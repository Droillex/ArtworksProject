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

    typeWriter($('#title').children().eq(0), dat['title'], 75);
    $('#title').children().eq(1).fadeOut(500).fadeIn(500);
    $('#description').html(dat['description']);
    $('#author_name').html(dat['author_name']);
    $('.author-info').children().eq(0).attr('href',dat['author_link']);
    $('.options').children().eq(0).attr('href',dat['work_link']);
    $('.author-part').children().eq(1).attr('src',dat['author_logo']);
    for (i = 0; i < dat['content'].length; i++) 
    {
        let $img = $("<div>", {"class": "artwork-data"});
        $img.append($("<img>", {"src": dat['content'][i]}))
        $('.artwork-container').append($img);
    }

}

$("#pointer, #title").click(function() {
    if ($flag == true) {
        $("#pointer").css({ 'transform': 'rotate(90deg)'});
        $('#description').stop();
        $('.options').stop();
        $('#description').animate({ height: 'show' }, 500);
        $('.options').animate({ height: 'show' }, 500);
        $flag = false;
    } else {
        $("#pointer").css({ 'transform': 'unset' });
         $('#description').stop();
        $('.options').stop();
        $('#description').animate({ height: 'hide' }, 500);
        $('.options').animate({ height: 'hide' }, 500);
        $flag = true;
    }
});

// $("#to_alb").click(function() {
//     $("#saveModal").css({ 'display': 'block' });
// })

// $(".exit").click(function() {
//     $("#saveModal").css({ 'display': 'none' });
// })
