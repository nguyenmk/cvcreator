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
    // calculate the new cursor position:
    var elm = document.elementFromPoint(e.clientX, e.clientY);
		console.log('elmnt before', elmnt);
		console.log('elmnt parent', elmnt.parentNode);
		if (elm && elm != elmnt.parentNode) {
			console.log('elm', elm);
			elmnt = exchangeElements(elmnt, elm);
		}
		console.log('elmnt after', elmnt);
		console.log('elmnt parent after', elmnt.parentNode);
    //console.log("elm", elm);
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }

	function exchangeElements(element1, element2) {
		if (element1 != element2 && element1 != null
		&& element2 != null && element1.parentNode == element2.parentNode) {
			var clonedElement1 = element1.cloneNode(true);
			var clonedElement2 = element2.cloneNode(true);
			console.log('element1 before', element1);
			console.log('element1 parent before', element1.parentNode);
			console.log('element2 before', element2);
			console.log('element2 parent before', element2.parentNode);
			element2.parentNode.replaceChild(clonedElement1, element2);
			element1.parentNode.replaceChild(clonedElement2, element1);
			console.log('element1 after', element1);
			console.log('element1 parent after', element1.parentNode);
			console.log('element2 after', element2);
			console.log('element2 parent after', element2.parentNode);

			return clonedElement1;
		}
		else return element1;
	}
}
