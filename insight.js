let burger = document.querySelector(".burger"); //burger menu
let links = Array.from(document.querySelectorAll('.innerselection > li > a[class="innerlink"]'));
let main = document.querySelector('.main');
let dateElement = document.querySelector('#date');
let dropOff = document.getElementsByClassName("dropoff")[0];
const form = document.querySelector('form');
let metaInput = document.querySelector('#input-text');
let metaContainer = document.querySelector('.metatextContainer');
let dropHeader = document.querySelector('.dropoffHeader');

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



/* 
Interation with Metadata IndexDB
*/
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
    let newInfo = { type: metaInputText };

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

  function displayData() {
    //open db get reference to objectStore to metadata db 'expense_mt'
    let objectStore = db.transaction('expense_mt').objectStore('expense_mt');

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
  }

  function displayLastData() {
    let objectStore = db.transaction('expense_mt').objectStore('expense_mt');

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


        metaContainer.appendChild(div);
      }
    } 
  }

  dropOff.addEventListener("drop", (event) => {
    let elementId = event.dataTransfer.getData('text');
    dropHeader.style.transform = '';
    deleteData(event, elementId);
  })

  function deleteData(event, idToDelete) {
    
    // console.log(idToDelete);

    let transaction = db.transaction(['expense_mt'], 'readwrite');
    let objectStore = transaction.objectStore('expense_mt');

    let deleteRequest = objectStore.delete(+idToDelete);
    deleteRequest.onerror = () => console.log('delete metadata failed')
    transaction.oncomplete = () => console.log(`Expense Type with ID ${idToDelete} has been deleted`)
  
    metaContainer.removeChild(document.querySelector(`[data-id="${idToDelete}"]`))
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

// dropOff.addEventListener('drop', (event) => {
//   let elementId = event.dataTransfer.getData('text');
//   console.log(event.target)
//   dropHeader.style.transform = '';
// })


