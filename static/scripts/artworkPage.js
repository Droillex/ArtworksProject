var art_data;
var $flag = true;
var proc = false;

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
        $img.append($("<img>", {"loading":"lazy","src": dat['content'][i]}))
        $('.artwork-container').append($img);
    }
    if(login_res['res'] == 0)
    {
        $('#to_alb').html('Login to save artwork');
        $('#to_alb').attr('id','unavailable');
    }
    else
    {
        $("#to_alb").attr('onclick','SaveModal()');
         //$("#to_alb").click();
    }
}

function SaveModal()
{
    $wdw = $("<div>", {"class":"modal", "id": "saveModal"}).append($("<div>", {"class":"modal-content", "id": "choose_content"}).append($("<div>", {"class":"modal-header"}).text('Choose an Album')));
    $cont = $("<div>", {"class":"modal-main"});
    $foot = $("<div>", {"class":"modal-footer"}).html('<button class="exit" onclick="CloseModal()">Cancel</button>');
    $wdw.children().first().append($cont);
    $wdw.children().first().append($foot);
    $('.artwork-container').after($wdw);
    Blank();
    if (proc)
        return;
    fetch(`/api/album_list?id=${art_data['work_id']}`,{method: 'POST'})
    .then(res => res.json())
    .then(data => {
        if(data['status'] == '0')
            document.location.reload(true);
        Fill_albums(data);

    });
}

function CloseModal()
{
    $('#saveModal').remove();
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


function AddToAlb(caller="", val="")
{
     proc = true
     Blank();
    loc = "";
    if(caller !="")
        loc = `/api/add_art?id=${art_data['work_id']}&alb_name=${$(caller).parent().attr('value')}`;
    else
        loc = `/api/add_art?id=${art_data['work_id']}&alb_name=${val}`;
     fetch(loc, {method: 'POST'})
         .then(res => res.json())
         .then(data => {
            refresh_data();
         });

}

function RemoveFromAlb(caller)
{
     proc = true;
     Blank();
     fetch(`/api/remove_art?id=${art_data['work_id']}&alb_name=${$(caller).parent().attr('value')}`, {method: 'POST'})
         .then(res => res.json())
         .then(data => {
            refresh_data();
         });
}


function Fill_albums(data)
{
    $('.modal-main').empty();
        $('.modal-main').append($("<div>", {"class":"save-to","onclick":`new_alb()`}).html('<div><i class="fas fa-plus"></i>Create new Album</div>'));
        for (i = 0; i < data['data'].length; i++) 
        {
            al = data['data'][i];
            if(al['status'] == "True")
            {
                $('.modal-main').append($("<div>", {"class":"save-to","value":al['name']}).html(`<div>${al['name']}</div><div class="del-alb" onclick="RemoveFromAlb(this)">Remove</div>`));
            }
            else
            {
                $('.modal-main').append($("<div>", {"class":"save-to","value":al['name']}).html(`<div>${al['name']}</div><div class="add-alb" onclick="AddToAlb(this)">Add</div>`));
            }

        }
}


function Blank()
{
    let txt = '';
    if (proc)
        txt = 'Processing';
    else
        txt = 'Loading';
    $('.modal-main').empty().append($("<div>", {"class":"list_loading"}).html(`<span>${txt}</span><span class = 'underscore'>_</span><p>Please, wait</p>`));
}

function cr_alb()
{
    console.log('Create_album!');
    var name = $("#renameModal").find("#inp").val();
    proc = true;
    Blank();
    $('#renameModal').remove();
    fetch(`/api/add_album?name=${name}`,{method: 'POST'})
        .then(res => res.json())
        .then(data => {
        console.log(data);
        if(data['code'] == '-100')
        {
            document.location.reload(true);
        }
        if(data['code'] == '1')
        {
            AddToAlb("", name);
        }
        else
        {
            window.alert(data['message']);
            refresh_data();
        }
        });
}



function new_alb()
{
    addmodal('input','Create album','Create', cr_alb, {}, $('#album-body'));
}

function refresh_data()
{
    fetch(`/api/album_list?id=${art_data['work_id']}`,{method: 'POST'})
    .then(res => res.json())
    .then(data => {
        Fill_albums(data);
        proc = false;
    });
}