$(function() {

    $(".exp-to-data").each(function() {
        if ($(this).text() !== "") {
            $(this).text(' - ' + $(this).text());
        }
    });
    
    $(".exp-place-data").each(function() {
        if ($(this).text().indexOf(',') != 0) {
            $(this).text(',' + $(this).text()); 
        }
    })

    $("#print").click(function() {
 
        let css =[];
        $('link[rel=stylesheet]').each(function(){ 
            css.push($(this).attr('href'));
        })

        printJS({
            printable: 'mainContainer',
            type:'html',
            css: css,
            scanStyles: true,
            showModal: true,
            targetStyles: ['*'],
            onPrintDialogClose: function() { 
                console.log('The print dialog was closed');
            },
            onLoadingStart: function() {
                $('.page').setStyle('page',{'box-shadow': 'none'});
            },
            onLoadingEnd: function() {
                $('.page').load('page');
            }
        })        

    })

    $.getData = function() {
        let obj = {};
        obj['first-name'] = $('.first-name-data').text();
        obj['last-name'] = $('.last-name-data').text();
        obj['role-title'] = $('.role-title-data').text();
        obj['email'] = $('.email-data').text();
        obj['address'] = $('.address-data').text();
        obj['phone'] = $('.phone-data').text();
        obj['forwords'] = $('.forwords-data').text();

        experiences = [];
        $(this).find('.experiences').each(function() {
            let exps = {};
            exps['exp-header'] = $(this).find('.exp-header-data').text();
            
            exp_items = [];
            $(this).find('.exp').each(function() {
                let exp_item = {};
                exp_item['exp-role'] = $(this).find('.exp-role-data').text();
                exp_item['exp-company']= $(this).find('.exp-company-data').text();
                exp_item['exp-from'] = $(this).find('.exp-from-data').text();
                exp_item['exp-to'] = $(this).find('.exp-to-data').text();
                exp_item['exp-place'] = $(this).find('.exp-place-data').text();
                exp_item['exp-description'] = $(this).find('.exp-description-data').text();
                exp_items.push(exp_item);
            })
            exps['exp-items'] = exp_items;
            experiences.push(exps);
        })
        obj['experiences'] = experiences;
        
        components = [];
        $('.component').each(function() {
            let comp = {};
            comp['comp-header'] = $(this).find('.comp-header-data').text();
            let comp_items = [];
            $(this).find('.comp-item').each(function() {
                let comp_item = {};
                comp_item['comp-item-field'] = $(this).find('.comp-item-field-data').text();
                comp_item['comp-item-value'] = $(this).find('.comp-item-value-data').text();
                comp_items.push(comp_item);
            })
            comp['comp-items'] = comp_items;
            components.push(comp);
        })
        obj['components'] = components;
        
        return obj;
    }

    $.parseText = function(multiline_text) {
        let lines = multiline_text.trim().split('\n');
        let html = '';
        for (line of lines) {
            html = html + '<p>' + line.trim() + '</p>';
        }
        return html;
    }

    $.loadData = function(obj) {
        $('.first-name-data').text(obj['first-name']);
        $('.last-name-data').text(obj['last-name']);
        $('.role-title-data').text(obj['role-title']);
        $('.email-data').text(obj['email']);
        $('.address-data').text(obj['address']);
        $('.phone-data').text(obj['phone']);
        $('.forwords-data').text(obj['forwords']);
        
        let experiences = obj['experiences'];
        let experiences_elm = $(this).find('.experiences');
        for (let i = 0; i < experiences_elm.length; ++i) {
            let experience = experiences[i];
            let experience_elm = experiences_elm[i];

            $(experience_elm).find('.exp-header-data').text(experience['exp-header']);
            let exps = experience['exp-items'];
            let exps_elm = $(experience_elm).find('.exp');

            for (let j = 0; j < exps_elm.length; ++j) {
                let exp_item = exps[j];
                let exp_elm = exps_elm[j];
                $(exp_elm).find('.exp-role-data').html(exp_item['exp-role']);
                $(exp_elm).find('.exp-company-data').html(exp_item['exp-company']);
                $(exp_elm).find('.exp-from-data').html(exp_item['exp-from']);
                $(exp_elm).find('.exp-to-data').html(exp_item['exp-to']);
                $(exp_elm).find('.exp-place-data').html(exp_item['exp-place']);
                $(exp_elm).find('.exp-description-data').html($.parseText(exp_item['exp-description']));
            }
        }

        let components = obj['components'];
        let components_elm = $(this).find('.component');
        for (let i = 0; i < components_elm.length; ++i) {
            let comp = components[i];
            let comp_elm = components_elm[i];
            $(comp_elm).find('.comp-header-data').text(comp['comp-header']);
            let comp_items = comp['comp-items'];
            let comp_items_elm = $(comp_elm).find('.comp-item');
            for (let j = 0; j < comp_items_elm.length; ++j) {
                let comp_item = comp_items[j];
                let comp_item_elm = comp_items_elm[j];
                $(comp_item_elm).find('.comp-item-field-data').text(comp_item['comp-item-field']);
                $(comp_item_elm).find('.comp-item-value-data').text(comp_item['comp-item-value']);
            }
        }
    }

    $("#save").on('click', function(ev) {  
        let obj = $.getData();  
        let json = JSON.stringify(obj);
        var blob = new Blob([json], {type: "applicaton/json;charset=utf-8"});
        saveAs(blob, 'cv-data.json');    
    })

    $("#fileDialog").change(function(ev) {
        let f = ev.target.files[0];
        let reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                jsonObj = JSON.parse(e.target.result);
                $.loadData(jsonObj);
            };
        })(f);
        reader.readAsText(f);
        
    })

    $("#load").click(function(ev) {
        action = 'load';
        $("#fileDialog").trigger('click');
    })


    $(window).on("scroll", function(){
        $("#container-extra").css({
            "top": ($(window).scrollTop()) + "px",
            "left": ($(window).scrollLeft()) + "px"
        });
    })
})
