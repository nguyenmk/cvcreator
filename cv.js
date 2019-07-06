
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
    
    $.fn.save = function(name, cssProperties) {
        let props = {}
        for (let css of cssProperties) props[css] = $(this).css(css);
        $(this).data(name, props);
    }

    $.fn.load = function(name) {
        let data = $(this).data(name);
        for (let css in data) $(this).css(css, data[css]);
    }

    let propertyContainer = $('#properties-container').hide();
    let textContainer = $('#text-container').hide();

    $.fn.isRow = function () { return $(this).hasClass("rowxtend") || $(this).hasClass("lastrowxtend"); };
    $.fn.isCol = function() { return $(this).hasClass("colxtend") || $(this).hasClass("lastcolxtend") };

    $.fn.setBO = function(border, opacity) { //border and opacity
        (border !== undefined)? $(this).css('outline', border) : $(this).css('outline', '');
        (opacity !== undefined) ? $(this).css('opacity', opacity) : $(this).css('opacity', '');
        return this;
    }

    $.new = function(elementName, className) {
        let str = '<' + elementName;
        if (className !== undefined) str += ' class="' + className + '"';
        str += '></' + elementName + '>';
        return $(str);
    }

    $.fn.appendLast = function() {
        ($(this).isCol()) ? $(this).parent().append($.new('div', "lastcolxtend")): $(this).parent().append($.new('div',"lastrowxtend"));
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

    var isDragOn = false;
    var isResizeOn = false;
    
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
            $(this).setBO('1px solid').showProps().focus();
            ($(this).children('span')).attr('contenteditable', 'true').focus();
            propertyContainer.show();
            textContainer.show();
            editMode = true;
            $('.rowxtend, .colxtend').draggable({disabled: true});
            return this;
        } else {
            $(this).setBO().focusout();
            $(this).children('span').attr('contenteditable', 'false');
            propertyContainer.hide();
            textContainer.hide();
            editMode = false;
            $('.rowxtend, .colxtend').draggable({disabled: false});
            return $();
        }
    }

    var selected = $();
    $(document).on("mousedown", ".rowxtend, .colxtend", function(ev){   
        if (isDragOn || isResizeOn) return;
        if (!$(this).is(selected)) {      
            selected = selected.setSelected(false);
            selected = $(this).setSelected(true);
            jscolor.installByClassName('jscolor');
        } 
        ev.stopPropagation();
    })

    $(document).keydown(function(ev) {
        if (ev.which === 27) selected = selected.setSelected(false);
    })

    // handle hover event on .rowxtend or .colxtend and .lastrowxtend, .lastcolxtend
    $(document).on('mouseover', '.rowxtend, .colxtend, .lastrowxtend, .lastcolxtend', function(ev) {     
        ev.stopPropagation(); 
        if (editMode || isResizeOn || isDragOn) return;
        $(this).save("opacity", ["opacity"]);
        $(this).css('opacity', '0.34');
    }).on('mouseout', '.rowxtend, .colxtend, .lastrowxtend, .lastcolxtend', function(ev) {     
        ev.stopPropagation(); 
        if (editMode || isResizeOn || isDragOn) return;
        $(this).load("opacity");
    })
    

    //create a wrapper with the target type around the object
    $.fn.createWrapper = function($target) {
        let $newItem = $(this);
        if ($target.isCol() && $newItem.isRow()) {
            let $col = $.new('div', "colxtend").makeDraggable().makeResizable();
            $col.append($newItem);
            $newItem.appendLast();
            $newItem = $col;
        } else if ($target.isRow() && $newItem.isCol()) {
            let $row = $.new('div', "rowxtend").makeDraggable().makeResizable();
            $row.append($newItem);
            $newItem.appendLast();
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
    
    $.getHovered = function(x, y) {
        let elm = document.elementFromPoint(x, y);
        return $(elm).closest('[class*=xtend]');
    }

    var hovered = $();
    $.fn.makeDraggable = function () {
        $(this).draggable( {
            //handle: $(this).children(".corner-bar"),
            helper: "clone",
            opacity: 0.34,
            delay: 300,
            containment:$(this).closestParent('.componentx'),
            start: function(ev, ui) {
                ev.stopPropagation();
                $(this).data("width", $(this).width()).data("height",$(this).height()); 
                           
                isDragOn = true;
                $(this).setBO('1px solid', '0.34');
                ui.helper.setBO('1px solid', '0.34');
            },
            drag: function(ev, ui) {
                ev.stopPropagation();
                ui.helper.width($(this).data("width")).height($(this).data("height"));

                let posX = ev.clientX;
                let posY = ev.clientY;
                hovered.load('hover-drag');
                hovered = $.getHovered(posX, posY);
                if (hovered.length > 0) {
                    let coor = hovered[0].getBoundingClientRect();
                    hovered.save('hover-drag', ['border-left', 'border-top', 'border-right', 'border-bottom']);
                    if (posX < coor.left + 5 && hovered.isCol()) {
                        hovered.css('border', '3px dotted black');
                        hovered.css('border-left', '3px dotted red');                        
                    } else if (posY < coor.top + 5 && hovered.isRow()) {
                        hovered.css('border', '3px dotted black');
                        hovered.css('border-top', '3px dotted red');
                    }
                }
            },
            stop: function(ev, ui) {    
                isDragOn = false;
                selected = $(this).setSelected(false);

                let posX = ev.clientX;
                let posY = ev.clientY;

                hovered.load('hover-drag');
                hovered = $.getHovered(posX, posY);                
                if (hovered.length > 0) {
                    let coor = hovered[0].getBoundingClientRect();
                    if (posX >= coor.left + 5 && hovered.isCol() || posY >= coor.top + 5 && hovered.isRow()) {
                        hovered = null;
                    }
                }
                
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

    $(".colxtend, .rowxtend").each(function() {$(this).makeDraggable();});
    
    $.fn.makeResizable = function() {
        $(this).resizable({     
            handles: "e",
            //autoHide: true,
            start: function(event, ui) { 
                $(this).save('outline-resize', ['outline']);
                $(this).css('outline', '1px solid');
            },
            resize: function(event, ui) {            
                ui.size.height = ui.originalSize.height;  //fix the height                 
            },
            stop: function(event, ui) {
                //$(this).load('outline-resize');
            }
        });
        return this;
    }

    $(".colxtend").each(function() {$(this).makeResizable();});
    
});

