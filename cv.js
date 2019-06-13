const Region ={
	LEFT: "left", RIGHT: "right", TOP: "top", BOTTOM: "bottom"
}
function getRegionPointer(box, x, y) {
	if (box.width > box.height) {
		wlo = box.width / 6;
		whi = wlo * 5;
		hmid = box.height / 2;
		console.log("region: ", "(" + box.width + "," + box.height + ")" + wlo + " " + whi + " " + hmid);
		if (x < box.left + wlo) return Region.LEFT;
		else if (x > box.left + whi) return Region.RIGHT;
		else if (y < box.top + hmid) return Region.TOP;
		else return Region.BOTTOM;
	} else {
		hlo = box.height / 6;
		hhi = hlo * 5;
		wmid = box.width / 2;
		console.log("region: ", "(" + box.width + "," + box.height + ")" + hlo + " " + hhi + " " + wmid);
		if (y < box.top + hlo) return Region.TOP;
		else if (y > box.top + hhi) return Region.BOTTOM;
		else if (x < box.left + wmid) return Region.LEFT;
		else return Region.RIGHT;
	}
	
}
//only exchange elements having the same parent
function exchangeElements(element1, element2, region) {
	
	if (element1 == null || element2 == null) return element1;
	if (element1 == element2) return element1;
	
	console.log('Region', region);
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
		var r = getRegionPointer(elm.getBoundingClientRect(), e.clientX, e.clientY);
		elmnt = exchangeElements(elmnt, elm, r);	
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
		elmnt.onmousedown = dragMouseDown;
  }


}
