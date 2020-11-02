//Polyfills??
// window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
// window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

import { whiteCharHandler } from './utility.js';

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
let expenseTypeDropdown = document.querySelector('.expenseTypeDropdownList');

// uncomment to reset by deleting the database

// let requestDeleteAll = indexedDB.deleteDatabase('expense_db');
// requestDeleteAll.onsuccess = () => {
//   console.log('deleted');
// };

// let requestDeleteAll_2 = indexedDB.deleteDatabase('expense_mt');
// requestDeleteAll_2.onsuccess = () => {
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
        
    //Define what data items (transactional data)
    objectStore.createIndex('merchant', 'merchant', { unique: true }); //merchant
    objectStore.createIndex('date', 'date', { unique: false }); //date
    objectStore.createIndex('status', 'status', { unique: false }); //status
    objectStore.createIndex('amount', 'amount', { unique: false }); //amount
    
    //Metadata table
    let objectStoreMeta = db.createObjectStore('expense_mt', { keyPath: 'id', autoIncrement: true });
    objectStoreMeta.createIndex('type', 'type', { unique: true }) //expense type
    
    console.log('2 Databases setup complete')
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
    // // -- Metadata database
    // /* 
    // need to open cursor to expense_mt (metadata database)
    // because that is what the expense type dropdown list attached to each chevron will be based on
    // */

    let transactionMeta = db.transaction('expense_mt')
    let objectStoreMeta = transactionMeta.objectStore('expense_mt');

    let expenseListArr = [];
    objectStoreMeta.openCursor().onsuccess = (e) => {
      let cursor = e.target.result;


      if (cursor) {
        // console.log(cursor.value.type)
        // let expenseItem = document.createElement('li');
        // expenseItem.innerHTML = cursor.value.type
        expenseListArr.push(cursor.value.type)
        cursor.continue()
      }
    }

    transactionMeta.oncomplete = () => {
      
    
      // -- Metadata database end
      //Returns an IDBObjectStore in the transaction's scope
      let transaction = db.transaction('expense_os')

      let objectStore = transaction.objectStore('expense_os');

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
          // const p1 = document.createElement('p'); //id
          const p2 = document.createElement('p'); //merchant
          const p3 = document.createElement('p'); //date
          
          //-- drop down text
          // const p4 = document.createElement('p'); //status
          const p4 = document.createElement('ul'); //status
          //-- drop down text

          const p5 = document.createElement('p'); //amount
          const p6 = document.createElement('i'); //delete

          //<i class="far fa-trash-alt"></i>

          // li.append(...[p1, p2, p3, p4, p5, p6]) //append all to li (backup)
          li.append(...[p2, p3, p4, p5, p6]) //append all to li
          contentParent.appendChild(li);

          // p1.textContent = cursor.value.id;
          p2.textContent = cursor.value.merchant;
          p3.textContent = cursor.value.date;
          
          //-- drop down text
          // p4.textContent = cursor.value.status;
          //p4.innerHTML = `<li><i class="fas fa-chevron-down"></i>${cursor.value.status}</li><ul class='expenseList'><li>Uncategorized</li><li>${cursor.value.status}</li></ul>`
          p4.innerHTML = `<li class="needborder"><i class="fas fa-chevron-down"></i>${cursor.value.status}</li><ul class='expenseList'></ul>`

          //-- drop down text0
          
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
        } else {//iterator all cursor item completes
          
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
            })

            // merchantDivClone.addEventListener('click', (event) => {
            //   expenseTypeDropdown.value = event.target.innerText
            // })

          });
        }
      }

      //after openCursor transaction on transaction db 
      transaction.oncomplete = () => {
        let expenseLists = document.querySelectorAll(".expenseList");
        let chevrons = document.querySelectorAll("ul li i[class='fas fa-chevron-down']")

        //expense type (Expense Category) drop down List
        expenseTypeDropdown.innerHTML = ''; 
        expenseListArr.forEach(expenseType => {
          let expenseListItem = document.createElement("div");
          expenseListItem.innerText = expenseType;
          expenseTypeDropdown.append(expenseListItem);            
        })
        //Expense Category Contains Uncategorized
        let uncategorizedDiv = document.createElement('div');
        uncategorizedDiv.innerText = 'Uncategorized';
        expenseTypeDropdown.append(uncategorizedDiv);
          
        //add expense drop down list to each category
        expenseLists.forEach(expenseList => {
          expenseListArr.forEach(expenseType => {
            let expenseListItem = document.createElement("li");
            expenseListItem.innerText = expenseType;
            expenseList.append(expenseListItem);
          })
        })

        // console.log(expenseLists)
        chevrons.forEach((chevron, index) => {
          chevron.addEventListener('click', () => {
            expenseLists.forEach(expenseList => {
              // expenseList.style.display = 'none';
              expenseList.style.zIndex = -1;
              expenseList.style.opacity = '0';
              expenseList.style.pointerEvents  = 'none';
              
            });
            // expenseLists[index].style.display = 'block'
            expenseLists[index].style.zIndex = 1;
            expenseLists[index].style.opacity = '1';
            expenseLists[index].style.pointerEvents  = 'all';
            
            chevrons[index].parentElement.style.borderColor = "#4aae9b"
            
            expenseLists[index].addEventListener('mouseleave', function handleMouseleave(event) {
              expenseLists[index].removeEventListener('mouseleave', handleMouseleave);
              // expenseLists[index].style.display = 'none';
              expenseLists[index].style.zIndex = -1;
              expenseLists[index].style.opacity = '0';
              expenseLists[index].style.pointerEvents  = 'none';

              chevrons[index].parentElement.style.borderColor = "#DCDCDC"
            })
            
            //process another transaction to handle click on expense type 
            let expenseItems = expenseLists[index].querySelectorAll('li'); 
            expenseItems.forEach(expenseItem => {
              expenseItem.addEventListener('click', () => {
                //update Status column
                expenseItem.parentElement.previousElementSibling.childNodes[1].nodeValue = expenseItem.innerText
                
                let transactionUpdate = db.transaction(['expense_os'], 'readwrite');
                let objectStore = transactionUpdate.objectStore('expense_os');
                
                //dataId is the key in expense_os db that we want to update, has to convert to number
                let dataId = +expenseItem.parentElement.parentElement.parentElement.getAttribute('data-id');
                
                let objectStoreRetrieveRequest = objectStore.get(dataId);

                objectStoreRetrieveRequest.onsuccess = () => {
                  let expenseTransactionResult = objectStoreRetrieveRequest.result;
                  expenseTransactionResult.status = expenseItem.innerText;
                  let expenseUpdateRequest = objectStore.put(expenseTransactionResult);
                  expenseUpdateRequest.onsuccess = () => {
                     
                  } 
                }    
              })
            })
          })
        });
        //pagination test
        //persumebly all expense entries are all rendered at this point
        //with all expense dropdowns appended 
        // let expenseListItems = document.querySelectorAll('.indexedDb li[data-id]')
        // console.log(expenseListItems.length)
        // expenseListItems.forEach((listItem, index) => {
        //   if (index > 20) {
        //     listItem.style.display = 'none';
        //   }

        // })
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

    displayData();
  }
}
