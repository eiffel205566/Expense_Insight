let drags = Array.from(document.querySelectorAll('.draggable')); //All elements able to drag
let containers = Array.from(document.querySelectorAll('.container'));
let placeholder = document.querySelector('#placeholder'); //placeholder

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