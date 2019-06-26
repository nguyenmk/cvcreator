
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

    $.fn.setBO = function(border, opacity) { //border and opacity
        (border !== undefined)? $(this).css('border', border) : $(this).css('border', '');
        (opacity !== undefined) ? $(this).css('opacity', opacity) : $(this).css('opacity', '');
        return this;
    }

    $.fn.setSelectedStyle = function(isOn = true) { //border
        return (isOn === true) ? $(this).setBO('1px solid') : $(this).setBO();
    }
    
    $.fn.setHoverStyle = function(isOn = true) {
        return (isOn === true) ? $(this).setBO('1px solid', '0.34') : $(this).setBO();        
    }

    $.new = function(elementName, className) {
        let str = '<' + elementName;
        if (className !== undefined) str += ' class="' + className + '"';
        str += '></' + elementName + '>';
        return $(str);
    }

    $.fn.appendLast = function() {
        if ($(this).children(".mycol, .myrow").length > 0) {
            ($(this).isCol()) ? $(this).append($.new('div', "lastrow")): $(this).append($.new('div',"lastcol"));
        }
        return this;
    }

     // append last column or row
    $(".myrow, .mycol").each(function() { $(this).appendLast(); });

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

    $(".myrow, .lastrow, .mycol, .lastcol").each(function() { $(this).prependHandler(false); });

    var isDragOn = false;
    var hovered = null;
    var isResizeOn = false;

    // handle hover event on handler wrappers
    $(document).on('mouseenter','[class|="handler-wrapper"], .lastcol, .lastrow', function(){
        if (isDragOn) {
            if ($(this).hasClass('.lastrow') || $(this).hasClass('.lastcol')) hovered = $(this);
            else hovered = $(this).parent();
            $(this).find('[class|="handler-symbol"]').css("display", "block");
        }
    }).on('mouseleave','[class|="handler-wrapper"], .lastcol, .lastrow', function() {
        if (isDragOn) {
            $(this).find('[class|="handler-symbol"]').css("display", "none");
            hovered = null;
        }
    });

    var prop = {name: null, editor: null};
    $(document).on('focus', '.property-value', function(event) {
        prop = {name: $(this).prev().attr("title"), editor: $(this)};
        selected.css('max-width', selected.css('width'));
    }).on('input', '.property-value', function(event) {
        let newValue = $(this).text();
        if (prop.name == "text") selected.children("span.text").text(newValue);
        else selected.css(prop.name, newValue);
    }).on('blur', '.property-value', function(event) {
        if (prop.name !== "text") prop.editor.text(selected.children("span.text").css(prop.name));
        prop = {name: null, editor: null};
    })

    $.fn.addProp = function(field, value) {
        if (!isNaN(parseInt(field)) || typeof(value) !== "string") return this;
        var li = $.new('li', "list-group-item  list-group-item-primary property");
        var name = $.new('div', "property-name").attr("data-toggle","tooltip").attr("title", field).html(field);        
        var content = $.new('div', "property-value").attr('contenteditable', "true").html(value);
        return $(this).append(li.append(name).append(content));
    }

    $.fn.showProps = function() {
        let textElm = $(this).children("span");
        properties.empty();

        for (let field of propList) {
            if (field === "text") {
                properties.addProp(field, $(this).children("span").text());
            } else properties.addProp(field, $(this).css(field));
        }
        return $(this);
    }


    var selected = null;

    $(document).on("mousedown", ".mycol, .myrow", function(ev){
        ev.stopPropagation();
        if ($(this).is(selected)) {
            selected.setSelectedStyle(false);
            properties.hide();
            selected = null;
        } else {
            if (selected != null) selected.setSelectedStyle(false);
            selected = $(this).setSelectedStyle(true).showProps();
            properties.show();
            
        }
    })



    let hoveredItem = null;

    // handle hover event on .myrow or .mycol and .lastrow, .lastcol
    $(document).on('mouseover', '.myrow, .mycol', function(ev) {
        ev.stopPropagation();
        console.log('mouseenter', $(this)[0]);
        if (isDragOn || isResizeOn) return;
        if (hoveredItem != null && !hoveredItem.is(selected)) hoveredItem.setHoverStyle(false);
        hoveredItem = $(this);
        if (!hoveredItem.is(selected)) hoveredItem.setHoverStyle(true);
    }).on('mouseout', '.myrow, .mycol', function(ev) {
        ev.stopPropagation();
        console.log('mouseleave', $(this)[0]);
        if (isDragOn || isResizeOn) return;
        if (hoveredItem != null && !hoveredItem.is(selected)) hoveredItem.setHoverStyle(false);
        hoveredItem = null;
    }).on('mouseover', '.lastrow, .lastcol', function(ev) {
        ev.stopPropagation();
        if (isDragOn || isResizeOn) return;
        if (hoveredItem !== null) hoveredItem.setHoverStyle(false);
        hoveredItem = $(this).parent().setHoverStyle(true);
    }).on('mouseout', '.myrow, .mycol', function(ev) {
        ev.stopPropagation();
        if (isDragOn || isResizeOn) return;
        if (hoveredItem !== null) hoveredItem.setHoverStyle(false);
        hoveredItem = null;
    })

    $.fn.createWrapper = function($target) {
        let $newItem = $(this);
        if ($target.isCol() && $newItem.isRow()) {
            let $col = $.new('div', "mycol").prependHandler().makeDraggable().makeResizable();
            $col.append($newItem).appendLast();
            $col.children().last().prependHandler();
            $newItem = $col;
        } else if ($target.isRow() && $newItem.isCol()) {
            let $row = $.new('div', "myrow").prependHandler().makeDraggable().makeResizable();
            $row.append($newItem).appendLast();
            $row.children().last().prependHandler();   
            $newItem = $row;
        }
        return $newItem;
    }
    $.fn.simplify = function() {        
        let $container = $(this).getContainerUp();
        let $contained = $(this).getContainerDown();
        let $newItem = $contained.createWrapper($container);
        $newItem.insertBefore($container);
        $container.remove();
    }

    $.fn.makeDraggable = function () {
        $(this).draggable( {
            helper: "clone",
            opacity: 0.34,
            containment:$(this).closest('.component'),
            start: function(event, ui) {
                $(this).data("width", $(this).width()).data("height",$(this).height());            
                isDragOn = true;
                $(this).setHoverStyle(true);
                ui.helper.setHoverStyle(true);
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
                hovered.find('[class|="handler-symbol"]').css("display", "none");
                if (jQuery.contains(this, hovered[0]) || $(this).is(hovered)) {
                    $(this).setHoverStyle(false);
                    $(this).setSelectedStyle(true);
                    return;
                }
                let $container = $(this).getContainerUp();
                let $contained = $(this).getContainerDown();
                
                $dragged = $contained.setHoverStyle(false).detach();
                $dragged = $dragged.createWrapper(hovered);
                
                $dragged.insertBefore(hovered);
                if (!$container.is($contained) && $container.children(".mycol:not(.ui-draggable-dragging):not(.handler-wrapper-c), .myrow:not(.ui-draggable-dragging)").length <= 1)
                    $container.simplify();
                
                selected = $dragged.setSelectedStyle(true);
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
                $(this).setSelectedStyle(true);
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
            stop: function(event, ui) {
                isResizeOn = false;
            }
        });
        return this;
    }

    $(".mycol").makeResizable();
});

