
//Make the DIV element draggagle:
//document.getElementById("mydivheader").ondragstart = handleDragStart;
//document.getElementById("Move").ondragover = handleDragOver;

$(function() {
    const Region = { L: "left", R: "right", B: "bottom", T: "top", O: "outside"};

    $.fn.getRegion = function(box, x, y) {
        if (box.width > box.height) {
            let dw = box.width / 6;
            let dh = box.height / 2;
            if (box.left <= x && x < box.left + dw) return Region.L;
            else if (box.left + dw * 5 < x && x <= box.left + box.width) return Region.R;
            else if (box.top <= y && y < box.top + dh) return Region.T;
            else if (box.top + dh <= y && y <= box.top + box.height) return Region.B;
            else return Region.O;
        } else {
            let dw = box.width / 2 ;
            let dh = box.height / 6;
            if (box.top <= y && y < box.top + dh) return Region.T;
            else if (box.top + dh * 5 < y && y <= box.top + box.height) return Region.B;
            else if (box.left <= x && x < box.left + dw) return Region.L;
            else if (box.left + dw <= x && x < box.left + box.width) return Region.R;
            else return Region.O;
        }
    }
    let $lastColTag = "lastcol"

    // add div.lastColTag type to all the .row elements
    $(".row").append('<div class="lastcol"></div>');
    $.fn.isRow = function () { return $(this).hasClass("row"); };
    $.fn.isCol = function() { return $(this).hasClass("mycol") };

    $.fn.getContainer = function() {
        let $child = null, $parent = $(this);
        do {
            $child = $parent;
            $parent = $child.parent();
        } while ($parent.children(":not(.ui-draggable-dragging):not(." + $lastColTag + ")").length == 1)
        return $child;
    }

    var count = 0;
    // make row and column items draggable
    $("div.mycol, div.row").draggable({
        helper: "clone",
        start: function(event, ui) {            
            this.original = { w:$(this).width(), h: $(this).height() }; // store width and height before dragging
            this.inserted = $(this).css("opacity", "0.34"); //initialize inserted item to $(this)
            ui.helper.css("opacity", "0.34");
        },
        drag: function(event, ui) {
            // set the helper width and height to its original values
            ui.helper.width(this.original.w).height(this.original.h);
            // get the target element where the mouse is pointing at
            let target = document.elementFromPoint(event.clientX, event.clientY);
        
            if (jQuery.contains(this, target) || this === target) return;
        
            // get the region of the target element where the mouse pointer is
            let region = $(this).getRegion(target.getBoundingClientRect(), event.clientX, event.clientY);

            if (!$(target).isRow() && !$(target).isCol()) return;
            if ($(target).isRow() && (region != Region.T && region != Region.B)) return;
            if ($(target).isCol() && (region != Region.L && region != Region.R)) return;

            if (count == 1) {
                let b = 0;
            }
            ++count;
            
            // get the container of the dragged object
            let $container = $(this).getContainer();            
            let $dragged = $(this).detach().css("opacity",""); // remove the dragged object, but keep it for later use
            //if ($dragged.isCol()) $dragged.applyCol(true);
                        
            let $wrapper = $dragged; // initialize the wrapper to $dragged

            //put $dragged inside a wrapper if necessary
            if ($(target).isRow() && $(this).isCol())
                $wrapper = $('<div class="row ui-draggable ui-draggable-handle"></div>')
                                .append($dragged).append('<div class="' + $lastColTag + '"></div>');
            else if ($(target).isCol() && $(this).isRow())
                $wrapper = $('<div class="' + $lastColTag + ' ui-draggable ui-draggable-handle"></div>')
                                .append($('<div class="container"></div>').append($dragged));
            

            if (region == Region.L || region == Region.T) {
                this.inserted = $wrapper.insertBefore($(target));
            } else {                
                this.inserted = $wrapper.insertAfter($(target));
            }
            

            this.inserted.css("opacity", "0.34");

            // remove original container of the dragged object
            if ($container[0] !== $dragged[0]) $container.remove();
        },
        stop: function(event, ui) {
            this.inserted.css("opacity", "");            
        }
    });

    // make column resizable
    $("div.row .mycol").resizable({     
        handles: "e",
        autoHide: true,
        start: function(event, ui) { 
            this.widthSum = $(this).next().width() + $(this).width();
        },
        resize: function(event, ui) {            
            ui.size.height = ui.originalSize.height;  //fix the height
            $neighbor = $(this).next();  
            if (this.widthSum <= ui.element.width()) {
                $neighbor.width(0);
                $(this).width(this.widthSum);
            } else {
                $neighbor.width(this.widthSum - ui.element.width());            
            } 
        },
    });
});

