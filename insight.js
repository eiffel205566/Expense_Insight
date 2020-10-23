import {dateLetterArr, printDate, whiteCharHandler, extractNthItem, sumByCriteria } from './utility.js';

let burger = document.querySelector(".burger"); //burger menu
let links = Array.from(document.querySelectorAll('.innerselection > li > a[class="innerlink"]'));
let main = document.querySelector('.main');

let dropOff = document.getElementsByClassName("dropoff")[0];
const form = document.querySelector('form');
let metaInput = document.querySelector('#input-text');
let metaContainer = document.querySelector('.metatextContainer');
let dropHeader = document.querySelector('.dropoffHeader');
let button = document.querySelector('.meta-submit');
let barChart = document.getElementById('barChart');

//burger menu animation
burger.addEventListener("click", () => {
  if (Array.from(burger.classList).includes("open")) {
    burger.classList.remove("open");
    main.classList.remove("open")
    document.body.style.overflowY = "";
    links.forEach(element=>element.classList.remove('open'))
  } else {
    burger.classList.add("open")
    main.classList.add("open")
    document.body.style.overflowY = "hidden";
    links.forEach(element=>element.classList.add('open'))
  }
});

/* 
Interation with Metadata IndexDB
*/
let db;
let timeId

printDate(dateLetterArr, timeId);

window.onbeforeunload = () => clearInterval(timdId); //clearout timeId when leaving

window.onload = function run() {

  //open database with version "2" so it will trigger onupgradeneeded event, so add another ObjectStore is possible
  let request = window.indexedDB.open('expense_db', 1);
  
  //onerror
  request.onerror = () => console.log('failed to load main database');
  
  //onsuccess
  request.onsuccess = () => {
    console.log('main database load complete');

    //store opened database object
    db = request.result; //has to let db in global as onupgradeneede runs before onsuccess

    let objectStore = db.transaction('expense_os').objectStore('expense_os');
    let objectStoreMeta = db.transaction('expense_mt').objectStore('expense_mt');
    let countRequest = objectStore.count();
    countRequest.onsuccess = () => {
      console.log(`transactional: ${countRequest.result}`); //update number in content-3 blue box value
    }


    let countRequestMeta = objectStoreMeta.count();
    countRequestMeta.onsuccess = () => {
      console.log(`metadata: ${countRequestMeta.result}`)
    }

    displayData();
  }

  request.onupgradeneeded = (e) => {
    //a reference to the opened database;
    let db = e.target.result; 
    console.log('Database setup complete');
  }

  form.onsubmit = addData;

  function addData(e) {
    //prevent default, dont want form to be submit normally
    e.preventDefault();
    let metaInputText = metaInput.value;

    //test for emptyness
    if (!metaInputText) {
      return;
    }
    
    //the new info
    let newInfo = { type: whiteCharHandler(metaInputText) };

    //has to opencursor to make sure no duplicated value been entered
    let checkTransaction = db.transaction('expense_mt');
    let objectStoreCheck = checkTransaction.objectStore('expense_mt');
    let duplicate;

    objectStoreCheck.openCursor().onsuccess = (e) => {
      let cursor = e.target.result;
      
      if (cursor) {

        if (cursor.value.type.toUpperCase() === whiteCharHandler(metaInputText)?.toUpperCase()) {
          alert("Please do not enter duplicated expense type");
          duplicate = 1;
        }
        cursor.continue()
      }
    }

    checkTransaction.onerror = () => {
      console.log('fail to add')
    }
    
    checkTransaction.oncomplete = () => {
      if (!duplicate) {
        //open a read/write db tran
        let transaction = db.transaction(['expense_mt'], 'readwrite');
    
        let objectStore = transaction.objectStore('expense_mt');
    
        let addRequest = objectStore.add(newInfo);
    
        addRequest.onsuccess = () => {
          metaInput.value = '';
        };
    
        transaction.oncomplete = () => {
          console.log("Transaction complete: added data");
          displayLastData();
        }
        
        transaction.onerror = () => {
          console.log('transaction adding data failed')
        };
      }
    }
  }

  function displayData() {
    //open db get reference to objectStore to metadata db 'expense_mt'
    let transaction = db.transaction('expense_mt')
    let objectStore = transaction.objectStore('expense_mt');

    //has to remove the first child... 
    // while (metaContainer.firstChild) {
    //   metaContainer.remove(metaContainer.firstChild);
    // }

    //open cursor to db
    objectStore.openCursor().onsuccess = (e) => {
      let cursor = e.target.result;

      //iterate cursor and build the list
      if (cursor) {
        const div = document.createElement('div');
        //add text
        div.innerHTML = '---' + cursor.value.type;
        div.classList.add("metatextContent")
        div.classList.add("paddingTopBottom-10")
        
        div.setAttribute('data-id', cursor.value.id) //to facilitate deletion
        div.setAttribute('draggable', "true");
        
        //set id so drag can setData and then delete can use ID to delete
        div.setAttribute('id', cursor.value.id);

        div.addEventListener('dragstart', event => {
          event.currentTarget.style.opacity = '0.5';
          event.dataTransfer.setData('text/plain', event.target.id);
        })

        div.addEventListener('dragend', event => {
          event.currentTarget.style.opacity = '1';
        })

        metaContainer.appendChild(div);

        cursor.continue();
      }
    }

    //render charts on initial load
    transaction.oncomplete = () => {
      renderCharts();
    }
  }

  function displayLastData() {
    let transaction = db.transaction('expense_mt');
    let objectStore = transaction.objectStore('expense_mt');

    let lastData,
        lastId;

    objectStore.openCursor().onsuccess = (e) => {
      let cursor = e.target.result;

      if (cursor) {
        lastData = cursor.value.type;
        lastId = cursor.value.id
        cursor.continue();
      } else {
        //now curosr finished iteration
        let div = document.createElement("div");
        div.innerHTML = '---' + lastData;
        div.classList.add("metatextContent")
        div.classList.add("paddingTopBottom-10")
        div.setAttribute('data-id', lastId) //to facilitate deletion
        div.setAttribute('draggable', "true");
        div.addEventListener('dragstart', event => {
          event.currentTarget.style.opacity = '0.5';
          event.dataTransfer.setData('text/plain', lastId);
        })

        div.addEventListener('dragend', event => {
          event.currentTarget.style.opacity = '1';
        })
        metaContainer.appendChild(div);
      }
    }

    //when adding new data
    transaction.oncomplete = () => {
      renderCharts()
    }
  };

  dropOff.addEventListener("drop", (event) => {
    let elementId = event.dataTransfer.getData('text');
    // console.log(document.querySelector(`[data-id="${elementId}"]`));    
    
    let dataToDelete = document.querySelector(`[data-id="${elementId}"]`).textContent.slice(3,) //the expense type to be delete
    
    metaContainer.removeChild(document.querySelector(`[data-id="${elementId}"]`))
    dropHeader.style.transform = '';
    deleteData(event, elementId, dataToDelete)

  })

function deleteData(event, idToDelete, dataToDelete) {

    return new Promise((resolve, reject) => {
      // console.log(idToDelete);
      let transaction = db.transaction(['expense_mt'], 'readwrite'); //initial request to delete in database
      let objectStore = transaction.objectStore('expense_mt');
      let deleteRequest = objectStore.delete(+idToDelete);
      deleteRequest.onerror = () => console.log('delete metadata failed')
      
      //transaction that deletes meta data needs to update all transaction
      transaction.oncomplete = () => {
        console.log(`Expense Type with ID ${idToDelete} has been deleted`)
        
        let updateTransactionDataRequest = db.transaction(['expense_os'], 'readwrite'); //another request to open cursor
        let objectStore = updateTransactionDataRequest.objectStore('expense_os');
        
        //iterate each transaction in expense_os db and update "status" to Uncategorized
        objectStore.openCursor().onsuccess = (event) => {
          let cursor = event.target.result;
          if (cursor) {
            if (cursor.value.status === dataToDelete) {
              let updateData = cursor.value;
              updateData.status = "Uncategorized";
              let updateRequest = cursor.update(updateData);

              updateRequest.onsuccess = () => console.log(`All Transaction with ${dataToDelete} updated`)
            }
            cursor.continue();
          }
        };

        //once the request to iterator all cursor item and replaced all deleted value with "Categorized"
        //re-render charts with new information
        updateTransactionDataRequest.oncomplete = () => {
          renderCharts()
        }
      };
    })
  }
}

