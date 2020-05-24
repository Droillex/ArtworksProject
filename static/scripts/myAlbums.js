
var $flag_1 = true;
var $flag_2 = true;
var $settings;

//Вариант с наведением на иконку настроек
$("div[class^='alb-']").hover(
    function() {
        $(".settings").hover(function() {
            var $album = $(this).parent();
            $settings = $album;
            $($settings).css({ 'height': 'inherit' });
            $($settings).find(".rename, .delete").css({ 'display': 'unset' });
        })
    },

    function() {
        $($settings).css({ 'height': '22.5px' });
        $($settings).find(".rename, .delete").css({ 'display': 'none' });
    });

//Вариант с кликом на иконку настроеку
$(".settings").click(function() {
    var $cont = $(this).parent();
    if ($flag_2 == true) {
        $($cont).css({ 'height': 'inherit' });
        $($cont).find(".rename, .delete").css({ 'display': 'unset' });
        $flag_2 = false;

    } else {

        $($cont).css({ 'height': '22.5px' });
        $($cont).find(".rename, .delete").css({ 'display': 'none' });
        $flag_2 = true;
    }
});

//Показ полного имени альбома
$(".albums_main").click(function() {
    if ($flag == true) {
        $(this).css({
            'height': 'unset',
            'overflow': 'unset',
            'word-break': 'break-all',
            'white-space': 'unset'
        });
        $flag_1 = false;

    } else {
        $(this).css({
            'height': '50px',
            'overflow': 'hidden',
            'word-break': 'unset',
            'white-space': 'nowrap'
        })
        $flag_1 = true;
    }

});

//Изменение имени альбома
$(".rename").click(function() {
    var $album = $(this).parent();
    var $alb_name = $($album).find("span").text();
    $("#renameModal").css({ 'display': 'block' });
    $("#renameModal").find("#rename").val($alb_name);

    $(".execute").click(function(){
        var $new_name = $("#renameModal").find("#rename").val();
        fetch(`/api/rename_album?name=${$alb_name}&new_name=${$new_name}`)
        .then(res => res.json())
        .then(data => {
        console.log(data);
        });
        $($album).find("span").text($new_name);
        $("#renameModal").css({ 'display': 'none' });
    });

    $(".exit").click(function() {
        $("#renameModal").css({ 'display': 'none' });
    });
});

//Удаление альбома
$(".delete").click(function() {
    var $album = $(this).parent();
    var $alb_name = $($album).find("span").text();
    $("#deleteModal").css({ 'display': 'block' });
    $("#deleteModal").find(".modal-header").text("Delete '" + $alb_name + "'");

    $(".exit").click(function() {
        $("#deleteModal").css({ 'display': 'none' });
    });

    $(".execute").click(function() {
        $($album).parent().parent().remove();
        $("#deleteModal").css({ 'display': 'none' });
    });
});
