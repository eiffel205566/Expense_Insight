let date = new Date();
let dateElement = document.querySelector('#date');
export let dateLetterArr = date.toDateString().split("")

function deleteDate(timeId) {
  return new Promise((resolve) => {
    timeId = setTimeout(function deleteLetter() {
      if (dateElement.innerHTML.length === 0) {
        clearTimeout(timeId);
        //wait 1 second and resolve so there is a delay
        setTimeout(() => {
          resolve(timeId)
        }, 1000);

      } else {
        dateElement.innerHTML = dateElement.innerHTML.slice(0, dateElement.innerHTML.length - 1) 
        timeId = setTimeout(() => deleteLetter(), 100)
      }
    })
  })
}

//date type, function to type out letter
function delayPrintDate(arr, timeId) {
  return new Promise((resolve) => {
    let i = 0;
    timeId = setTimeout(function addLetter() {
      // console.log(arr[i]);
      dateElement.innerHTML += arr[i];
      i++;
      if (i == arr.length) {
        clearTimeout(timeId)
        //wait 1 sec and then resolve, to facilitate deletion
        setTimeout(()=> resolve(timeId), 1000)
  
      } else {
        timeId = setTimeout(addLetter, 200)  
      }
    },200);
  })
}

export function printDate(arr, timeId) {
  delayPrintDate(arr, timeId).then(() => deleteDate(timeId)).then(() => printDate(arr, timeId))
}


//Utility function enforce no consecutive whitespace characters; 
export function whiteCharHandler(str) {
  let regex = /\s{2}/g;
  
  while (str.trim().match(regex)) {
    str = str.trim().replace(regex, ' ');
  }

  //finally replace all whitespace with ' ';
  str.replace(/\s/g, ' ');

  return str;
}

//Utility function to extract nth element from each index of an array
export function extractNthItem(arr, index) {
  return arr.map(item => item[index])
}

//utility function to sum up values base on criteria
//example: sum expense by expense type
export function renderChart(chartType, base, time, allData, expenseTypeList, merchantList) {
  //obj containing each key in baseList with value of 0
  //to facilitate summarization
  let baseList = (base == 'Expense Type') ? expenseTypeList : merchantList;
  let chart

  let summaryObj = baseList.reduce((prev, curr) => {
    return {...prev, [curr]:0} 
  }, {});

  
  for (let transaction of allData) {
    if (time[0] <= transaction['date'] && time[1] >= transaction['date']) {
      let propertyName = base == 'Expense Type' ? 'status' : 'merchant';
      summaryObj[transaction[propertyName]] += +transaction['amount']

      // summaryObj[transaction['status']] += +transaction['amount'] //expense type
      // summaryObj[transaction['merchant']] += +transaction['amount']

    }
  }

  for (let key in summaryObj) {
    summaryObj[key] = parseFloat(summaryObj[key].toFixed(2));
  }

  //console.log(summaryObj);

  if (chartType == 'bar') {
    chart = new Chart(myChart, {
      type: 'bar',
      data: {
          labels: [...baseList],
          datasets: [{
              label: `Exp By ${base.toUpperCase()}, ${time[0]} to ${time[1]}}`,
              data: [...Object.values(summaryObj)],
              backgroundColor: getRandomColors(baseList.length),
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

  }
  console.log(chart);
  return chart;
}




export function getRandomColors(n) {
  let result = Array(n).fill(1);
  function getRandomColor() {
    let r = Math.floor(Math.random() * 255)
    let g = Math.floor(Math.random() * 255)
    let b = Math.floor(Math.random() * 255)

    return `rgba(${r}, ${g}, ${b}, 0.2)`
  }
  return result.map(x => getRandomColor())
}

