
//Make the DIV element draggagle:
//document.getElementById("mydivheader").ondragstart = handleDragStart;
//document.getElementById("Move").ondragover = handleDragOver;

$(function() {
  
    // add div.lastColTag type to all the .row elements
    $(".row").append('<div class="lastcol"></div>');
    $(".container").append('<div class="lastrow"></div>');

    $.fn.isRow = function () { return $(this).hasClass("row") || $(this).hasClass("lastrow"); };
    $.fn.isCol = function() { return $(this).hasClass("mycol") || $(this).hasClass("lastcol") };

    $.fn.getContainerUp = function() {
        let $child = null, $parent = $(this);
        do {
            $child = $parent;
            $parent = $child.parent();
        } while ($parent.children(".mycol:not(.ui-draggable-dragging), .row:not(.ui-draggable-dragging)").length <= 1)
        return $child;
    }

    $.fn.getContainerDown = function() {
        let $parent = $(this);
        let $children = $parent.children(".container, .mycol:not(.ui-draggable-dragging), .row:not(.ui-draggable-dragging)");
        while ($children.length == 1) {
            $parent = $children.eq(0);
            $children = $parent.children(".container, .mycol:not(.ui-draggable-dragging):not(.handler-c-wrapper), .row:not(.ui-draggable-dragging)");
        }
        return $parent;
    }
    $.fn.prependHandler = function () {
        if ($(this).isCol())
            $(this).prepend($('<div class="handler-c-wrapper"><div class="handler-c">&#9660;</div></div>'));
        else 
            $(this).prepend($('<div class="handler-r-wrapper"><div class="handler-r">&#9658;</div></div>'));
        return this;
    }

    $("div.mycol, div.lastcol").prependHandler();
    $("div.row, div.lastrow").prependHandler();

    var isDragOn = false;
    var hovered = null;

    // handle hover event on handler wrappers
    $(document).on("mouseenter",".mycol .handler-c-wrapper, .row .handler-r-wrapper", function(){
        if (isDragOn) {
            hovered = $(this).parent();
            $(this).find(".handler-c, .handler-r").css("display", "block");
        }
    }).on("mouseleave",".mycol .handler-c-wrapper, .row .handler-r-wrapper, .lastcol, .lastrow", function() {
        if (isDragOn) {
            $(this).find(".handler-c, .handler-r").css("display", "none");
            hovered = null;
        }
    });

    // handle hover event on .lastcol, .lastrow 
    $(document).on("mouseenter",".lastcol, .lastrow", function(){
        if (isDragOn) {
            hovered = $(this);
            $(this).find(".handler-c, .handler-r").css("display", "block");
        }
    }).on("mouseleave",".mycol .handler-c-wrapper, .row .handler-r-wrapper, .lastcol, .lastrow", function() {
        if (isDragOn) {
            $(this).find(".handler-c, .handler-r").css("display", "none");
            hovered = null;
        }
    });

    
    var selected = null;
    $(document).on("mousedown", "div.mycol, div.row", function(ev){
        ev.stopPropagation();
        if ($(this).is(selected)) {
            selected.css("opacity","");
            selected = null;
        } else {
            if (selected !== null) selected.css("opacity","");
            selected = $(this).css("opacity", "0.34");
        }
    })

    $.fn.makeDraggable = function () {
        $(this).draggable( {
            helper: "clone",
            opacity: 0.34,
            containment:$(this).closest('.component'),
            start: function(event, ui) {
                $(this).data("width", $(this).width()).data("height",$(this).height());            
                isDragOn = true;
                $(this).css("opacity", "0.34");
            },
            drag: function(event, ui) {
                ui.helper.width($(this).data("width")).height($(this).data("height"));
            },
            stop: function(event, ui) {            
                if (hovered == null) return;
                if (jQuery.contains(this, hovered[0]) || $(this).is(hovered)) return;
                
                let $container = $(this).getContainerUp();
                let $contained = $(this).getContainerDown();
                
                $dragged = $contained.detach();                
                if ($dragged.isRow() && hovered.isCol()) {
                    let $col = $('<div class="mycol"></div>').prependHandler().makeDraggable();
                    $col.append($('<div class="container"></div>').append($dragged));
                    $dragged = $col;
                } else if ($dragged.isCol() && hovered.isRow()) {
                    let $row = $('<div class="row ui-draggable ui-draggable-handle"></div>').prependHandler().makeDraggable();
                    $row.append($dragged);
                    $dragged = $row;
                }
                
                $dragged.insertBefore(hovered);
                if (!$container.is($contained)) $container.remove();
                
                selected = $(contained);
                hovered.children(".handler-c-wrapper, .handler-r-wrapper").children(".handler-c, .handler-r").css("display", "none");
                isDragOn = false;
            }
        });
        return this;
    }

    $("div.mycol, div.row").makeDraggable();

    $.fn.makeResizable = function() {
        $(this).resizable({     
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
        return this;
    }

    $(".mycol").makeResizable();
});

