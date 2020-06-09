var art_data;
var $flag = true;

 fetch(`/${(window.location.pathname+location.search).substr(1)}`,{method: 'POST'})
         .then(res => res.json())
         .then(data => {
            art_data = data;
            FillPage(art_data);
         });

function FillPage(dat)
{

    $('#title').html(dat['title']);
    $('#description').html(dat['description']);
    $('#author_name').html(dat['author_name']);
    $('.author-info').children().eq(1).attr('src',dat['author_logo']);
    for (i = 0; i < dat['content'].length; i++) 
    {
        let $img = $("<div>", {"class": "artwork-data"});
        $img.append($("<img>", {"src": dat['content'][i]}))
        $('.artwork-container').append($img);
    }

}

$("#pointer, #title").click(function() {
    if ($flag == true) {
        $("#pointer").css({ 'transform': 'rotate(90deg)' });
        $("#description").css({ 'display': 'block' });
        $('.options').css({ 'display': 'unset' });
        $flag = false;
    } else {
        $("#pointer").css({ 'transform': 'unset' });
        $("#description").css({ 'display': 'none' });
        $('.options').css({ 'display': 'none' });
        $flag = true;
    }
});

$("#to_alb").click(function() {
    $("#saveModal").css({ 'display': 'block' });
})

$(".exit").click(function() {
    $("#saveModal").css({ 'display': 'none' });
})
