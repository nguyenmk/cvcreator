
//Make the DIV element draggagle:
//document.getElementById("mydivheader").ondragstart = handleDragStart;
//document.getElementById("Move").ondragover = handleDragOver;

$(function() {
  
    let propList = [ 'color', 'font', 'fontFamily', 'fontSize', 'fontStyle', 'textAlign'
                    , 'border', 'borderLeft', 'borderRight', 'borderTop', 'borderBottom'
                    , 'backgroundColor','backgroundImage', 'backgroundPosition', 'backgroundRepeat', 'backgroundSize'
                    , 'margin', 'padding', 'width', 'height'];
    properties = $('#properties').hide();

    $.fn.isRow = function () { return $(this).hasClass("rowx") || $(this).hasClass("lastrow"); };
    $.fn.isCol = function() { return $(this).hasClass("colx") || $(this).hasClass("lastcol") };

    $.fn.setBO = function(border, opacity) { //border and opacity
        (border !== undefined)? $(this).css('border', border) : $(this).css('border', '');
        (opacity !== undefined) ? $(this).css('opacity', opacity) : $(this).css('opacity', '');
        return this;
    }

    $.fn.setSelectedStyle = function() {       
        return $(this).setBO('1px solid'); 
        //return $(this).setBO(); 
    }
    
    $.fn.setHoverStyle = function() {     
        return $(this).setBO('1px solid', '0.34'); 
    }

    $.fn.setNormalStyle = function() { 
        return $(this).setBO();
    }

    $.new = function(elementName, className) {
        let str = '<' + elementName;
        if (className !== undefined) str += ' class="' + className + '"';
        str += '></' + elementName + '>';
        return $(str);
    }

    $.fn.appendLast = function() {
        if ($(this).children(".colx, .rowx").length > 0) {
            ($(this).isCol()) ? $(this).append($.new('div', "lastrow")): $(this).append($.new('div',"lastcol"));
        }
        return this;
    }

     // append last column or row
    $(".rowx, .colx").each(function() { $(this).appendLast(); });

    $.fn.closestParent = function(selector) {
        return $(this).parent().closest(selector);
    }

    $.fn.getContainerUp = function() {
        if (!$(this).isCol() && !$(this).isRow()) return null;
        let $child = null, $parent = $(this);
        do {
            $child = $parent;
            $parent = $child.parent();
            if (!$parent.isCol() && !$parent.isRow()) break;
        } while ($parent.children(".colx:not(.ui-draggable-dragging), .rowx:not(.ui-draggable-dragging)").length <= 1)
        return $child;
    }

    $.fn.getContainerDown = function() {
        let $parent = $(this);
        let $children = $parent.children(".colx:not(.ui-draggable-dragging), .rowx:not(.ui-draggable-dragging)");
        while ($children.length == 1) {
            $parent = $children.eq(0);
            $children = $parent.children(".colx:not(.ui-draggable-dragging):not(.handler-wrapper-c), .rowx:not(.ui-draggable-dragging)");
        }
        return $parent;
    }

    $.fn.prependHandler = function () {
        if ($(this).isCol()) {
            let handlerWrapper = $('<div class="handler-wrapper-c"></div>');
            handlerWrapper.append($('<div class="handler-symbol-c">&#9660; <hr /></div>'));
            $(this).prepend(handlerWrapper);
        }
        else  {
            let handlerWrapper = $('<div class="handler-wrapper-r"></div>');
            handlerWrapper.append($('<div class="handler-symbol-r">&#9658; <hr/></div>'));
            $(this).prepend(handlerWrapper);
        }
        return this;
    }

    $(".rowx, .lastrow, .colx, .lastcol").each(function() { $(this).prependHandler(false); });

    var isDragOn = false;
    var hovered = null;
    var isResizeOn = false;

    // handle hover event on handler wrappers
    $(document).on('mouseover','[class|="handler-wrapper"], .lastcol, .lastrow', function(ev){
        ev.stopPropagation();
        if (isDragOn) {
            if ($(this).hasClass('lastrow') || $(this).hasClass('lastcol')) hovered = $(this);            
            else hovered = $(this).parent();
            $(this).find('[class|="handler-symbol"]').css("display", "block");
        }
    }).on('mouseout','[class|="handler-wrapper"], .lastcol, .lastrow', function(ev) {
        ev.stopPropagation();
        if (isDragOn) {
            $(this).find('[class|="handler-symbol"]').css("display", "none");
            hovered = null;
        }
    });
    
    var prop = {name: null, editor: null};
    $(document).on('focus', '.property-value', function(event) {
        prop = {name: $(this).prev().attr("title"), editor: $(this)};
        selected.css('max-width', selected.css('width'));
    }).on('change', '.property-value', function(event) {
        let newValue = $(this).val();
        if ($(this).hasClass('jscolor')) 
            selected.css(prop.name, '#' + newValue);
        else 
            selected.css(prop.name, newValue);
    }).on('blur', '.property-value', function(event) {
        prop.editor.text(selected.children("span.text").css(prop.name));
        prop = {name: null, editor: null};
    })

    $.fn.addProp = function(field, value) {
        if (!isNaN(parseInt(field)) || typeof(value) !== "string") return this;
        let li = $.new('li', "list-group-item  list-group-item-primary property");
        let name = $.new('div', "property-name").attr("data-toggle","tooltip").attr("title", field).html(field);
        let content = $.new('input', "property-value").attr('value', value);
        if (field.toLowerCase().indexOf('color') > -1) content = $.new('input', "property-value jscolor").attr('value', value);
        return $(this).append(li.append(name).append(content));
    }

    $.fn.showProps = function() {
        properties.empty();
        /*
        for (let field of propList) {
            properties.addProp(field, $(this).css(field));
        }
        */
       /*
        let props = $(this).prop('style');
        for (let field in props) {
            properties.addProp(field, $(this).css(field));
        }
       */
        
       let props = getComputedStyle(this[0]);
       for (let field in props) {
           properties.addProp(field, props.getPropertyValue(field));
       }
        return $(this);
    }


    $.fn.setSelected = function(isSelected) {
        if (isSelected == true) {
            $(this).setSelectedStyle();
        } else {
            $(this).setNormalStyle();
        }
    }
    var selected = null;

    $(document).on("mousedown", ".colx, .rowx", function(ev){
        ev.stopPropagation();
        /*
        if ($(this).is(selected)) {
            selected.setNormalStyle();
            properties.hide();
            selected = null;
            console.log(selected);
        } else {
            if (selected != null) selected.setNormalStyle();
            selected = $(this).setSelectedStyle().showProps();
            properties.show();
            jscolor.installByClassName('jscolor');
            console.log(selected);
        }
        */
        console.log("mousedown .colx, .rowx, isDragOn: ", isDragOn);
    }).on("mouseup", ".colx, .rowx", function(ev) {
        ev.stopPropagation();
        if ($(this).is(selected)) {
            selected.setNormalStyle();
            properties.hide();
            selected = null;
            console.log(selected);
        } else {
            if (selected != null) selected.setNormalStyle();
            selected = $(this).setSelectedStyle().showProps();
            properties.show();
            jscolor.installByClassName('jscolor');
            console.log(selected);
        }
        console.log("mouseup .colx, .rowx, isDragOn: ", isDragOn);
    })
    

    $.fn.setHovered = function (isHovered) {
        if (isHovered === true) {
            $(this).setHoverStyle();
           // $(this).children('.corner-bar').css('visibility', 'visible');
        } else {
            $(this).setNormalStyle();
           // $(this).children('.corner-bar').css('visibility', 'hidden');
        }
    }

    let hoveredItem = null;
    
    // handle hover event on .rowx or .colx and .lastrow, .lastcol
    $(document).on('mouseover', '.rowx, .colx', function(ev) {      
        ev.stopPropagation();
        if (isDragOn || isResizeOn || selected !== null) return;
        if (hoveredItem != null) {
            hoveredItem.setHovered(false);
            if (hoveredItem.is(selected)) selected.setSelected(true);
        }
        hoveredItem = $(this);
        hoveredItem.setHovered(true);
    }).on('mouseover', '.lastrow, .lastcol', function(ev) {
        ev.stopPropagation();
        if (isDragOn || isResizeOn || selected !== null) return;
        if (hoveredItem !== null) hoveredItem.setNormalStyle();
        hoveredItem = $(this).parent().setHoverStyle();
    }).on('mouseout', '.lastrow, .lastcol', function(ev) {
        ev.stopPropagation();
        if (isDragOn || isResizeOn || selected !== null) return;
        if (hoveredItem !== null) hoveredItem.setNormalStyle();
        hoveredItem = null;
    })
    

    //create a wrapper with the target type around the object
    $.fn.createWrapper = function($target) {
        let $newItem = $(this);
        if ($target.isCol() && $newItem.isRow()) {
            let $col = $.new('div', "colx").prependHandler().makeDraggable().makeResizable();
            $col.append($newItem).appendLast();
            $col.children().last().prependHandler();
            $newItem = $col;
        } else if ($target.isRow() && $newItem.isCol()) {
            let $row = $.new('div', "rowx").prependHandler().makeDraggable().makeResizable();
            $row.append($newItem).appendLast();
            $row.children().last().prependHandler();   
            $newItem = $row;
        }
        return $newItem;
    }

    // simplify an object if it is inside too many levels of containers
    $.fn.simplify = function() {        
        let $container = $(this).getContainerUp();
        if ($container === null) return;
        if (!$container.parent().isCol() && !$container.parent().isRow()) return;
        let $contained = $(this).getContainerDown();
        let $newItem = $contained.createWrapper($container);
        $newItem.insertBefore($container);
        $container.remove();
    }
    
    $.fn.makeDraggable = function () {
        $(this).draggable( {
            //handle: $(this).children(".corner-bar"),
            helper: "clone",
            opacity: 0.34,
            delay: 300,
            //containment:$(this).closest('.componentx'),
            start: function(event, ui) {
                $(this).data("width", $(this).width()).data("height",$(this).height());            
                isDragOn = true;
                $(this).setHoverStyle();
                ui.helper.setHoverStyle();
                console.log("dragStart .colx, .rowx, isDragOn: ", isDragOn);
            },
            drag: function(event, ui) {
                ui.helper.width($(this).data("width")).height($(this).data("height"));
                console.log("dragging .colx, .rowx, isDragOn: ", isDragOn);
            },
            stop: function(event, ui) {    
                console.log("dragStop .colx, .rowx, isDragOn: ", isDragOn);
                $(this).setNormalStyle().setSelectedStyle();
                isDragOn = false;
                if (hovered == null) return;
                hovered.find('[class|="handler-symbol"]').css("display", "none");
                if (jQuery.contains(this, hovered[0]) || $(this).is(hovered)) return;
                if (!$(this).closestParent('.componentx').is(hovered.closestParent('.componentx'))) return;
                let $container = $(this).getContainerUp();
                let $containerParent = $container.parent();
                let $contained = $(this).getContainerDown();
                
                $dragged = $contained.detach().createWrapper(hovered);
                
                $dragged.insertBefore(hovered);
                if (!$container.is($contained)) $container.remove();
                if ($containerParent.children(".colx:not(.ui-draggable-dragging):not(.handler-wrapper-c), .rowx:not(.ui-draggable-dragging)").length <= 1)
                    $containerParent.simplify();
                
                selected = $dragged.setSelectedStyle();
                
            }
        });
        return this;
    }

    $(".colx, .rowx").makeDraggable();
    
    $.fn.makeResizable = function() {
        $(this).resizable({     
            handles: "e",
            //autoHide: true,
            start: function(event, ui) { 
                $(this).setSelectedStyle();
            },
            resize: function(event, ui) {            
                ui.size.height = ui.originalSize.height;  //fix the height                 
            },
        });
        return this;
    }

    $(".colx").makeResizable();
    
});

