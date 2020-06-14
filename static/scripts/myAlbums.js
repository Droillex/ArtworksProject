
var $flag_1 = true;
var $flag_2 = true;
var $settings;
var user_data;
var current_dir;
var opening = false;


fetch(`/api/get_albums`,{method: 'POST'})
        .then(res => res.json())
        .then(data => {
        if(data['code'] == 1)
        {
            user_data = data['data'];
            $(".albums_head").attr('data-content',`:\\${data["user"]}\\`);
            $(".albums_main").attr('data-content',`:\\${data["user"]}\\`);
            open_album();
        }
        else
        {
            window.alert(data['message']);
        }
        });



function add_window(name, url='', typ = 'album')
{   
    let alb_pic = "";
    if(url!='')
    {
        alb_pic = url;
        switch (typ) 
        {
            case 'album':
                $img = $("<img>", {"loading":"lazy","src": alb_pic,"alt":"Album","onclick":`open_album("${name}")`});
                break;

            case 'picture':
                $img = $("<img>", {"loading":"lazy","src": alb_pic,"alt":"Album","onclick":`open_pic("${name}")`});
                break;
            default:
                break;
        }
    }
    else
    {
        alb_pic = "pics/empty-album.jpg";
        $img = $("<img>", {"loading":"lazy","src": alb_pic,"alt":"Album"});
    }

    let $new_alb = $("<div>", {"class":"wrap_alb", "onmouseleave": "hover_leave()"});
    $albname = $("<div>", {"class": "alb_name"});
    $albname.append($("<span>",{"class":"alb_features"}).append(`<span>${name}</span><span class="underscore">_</span>`));
    $sett = $("<div>", {"class":"settings"});

    $sett.hover(function() 
    {
     var $album = $(this).parent();
     $settings = $album;
     $($settings).css({'height':'inherit'});
     $($settings).children().eq(1).children().first().css({'opacity':0});
     $($settings).find(".rename, .delete").css({'opacity':'1','pointer-events':'auto'});

    });

    $albname.append($sett.append($("<i>", {"class":"fas fa-cog"})));
    $del = $("<div>", {"class":"delete"});

    switch (typ) 
    {
        case 'album':
            $ren = $("<div>", {"class":"rename"});
            //$ren.click(renaming);
            let $img = $("<img>", {"src":"pics/edit.png", "id":"edit-icon"});
            $img.click(renaming);
            $albname.append($ren.append($img));
        $del.append($("<img>", {"src":"pics/delete.png", 'id':'edit-icon'}));
        $del.children().eq(0).click(deleting);
            break;

        case 'picture':
            $mov = $("<div>", {"class":"rename"});
            $mov.click(moving);
            $albname.append($mov.append($("<img>", {"src":"pics/move.png", "id":"edit-icon"})));
            $del.append($("<img>", {"src":"pics/delete.png", 'id':'edit-icon'}));
            $del.children().eq(0).click(deleting_pic);
            break;
        default:
            break;
    }



    $albname.append($del);
    $new_alb.append($albname);
    $new_alb.append($img);
    $('.grid-albums').append($new_alb);
}


function add_albums(dat){

        for (i = 0; i < dat.length; i++) 
        {
            let alb_pic = "";
            pic_amount = dat[i]["pics"].length
            if(pic_amount >0)
            {
                alb_pic = dat[i]["pics"][pic_amount-1]["cover"]
            }
            add_window(dat[i]["name"],alb_pic);
        }
    
}

function add_pics(dat){
    tmp = dat.slice(0);
    tmp.reverse();
    for (i = 0; i < tmp.length; i++) 
    {
        add_window(tmp[i]["work_id"], tmp[i]["cover"],'picture');
    }
    
}





function hover_leave()
{
    $($settings).css({'height':'22.5px'});
    $($settings).find(".rename, .delete").css({'opacity': '0','pointer-events':'none'})
    $($settings).children().eq(1).children().first().css({'opacity':1});
}


