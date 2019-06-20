
//Make the DIV element draggagle:
//document.getElementById("mydivheader").ondragstart = handleDragStart;
//document.getElementById("Move").ondragover = handleDragOver;

$(function() {
    const Region = { LEFT: "left", RIGHT: "right", BOTTOM: "bottom", TOP: "top"};

    $.fn.getRegion = function(box, x, y) {
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

    $.fn.isRow = function () { return $(this).hasClass("row"); };
    $.fn.isCol = function() { return $(this).hasClass("col") || $(this).hasClass("col-auto")};

    $.fn.getContainer = function() {
        let $child = null, $parent = $(this);
        do {
            $child = $parent;
            $parent = $child.parent();
        } while ($parent.children(":not(.ui-draggable-dragging)").length == 1)
        return $child;
    }

    var count = 0;
    // make row and column items draggable
    $("div.col, div.row").draggable({
        helper: "clone",
        opacity: 0.34,
        start: function(event, ui) {
            // store the original width and height of the item
            this.original_width = $(this).width();
            this.original_height = $(this).height();
            //initially, the inserted_item will be $(this)
            this.inserted_item = $(this);
            this.inserted_item.css("opacity", "0.34");
            
        },
        drag: function(event, ui) {
            // set the helper width and height to its original values
            ui.helper.width(this.original_width).height(this.original_height);
        
            // get the target element where the mouse is pointing at
            let target = document.elementFromPoint(event.clientX, event.clientY);
        
            if (jQuery.contains(this, target) || this === target) return;
        
            // get the region of the target element where the mouse pointer is
            let region = $(this).getRegion(target.getBoundingClientRect(), event.clientX, event.clientY);
            console.log(region +", isRow" + $(target).isRow());
            console.log(target);
            if (!$(target).isRow() && !$(target).isCol()) return;
            if ($(target).isRow() && (region != Region.TOP && region != Region.BOTTOM)) return;
            if ($(target).isCol() && (region != Region.LEFT && region != Region.RIGHT)) return;

            // get the container of the dragged object
            let $container = $(this).getContainer();
            let $parent = $container.parent();
            // remove the dragged object from the screen, but keep it in $dragged
            let $dragged = $(this).detach().css("opacity","");
            if ($dragged.isCol()) $dragged.applyCol(true);
            
            // initially the wrapper will be $dragged
            let $wrapper = $dragged;

            //put $dragged inside a wrapper if necessary
            if ($(target).isRow()) {
                if ($(this).isCol())
                    $wrapper = $('<div class="row ui-draggable ui-draggable-handle"></div>').append($dragged);
            } else if ($(target).isCol()) {
                if ($(this).isRow())
                    $wrapper = $('<div class="col ui-draggable ui-draggable-handle"></div>')
                                    .append($('<div class="container"></div>').append($dragged));
            }                
            
            this.inserted_item = (region == Region.LEFT || region == Region.TOP)? 
                                $wrapper.insertBefore($(target)) : $wrapper.insertAfter($(target));

            this.inserted_item.css("opacity", "0.34");

            // remove original container of the dragged object
            if ($container[0] !== $dragged[0]) $container.remove();
            if ($parent.isRow()) $parent.children().applyCol(true);
        },
        stop: function(event, ui) {
            this.inserted_item.css("opacity", "");            
        }
    });

    $.fn.applyCol = function(isOn) {
        if (isOn) {
            $(this).addClass("col").removeClass("col-auto");
        } else {
            let w = $(this).width();
            $(this).removeClass("col").addClass("col-auto");
            $(this).width(w);
        }
    }

    //$("div.row .col:not(:last-child)").storeCurrentDimension(true);

    
    // make column resizable
    $("div.row .col:not(:last-child)").resizable({     
        handles: "e",
      //  grid: [20, 10],
        autoHide: true,
        start: function(event, ui) { 
            this.widthSum = $(this).next().width() + $(this).width();     
            this.lastWidth = $(this).width();
            $(this).parent().children().applyCol(false);
        },
        resize: function(event, ui) {
            ui.size.height = ui.originalSize.height;  //fix the height
            $neighbor = $(this).next();  
            if (this.widthSum < ui.element.width()) {
                $neighbor.width(this.widthSum - this.lastWidth);
                $(this).width(this.lastWidth);
            } else {
                this.lastWidth = $(this).width();
                $neighbor.width(this.widthSum - ui.element.width());            
            } 
        },
    });
});

