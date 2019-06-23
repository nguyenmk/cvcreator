
//Make the DIV element draggagle:
//document.getElementById("mydivheader").ondragstart = handleDragStart;
//document.getElementById("Move").ondragover = handleDragOver;

$(function() {
  
    // add div.lastColTag type to all the .row elements
    $(".row").append('<div class="lastcol"></div>');
    $(".container").append('<div class="lastrow"></div>');

    $.fn.isRow = function () { return $(this).hasClass("row") || $(this).hasClass("lastrow"); };
    $.fn.isCol = function() { return $(this).hasClass("mycol") || $(this).hasClass("lastcol") };

    $.fn.getContainer = function() {
        let $child = null, $parent = $(this);
        do {
            $child = $parent;
            $parent = $child.parent();
        } while ($parent.children(".mycol:not(.ui-draggable-dragging), .row:not(.ui-draggable-dragging)").length <= 1)
        return $child;
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
    $('.handler-c-wrapper, .handler-r-wrapper').hover(function(){
        if (isDragOn) hovered = $(this).parent();
    }, function() {
        if (isDragOn) hovered = null;
    });
    
    var selected = null;
    $("div.mycol, div.row").mouseup(function(ev){
        ev.stopPropagation();
        if (selected !== null) selected.css("opacity","");
        selected = $(this);
        selected.css("opacity", "0.34");
    })

    // make row and column items draggable
    $("div.mycol, div.row").draggable({
        helper: "clone",
        opacity: 0.34,
        start: function(event, ui) {
            $(this).data("width", $(this).width()).data("height",$(this).height());            
            isDragOn = true;
        },
        drag: function(event, ui) {
            ui.helper.width($(this).data("width")).height($(this).data("height"));
        },
        stop: function(event, ui) {
            isDragOn = false;
            if (hovered == null) return;
            
            let $container = $(this).getContainer();
            let $dragged = $(this).detach();
            
            if ($dragged.isRow() && hovered.isCol()) {
                let $col = $('<div class="mycol"</div>').prependHandler();
                $col.append($('<div class="container"></div>').append($dragged));
                $dragged = $col;
            } else if ($dragged.isCol() && hovered.isRow()) {
                let $row = $('<div class="row"></div>').prependHandler();
                $row.append($dragged);
                $dragged = $row;
            }
            
            $dragged.insertBefore(hovered);
            if (!$container.is($(this))) $container.remove();
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

