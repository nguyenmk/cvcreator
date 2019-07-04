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
            targetStyles: ['*']
            })
    })

    $("#save").on('click', function(ev) {  
        let obj = {name: "khoa", age: "8"};  
        let json = JSON.stringify(obj);
        var blob = new Blob([json], {type: "applicaton/json;charset=utf-8"});
        saveAs(blob, "cv_data.json");
    })

    $("#fileDialog").change(function(ev) {
        console.log($(this).val());
    })

    $("#load").click(function(ev) {
        $("#fileDialog").trigger('click');
    })
})
