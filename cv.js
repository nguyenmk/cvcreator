
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
    $.fn.isCol = function() { return $(this).hasClass("mycol")};

    $.fn.getContainer = function() {
        let $child = null, $parent = $(this);
        do {
            $child = $parent;
            $parent = $child.parent();
        } while ($parent.children(":not(.ui-draggable-dragging)").length == 1)
        return $child;
    }

    // make row and column items draggable
    $("div.mycol, div.row").draggable({
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

            if (!$(target).isRow() && !$(target).isCol()) return;
            if ($(target).isRow() && (region != Region.TOP && region != Region.BOTTOM)) return;
            if ($(target).isCol() && (region != Region.LEFT && region != Region.RIGHT)) return;

            // get the container of the dragged object
            let $container = $(this).getContainer();

            // remove the dragged object from the screen, but keep it in $dragged
            let $dragged = $(this).detach().css("opacity","");
            if ($dragged.isCol()) $dragged.removeClass("col-sm-auto").addClass("col-sm");
            
            // initially the wrapper will be $dragged
            let $wrapper = $dragged;

            //put $dragged inside a wrapper if necessary
            if ($(target).isRow()) {
                if ($(this).isCol())
                    $wrapper = $('<div class="row ui-draggable ui-draggable-handle"></div>').append($dragged);
            } else if ($(target).isCol()) {
                if ($(this).isRow())
                    $wrapper = $('<div class="col-sm mycol ui-draggable ui-draggable-handle"></div>')
                                    .append($('<div class="container"></div>').append($dragged));
            }                
            
            this.inserted_item = (region == Region.LEFT || region == Region.TOP)? 
                                $wrapper.insertBefore($(target)) : $wrapper.insertAfter($(target));

            this.inserted_item.css("opacity", "0.34");

            // remove original container of the dragged object
            if ($container[0] !== $dragged[0]) $container.remove();            
        },
        stop: function(event, ui) {
            this.inserted_item.css("opacity", "");            
        }
    });

    $.fn.storeCurrentDimension = function() {
        let w = $(this).width();
        let h = $(this).height();
        $(this).toggleClass("col-sm").toggleClass("col-sm-auto");
        $(this).width(w);
        $(this).height(h);
    }

    $("div.row .mycol").storeCurrentDimension();

    
    // make column resizable
    $("div.row .mycol:not(:last-child)").resizable({   
        helper: "resizable-helper",     
        handles: "e",
      //  grid: [20, 10],
        autoHide: true,
        start: function(event, ui) {       
            this.w = $(this).width();
            this.h = $(this).height();            
        },
        resize: function(event, ui) {
            ui.size.height = ui.originalSize.height;
            $neighbor = $(this).next();
            $neighbor.width($neighbor.width() - ui.helper.width() + ui.element.width());
            console.log($(this).width() + "," + $neighbor.width());
            console.log("helper", ui.element.width() + "," + ui.helper.width());
        },
        stop: function(event, ui) {
        }
    });
    
});

