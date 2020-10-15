let date = new Date();
let dateElement = document.querySelector('#date');
export let dateLetterArr = date.toDateString().split("")

export function deleteDate() {
  let timeId = setTimeout(function deleteLetter() {
    if (dateElement.innerHTML.length === 0) {
      clearTimeout(timeId);
    } else {
      dateElement.innerHTML = dateElement.innerHTML.slice(0, dateElement.innerHTML.length - 1)         
      timeId = setTimeout(deleteDate(), 100) 
    }
  }, 100)
}

export function delayPrintDate(arr) {
  let i = 0;
  let timeId = setTimeout(function addLetter() {
    // console.log(arr[i]);
    dateElement.innerHTML += arr[i];
    i++;
    if (i == arr.length) {
      clearTimeout(timeId)
    } else {
      timeId = setTimeout(addLetter, 200)  
    }
  },200);
}