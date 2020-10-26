import {
  dateLetterArr, 
  printDate, 
  whiteCharHandler, 
  extractNthItem, 
  renderChart, 
  getRandomColors,
  openDB} from './utility.js';

let burger = document.querySelector(".burger"); //burger menu
let links = Array.from(document.querySelectorAll('.innerselection > li > a[class="innerlink"]'));
let main = document.querySelector('.main');

let dropOff = document.getElementsByClassName("dropoff")[0];
const form = document.querySelector('form');
let metaInput = document.querySelector('#input-text');
let metaContainer = document.querySelector('.metatextContainer');
let dropHeader = document.querySelector('.dropoffHeader');
// let button = document.querySelector('.meta-submit');
let myChart = document.getElementById('myChart');
let chart;

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
let timeId = 0;

printDate(dateLetterArr, timeId);

// window.onbeforeunload = () => clearInterval(timdId); //clearout timeId when leaving

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
      // renderCharts();
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
      // renderCharts()
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
          // renderCharts()
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


function renderCharts({chartType='bar', base='Expense Type', time=['2020-10-13', '2020-10-14']}={}) {

  //open expense item (transactional) db and resolve the db  
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
          resolve([db, allData, Array.from(merchantList)])
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

    chart = renderChart(chartType, base, time, allData, expenseTypeList, merchantList)
    
  })
}


/* 

### --- Graph Design UI Section --- ###

interface with 3 level: 

1: ask user to pick which chart to render
graphUI > barContainer 
graphUI > pieContainer

2: ask user to provide parameter of chart
graphUI > uiDetail

3: render chart
chartContainer

*/


let chartContainer = document.querySelector('.chartContainer');
let graphUI = document.querySelector('.graphUI');
let barContainer = document.querySelector('.graphUI .barContainer')
let pieContainer = document.querySelector('.graphUI .pieContainer')
let uiDetail = document.querySelector('.uiDetail');
let backArrow = document.querySelector('.arrowContainer')
let basisOptions = document.querySelector('#basisOptionContainer')
let insightFromDate = document.querySelector('.insightFromDate');
let insightToDate = document.querySelector('.insightToDate');
let insightWarning = document.querySelector('.insightWarning');
let bottomArrow = document.querySelector('.bottomArrowWrapper');
let basisOptionSelection = document.querySelector('#basisOptions');

function resetInsightUI() {
  chartContainer.style.display = '';
  uiDetail.style.display = '';
  graphUI.style.display = 'flex';
  barContainer.style.display = 'block';
  pieContainer.style.display = 'block';
  insightFromDate.value = '';
  insightToDate.value = '';
  basisOptions.style.display = '';
  insightWarning.style.display = '';
  bottomArrow.style.display = '';

  //chart must be destroied before create a new chart
  if (chart) {
    chart.destroy();
  }
}

backArrow.addEventListener('click', () => resetInsightUI());
barContainer.addEventListener('click', (event) => renderGraphBuilder(event));
pieContainer.addEventListener('click', (event) => renderGraphBuilder(event));
basisOptionSelection.addEventListener('input', () => {
  if (basisOptionSelection.value !== 'none') {
    bottomArrow.style.display = 'block'
  }
});

// starts here!! when date validation fail, need to get rid of basisOption 
 

insightFromDate.oninput = () => {
  if (insightFromDate.value && insightToDate.value) {
    if (new Date(insightToDate.value) >= new Date(insightFromDate.value)) {
      basisOptions.style.display = 'flex'
      insightWarning.style.display = '';
    } else {
      insightWarning.style.display = 'block';
      // insightFromDate.value = '';
      basisOptions.style.display = '';
      bottomArrow.style.display = '';
    }
  }
};

insightToDate.oninput = () => {
  if (insightFromDate.value && insightToDate.value) {
    if (new Date(insightToDate.value) >= new Date(insightFromDate.value)) {
      basisOptions.style.display = 'flex'
      insightWarning.style.display = '';  
    } else {
      insightWarning.style.display = 'block';
      // insightToDate.value = '';
      basisOptions.style.display = '';     
      bottomArrow.style.display = '';
    }
  }
};

function renderGraphBuilder(event) {
  barContainer.style.display = 'none'
  pieContainer.style.display = 'none'
  if (barContainer.contains(event.target)) {
    bottomArrow.setAttribute('data-chartType', 'bar')
  }
  if (pieContainer.contains(event.target)) {
    bottomArrow.setAttribute('data-chartType', 'pie')
  }
  uiDetail.style.display = 'block';
}

bottomArrow.addEventListener("click", () => {
  
  bottomArrow.setAttribute('data-from', insightFromDate.value)
  bottomArrow.setAttribute('data-to', insightToDate.value)
  bottomArrow.setAttribute('base', basisOptionSelection.value)

  resetInsightUI();
  graphUI.style.display = 'none';
  // barContainer.style.display = 'none';
  // pieContainer.style.display = 'none';
  chartContainer.style.display = 'block';

  let chartPropObj = {
    chartType: bottomArrow.getAttribute('data-chartType'), 
    base: basisOptionSelection.value,
    time: [bottomArrow.getAttribute('data-from'), bottomArrow.getAttribute('data-to')],
  }

  // console.log(chartPropObj)
  // renderCharts()
  renderCharts(chartPropObj);

  // chartContainer.removeChild(chartContainer.firstElementChild)
})

//### --- Graph Design UI Section --- ###






