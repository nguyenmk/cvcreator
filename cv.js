
//Make the DIV element draggagle:
//document.getElementById("mydivheader").ondragstart = handleDragStart;
//document.getElementById("Move").ondragover = handleDragOver;


const GridType = { Row: "row", Col:"col", None: "none"};

const Region = { LEFT: "left", RIGHT: "right", BOTTOM: "bottom", TOP: "top"};

function isLeftRight(region) { return region < 0; }
function isLeftBottom(region) { return Math.abs(region) == 2; }

function getRegion(box, x, y) {
	if (box.width > box.height) {
		let w_lo = box.width / 6;
		let w_hi = w_lo * 5;
		let h_mi = box.height / 2;
		if (x < box.left + w_lo) return Region.LEFT;
		else if (x > box.left + w_hi) return Region.RIGHT;
		else if (y < box.top + h_mi) return Region.TOP;
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
    let elm = div_elements[i];
    let gridType = getGridType(elm);
    if ( gridType == GridType.Row || gridType == GridType.Col) {
        console.log(elm);
        elm.draggable = true;
        elm.ondragstart = handleDragStart;
        elm.ondragover = handleDragOver;
    }
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

function getGridType(element) {
    if (element instanceof Array) {
        if (element.length > 0) return getGridType(element[0]);            
    } else {
        if (element != null && element.classList && element.classList.contains("row")) return GridType.Row;
        else if (element.parentNode && getGridType(element.parentNode) == GridType.Row) return GridType.Col;
    }
    return GridType.None;
}

function createNode(tagName, className) {
    let node = document.createElement(tagName);
    node.className = className;
    return node;
}

function countChildren(element) {
    let count = 0;
    if (element.childNodes) {
        for (let item of element.childNodes) {
            if (item.nodeType != Node.TEXT_NODE) ++count;
        }
    }
    return count;
}

function findRoot(element) {
    let child = null, parent = element;
    do {
        child = parent;
        parent = child.parentNode;
    } while (parent != null && countChildren(parent) == 1)
    return child;
}

function sameRoot(element1, element2) {
    return findRoot(element1) == findRoot(element2);
}

function handleDragStart(ev) {
    this.style.opacity = '0.4';  // this / e.target is the source node.
      dragged_item = ev.target
  
}
  
function remove(element) {
    let child = null, parent = element;
    do {
        child = parent;
        parent = child.parentNode;
    } while (countChildren(parent) == 1)

    parent.removeChild(child);
}

function promote(element, targetGridType) {
    let root = element.cloneNode(true);
    if (targetGridType == GridType.Row) {
        if (getGridType(element) == GridType.Row) {
            return [root, root];
        } else if (getGridType(element) == GridType.Col) {
            let row = createNode("DIV", "row");
            row.appendChild(root);
            return [row, root];
        }
    } else if (targetGridType == GridType.Col) {
        if (getGridType(element) == GridType.Row) {
            let container = createNode("DIV", "container");
            container.appendChild(root);
            let col = createNode("DIV", "col");
            col.appendChild(container);
            return [col, root];
        } else if (getGridType(element) == GridType.Col) {
            return [root, root];
        }
    }
}
function handleDragOver(ev) {
     
    ev.preventDefault(); // Necessary. Allows us to drop.

    if (ev.target == dragged_item) return;

    // get the target element where the mouse pointer is
    let hovered_item = document.elementFromPoint(ev.clientX, ev.clientY);

    // get the region of the target element where the mouse pointer is
    let region = getRegion(hovered_item.getBoundingClientRect(), ev.clientX, ev.clientY);

    console.log(region + " ", getGridType(hovered_item));

    if (getGridType(hovered_item) == GridType.Row && (region != Region.TOP && region != Region.BOTTOM)) return;
    if (getGridType(hovered_item) == GridType.Col && (region != Region.LEFT && region != Region.RIGHT)) return;

    // clone other item
    let [clone, cloneRoot] = promote(dragged_item, getGridType(hovered_item));
    
    // insert clone item
    let inserted_item;
    if (region == Region.LEFT || region == Region.TOP) {
        inserted_item = hovered_item.parentNode.insertBefore(clone, hovered_item);
    } else {
        if (hovered_item.nextSibling != null)
            inserted_item = hovered_item.parentNode.insertBefore(clone, hovered_item.nextSibling);
        else
            inserted_item = hovered_item.parentNode.appendChild(clone, hovered_item);
    }

    // remove other item
    remove(dragged_item);

    // assign new dragged_item
    dragged_item = cloneRoot;
    
}

