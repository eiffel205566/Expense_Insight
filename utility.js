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
export function sumByCriteria(allData, criteriaList) {
  //obj containing each key in criteriaList with value of 0
  //to facilitate summarization
  let summaryObj = criteriaList.reduce((prev, curr) => {
    return {...prev, [curr]:0} 
  }, {});

  for (let transaction of allData) {
    summaryObj[transaction.status] += transaction.amount
  }

  return Object.values(summaryObj);
}


//add 3 toggle option: last 1 month, last 3 month, all time
//chart options: bar, pie, etc
//expense by merchant
//expense by type


//renderChart to accept arguments specifing which type of chart

//initially render a bar chart, with arrow on top right
//hover effect of constant moving arrow 
//click arrow will bring back to chart build UI where user will design 
//own chart by using the toggles