/* 
Deal with Drop off area
*/

//prevent default;
dropOff.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropHeader.style.transform = 'scale(1.1)';
})

dropOff.addEventListener('dragleave', () => {
  dropHeader.style.transform = '';
});


function renderCharts() {

  //open expense item (transactional) db and resolve the db
  function openDB() {
    return new Promise((resolve, reject) => {
      let request = window.indexedDB.open('expense_db', 1);
      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };
      
      request.onerror = () => console.log('fail to open')
    })
  };
  
  //chain then the db, and iterate cursor to get all raw data to be put in charts
  openDB().then(
    db => {
      return new Promise(resolve => {
        let transaction = db.transaction('expense_os')
        let objectStore = transaction.objectStore('expense_os');
        let allData = new Array();
        let merchantList = new Set(); 
        objectStore.openCursor().onsuccess = (e) => {
          let cursor = e.target.result;
  
          if (cursor) {
            //console.log(`${cursor.value.merchant}, ${cursor.value.status}, ${cursor.value.amount}, ${cursor.value.date}`)
            //allData.push([cursor.value.merchant, cursor.value.status, cursor.value.amount, cursor.value.date])
            allData.push(
              {merchant: cursor.value.merchant,
               status: cursor.value.status, 
               amount: cursor.value.amount, 
               date: cursor.value.date
              })
            
            
            merchantList.add(cursor.value.merchant)
            cursor.continue();
          }
        };
  
        transaction.oncomplete = () => {
          resolve([db, allData, merchantList])
        }
      })
    }
  ).then(([db, allData, merchantList]) => { //then db again to get expense type list 
    // console.log(db)
    // console.log(allData)
    // console.log(merchantList)
    let expenseTypeList = new Array;

    return new Promise((resolve, reject) => {
      let expenseTypeRequest = db.transaction('expense_mt');
      let objectStore = expenseTypeRequest.objectStore("expense_mt");

      objectStore.openCursor().onsuccess = (e) => {
        let cursor = e.target.result;
        if (cursor) {
          expenseTypeList.push(cursor.value.type)
          cursor.continue();
        }
      }

      expenseTypeRequest.oncomplete = () => {
        //up-to-date expense types in an arr, all expense item, and merchant list
        resolve([expenseTypeList, allData, merchantList])
      }
    })
  }).then(([expenseTypeList, allData, merchantList]) => {
    let obj = expenseTypeList.reduce((prev, curr) => {
      return {...prev, [curr]:0} 
    }, {}); //convert expenseTypeList to obj where key is expense type, and value is 0 to facilitate summing

    //new
    for (let each of allData) {
      obj[each['status']] += +each['amount'];  
    }

    for (let key in obj) {
      obj[key] = parseFloat(obj[key].toFixed(2));
    }
    
    // console.log(expenseTypeList)
    let myChart = new Chart(barChart, {
      type: 'bar',
      data: {
          labels: [...expenseTypeList],
          datasets: [{
              label: '$$',
              data: [...Object.values(obj)],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          }
      }
    });

  })
}
