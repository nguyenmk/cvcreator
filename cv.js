
//Make the DIV element draggagle:
//document.getElementById("mydivheader").ondragstart = handleDragStart;
//document.getElementById("Move").ondragover = handleDragOver;

$(function() {
  
    let propList = [ 'text', 'color', 'font', 'fontFamily', 'fontSize', 'fontStyle', 'textAlign'
                    , 'border', 'borderLeft', 'borderRight', 'borderTop', 'borderBottom'
                    , 'backgroundColor','backgroundImage', 'backgroundPosition', 'backgroundRepeat', 'backgroundSize'
                    , 'margin', 'padding'];
    properties = $('#properties').hide();

        
    $.fn.isRow = function () { return $(this).hasClass("myrow") || $(this).hasClass("lastrow"); };
    $.fn.isCol = function() { return $(this).hasClass("mycol") || $(this).hasClass("lastcol") };

    $.fn.appendLast = function() {
        if ($(this).children(".mycol, .myrow").length > 0) {
            if ($(this).isCol()) $(this).append('<div class="lastrow"></div>');
            else $(this).append('<div class="lastcol"></div>');
        }
        return this;
    }

     // append last column or row
    $(".myrow").appendLast();
    $(".mycol").appendLast();

    $.fn.getContainerUp = function() {
        let $child = null, $parent = $(this);
        do {
            $child = $parent;
            $parent = $child.parent();
        } while ($parent.children(".mycol:not(.ui-draggable-dragging), .myrow:not(.ui-draggable-dragging)").length <= 1)
        return $child;
    }

    $.fn.getContainerDown = function() {
        let $parent = $(this);
        let $children = $parent.children(".mycol:not(.ui-draggable-dragging), .myrow:not(.ui-draggable-dragging)");
        while ($children.length == 1) {
            $parent = $children.eq(0);
            $children = $parent.children(".mycol:not(.ui-draggable-dragging):not(.handler-wrapper-c), .myrow:not(.ui-draggable-dragging)");
        }
        return $parent;
    }

    $.fn.prependHandler = function () {
        if ($(this).isCol())
            $(this).prepend($('<div class="handler-wrapper-c"><div class="handler-symbol-c">&#9660;</div></div>'));
        else 
            $(this).prepend($('<div class="handler-wrapper-r"><div class="handler-symbol-r">&#9658;</div></div>'));
        return this;
    }

    $(".myrow, .lastrow").prependHandler();
    $(".mycol, .lastcol").prependHandler();

    var isDragOn = false;
    var hovered = null;

    // handle hover event on handler wrappers
    $(document).on('mouseenter','[class|="handler-wrapper"]', function(){
        if (isDragOn) {
            hovered = $(this).parent();
            $(this).find('[class|="handler-symbol"]').css("display", "block");
        }
    }).on('mouseleave','[class|="handler-wrapper"]', function() {
        if (isDragOn) {
            $(this).find('[class|="handler-symbol"]').css("display", "none");
            hovered = null;
        }
    });

     // handle hover event on handler wrappers
     $(document).on('mouseenter','.lastcol, .lastrow', function(){
        if (isDragOn) {
            hovered = $(this);
            $(this).find('[class|="handler-symbol"]').css("display", "block");
        }
    }).on('mouseleave','.lastcol, .lastrow', function() {
        if (isDragOn) {
            $(this).find('[class|="handler-symbol"]').css("display", "none");
            hovered = null;
        }
    });

    var prop = {name: null, editor: null};
    $(document).on('focus', '.property-value', function(event) {
        prop = {name: $(this).prev().attr("title"), editor: $(this)};
        selected.div.css('max-width', selected.div.css('width'));
    }).on('input', '.property-value', function(event) {
        let newValue = $(this).text();
        if (prop.name == "text") selected.text.text(newValue);
        else selected.text.css(prop.name, newValue);
    }).on('blur', '.property-value', function(event) {
        if (prop.name !== "text") prop.editor.text(selected.text.css(prop.name));
        prop = {name: null, editor: null};
    })

    $.fn.addProperty = function(field, value) {
        if (!isNaN(parseInt(field)) || typeof(value) !== "string") return this;

        var li = $('<li class="list-group-item  list-group-item-primary property"></li>');
        var name = $('<div class="property-name"></div>').html(field);
        name.attr("data-toggle","tooltip").attr("title", field);
        
        var content = $('<div class="property-value" contenteditable="true"></div>').html(value);
        li.append(name).append(content);
        $(this).append(li);
        return this;
    }

    $.fn.showProperties = function() {
        let textElm = $(this).children("span");
        let style = textElm.prop('style');
        properties.empty();

        for (let field of propList) {
            if (field === "text") properties.addProperty(field, textElm.text());
            else properties.addProperty(field, textElm.css(field));
        }
    }

    var selected = {div:null, text:null};

    $(document).on("mousedown", ".mycol, .myrow", function(ev){
        ev.stopPropagation();
        if ($(this).is(selected.div)) {
            selected.div.css('border','');
            properties.hide();
            selected = {div:null, text:null};
        } else {
            if (selected.div !== null) selected.div.css('border','');
            $(this).css('border','1px solid').showProperties();
            properties.show();
            selected = {div:$(this), text:$(this).children("span")};
        }
    })

    let hoveredItem = null;

    // handle hover event on .myrow or .mycol
    $(document).on('mouseenter', '.myrow, .mycol', function() {
        if (isDragOn) return;
        if (hoveredItem !== null) hoveredItem.css('border-style', '');
        hoveredItem = $(this);
        $(this).css('border-style', 'solid');
    }).on('mouseleave', '.myrow, .mycol', function() {
        if (isDragOn) return;
        if (hoveredItem !== null) hoveredItem.css('border-style', '');
        hoveredItem = null;
    })

    $(document).on('mouseenter', '.myrow, .mycol', function() {
        if (isDragOn) return;
        if (hoveredItem !== null) hoveredItem.css('border-style', '');
        hoveredItem = $(this).css('border-style', 'solid');
    }).on('mouseleave', '.myrow, .mycol', function() {
        if (isDragOn) return;
        if (hoveredItem !== null) hoveredItem.css('border-style', '');
        hoveredItem = null;
    })

    $(document).on('mouseenter', '.lastrow, .lastcol', function() {
        if (hoveredItem !== null) hoveredItem.css('border-style', '');
        hoveredItem = $(this).parent().css('border-style', 'solid');
    }).on('mouseleave', '.myrow, .mycol', function() {
        if (hoveredItem !== null) hoveredItem.css('border-style', '');
        hoveredItem = null;
    })


    $.fn.makeDraggable = function () {
        $(this).draggable( {
            helper: "clone",
            opacity: 0.34,
            containment:$(this).closest('.component'),
            start: function(event, ui) {
                $(this).data("width", $(this).width()).data("height",$(this).height());            
                isDragOn = true;
                $(this).css("opacity", "0.34").css('border','1px solid');
            },
            drag: function(event, ui) {
                ui.helper.width($(this).data("width")).height($(this).data("height"));
            },
            stop: function(event, ui) {            
                if (hovered == null) {
                    isDragOn = false;
                    return;
                }
                isDragOn = false;
                if (jQuery.contains(this, hovered[0]) || $(this).is(hovered)) return;
                
                let $container = $(this).getContainerUp();
                let $contained = $(this).getContainerDown();
                
                $dragged = $contained.css("opacity", "").css('border','').detach();                
                if ($dragged.isRow() && hovered.isCol()) {
                    let $col = $('<div class="mycol"></div>').prependHandler().makeDraggable().makeResizable();
                    $col.append($dragged).appendLast();
                    $col.children().last().prependHandler();
                    $dragged = $col;
                } else if ($dragged.isCol() && hovered.isRow()) {
                    let $row = $('<div class="myrow"></div>').prependHandler().makeDraggable().makeResizable();
                    $row.append($dragged).appendLast();
                    $row.children().last().prependHandler();
                    $dragged = $row;
                }
                
                $dragged.insertBefore(hovered);
                if (!$container.is($contained)) $container.remove();
                
                selected.div = $dragged.css("opacity", "").css('border','1px solid');
                selected.text = selected.div.children("span");
                hovered.find('[class|="handler-symbol"]').css("display", "none");
                
            }
        });
        return this;
    }

    $(".mycol, .myrow").makeDraggable();

    $.fn.makeResizable = function() {
        $(this).resizable({     
            handles: "e",
            autoHide: true,
            start: function(event, ui) { 
                $(this).data({widthSum: $(this).next().width() + $(this).width()});
                $(this).css('max-width','');
            },
            resize: function(event, ui) {            
                ui.size.height = ui.originalSize.height;  //fix the height
                $neighbor = $(this).next();  
                if ($(this).data('widthSum') <= ui.element.width()) {
                    $neighbor.width(0);
                    $(this).width($(this).data('widthSum'));
                } else {
                    $neighbor.width($(this).data('widthSum') - ui.element.width());            
                } 
            },
        });
        return this;
    }

    $(".mycol").makeResizable();
});

