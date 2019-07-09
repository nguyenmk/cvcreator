
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
        'border-bottom': 'field3',
        'border-bottom-left-radius': 'length',
        'border-bottom-right-radius': 'length',
        'border-left': 'field3',
        'border-right': 'field3',
        'border-top': 'field3', // (width, style, color)
        'border-top-left-radius': 'length',
        'border-top-right-radius': 'length',
        'color': 'color', 
        'direction': 'field1',
        'font-family': 'textArray', 
        'font-size': 'length', 
        'font-style': 'field1', 
        'font-weight': 'field1',
        'line-height': 'length',
        'margin': 'field4', 
        'opacity': 'scalar', 
        'padding': 'field4', 
        'text-align': 'field1', 
        'text-indent': 'field1', 
        'text-shadow': 'mixed', 
        'text-transform': 'mixed',    
        'white-space': 'length', 
        'word-spacing': 'length',
    };

    // set style and backup the one before it
    $.fn.setStyle = function(name, stylePairs) {
        let props = {}
        for (let css in stylePairs) {
            props[css] = $(this).css(css);
            $(this).css(css, stylePairs[css]);
        }
        $(this).data(name, props);
        return this;
    }

    $.fn.load = function(name) {
        let data = $(this).data(name);
        for (let css in data) $(this).css(css, data[css]);
        return this;
    }

    let propertyContainer = $('#properties-container').hide();
    let textContainer = $('#text-container').hide();

    $.fn.isRow = function () { return $(this).hasClass("rowxtend") || $(this).hasClass("lastrowxtend"); };
    $.fn.isCol = function() { return $(this).hasClass("colxtend") || $(this).hasClass("lastcolxtend") };

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
    }).on('change', '.property-value', function(event) {
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
        let content = $.new('input', "property-value").attr('value', value).attr('type', type);
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

    var selected = $();
    $.fn.setSelected = function(isSelected) {
        if (isSelected == true) {
            $(this).load("opacity-mouseover");
            $(this).setStyle('border-selected', {'outline': '1px solid'});
            $(this).showProps().focus();
            ($(this).children('span')).attr('contenteditable', 'true').focus();
            jscolor.installByClassName('jscolor');
            propertyContainer.show();
            textContainer.show();
            editMode = true;
            $('.rowxtend, .colxtend').draggable({disabled: true});
            selected = this;            
        } else {
            $(this).load('border-selected').focusout();
            $(this).children('span').attr('contenteditable', 'false');
            propertyContainer.hide();
            textContainer.hide();
            editMode = false;
            $('.rowxtend, .colxtend').draggable({disabled: false});
            selected = $();
        }
        return this;
    }

    
    $(document).on("mousedown", ".rowxtend, .colxtend", function(ev){ 
        if (ev.which !== 1) return;
        if (isDragOn || isResizeOn) return;
        if (!$(this).is(selected)) {      
            selected.setSelected(false);
            $(this).setSelected(true);
            
            
        } 
        ev.stopPropagation();
    })

    $(document).keydown(function(ev) {
        if (ev.which === 27) selected.setSelected(false);
    })

    var isContextMenuOn = false;
    // handle hover event on .rowxtend or .colxtend and .lastrowxtend, .lastcolxtend
    $(document).on('mouseover', '.rowxtend, .colxtend', function(ev) {     
        ev.stopPropagation(); 
        if (editMode || isResizeOn || isDragOn) return;
        $(this).setStyle("opacity-mouseover", {"opacity": '0.34', "border": '1px solid blue'});
    }).on('mouseout', '.rowxtend, .colxtend', function(ev) {     
        ev.stopPropagation(); 
        if (editMode || isResizeOn || isDragOn || isContextMenuOn) return;
        $(this).load("opacity-mouseover");
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
    var tol = 10; //tolerant is 10 px
    $.fn.makeDraggable = function () {
        $(this).draggable( {
            helper: "clone",
            opacity: 0.34,
            delay: 300,
            containment:$(this).closestParent('.componentx'),
            start: function(ev, ui) {
                ev.stopPropagation();
                $(this).data("width", $(this).width()).data("height",$(this).height()); 
                           
                isDragOn = true;
                $(this).setStyle('drag-start', {'outline':'1px solid', 'opacity':'0.34'});
                ui.helper.setStyle('drag-start', {'outline':'1px solid', 'opacity':'0.34'});
            },
            drag: function(ev, ui) {
                ev.stopPropagation();
                ui.helper.width($(this).data("width")).height($(this).data("height"));

                let posX = ev.clientX;
                let posY = ev.clientY;
                hovered.load('hover-drag');
                hovered = $.getHovered(posX, posY);
                if (!hovered.closestParent(".componentx").is($(this).closestParent(".componentx"))) return;
                if (hovered.length > 0) {
                    let coor = hovered[0].getBoundingClientRect();
                    if (posX < coor.left + tol && hovered.isCol()) {
                        hovered.setStyle('hover-drag', {'border-left': '3px dotted red'});                        
                    } else if (posY < coor.top + tol && hovered.isRow()) {
                        hovered.setStyle('hover-drag', {'border-top': '3px dotted red'});
                    }
                }
            },
            stop: function(ev, ui) {    
                isDragOn = false;
                $(this).load('drag-start');
                $(this).setSelected(false);
                
                let posX = ev.clientX;
                let posY = ev.clientY;

                hovered.load('hover-drag');
                hovered = $.getHovered(posX, posY);  
                
                if (!hovered.closestParent(".componentx").is($(this).closestParent(".componentx"))) return;
                if (hovered.length > 0) {
                    let coor = hovered[0].getBoundingClientRect();
                    if (posX >= coor.left + tol && hovered.isCol() || posY >= coor.top + tol && hovered.isRow()) {
                        hovered = $();
                    }
                }
                
                if (hovered.length === 0) return;
                if (jQuery.contains(this, hovered[0]) || $(this).is(hovered)) return;
                if ($(this).next().is(hovered)) return;
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
                $(this).setStyle('outline-resize', {'outline': '1px solid'});
            },
            resize: function(event, ui) {            
                ui.size.height = ui.originalSize.height;  //fix the height                 
            },
            stop: function(event, ui) {
                console.log("stop resize", $(this).data('outline-resize'));
                $(this).load('outline-resize');
                $(this).setSelected(false);
            }
        });
        return this;
    }

    $(".colxtend").each(function() {$(this).makeResizable();});
    
    
    /*
    $.contextMenu({
        selector: '.colxtend, .rowxtend',
        autoHide: true,
        events: {
            show: function() {
                isContextMenuOn = true;
            },
            hide: function() {
                $(this).load("opacity-mouseover");
                isContextMenuOn = false;
            }
        },
        callback: function(key, options) {
            if (key === 'insert_before') {
                let clone = $(this).clone(true, true);
                clone.removeClass('context-menu-active');
                clone.load("opacity-mouseover");
                clone.insertBefore($(this));
            } else if (key === 'insert_after') {
                let clone = $(this).clone(true, true);
                clone.removeClass('context-menu-active');
                clone.load("opacity-mouseover");
                clone.insertAfter($(this));
            } else if (key === 'delete') {
                $(this).remove();
            }
        },
        items: {
            "insert_before": {name: "Insert Before", icon: "add"},
            "insert_after": {name: "Insert After", icon: "add"},
            "delete": {name: "Delete", icon: "delete"},
            "sep1": "---------",
            "quit": {name: "Quit", icon: function(){
                return 'context-menu-icon context-menu-icon-quit';
            }}
        }

    });
    */
});

