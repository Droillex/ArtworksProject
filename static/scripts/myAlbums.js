
var $flag_1 = true;
var $flag_2 = true;
var $settings;

fetch(`/api/get_albums`, {method: 'POST', redirect: 'follow'})
        .then(res => res.json())
        .then(data => {
        if(data['code'] == 1)
        {
            $(".albums_head").attr('data-content',`${data["user"]}\\`);
            add_albums(data['data']);
        }
        else
        {
            redirect_to("login");
        }

    });



function add_album(name, url='')
{   
    let alb_pic = "";
    if(url!='')
    {
        alb_pic = url
    }
    else
    {
        alb_pic = "pics/empty-album.jpg"
    }

    let $new_alb = $("<div>", {"class":"wrap_alb", "onmouseleave": "hover_leave()"});
    $albname = $("<div>", {"class": "alb_name"});
    $albname.append($("<span>").append(name));
    $sett = $("<div>", {"class":"settings"});

    $sett.hover(function() 
    {
     var $album = $(this).parent();
     $settings = $album;
     $($settings).css({'height':'inherit'});
     $($settings).find(".rename, .delete").css({'opacity':'1'});
    });

    $albname.append($sett.append($("<i>", {"class":"fas fa-cog"})));
    $ren = $("<div>", {"class":"rename"});
    $ren.click(renaming);
    $albname.append($ren.append($("<i>", {"class":"fas fa-pencil-alt fa-3x"})));
    $del = $("<div>", {"class":"delete"});
    $del.click(deleting);
    $albname.append($del.append($("<i>", {"class":"far fa-trash-alt fa-3x"})));
    $new_alb.append($albname);
    $new_alb.append($("<img>", {"src": alb_pic,"alt":"Album"}));
    $('.grid-albums').append($new_alb);
}


function add_albums(dat){
    for (i = 0; i < dat.length; i++) 
    {
        let alb_pic = "";
        pic_amount = dat[i]["pics"].length
        if(pic_amount >0)
        {
            alb_pic = dat[i]["pics"][pic_amount-1]["content"][0]
        }

        add_album(dat[i]["name"],alb_pic);
        
    }
}




function hover_leave()
{
    $($settings).css({'height':'22.5px'});
    $($settings).find(".rename, .delete").css({'opacity': '0'})
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
        $inp = $("<input>", {"type":"text", "value":"", "id":"inp", "maxlength":"30"});
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


//Вариант с кликом на иконку настроеку
// $(".settings").click(function() {
//     var $cont = $(this).parent();
//     if ($flag_2 == true) {
//         $($cont).css({ 'height': 'inherit' });
//         $($cont).find(".rename, .delete").css({ 'opacity': '1' });
//         $flag_2 = false;

//     } else {

//         $($cont).css({ 'height': '22.5px' });
//         $($cont).find(".rename, .delete").css({ 'opacity': '0' });
//         $flag_2 = true;
//     }
// });

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
function renaming()
{
    var $album = $(this).parent();
    var $alb_name = $($album).find("span").text();
    modalwindow("input",`Renaming "${$alb_name}"`, "rename", exec_rename, {alb: $album}, $alb_name);
}




//Удаление альбома
function deleting()
{   
    var $album = $(this).parent();
    var $alb_name = $($album).find("span").text();
    modalwindow("delete",`Deleting "${$alb_name}"`, "MSG: Are you sure you want to delete this album?", exec_delete, {alb: $album});
}


function adding()
{
    modalwindow("input",`Adding new album`, "create", exec_add);
}



function exec_rename(event)
{
    alb = event.data.alb;
    var $alb_name = alb.find("span").text();
    var $new_name = $("#renameModal").find("#inp").val();
    fetch(`/api/rename_album?name=${$alb_name}&new_name=${$new_name}`,{method: 'POST', redirect: 'follow'})
    .then(res => res.json())
    .then(data => {
        console.log(data);
        if(data['code'] == '-100')
        {
            redirect_to('login');
        }
        if(data['code'] == 1)
        {
            alb.find("span").text($new_name);
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
    var $alb_name = alb.find("span").text();
    fetch(`/api/remove_album?name=${$alb_name}`,{method: 'POST', redirect: 'follow'})
        .then(res => res.json())
        .then(data => {
        console.log(data);
                if(data['code'] == '-100')
        {
            redirect_to('login');
        }
        if(data['code'] == 1)
        {
            alb.parent().remove();
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
        console.log(data);
        if(data['code'] == '-100')
        {
            redirect_to('login');
        }
        if(data['code'] == 1)
        {
            add_album(name);
        }
        else
        {
            window.alert(data['message']);
        }
        });
        $('#renameModal').remove();
}


function redirect_to(adress)
{
    window.location = `/${adress}`;
}