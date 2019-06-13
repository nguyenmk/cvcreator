
//only exchange elements having the same parent
function exchangeElements(element1, element2) {
	
	if (element1 == null || element2 == null) return element1;
	if (element1 == element2) return element1;
	console.log('elm1', element1);
	console.log('elm2', element2);
	
	if (element1.parentNode == element2.parentNode && element1.parentNode != null && element2.parentNode != null) {
		var clonedElement1 = element1.cloneNode(true);
		var clonedElement2 = element2.cloneNode(true);
		element2.parentNode.replaceChild(clonedElement1, element2);
		element1.parentNode.replaceChild(clonedElement2, element1);
		return clonedElement1;
	}
	else return element1;
}

//Make the DIV element draggagle:
dragElement(document.getElementById("mydivheader"));

function dragElement(elmnt) {

  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
		
    // get element at the mouse cursor
    var elm = document.elementFromPoint(e.clientX, e.clientY);
		
		elmnt = exchangeElements(elmnt, elm);		
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }


}
