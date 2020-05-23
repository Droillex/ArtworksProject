$("div[class^='alb-']").hover(
    function() {
        var alb_class = $(this).attr("class");
        var str = '.' + alb_class + '> .wrap_alb > .alb_name > .settings';
        $(str).css('visibility', 'unset');
    },

    function() {
        var alb_class = $(this).attr("class");
        var str = '.' + alb_class + '> .wrap_alb > .alb_name > .settings';
        $(str).css('visibility', 'hidden');
    });
