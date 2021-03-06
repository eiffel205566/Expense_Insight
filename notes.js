/* 
drag and drop API

### --- Event handlers --- ###

- ondragstart: attached to draggable element and fire when "dargstart" event occurs

- ondragover: attached to container element (where you drop stuff off), and fire hwen "dragover" event occurs

- ondrop: attached to container element, fire when "drop" event occurs

- total 8 event handlers in total:

- ondrag
- ondragend
- ondragenter
- ondragexit
- ondragleav
- ondragover
- ondragstart
- ondrop

### --- ###

### --- DataTransfer Object (property of drag events!!!) --- ###

DataTransfer: object used to hold data that is being dragged during a drag and drop operation. can hold multiple dta

-- Method: setData

- dataTransfer.setData(format, data);
- format: a DOMString, type of the drag data to add to drag object
- data: DOMString represent the data to add to the drag object


### --- ###

toDo:

1. Validation on all 6 input fields (x)
2. Expense Category dropdown list
3. side bar & hamburger menu on nav bar (change to overlay)
4. sorting functionality for all content-5 detail (x)
5. drag/drop page (change to overlay)
6. content-3 dynamic data update (x)
7. responsiveness of index.html
8. sorting with date range on content-4 
9. insight page with tree structure 
10. Enter New Expense section had Merchant dropdown list added
11. Dynamic update for Merchant dropdown list


//Maybe add a "Category Management" page for metadata management, 
//where we can use drag & drop











*/