
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
        'vertical-align': 'field1',    
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

    $.fn.isRow = function () { return $(this).hasClass("rowxtend"); };
    $.fn.isCol = function() { return $(this).hasClass("colxtend"); };

    $.new = function(elementName, className) {
        let str = '<' + elementName;
        if (className !== undefined) str += ' class="' + className + '"';
        str += '></' + elementName + '>';
        return $(str);
    }

    $.fn.addDivider = function(isBefore = true) {
        if ($(this).isCol()) {
            if (isBefore)
                $('<div class="divider-col" style="display: table-cell; width:4px;padding-left:1px;padding-right:1px"></div>').insertBefore($(this));
            else
                $('<div class="divider-col" style="display: table-cell; width:4px;padding-left:1px;padding-right:1px"></div>').insertAfter($(this));
        } else if ($(this).isRow()) {
            if (isBefore)
                $('<div class="divider-row" style="display: block;height:2px;padding-top:1px;padding-bottom:1px"></div>').insertBefore($(this));
            else 
                $('<div class="divider-row" style="display: block;height:2px;padding-top:1px;padding-bottom:1px"></div>').insertAfter($(this));
        }
        return this;
    }
    //append divider
    $('.colxtend, .rowxtend').each(function() { $(this).addDivider(true); });
    $('.colxtend:last-of-type, .rowxtend:last-of-type').each(function() { $(this).addDivider(false);})

    var editMode = false;
    var isResizeOn = false;
    var draggedItem = $();

    $('div').on('mouseover', '.divider-row, .divider-col', function(ev) {
        ev.stopPropagation();
        console.log('mouseover');
        if (!$(this).closestParent('.componentx').is(draggedItem.closestParent('.componentx'))) {
            return;
        } 
        console.log('mouseover', 'pass test');
        $(this).setStyle('divider-hover', {'background-color':'red'});
        $(this).next().setStyle('element-hover', {'border':'1px solid', 'opacity':'0.34'});
        $(this).prev().setStyle('element-hover', {'border':'1px solid', 'opacity':'0.34'});
        hovered = $(this);
    }).on('mouseout', '.divider-row, .divider-col', function(ev) {
        ev.stopPropagation();
        $(this).load('divider-hover');
        $(this).next().load('element-hover');
        $(this).prev().load('element-hover');
        hovered = $();
    })

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

    var selected = $();
    $.fn.setSelected = function(isSelected) {
        if (isSelected == true) {
            $(this).load("hovered");
            $(this).load("opacity-mouseover");
            $(this).setStyle('selected', {'outline': '1px solid'});
            $(this).showProps().focus();
            ($(this).children('span')).attr('contenteditable', 'true').focus();
            jscolor.installByClassName('jscolor');
            propertyContainer.show();
            textContainer.show();
            editMode = true;
            $('.rowxtend, .colxtend').draggable({disabled: true});
            selected = this;            
        } else {
            $(this).load('selected').focusout();
            $(this).children('span').attr('contenteditable', 'false');
            propertyContainer.hide();
            textContainer.hide();
            editMode = false;
            $('.rowxtend, .colxtend').draggable({disabled: false});
            selected = $();
        }
        return this;
    }

    
    $('div').on("mousedown", ".rowxtend, .colxtend", function(ev){ 
        if (ev.which !== 1) return;
        if (draggedItem.length > 0 || isResizeOn) return;
        if (!$(this).is(selected)) {      
            selected.setSelected(false);
            $(this).setSelected(true);
            
            
        } 
        ev.stopPropagation();
    })

    $('div').on("mouseover", '.rowxtend, .colxtend', function(ev){
        ev.stopPropagation();
        if (selected.length > 0) return;
        $(this).setStyle("hovered", {'opacity':'0.5', 'outline': '1px solid blue'});
    }).on("mouseout", '.rowxtend, .colxtend', function(ev){
        ev.stopPropagation();
        if (selected.length > 0) return;
        $(this).load("hovered");
    });

    $(document).keydown(function(ev) {
        if (ev.which === 27) selected.setSelected(false);
    })

    var isContextMenuOn = false;

    //create a wrapper with the target type around the object
    $.fn.createWrapper = function($target) {
        let $newItem = $(this);
        //if ($target.hasClass("divider-col") && $newItem.isRow()) {
        if ($target.hasClass("divider-col")) {
            if ($newItem.children(".colxtend").length > 0) {
                return $newItem.children(".colxtend");
            } else if ($newItem.isRow()){
                let $col = $.new('div', "colxtend").makeDraggable().makeResizable();
                $col.append($newItem);
                $newItem.addDivider(true).addDivider(false);
                return $col;
            }
        } else if ($target.hasClass("divider-row")) {
            if ($newItem.children(".rowxtend").length > 0) {
                return $newItem.children(".rowxtend");
            } else if ($newItem.isCol()) {
                let $row = $.new('div', "rowxtend").makeDraggable().makeResizable();
                $row.append($newItem);
                $newItem.addDivider(true).addDivider(false);
                $newItem = $row;
            }
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

    var hovered = $();

    $.fn.makeDraggable = function () {
        $(this).draggable( {
            helper: "clone",
            opacity: 0.34,
            delay: 300,
            containment:$(this).closestParent('.componentx'),
            start: function(ev, ui) {
                ev.stopPropagation();
                $(this).data("width", $(this).width()).data("height",$(this).height()); 
                           
                draggedItem = $(this);
            },
            drag: function(ev, ui) {
                ev.stopPropagation();
                ui.helper.width($(this).data("width")).height($(this).data("height"));
            },
            stop: function(ev, ui) {    
                draggedItem = $();
                $(this).load('drag-start');
                $(this).setSelected(false);
                if (hovered.length === 0) return;
                hovered.load('divider-hover');
                hovered.prev().load('element-hover');
                hovered.next().load('element-hover');
                if (jQuery.contains(this, hovered[0]) || $(this).is(hovered)) return;
                if ($(this).next().is(hovered) || $(this).prev().is(hovered)) return;
                if (!$(this).closestParent('.componentx').is(hovered.closestParent('.componentx'))) return;
                let $container = $(this).getContainerUp();
                let $containerParent = $container.parent();
                let $contained = $(this).getContainerDown();
                
                $contained.prev().remove();
                $dragged = $contained.detach().createWrapper(hovered);
                $dragged.each(function() {
                    $(this).insertBefore(hovered);
                    $(this).addDivider(true);
                })
                
                if (!$container.is($contained)) {
                    $container.prev().remove();
                    $container.remove();
                }
                if ($containerParent.children(".colxtend, .rowxtend").length <= 1)
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

