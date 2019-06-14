
//Make the DIV element draggagle:
//document.getElementById("mydivheader").ondragstart = handleDragStart;
//document.getElementById("Move").ondragover = handleDragOver;

const Region = { TOP: "top", BOTTOM: "bottom", LEFT: "left", RIGHT: "right"}

function getRegion(box, x, y) {
	if (box.width > box.height) {
		let w_lo = box.width / 6;
		let w_hi = w_lo * 5;
		let h_mi = box.height / 2;
		if (x < box.left + w_lo) return Region.LEFT;
		else if (x > box.left + w_hi) return Region.RIGHT;
		else if (h_mi < box.top + h_mi) return Region.TOP;
		else return Region.BOTTOM;
	} else {
		let h_lo = box.height / 6;
		let h_hi = h_lo * 5;
		let w_mi = box.width / 2;
		if (y < box.top + h_lo) return Region.TOP;
		else if (y > box.top + h_hi) return Region.BOTTOM;
		else if (x < box.left + w_mi) return Region.LEFT;
		else return Region.RIGHT;
	}
}

let div_elements = document.getElementsByTagName("DIV");
for (var i = 0; i < div_elements.length; ++i) {
	div_elements.ondragstart = handleDragStart;
	div_elements.ondragover = handleDragOver;
	div_elements.ondop = handleDrop;
}

let dragged_item = null;
let last_dragged_over_item = null;

function can_exchange(element1, element2) {
	return element1 != null && element2 != null && element1 != element2 && element1.parentNode != null && element2.parentNode != null;
}
//only exchange elements having the same parent
function exchangeElements(element1, element2) {
	if (can_exchange(element1, element2)) {
		var clonedElement1 = element1.cloneNode(true);
		var clonedElement2 = element2.cloneNode(true);
		element2.parentNode.replaceChild(clonedElement1, element2);
		element1.parentNode.replaceChild(clonedElement2, element1);
		return [clonedElement1, clonedElement2];
	}
	else return [element1, element2];
}

function isColItem(element) {
	return element && element.classList && element.classList.contains("row");
}

function isRowItem(element) {
	return element && element.classList && (element.classList.contains("container") || element.classList.contains("container-fluid"));
}

const ContainerType = { Container: "container", Row: "row", None: "none"};

function createClone(element, otherElement, containerType) {
	if (containerType == ContainerType.None) {
		return inserted.cloneNode(true);
	} else {
		let clone = document.createNode("DIV");
		if (containerType == ContainerType.Container) clone.class = "container";
		else clone.class = "row";
		clone.appendChild(element.cloneNode(true));
		clone.appendChild(otherElement.cloneNode(true));
		return cloned;
	}
}

function removeElement(element) {
	if (element.parentNode) {
		if (element.parentNode.childNodes.length == 2 && element.parentNode.parentNode) {
			// unwrap
			let otherNode = element.parentNode.childNodes[0];
			if (otherNode == element) otherNode = element.parentNode.childNodes[1];
			let clone = otherNode.cloneNode(true);
			element.parentNode.parentNode.replace(clone, element.parentNode);
		}
		else {
			element.parentNode.removeChild(element);
		}
	}
}

const NodeAddType = { Insert: "insertBefore", Replace: "replace", Append: "append"};

function integrateClone(clone, element, nodeAddType) {
	if (nodeAddType == NodeAddType.Insert) return element.parentNode.insertBefore(clone, element);
	else if (nodeAddType == NodeAddType.Replace) return element.parentNode.replace(clone, element);
	else element.parentNode.append(clone, element);
}

function insertElement(inserted, element, region) {
	if (region == Region.LEFT) {
		if (isRowItem(element)) {
			let clone = createClone(inserted, element, ContainerType.None);
			let new_element = integrateClone(clone, element, NodeAddType.Insert);
			removeElement(inserted);
			return new_element;
		} else {
			//wrap around by a container
			let clone = createClone(inserted, element, ContainerType.Row);
			// integrate clone and clean
			let new_element = integrateClone(clone, element, NodeAddType.Replace);
			// remove the inserted
			removeElement(inserted);

			return new_element;
		}
	} else if (region == Region.RIGHT) {
		if (isRowItem(element)) {
			let clone = createClone(inserted, element, ContainerType.None);
			let new_element = integrateClone(clone, element, NodeAddType.Append);
			removeElement(inserted);
			return new_element;
		} else {
			//wrap around by a container
			let clone = createClone(inserted, element, ContainerType.Row);
			// integrate clone and clean
			let new_element = integrateClone(clone, element, NodeAddType.Replace);
			// remove the inserted
			removeElement(inserted);

			return new_element;
		}
	} else if (region == Region.TOP) {
		if (isColItem(element)) {
			let cloned = createClone(inserted, element, ContainerType.None);
			let new_element = integrateClone(clone, element, NodeAddType.Insert);
			removeElement(inserted);
			return new_element;
		} else {
			//wrap around by a container
			let clone = createClone(inserted, element, ContainerType.Container);
			// integrate clone and clean
			let new_element = integrateClone(clone, element, NodeAddType.Replace);
			// remove the inserted
			removeElement(inserted);

			return new_element;
		}
	} else if (region == Region.BOTTOM) {
		if (isColItem(element)) {
			let clone = inserted.cloneNode(true);
			let new_element = element.parentNode.append(clone, element);
			removeElement(inserted);
			return new_element;
		} else {
			//wrap around by a container
			let clone = createClone(inserted, element, ContainerType.Container);
			// integrate clone and clean
			let new_element = integrateClone(clone, element, NodeAddType.Append);
			// remove the inserted
			removeElement(inserted);

			return new_element;
		}
	}
}

function handleDragStart(ev) {
  this.style.opacity = '0.4';  // this / e.target is the source node.
	dragged_item = ev.target
	dragged_item.ondragstart = handleDragStart;
}

/*
function handleDragOver(ev) {
    ev.preventDefault(); // Necessary. Allows us to drop.
		if (ev.target != last_dragged_over_item) { //swap back the last one
			[dragged_item, dragged_over_item] = exchangeElements(dragged_item, last_dragged_over_item);
		}
		// swap the current one
		[dragged_item, dragged_over_item] = exchangeElements(dragged_item, ev.target);
		dragged_over_item.ondragover = handleDragOver;
		last_dragged_over_item = dragged_over_item;
}
*/

function handleDragOver(ev) {
    ev.preventDefault(); // Necessary. Allows us to drop.
		// insert the current one
		dragged_item = insertElement(dragged_item, ev.target, r);
		ev.target.ondragover = handleDragOver;
}


function handleDrop(ev) {

}