function modalwindow(typ, head_text, body_text, exec_func, params={}, inp_value="")
{
    let $wdw = $("<div>", {"id":"renameModal", "class": "modal"});
    $modalcontent = $("<div>", {"class": "modal-content"});
    $modalcontent.append($("<div>", {"class":"modal-header"}).append(head_text));
    $modalbody = $("<div>", {"class":"modal-body"});
    if(typ == "input")
    {
        $modalbody.append($("<label>", {"for":"inp"}).append(`>${body_text}`));
        $inp = $("<input>", {"autocomplete":"off","type":"text", "value":"", "id":"inp", "maxlength":"30"});
        $modalbody.append($inp);
    }
    else
    {
        $modalbody.append($("<label>").append(`${body_text}`));
    }
    $modalcontent.append($modalbody);
    $modalfooter = $("<div>", {"class":"modal-footer"});
    $exec = $("<button>", {"class":"execute"});

    $exec.click(params, exec_func);

    $modalfooter.append($exec.append("Execute"))
    $exit = $("<button>", {"class":"exit"});

    $exit.click(function()
     {
        $("#renameModal").remove();
    });

    $modalfooter.append($exit.append("Cancel"))
    $modalcontent.append($modalfooter);
    $wdw.append($modalcontent);
    //$wdw.css({ 'display': 'block'});
    $('.grid-albums').append($wdw);
    if(typ == "input")
    {
    $inp.focus();
    $inp.val(inp_value);
    }
}

