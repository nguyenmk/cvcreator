
//Make the DIV element draggagle:
//document.getElementById("mydivheader").ondragstart = handleDragStart;
//document.getElementById("Move").ondragover = handleDragOver;

$(function() {
  
    let propList = [ 'color', 'font', 'fontFamily', 'fontSize', 'fontStyle', 'textAlign'
                    , 'border', 'borderLeft', 'borderRight', 'borderTop', 'borderBottom'
                    , 'backgroundColor','backgroundImage', 'backgroundPosition', 'backgroundRepeat', 'backgroundSize'
                    , 'margin', 'padding', 'width', 'height'];
    properties = $('#properties').hide();

    $.fn.isRow = function () { return $(this).hasClass("rowxtend") || $(this).hasClass("lastrow"); };
    $.fn.isCol = function() { return $(this).hasClass("colxtend") || $(this).hasClass("lastcol") };

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
        if ($(this).children(".colxtend, .rowxtend").length > 0) {
            ($(this).isCol()) ? $(this).append($.new('div', "lastrow")): $(this).append($.new('div',"lastcol"));
        }
        return this;
    }

     // append last column or row
    $(".rowxtend, .colxtend").each(function() { $(this).appendLast(); });

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
        } while ($parent.children(".colxtend:not(.ui-draggable-dragging), .rowxtend:not(.ui-draggable-dragging)").length <= 1)
        return $child;
    }

    $.fn.getContainerDown = function() {
        let $parent = $(this);
        let $children = $parent.children(".colxtend:not(.ui-draggable-dragging), .rowxtend:not(.ui-draggable-dragging)");
        while ($children.length == 1) {
            $parent = $children.eq(0);
            $children = $parent.children(".colxtend:not(.ui-draggable-dragging):not(.handler-wrapper-c), .rowxtend:not(.ui-draggable-dragging)");
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

    $(".rowxtend, .lastrow, .colxtend, .lastcol").each(function() { $(this).prependHandler(false); });

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

    $.fn.deselect = function() {
        $(this).setNormalStyle();
        $(this).focusout();
        $(this).children('span').attr('contenteditable', 'false');
        properties.hide();
        return null;
    }
    
    var editMode = true;
    $(document).on("click", ".rowxtend, .colxtend", function(ev){        
        if ($(this).is(selected)) {
            selected.setNormalStyle();
            selected.children('span').attr('contenteditable', 'false');
            properties.hide();
            selected = null;
        } else {         
            if (selected != null) {
                selected = selected.deselect();
            }
            selected = $(this).setSelectedStyle().showProps();
            selected.focus();
            properties.show();
            jscolor.installByClassName('jscolor');
            selected.children('span').attr('contenteditable', 'true');
            selected.children('span').focus();
        } 
        ev.stopPropagation();
    })

    $(document).keydown(function(ev) {
        if (ev.which === 27) {
            selected = selected.deselect();
        }
    })

    $.fn.setHovered = function (isHovered) {
        if (isHovered === true) {
            $(this).setHoverStyle();
        } else {
            $(this).setNormalStyle();
        }
    }

    let hoveredItem = null;
    
    // handle hover event on .rowxtend or .colxtend and .lastrow, .lastcol
    $(document).on('mouseover', '*', function(ev) {     
        ev.stopPropagation(); 
        if ($(this).hasClass('rowxtend') || $(this).hasClass('colxtend')) {
            console.log('rowcol', $(this));
            console.log('rowcol closest', $(this).closest('[class*="xtend"]'));
            console.log('rowcol selected', selected);

            if (isDragOn || isResizeOn || $(this).closest('[class*="xtend"]').is(selected)) return;
            if (hoveredItem != null) {
                hoveredItem.setHovered(false);
                if (hoveredItem.is(selected)) selected.setSelected(true);
            }
            hoveredItem = $(this);
            hoveredItem.setHovered(true);
            console.log("setHovered", $(this));
        } else if ($(this).hasClass('lastrow') || $(this).hasClass('lastcol')) {
            console.log('lastrowcol', $(this));
            console.log('lastrowcol closest', $(this).closest('[class*="xtend"]'));
            console.log('lastrowcol selected', selected);

            if (isDragOn || isResizeOn) return;
            if ($(this).closest('[class*="xtend"]').is(selected)) return;
            if (hoveredItem !== null) hoveredItem.setNormalStyle();
            hoveredItem = $(this).parent().setHoverStyle();            
        } else {
            console.log('other', $(this));
            console.log('other closest', $(this).closest('[class*="xtend"]'));
            console.log('other selected', selected);
            console.log('other is closest selected', $(this).closest('[class*="xtend"]').is(selected));
            console.log('other hover', hoveredItem);
            if (isDragOn || isResizeOn) return;
            let parent = $(this).closest('[class*="xtend"]');
            if (parent !== null) {
                if (!parent.is(selected)) {
                    if (hoveredItem !== null) hoveredItem.setNormalStyle();
                    hoveredItem = parent;
                    hoveredItem.setHovered(true);
                } else {
                    if (hoveredItem !== null) hoveredItem.setNormalStyle();
                    hoveredItem = null;
                    selected.setSelected(true);
                }
            }
        }
    })
    

    //create a wrapper with the target type around the object
    $.fn.createWrapper = function($target) {
        let $newItem = $(this);
        if ($target.isCol() && $newItem.isRow()) {
            let $col = $.new('div', "colxtend").prependHandler().makeDraggable().makeResizable();
            $col.append($newItem).appendLast();
            $col.children().last().prependHandler();
            $newItem = $col;
        } else if ($target.isRow() && $newItem.isCol()) {
            let $row = $.new('div', "rowxtend").prependHandler().makeDraggable().makeResizable();
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
                event.stopPropagation();
                $(this).data("width", $(this).width()).data("height",$(this).height());            
                isDragOn = true;
                $(this).setHoverStyle();
                ui.helper.setHoverStyle();
                console.log("dragStart ", $(this));
                
            },
            drag: function(event, ui) {
                event.stopPropagation();
                ui.helper.width($(this).data("width")).height($(this).data("height"));
                console.log("dragging ", $(this));
                
            },
            stop: function(event, ui) {    
                console.log("dragStop .colxtend, .rowxtend, isDragOn: ", isDragOn);
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
                if ($containerParent.children(".colxtend:not(.ui-draggable-dragging):not(.handler-wrapper-c), .rowxtend:not(.ui-draggable-dragging)").length <= 1)
                    $containerParent.simplify();
                
                selected = $dragged.setSelectedStyle();
                
            }
        });
        return this;
    }

    $(".colxtend, .rowxtend").makeDraggable();
    
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

    $(".colxtend").makeResizable();
    
});

