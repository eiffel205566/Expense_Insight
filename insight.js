let burger = document.querySelector(".burger"); //burger menu
let links = Array.from(document.querySelectorAll('.innerselection > li > a[class="innerlink"]'));
let main = document.querySelector('.main');
let dateElement = document.querySelector('#date');


export let date = new Date();
export let dateLetterArr = date.toDateString().split("")
// dateElement.innerHTML = date.toDateString();

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

function delayPrintDate(arr) {
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
  
function deleteDate() {
  let timeId = setTimeout(function deleteLetter() {
    if (dateElement.innerHTML.length === 0) {
      clearTimeout(timeId);
    } else {
      dateElement.innerHTML = dateElement.innerHTML.slice(0, dateElement.innerHTML.length - 1)         
      timeId = setTimeout(deleteDate(), 100) 
    }
  }, 100)
}


let db;

window.onload = function() {
  
  //print out date... for fun???
  let timeId = setInterval(() => {
    delayPrintDate(dateLetterArr);
    setTimeout(() => {
      deleteDate()
    }, 4000);
  }, 8000);
  
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
    
    //doesn't work
    let objectStoreMeta = db.transaction('expense_mt').objectStore('expense_mt');
    

    let countRequest = objectStore.count();
    countRequest.onsuccess = () => {
      console.log('Count request successful');
      console.log(`transactional: ${countRequest.result}`); //update number in content-3 blue box value
    }


    let countRequestMeta = objectStoreMeta.count();
    countRequestMeta.onsuccess = () => {
      console.log(`metadata: ${countRequestMeta.result}`)
    }
  }

  request.onupgradeneeded = (e) => {
    //a reference to the opened database;
    let db = e.target.result; 
    console.log('Database setup complete');
  }
}
