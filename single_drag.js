/* 
target is element that trigger the event

currentTarget is where event listener is attached to
*/

let drag1 = document.querySelector('#draggable-1'); //the draggable element
let container = document.querySelector('.example-dropzone');//container
let oldContainer = document.querySelector('.example-parent'); //original container

//dragstart to change color to yellow when drag start 
drag1.addEventListener('dragstart', (event) => {
  event.dataTransfer.setData('text/plain', event.target.id);
  event.currentTarget.style.backgroundColor = 'yellow';
});

//revert draggable to original color when release
drag1.addEventListener('dragend', (event) => {
  event.currentTarget.style.backgroundColor = '#4aae9b';
});


//disable default action to prevent dropping
container.addEventListener('dragover', (event) => {
  event.preventDefault();
})

container.addEventListener('drop', (event) => {
  event.target.appendChild(drag1); //event.target : container
  event.dataTransfer.clearData(); //clear data
})

oldContainer.addEventListener('dragover', (event) => {
  event.preventDefault();
})

oldContainer.addEventListener('drop', (event) => {
  //only want draggable to be dropped in either container or oldContainer

  if (Array.from(event.target.classList).includes('example-origin')) {
    event.target.appendChild(drag1); 
    event.dataTransfer.clearData(); //clear data
  }
})
