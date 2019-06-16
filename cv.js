
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

function isRow(element) {
	return element && element.classList && element.classList.contains("row");
}

function isContainer(element) {
	return element && element.classList && (element.classList.contains("container") || element.classList.contains("container-fluid"));
}

function isCol(element) {
	return element && element.parentNode && isRow(element.parentNode);
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

function createNode(tagName, className) {
    let node = document.createNode(tagName);
    node.className = className;
    return node;
}

function createWrapper(insrt, elm, region) {
    if (isCol(elm)){
        if (isCol(insrt)) {
            if (region == Region.LEFT || region == Region.RIGHT) {
                if (region == Region.LEFT)
                    return [elm.nodeClone(true), insert.nodeClone(true)];
                else 
                    return [insert.nodeClone(true), elm.nodeClone(true)];
            } else {
                let c = createNode("DIV", "col");
                let container = createNode("DIV", "container");
                let row1 = createNode("DIV", "row");
                let row2 = createNode("DIV", "row");
                if (region == Region.TOP) {
                    row1.appendChild(insrt.nodeClone(true));
                    row2.appendChild(elm.nodeClone(true));
                } else {
                    row1.appendChild(elm.nodeClone(true));
                    row2.appendChild(insrt.nodeClone(true));
                }
                c.appendChild(container);
                container.appendChild(row1);
                container.appendChild(row2);
                return [c];
            }
        } else if (isRow(insrt)) {
            if (region == Region.LEFT || region == Region.RIGHT) {
                let c = createNode("DIV", "col");
                let container = createNode("DIV", "container");
                c.appendChild(container);
                container.appendChild(insrt.cloneNode(true));
                if (region == Region.LEFT) 
                    return [elm.nodeClone(true), c];
                else 
                    return [c, elm.nodeClone(true)];
            } else {
                let c = createNode("DIV", "col");
                let container = createNode("DIV", "container");
                let row = createNode("DIV", "row");
                row.appendChild(elm.nodeClone(true));
                if (region == Region.TOP) {
                    container.appendChild(insrt.nodeClone(true));
                    container.appendChild(elm.nodeClone(true));
                } else {
                    container.appendChild(elm.nodeClone(true));
                    container.appendChild(insrt.nodeClone(true));
                }
                c.appendChild(container);
                return [c];
            }
        }
    } else if (isRow(elm)) {
        if (isCol(insrt)) {
            if (region == Region.LEFT || region == Region.RIGHT) {
                let r = createNode("DIV", "row");
                let c = createNode("DIV", "col");
                let container = createNode("DIV", "container");
                c.appendChild(container);
                container.appendChild(elm.cloneNode(true));
                if (region == Region.LEFT) {
                    r.appendChild(insrt.cloneNode(true));
                    r.appendChild(elm.cloneNode(true));
                } else { 
                    r.appendChild(elm.cloneNode(true));
                    r.appendChild(insrt.cloneNode(true));
                }
                return [r];
            } else {
                let r = createNode("DIV", "row");
                r.appendChild(insrt.cloneNode(true));
                if (region == Region.TOP) {
                    return [r, elm.cloneNode(true)];
                } else { 
                    return [elm.cloneNode(true), r];
                }
            }
        } else if (isRow(insrt)) {
            if (region == Region.LEFT || region == Region.RIGHT) {
                let container1 = createNode("DIV", "container");
                let container2 = createNode("DIV", "container");
                let c1 = createNode("DIV", "col");
                let c2 = createNode("DIV", "col");
                let r = createNode("DIV", "row");
                r.appendChild(c1);
                r.appendChild(c2);
                c1.appendChild(container1);
                c2.appendChild(container2);
                container1.appendChild(insrt.cloneNode(true));
                container2.appendChild(elm.cloneNode(true));
                
                if (region == Region.LEFT) {
                    r.appendChild(insrt.cloneNode(true));
                    r.appendChild(elm.cloneNode(true));
                } else { 
                    r.appendChild(elm.cloneNode(true));
                    r.appendChild(insrt.cloneNode(true));
                }
                return [r];
            } else {
                if (region == Region.TOP) {
                    return [elm.cloneNode(true), insrt.cloneNode(true)];
                } else { 
                    return [insrt.cloneNode(true), elm.cloneNode(true)];
                }
            }
        }
    }
}

function insertElement(inserted, elm, region) {
    if (isCol(elm)) {
        if (region == Region.LEFT) {
            // create clone
            let clone = createWrapper(inserted, elm, region); // create clone
            let new_elm = integrateClone(clone, elm); // insert
            erase(inserted);
        } else if (region == Region.RIGHT) {

        } else if (region == Region.TOP) {

        } else if (region == Region.BOTTOM) {

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
