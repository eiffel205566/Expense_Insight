
let drags = Array.from(document.querySelectorAll('.draggable')); //All elements able to drag
let containers = Array.from(document.querySelectorAll('.container'));
let placeholder = document.querySelector('#placeholder'); //placeholder
let dateElement = document.querySelector('#date');
let dropDown = document.querySelector('.fas.fa-chevron-down')
let refresh = document.querySelector('#refresh');
let refreshableContent = Array.from(document.querySelectorAll('.content-4-input'));
let content5 = document.querySelector('.indexedDb');
let content5TopElements = document.querySelectorAll('.content-5 .content-5-header p[data-sort]'); //Elements click to sort

// let elementEntrySubmit = document.querySelector('#value-submit'); //display value
// let elementEntryDone= document.querySelector('#value-done');
// let elementEntryTodo = document.querySelector('#value-todo');

let date = new Date();
dateElement.innerHTML = date.toDateString();

let totalSubmitCount = document.querySelector('.indexedDb').childElementCount;
// elementEntrySubmit.innerText = totalSubmitCount;


//Iterate all container and make them droppable by calling event.preventDefault();
containers.map(
  (container) => {
    container.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    container.addEventListener('drop', (event) => {
      let elementId = event.dataTransfer.getData('text');
      let elementToDrop = document.querySelector('#' + elementId);

      // drop on an expense-cat container
      if (Array.from(event.target.classList).includes('container')) {
        event.target.appendChild(elementToDrop);
        container.removeChild(placeholder);
      };

      // drop on a sibling draggable to be append after the sibling element
      if (Array.from(event.target.classList).includes('draggable')) {
        event.target.insertAdjacentElement('afterend', elementToDrop)
        container.removeChild(placeholder);
      };

      // drop on placeholder
      if (event.target.id === 'placeholder') {
        event.target.insertAdjacentElement('afterend', elementToDrop)
        container.removeChild(placeholder);
      };

      //drop on container header (.expense-h)
      if (Array.from(event.target.classList).includes('expense-h')) {
        event.target.insertAdjacentElement('afterend', elementToDrop)
        container.removeChild(placeholder);
      }

    });
  }
)

//add opacity effect for the element being dragged, and revert it back when on mouse release
drags.map(
  (drag) => {
    drag.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', event.target.id);
      event.currentTarget.style.opacity = '0.5';
    });
    
    drag.addEventListener('dragend', (event) => {
      event.currentTarget.style.opacity = '1';

      //in case dropped anywhere else, remove placeholder
      try {
        containers.map(
          (container) => {
            if (Array.from(container.children).includes(placeholder)) {
              container.removeChild(placeholder);
            }
          }
        )
      }
      catch(error) {
        console.log(error)
      }
      
    });
  }
);

//add placeholder appearance mechanism to all container
containers.map(
  (container) => {
    container.addEventListener('dragover', (event) => {

      placeholder.innerHTML = 'put it here'; //make placeholder appear
      let eventTargetId = event.target.id; //take event.target.id, only #draggable/#expense-cat are droppable
      let eventTargetCls = Array.from(event.target.classList);

      if (eventTargetId.slice(0,11) === 'expense-cat') { 
        if (!Array.from(container.children).includes(placeholder)) { //drop into an expense-cat bucket
          container.appendChild(placeholder);
        }
      } else if (eventTargetId.slice(0,9) === 'draggable') { //drop below an draggable item 
          event.target.insertAdjacentElement('afterend', placeholder);
      } else if (Array.from(event.target.classList).includes('expense-h')) {
          event.target.insertAdjacentElement('afterend', placeholder)
      }
       else return;
    });
  }
)

//Dropdown
dropDown.addEventListener('click', (event) => console.log(event.currentTarget));

//Refresh button
refresh.addEventListener('click', (event) => {
  refreshableContent.forEach((element) => element.value = "");
});


//add event listener 
content5TopElements.forEach(
  (element, index) => {
    element.addEventListener('click', () => sortNthListItems(index + 1) )
  }
);

//Nth: nth column number, start with 1 
function sortNthListItems(n) {
  console.log(n);
  let sortElement = document.querySelector(`p[data-sort]:nth-child(${n})`) //get sort flag
  let sortFlag = sortElement.getAttribute('data-sort');
  let listItemsSelected = Array.from(document.querySelectorAll(`li[data-id]>p:nth-child(${n})`)); //get list items to be sorted

  let sortFunction;

  if (sortFlag) {
    //if sortFlag is empty, reverse order;
    //column 2 & 4 & 3 are string, rest columns can be converted to number;
    if (n === 2 || n === 4 || n === 3) {
      sortFunction = (a, b) => (a.innerText > b.innerText ? 1 : -1);
    } else {
      sortFunction = (a, b) => (+a.innerText - +b.innerText);
    }

    //update data-sort
    sortElement.setAttribute('data-sort', '');

    //if sortFlag is not empty, change back to normal order
  } else { 
      if (n === 2 || n === 4 || n === 3) {
        sortFunction = (a, b) => (b.innerText > a.innerText ? 1 : -1);
      } else {
        sortFunction = (a, b) => (+b.innerText - +a.innerText);
      }
      //update data-sort
      sortElement.setAttribute('data-sort', 'Sorted');
  }

  //Remove all nodes from content5
  while (content5.firstChild) {
    content5.removeChild(content5.firstChild);
  };

  //re-add them back with sorted order
  let sortedListItems = listItemsSelected.sort(sortFunction);
  sortedListItems.forEach(
    (element) => content5.appendChild(element.parentNode)
  )
};


