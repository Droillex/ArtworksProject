
var locked = false;

function modalwindow(formname) {
    let $wdw = $("<div>", { "id": "loginModal", "class": "modal" });
    $modalcontent = $("<div>", { "class": "modal-content" });
    $modalcontent.append($("<div>", { "class": "modal-header" }).append(formname));
    $modalform = $("<div>");

    $modalelem = $("<div>", { "class": "form-elem" });
    $modalelem.append($("<label>", { "for": "username" }).append("Username"));
    $modalelem.append($("<input>", {"autocomplete":"off", "name": "username", "class": "usr-input", "maxlength": "30", "required": true }));

    $modalelem1 = $("<div>", { "class": "form-elem" });
    $modalelem1.append($("<label>", { "for": "password" }).append("Password"));
    $modalelem1.append($("<input>", {"name": "password", "type":"password", "class": "usr-input", "maxlength": "20", "required": true }));
    $modalfooter = $("<div>", { "class": "modal-footer" });
    $exec = $("<button>", { "class": "execute", "type": "submit", "onclick":`${formname.replace(/\s/g, '').toLowerCase()}()`}).append(formname);
    $exit = $("<button>", { "class": "exit" }).append("Cancel");

    $modalfooter.append($exec, $exit);

    if (formname == "Sign up") {
        $modalelem2 = $("<div>", { "class": "form-elem" });
        $modalelem2.append($("<label>", { "for": "r-password" }).append("Retype password"));
        $modalelem2.append($("<input>", { "name": "r-password", "type":"password", "class": "usr-input", "maxlength": "20", "required": true }));
        $modalform.append($modalelem, $modalelem1, $modalelem2, $modalfooter);
    } else {
        $modalform.append($modalelem, $modalelem1, $modalfooter);
    }

    $modalcontent.append($modalform);
    $wdw.append($modalcontent);
    $('body').append($wdw);

    $exit.click(function() {
        $("div[id$=Modal]").remove();
    });
}



function login()
{
    if(locked)
        return;
    user = $('.usr-input').eq(0).val();
    password = $('.usr-input').eq(1).val();
    if(user != '' && password != '')
    {
        locked = true;
        fetch(`/login?nm=${user}&pw=${password}`,{method: 'POST'})
        .then(res => res.json())
        .then(data => {
        if(data['code'] == 1)
        {
            locked = false;
            header_buttons(true);
            $("div[id$=Modal]").remove();
        }
        else
        {
            locked = false;
            window.alert(data['message']);
            //failed
        }
    });
    }
    else
    {
        window.alert('Fill in all fields');
    }
}

function signup()
{
    if(locked)
        return;
    user = $('.usr-input').eq(0).val();
    password = $('.usr-input').eq(1).val();
    retype_password = $('.usr-input').eq(2).val();
    if(password != retype_password)
    {
        window.alert(`Passwords doesn't match`);
        return;
    }
    if(user != '' && password != '')
    {
        locked = true;
        fetch(`/register?nm=${user}&pw=${password}`,{method: 'POST'})
        .then(res => res.json())
        .then(data => {
        if(data['code'] == 1)
        {
            locked = false;
            header_buttons(true);
            $("div[id$=Modal]").remove();
        }
        else
        {
            locked = false;
            window.alert(data['message']);
            //failed
        }
    });
    }
    else
    {
        window.alert('Fill in all fields');
    }
}
