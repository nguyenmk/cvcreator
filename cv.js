
//Make the DIV element draggagle:
//document.getElementById("mydivheader").ondragstart = handleDragStart;
//document.getElementById("Move").ondragover = handleDragOver;

$(function() {
    
    let propList = {
        'background-color': 'color', 
        'background-image': 'url', 
        'background-position': 'field2', 
        'background-repeat': 'field1', 
        'background-size': 'field2',
        
        'border-top': 'field3', // (width, style, color)
        'border-top-left-radius': 'length',
        'border-top-right-radius': 'length',
        
        'border-bottom': 'field3',
        'border-bottom-left-radius': 'length',
        'border-bottom-right-radius': 'length',
        
        'border-left': 'field3',
        'border-right': 'field3',
                   
        'margin': 'field4', 
        'padding': 'field4', 
        'width': 'length', 
        'height': 'length', 
        'left': 'length',  
        'top': 'length',  
        'right': 'length',  
        'bottom': 'length', 
        
        'color': 'color', 
        'opacity': 'scalar', 
        'white-space': 'length', 
        'word-spacing': 'length', 
        'direction': 'field1', 
        'line-height': 'length',
        'font-family': 'textArray', 
        'font-size': 'length', 
        'font-style': 'field1', 
        'font-weight': 'field1',
        'text-align': 'field1', 
        'text-indent': 'field1', 
        'text-shadow': 'mixed', 
        'text-transform': 'mixed',    
    };
    

    let propertyContainer = $('#properties-container').hide();
    let textContainer = $('#text-container').hide();

    $.fn.isRow = function () { return $(this).hasClass("rowxtend") || $(this).hasClass("lastrow"); };
    $.fn.isCol = function() { return $(this).hasClass("colxtend") || $(this).hasClass("lastcol") };

    $.fn.setBO = function(border, opacity) { //border and opacity
        (border !== undefined)? $(this).css('outline', border) : $(this).css('outline', '');
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
        ($(this).isCol()) ? $(this).parent().append($.new('div', "lastcol")): $(this).parent().append($.new('div',"lastrow"));
        return this;
    }

     // append last column or row
    $("div.rowxtend:last-of-type, div.colxtend:last-of-type").each(function() { $(this).appendLast(); });

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
    $(document).on('mouseenter','[class|="handler-wrapper"], .lastcol, .lastrow', function(ev){
        ev.stopPropagation();
        if (isDragOn) {
            if ($(this).hasClass('lastrow') || $(this).hasClass('lastcol')) hovered = $(this);            
            else hovered = $(this).parent();
            $(this).find('[class|="handler-symbol"]').css("display", "block");
        }
    }).on('mouseleave','[class|="handler-wrapper"], .lastcol, .lastrow', function(ev) {
        ev.stopPropagation();
        if (isDragOn) {
            $(this).find('[class|="handler-symbol"]').css("display", "none");
            hovered = null;
        }
    });
    
    $.fn.getItemFromProp = function(type) {
        if (type === 'text-content') {
            let span = selected.children('span');
            if (span.length === 1) return $(span[0]);
        }
        return this;
    }

    var prop = {name: null, editor: null};
    $(document).on('focus', '.property-value', function(event) {
        prop = {name: $(this).prev().attr("title"), editor: $(this)};
        selected.getItemFromProp($(this).attr('type')).css('max-width', selected.css('width'));       
    }).on('input', '.property-value', function(event) {
        let newValue = $(this).val();        
        let item = selected.getItemFromProp($(this).attr('type'));
        if ($(this).hasClass('jscolor'))             
            item.css(prop.name, '#' + newValue);
        else 
            item.css(prop.name, newValue);
    }).on('blur', '.property-value', function(event) {
        let item = selected.getItemFromProp($(this).attr('type'));
        prop.editor.text(item.css(prop.name));
        prop = {name: null, editor: null};
    })

    $.fn.addProp = function(field, value, type = 'this') {
        if (!isNaN(parseInt(field)) || typeof(value) !== "string") return this;
        let li = $.new('li', "list-group-item  list-group-item-primary property");
        let name = $.new('div', "property-name").attr("data-toggle","tooltip").attr("title", field).html(field).attr('type', type);
        let content = $.new('input', "property-value").attr('value', value);
        if (field.toLowerCase().indexOf('color') > -1) content = $.new('input', "property-value jscolor").attr('value', value).attr('type', type);
        return $(this).append(li.append(name).append(content));
    }

    $.fn.showProps = function() {
        propertyContainer.empty();
        textContainer.empty();
        
        for (let field in propList) {
            propertyContainer.addProp(field, $(this).css(field), "container");
        }
        let span = $(this).children('span');
        if (span.length == 1) {            
            for (let field in propList) {
                textContainer.addProp(field, span.css(field), "text-content");
            }
        }

        return $(this);
    }


    var editMode = false;

    $.fn.setSelected = function(isSelected) {
        if (isSelected == true) {
            $(this).setSelectedStyle().showProps();
            $(this).focus();
            $(this).children('span').attr('contenteditable', 'true');
            $(this).children('span').focus();
            propertyContainer.show();
            textContainer.show();
            editMode = true;
            $('.rowxtend, .colxtend').draggable({disabled: true});
            return this;
        } else {
            $(this).setNormalStyle();
            $(this).focusout();
            $(this).children('span').attr('contenteditable', 'false');
            propertyContainer.hide();
            textContainer.hide();
            editMode = false;
            $('.rowxtend, .colxtend').draggable({disabled: false});
            return null;
        }
    }

    var selected = null;   

    $(document).on("mousedown", ".rowxtend, .colxtend", function(ev){   
        if (isDragOn || isResizeOn) return;
        if (!$(this).is(selected)) {      
            if (selected != null) {
                selected = selected.setSelected(false);
            }
            selected = $(this).setSelected(true);
            jscolor.installByClassName('jscolor');
        } 
        ev.stopPropagation();
    })

    $(document).keydown(function(ev) {
        if (ev.which === 27) {
            if (selected) selected = selected.setSelected(false);
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
        if (editMode) return;
        ev.stopPropagation(); 
        if ($(this).hasClass('rowxtend') || $(this).hasClass('colxtend')) {
            if (isDragOn || isResizeOn || $(this).closest('[class*="xtend"]').is(selected)) return;
            if (hoveredItem != null) {
                hoveredItem.setHovered(false);
                if (hoveredItem.is(selected)) selected.setSelected(true);
            }
            hoveredItem = $(this);
            hoveredItem.setHovered(true);
        } else if ($(this).hasClass('lastrow') || $(this).hasClass('lastcol')) {
            if (isDragOn || isResizeOn) return;
            if ($(this).closest('[class*="xtend"]').is(selected)) return;
            if (hoveredItem !== null) hoveredItem.setNormalStyle();
            hoveredItem = $(this).parent().setHoverStyle();            
        } else {
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
            },
            drag: function(event, ui) {
                event.stopPropagation();
                ui.helper.width($(this).data("width")).height($(this).data("height"));
            },
            stop: function(event, ui) {    
                isDragOn = false;
                selected = $(this).setSelected(false);
                if (hovered == null) return;
                hovered.find('[class|="handler-symbol"]').css("display", "none");
                if (jQuery.contains(this, hovered[0]) || $(this).is(hovered)) return;
                if ($(this).next().is(hovered)) return;
                if (!$(this).closestParent('.componentx').is(hovered.closestParent('.componentx'))) return;
                let $container = $(this).getContainerUp();
                let $containerParent = $container.parent();
                let $contained = $(this).getContainerDown();
                
                $dragged = $contained.detach().createWrapper(hovered);
                
                $dragged.insertBefore(hovered);
                if (!$container.is($contained)) $container.remove();
                if ($containerParent.children(".colxtend:not(.ui-draggable-dragging):not(.handler-wrapper-c), .rowxtend:not(.ui-draggable-dragging)").length <= 1)
                    $containerParent.simplify();

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

