

var art_data;

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