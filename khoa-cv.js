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
})