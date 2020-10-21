
let ctx = document.getElementById('myChart');
let button = document.querySelector('.meta-submit');
let dropoff = document.querySelector('.dropoff');

let myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
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


let db;

//async func to open db
function renderCharts() {
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
  
  //chain then to get all raw data to be put in charts
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
            allData.push([cursor.value.merchant, cursor.value.status, cursor.value.amount, cursor.value.date])
            merchantList.add(cursor.value.merchant)
            cursor.continue();
          }
        };
  
        transaction.oncomplete = () => {
          resolve([db, allData, merchantList])
        }
      })
    }
  ).then(([db, allData, merchantList]) => {
    console.log(db)
    console.log(allData)
    console.log(merchantList)
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
        resolve(expenseTypeList, allData, merchantList)
      }
    })
  }).then(console.log)
}



//when submit button is click, we want to re-render charts
//or expense item was deleted
button.addEventListener('click', () => {
  renderCharts();
})

dropoff.addEventListener('drop', () => {
  renderCharts();
})
