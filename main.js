import { dateLetterArr, printDate, openDB } from "./utility.js";

let main = document.querySelector(".main");
//let drags = Array.from(document.querySelectorAll('.draggable')); //All elements able to drag
//let containers = Array.from(document.querySelectorAll('.container'));
//let placeholder = document.querySelector('#placeholder'); //placeholder
let dateElement = document.querySelector("#date");
let dropDown = document.querySelector(".fas.fa-chevron-down");
let refresh = document.querySelector("#refresh");
let refreshableContent = Array.from(
  document.querySelectorAll(".content-4-input")
);
let content5 = document.querySelector(".indexedDb");
let content5TopElements = document.querySelectorAll(
  ".content-5 .content-5-header p[data-sort]"
); //Elements click to sort
//let merchants = document.querySelectorAll('.merchant');
export let burger = document.querySelector(".burger"); //burger menu
let links = Array.from(
  document.querySelectorAll('.innerselection > li > a[class="innerlink"]')
);
let expenseDropdown = Array.from(
  document.querySelectorAll(".indexedDb > .content-5-header > ul > li > i")
);

// let elementEntrySubmit = document.querySelector('#value-submit'); //display value
// let elementEntryDone= document.querySelector('#value-done');
// let elementEntryTodo = document.querySelector('#value-todo');

//typing date
let timeId;
printDate(dateLetterArr, timeId);

//window.onbeforeunload = () => clearInterval(timdId);

//let totalSubmitCount = document.querySelector('.indexedDb').childElementCount;
// elementEntrySubmit.innerText = totalSubmitCount;

//Dropdown

//add event listener
content5TopElements.forEach((element, index) => {
  //deleted 1st column, also status column need rework
  //because it is no longer a simple p element
  if (index != 2) {
    element.addEventListener("click", () => sortNthListItems(index + 1));
  }
});

//Nth: nth column number, start with 1
function sortNthListItems(n) {
  console.log(n);
  let sortElement = document.querySelector(`p[data-sort]:nth-child(${n})`); //get sort flag
  let sortFlag = sortElement.getAttribute("data-sort");
  let listItemsSelected = Array.from(
    document.querySelectorAll(`li[data-id]>p:nth-child(${n})`)
  ); //get list items to be sorted

  let sortFunction;

  if (sortFlag) {
    //if sortFlag is empty, reverse order;
    //column 1 & 2 & 3 are string, rest columns can be converted to number;
    if (n === 1 || n === 2 || n === 3) {
      sortFunction = (a, b) => (a.innerText > b.innerText ? 1 : -1);
    } else {
      sortFunction = (a, b) => +a.innerText - +b.innerText;
    }

    //update data-sort
    sortElement.setAttribute("data-sort", "");

    //if sortFlag is not empty, change back to normal order
  } else {
    if (n === 1 || n === 2 || n === 3) {
      sortFunction = (a, b) => (b.innerText > a.innerText ? 1 : -1);
    } else {
      sortFunction = (a, b) => +b.innerText - +a.innerText;
    }
    //update data-sort
    sortElement.setAttribute("data-sort", "Sorted");
  }

  //Remove all nodes from content5
  while (content5.firstChild) {
    content5.removeChild(content5.firstChild);
  }

  //re-add them back with sorted order
  let sortedListItems = listItemsSelected.sort(sortFunction);
  sortedListItems.forEach(element => content5.appendChild(element.parentNode));
}

//burger menu animation
burger.addEventListener("click", () => {
  if (Array.from(burger.classList).includes("open")) {
    burger.classList.remove("open");
    main.classList.remove("open");
    document.body.style.overflowY = "";
    links.forEach(element => element.classList.remove("open"));
  } else {
    burger.classList.add("open");
    main.classList.add("open");
    document.body.style.overflowY = "hidden";
    links.forEach(element => element.classList.add("open"));
  }
});

/* 
Expense Category Drop down
*/

// expenseTypeDropdown.addEventListener('focusout', () => {
//   console.log('out')
// })

//Refresh button, to reset filters
refresh.addEventListener("click", () => {
  let expenseEntries = Array.from(
    document.querySelectorAll(".indexedDb .needborder")
  );
  refreshableContent.forEach(element => (element.value = ""));
  expenseEntries.forEach(expenseEntry => {
    expenseEntry.parentElement.parentElement.style.display = "grid";
  });
});

let expenseTypeDropList = document.querySelector(".expenseTypeDropdownList");
expenseTypeDropList.addEventListener("click", e => {
  // console.log(e.target)
  expenseTypeDropdown.value = e.target.innerText;
});

let expenseTypeInput = document.querySelector("#expenseTypeDropdown");

//experiment to limit dropdown options based on user input in expense category
expenseTypeInput.oninput = e => {
  let options = Array.from(
    document.querySelectorAll(
      ".content-4 .expense-dropdown .expenseTypeDropdownList div"
    )
  );

  if (!expenseTypeInput.value) {
    //if input value is blank, or user deleted everything, show all
    options.forEach(div => (div.style.display = "block"));
  } else {
    //if not then only display option that match input
    options.forEach(div => {
      if (!div.innerText.includes(expenseTypeInput.value)) {
        div.style.display = "none";
      }
    });
  }
};

//limit dropdown options based on user input in Merchant Dropdown
// let merchantDropdownList = document.querySelector('.merchantDropdownList');
let merchantInput = document.querySelector("#input-merchant");
merchantInput.oninput = () => {
  let merchantDivs = Array.from(
    document.querySelectorAll(".merchantDropdownList .merchant")
  );
  if (!merchantInput.value) {
    merchantDivs.forEach(merchantDiv => (merchantDiv.style.display = "block"));
  } else {
    merchantDivs.forEach(merchantDiv => {
      if (!merchantDiv.innerText.includes(merchantInput.value)) {
        merchantDiv.style.display = "none";
      }
    });
  }
};

//execute (double right arrow) button click to filter transaction
let executeDiv = document.querySelector("#execute");
executeDiv.addEventListener("click", () => {
  let expenseEntries = Array.from(
    document.querySelectorAll(".indexedDb .needborder")
  );
  let fromDate = document.querySelector("#fromDate");
  let toDate = document.querySelector("#toDate");

  expenseEntries.forEach(expenseEntry => {
    expenseEntry.parentElement.parentElement.style.display = "grid";
  });

  expenseEntries.forEach(expenseEntry => {
    let transactionDate =
      expenseEntry.parentElement.parentElement.childNodes[1].innerText;

    //if expense type input is not empty, use it as filter and check against each entry's expense type
    if (expenseTypeInput.value) {
      if (expenseEntry.innerText !== expenseTypeInput.value) {
        expenseEntry.parentElement.parentElement.style.display = "none";
      }
    }

    //if from date input (#fromDate) is not empty, use the value to check against transaction date
    if (fromDate.value) {
      if (fromDate.value > transactionDate) {
        // console.log(`fromdate: ${fromDate.value} trans:${transactionDate} ${fromDate.value > transactionDate}, ${expenseEntry.parentElement.parentElement.style.display}`)
        expenseEntry.parentElement.parentElement.style.display = "none";
      }
    }

    if (toDate.value) {
      if (toDate.value < transactionDate) {
        expenseEntry.parentElement.parentElement.style.display = "none";
      }
    }
  });
});
