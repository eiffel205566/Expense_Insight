//Polyfills??
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

let elementEntrySubmit = document.querySelector('#value-submit'); //dynamic update
let elementEntryDone= document.querySelector('#value-done');
let elementEntryTodo = document.querySelector('#value-todo');
elementEntrySubmit.innerHTML = 0;
elementEntryDone.innerHTML = 0;
elementEntryTodo.innerHTML = 0;

let submitBtn = document.querySelector('.expense-submit');
const form = document.querySelector('form');

//3 input fields
const merchatInput = document.querySelector('#input-merchant');
const dateInput = document.querySelector('#input-date');
const amountInput = document.querySelector('#input-amount');

//the ul we append detail li item to
const contentParent = document.querySelector('.indexedDb');

// // uncomment to reset by deleting the database
// let requestDeleteAll = indexedDB.deleteDatabase('expense_db');
// requestDeleteAll.onsuccess = () => {
//   console.log('deleted');
// };

let db;

window.onload = function() {

  //create database if it does not exist by creating a "request object"
  let request = window.indexedDB.open('expense_db', 1);

  //onerror
  request.onerror = () => console.log('failed to load main database');

  //onsuccess
  request.onsuccess = () => {
    console.log('main database load complete');

    //store opened database object
    db = request.result; //has to let db in global as onupgradeneede runs before onsuccess

    displayData();
  };

  //onupgradeneeded will run before onsuccess!!!!
  //setup database tables
  request.onupgradeneeded = (e) => {
    //a reference to the opened database;
    let db = e.target.result; 

    //create a table (called "object store"), the method is literally called createObjectStore
    let objectStore = db.createObjectStore('expense_os', { keyPath: 'id', autoIncrement: true });
    
    //Define what data items (metadata)
    objectStore.createIndex('merchant', 'merchant', { unique: false }); //merchant
    objectStore.createIndex('date', 'date', { unique: false }); //date
    objectStore.createIndex('status', 'status', { unique: false }); //status
    objectStore.createIndex('amount', 'amount', { unique: false }); //amount

    console.log('Database setup complete');
  }

  form.onsubmit = addData;

  function addData(e) {
    //prevent default, dont want form to be submit normally
    e.preventDefault();

    //Any empty field will halt addData
    if (merchatInput.value && dateInput.value && amountInput.value) {
      // console.log('Validating Data')
    } else {
      // console.log('Empty Data detected, not add');
      return;
    }

    //get info entered
    let newInfo = { merchant: merchatInput.value, date: dateInput.value, status: "Uncategorized", amount: amountInput.value };


    //open a read/write db transaction, ready for adding the data;
    let transaction = db.transaction(['expense_os'], 'readwrite');

    //call an object store in database Returns an IDBObjectStore in the transaction's scope.
    let objectStore = transaction.objectStore('expense_os');

    //Make request to add new info to object store
    let request = objectStore.add(newInfo);
    request.onsuccess = () => {
      //clear the form
      merchatInput.value = '';
      dateInput.value = '';
      amountInput.value = '';
    };

    //report result of transaction to add data
    transaction.oncomplete = () => {
      console.log('Transaction complete: added data');

      displayData(); //update DOM with new data
    };

    transaction.onerror = () => {
      console.log('transaction adding data failed')
    };
  }

  function displayData() {
    
    //Returns an IDBObjectStore in the transaction's scope
    let objectStore = db.transaction('expense_os').objectStore('expense_os');

    let countRequest = objectStore.count();

    countRequest.onsuccess = () => {
      console.log('Count request successful');
      elementEntrySubmit.innerHTML = countRequest.result; //update number in content-3 blue box value
    }

    //has to delete the first entry? no idea why
    while (contentParent.firstChild) {
      contentParent.removeChild(contentParent.firstChild);
    }

    objectStore.openCursor().onsuccess = (e) => {
      //get a reference to the cursor
      let cursor = e.target.result;
      
      //once iterate all items, cursor will become null hence false and stop running this block
      if (cursor) {
        
        const li = document.createElement('li');
        const p1 = document.createElement('p'); //id
        const p2 = document.createElement('p'); //merchant
        const p3 = document.createElement('p'); //date
        const p4 = document.createElement('p'); //status
        const p5 = document.createElement('p'); //amount
        const p6 = document.createElement('i'); //delete

        //<i class="far fa-trash-alt"></i>

        li.append(...[p1, p2, p3, p4, p5, p6]) //append all to li
        contentParent.appendChild(li);

        p1.textContent = cursor.value.id;
        p2.textContent = cursor.value.merchant;
        p3.textContent = cursor.value.date;
        p4.textContent = cursor.value.status;
        p5.textContent = cursor.value.amount;

        p6.classList.add('far');
        p6.classList.add('fa-trash-alt');

        li.setAttribute('data-id', cursor.value.id); // the id of list item, to facilitate deletion
        li.classList.add('content-5-header'); //add css class for formatting

        //Delete the entry
        p6.onclick = deleteData;

        //continue for next entry
        cursor.continue();
      };
    }
  };

  function deleteData(e) {

    //get primary key (id) of the node getting deleted
    let id = e.target.parentNode.getAttribute('data-id');

    //start a transaction
    let transaction = db.transaction(['expense_os'], 'readwrite');
    let objectStore = transaction.objectStore('expense_os');
    let request = objectStore.delete(+id); //delete() takes a NUMBER!!! need to convert it

    //remove node from DOM
    contentParent.removeChild(e.target.parentNode);

    transaction.oncomplete = () => {
      console.log(`Transaction with ${id} had been deleted`)

    }
  }
}


