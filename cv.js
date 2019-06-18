
//Make the DIV element draggagle:
//document.getElementById("mydivheader").ondragstart = handleDragStart;
//document.getElementById("Move").ondragover = handleDragOver;


const GridType = { Row: "row", Col:"col", None: "none"};

const Region = { LEFT: -2, RIGHT: -1, BOTTOM: 2, TOP: 1}

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

function promoteElement(elm, targetType) {
    if (getGridType(elm) == GridType.Row) {
        if (targetType == GridType.Col) {
            let container = createNode("DIV", "container");
            if (elm instanceof Array) {            
                for (el of elm) container.appendChild(el.cloneNode(true));
            } else container.appendChild(elm.cloneNode(true));
            let col = createNode("DIV", "col");
            col.appendChild(container);
            return col;
        } else {
            if (elm instanceof Array) {
                let arr = [];
                for (el of elm) arr.push(el.cloneNode(true));
                return arr;
            } else return elm.cloneNode(true);
        }
    } else {
        if (targetType == GridType.Row) {
            let row = createNode("DIV", "row");
            if (elm instanceof Array) {  
                for (el in elm) {
                    console.log("before crash", el);
                    row.appendChild(el.cloneNode(true));
                }
            } else row.appendChild(elm.cloneNode(true));
            return row;
        }  else {
            if (elm instanceof Array) {
                let arr = [];
                for (el of elm) arr.push(el.cloneNode(true));
                return arr;
            } else return elm.cloneNode(true);
        }
    }    
}

function createWrapper(insrt, elm, region) {
    let insrt_new, elm_new;
    if (isLeftRight(region)) {
        insrt_new = promoteElement(insrt, GridType.Col);
        elm_new = promoteElement(elm, GridType.Col);
    } else {
        insrt_new = promoteElement(insrt, GridType.Row);
        elm_new = promoteElement(elm, GridType.Row);
    }
    let arr;
    if (getGridType(elm) === GridType.Col && isLeftBottom(region) || getGridType(elm) === GridType.Row && !isLeftBottom(region)) arr = [elm_new, insrt_new];
    else arr = [insrt_new, elm_new];
    
    return promoteElement(arr, getGridType(elm));    
}

function erase(dragged_item, target, arr, region) {
    let childNode = null, parentNode = dragged_item;
    do {
        childNode = parentNode;
        parentNode = childNode.parentNode;
    } while (parentNode != null && countChildren(parentNode) == 1)

    if (parentNode != null) parentNode.removeChild(childNode);
    if (arr instanceof Array) {
        if (region == Region.LEFT || region == Region.TOP) {
            return [arr[arr.length-1], arr[0]];
        } else return arr;
    } else return [arr, target];
}

function handleDragStart(ev) {
  this.style.opacity = '0.4';  // this / e.target is the source node.
	dragged_item = ev.target

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
function handleDragOver(ev) {
    if (ev.target == dragged_item) return;
    if (sameRoot(ev.target, dragged_item)) return;
    
    ev.preventDefault(); // Necessary. Allows us to drop.

    // get the target element where the mouse pointer is
    let elm = document.elementFromPoint(ev.clientX, ev.clientY);

    console.log(getGridType(dragged_item) + " " + getGridType(elm));
    // get the region of the target element where the mouse pointer is
    let region = getRegion(elm.getBoundingClientRect(), ev.clientX, ev.clientY);
    console.log(region);
    
    if (region == Region.TOP) return;
    

    // create wrapper    
    let wrapper = createWrapper(dragged_item, elm, region);
    
    // insert the wrapper in front of the target element
    let new_elm = elm;
    let arr = []
    if (wrapper instanceof Array) {
        for (let el of wrapper) {
            new_elm = elm.parentNode.insertBefore(el, new_elm);
            arr.push(new_elm);
        }
    } else {
        new_elm = elm.parentNode.insertBefore(wrapper, new_elm);
        arr.push(new_elm);
    }
    //remove the target element
    elm.parentNode.removeChild(elm);

    //erase the dragged element and point to the wrapper
    [dragged_item, target_item] = erase(dragged_item, ev.target, arr, region);

    dragged_item.ondragstart = handleDragStart;
    target_item.ondragover = handleDragOver;
}

