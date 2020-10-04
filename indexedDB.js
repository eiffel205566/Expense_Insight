//Polyfills??
// window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
// window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

let elementEntrySubmit = document.querySelector('#value-submit'); //dynamic update
let elementEntryDone= document.querySelector('#value-done');
let elementEntryTodo = document.querySelector('#value-todo');
elementEntrySubmit.innerHTML = 0;
elementEntryDone.innerHTML = 0;
elementEntryTodo.innerHTML = 0;

let exclamations = document.querySelectorAll('.content-2-input .input-section .fa-exclamation-circle'); //all Exclamations
let warnings  = document.querySelectorAll('.content .content-2 .content-2-input .input-section .warning'); //warning symbols

export let submitBtn = document.querySelector('.expense-submit');
const form = document.querySelector('form');

//3 input fields
export const merchantInput = document.querySelector('#input-merchant');
export const dateInput = document.querySelector('#input-date');
export const amountInput = document.querySelector('#input-amount');

//the ul we append detail li item to
const contentParent = document.querySelector('.indexedDb');

//Merchant Dropdown list
export let merchantsDropdown = document.querySelector('.merchantDropdownList');

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
    
    let dateInputInMs = new Date(dateInput.value).getTime();
    let fields = [merchantInput.value, dateInput.value, amountInput.value]
    /* 
    Data Validation
    1. Merchant Descrition: a. Special Char, b. Trim blank, c. null/ undefined
    2. Expense Date: a. null/undefined, b. has to before or equal today
    3. Expense Amount: just check emptyness 
    */
    if (merchantInput.value && dateInput.value && amountInput.value) {
      //all 3 fields are non empty, reset all warning and exclamation
      fields.forEach((eachInput, index) => {
        warnings[index].style.zIndex = -1;
        exclamations[index].style.zIndex = -1;
      })

    } else {
      
      //Empty field warning message
      
      for (let i = 0; i < fields.length; i++) {
        if (!fields[i]) { //if input fields are empty
          warnings[i].style.zIndex = 1;
          exclamations[i].style.zIndex = 1;
        }
      };
      
      if (dateInputInMs > Date.now()) {
        warnings[1].style.zIndex = 1;
        warnings[1].innerText = "Please don't enter future expense"
        exclamations[1].style.zIndex = 1;
      }
      return;
    }

    //get info entered
    let newInfo = { merchant: whiteCharHandler(merchantInput.value), date: dateInput.value, status: "Uncategorized", amount: amountInput.value };


    //open a read/write db transaction, ready for adding the data;
    let transaction = db.transaction(['expense_os'], 'readwrite');

    //call an object store in database Returns an IDBObjectStore in the transaction's scope.
    let objectStore = transaction.objectStore('expense_os');

    //Make request to add new info to object store
    let request = objectStore.add(newInfo);
    request.onsuccess = () => {
      //clear the form
      merchantInput.value = '';
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
      elementEntrySubmit.innerText = countRequest.result; //update number in content-3 blue box value
    }

    //new experiment, try to query db to get all entries with 'uncategorized' for key: status
    let uncategorizedExpCount = 0; 

    //merchant list dropdown??
    let merchants = new Set();

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

        //increment uncategorized exp
        // console.log(cursor.value.status);
        if (cursor.value.status == 'Uncategorized') {
          uncategorizedExpCount++
        }

        //Merchant dropdown options, a Set
        merchants.add(cursor.value.merchant);

        //continue for next entry
        cursor.continue();
      } else {
        
        //update uncategorized expense count in orange box
        elementEntryTodo.innerText = uncategorizedExpCount;
        elementEntryDone.innerText = elementEntrySubmit.innerText - uncategorizedExpCount;

        //rebuilding dropdown list, clear previous data always
        merchantsDropdown.innerText = "";

        //iterate cursor completes: update merchantsDropDownList
        merchants = new Array(...merchants);
        merchants.forEach(merchant => {
          let merchantDiv = document.createElement("div");
          merchantDiv.classList.add("merchant");
          merchantDiv.innerHTML = `<h4>${merchant}</h4>`;
          merchantsDropdown.append(merchantDiv);

          //add click listener to fill in input when clicked
          merchantDiv.addEventListener("click", (event) => {
            merchantInput.value = event.target.innerText;
          });
        });
      }
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

//Utility function enforce no consecutive whitespace characters; 
function whiteCharHandler(str) {
  let regex = /\s{2}/g;
  
  while (str.trim().match(regex)) {
    str = str.trim().replace(regex, ' ');
  }

  //finally replace all whitespace with ' ';
  str.replace(/\s/g, ' ');

  return str;
}