//Показ полного имени альбома
$(".albums_main").click(function() {
    if ($flag_1 == true) {
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
function renaming()
{
    var $album = $(this).parent().parent();
    var $alb_name = $($album).find(".alb_features").children().first().text();
    modalwindow("input",`Renaming "${$alb_name}"`, "rename", exec_rename, {alb: $album}, $alb_name);
}




//Удаление альбома
function deleting()
{   
    var $album = $(this).parent().parent();
    var $alb_name = $($album).find(".alb_features").children().first().text();
    modalwindow("delete",`Deleting "${$alb_name}"`, "MSG: Are you sure you want to delete this album?", exec_delete, {alb: $album});
}


function adding()
{
    modalwindow("input",`Adding new album`, "create", exec_add);
}



function moving()
{
    window.alert("This feature not available yet");
}

function deleting_pic()
{
    let $pic = $(this).parent().parent();
    let id = $pic.children().eq(0).children().eq(0).text();
    modalwindow("delete",`Deleting "${id}"`, "MSG: Are you sure you want to delete this artwork?", exec_delete_artwork, {work_id: id, alb_name: user_data[current_dir]['name'], del: $pic.parent()});
}

function exec_rename(event)
{
    alb = event.data.alb;
    var $alb_name = $(alb).find(".alb_features").children().first().text();
    var $new_name = $("#renameModal").find("#inp").val();
    fetch(`/api/rename_album?name=${$alb_name}&new_name=${$new_name}`,{method: 'POST', redirect: 'follow'})
    .then(res => res.json())
    .then(data => {
        if(data['code'] == '-100')
        {
            redirect_to('');
        }
        else
        {
            get_user_data();
        }
        if(data['code'] == 1)
        {
            $(alb).find(".alb_features").children().first().text($new_name);
            idx = user_data.map(function(e) { return e['name']; }).indexOf($alb_name);
            user_data[idx]['name'] = $new_name;
        }
        else
        {
             window.alert(data['message']);
        }
    });
    $("#renameModal").remove();
}


function exec_delete(event)
{
    alb = event.data.alb;
    var $alb_name = $(alb).find(".alb_features").children().first().text();
    idx = user_data.map(function(e) { return e['name']; }).indexOf($alb_name);
    fetch(`/api/remove_album?name=${$alb_name}`,{method: 'POST', redirect: 'follow'})
        .then(res => res.json())
        .then(data => {
        if(data['code'] == '-100')
        {
            redirect_to('');
        }
        else
        {
            get_user_data();
        }
        if(data['code'] == 1)
        {
            if(current_dir == -1)
                alb.parent().remove();
            user_data.splice(idx, 1);
        }
        else
        {
            window.alert(data['message']);
        }
        });
        $('#renameModal').remove();
}


function exec_delete_artwork(event)
{
    id = event.data.work_id;
    album_name = event.data.alb_name;
    for_del = event.data.del;
    fetch(`/api/remove_art?alb_name=${album_name}&id=${id}`,{method: 'POST'})
        .then(res => res.json())
        .then(data => {
        if(data['code'] == '-100')
        {
            redirect_to('');
        }
        else
        {
            get_user_data();
        }
        if(data['status'] == 1)
        {
            for_del.remove();
            idx = user_data[current_dir]['pics'].map(function(e) { return e['work_id']; }).indexOf(id);
            user_data[current_dir]['pics'].splice(idx, 1);
        }
        else
        {
            window.alert(data['message']);
        }
        });
        $('#renameModal').remove();
}


function exec_add()
{
    var name = $("#renameModal").find("#inp").val();
    fetch(`/api/add_album?name=${name}`,{method: 'POST', redirect: 'follow'})
        .then(res => res.json())
        .then(data => {
        if(data['code'] == '-100')
        {
            redirect_to('');
        }
        else
        {
            get_user_data();
        }
        if(data['code'] == 1)
        {
            if(current_dir == -1)
                add_window(name);
            user_data.push({'last_updated':'None', 'name':name, 'pics':[]});
        }
        else
        {
            window.alert(data['message']);
        }
        });
        $('#renameModal').remove();
}


function open_album(name = "")
{
    if (opening == true)
        return;
    opening = true;
    if(name != "")
    {
        idx = user_data.map(function(e) { return e['name']; }).indexOf(name);
        if(current_dir == idx)
        {
            opening = false;
            return;
        }
        if (idx > (-1))
        {
            let pos = $(".grid-albums").outerWidth();
            $(".grid-albums").animate({
                right: `${pos}px`
            }, 'slow', function() 
            {                
                $(".header_section").first().append($("<div>", {"class":"directory_path", "onclick": `open_album('${name}')`}).append(`\\${name}`));
                $(".albums_main").first().children().first().after($("<a>", {"class":"dir", "onclick": `open_album('${name}')`}).append(`\\${name}`))
                current_dir = idx;
                $('.wrap_alb').remove();
                for (i = 0; i < user_data[current_dir]['pics'].length; i++)
                {
                    add_pics(user_data[current_dir]['pics']);
                }
                window.scrollTo(0, 0);
                //$(".grid-albums").css({ right: -pos });
                $(".grid-albums").animate({
                right: `0px`
                }, 'slow', function() {
                    opening = false;
                });

            });
        }
    }
    else
    {
        if(current_dir == -1)
        {
            opening = false;
            return;
        }


        let pos = $(".grid-albums").outerWidth();
        $(".grid-albums").animate({
            right: `${pos}px`
            }, 'slow', function() 
        {    
            $('.directory_path').remove();
            $('.dir').remove();
            get_user_data();
            $('.wrap_alb').remove();
            current_dir = -1;
            add_albums(user_data);
            window.scrollTo(0, 0); 
            $(".grid-albums").animate({
                right: `0px`
                }, 'slow', function() {
                    opening = false;
            });
        });


    }
}


function open_pic(work_id)
{
    var win = window.open(`/artwork?id=${work_id}`, '_blank');
    win.focus();
}

function redirect_to(adress)
{
    window.location = `/${adress}`;
}



function get_user_data()
{
    fetch(`/api/get_albums`,{method: 'POST'})
        .then(res => res.json())
        .then(data => {
        if(data['code'] == '-100')
            redirect_to('');
        if(data['code'] == 1)
        {
            //compare_data(data['data']);
            user_data = data['data'];
        }
        else
        {
            window.alert(`${data['message']}, code:${data['code']}`);
        }
        });
}


function compare(data1, data2)
{

    return _.isEqual(data1, data2);
}

function reset_data()
{
    current_dir = -1;
    $("#renameModal").remove();
    $('.wrap_alb').remove();
    add_albums(user_data);
}

