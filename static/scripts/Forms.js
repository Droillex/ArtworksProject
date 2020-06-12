function modalwindow(formname) {
    let $wdw = $("<div>", { "id": "loginModal", "class": "modal" });
    $modalcontent = $("<div>", { "class": "modal-content" });
    $modalcontent.append($("<div>", { "class": "modal-header" }).append(formname));
    $modalform = $("<form>", { "action": "", "method": "POST" });

    $modalelem = $("<div>", { "class": "form-elem" });
    $modalelem.append($("<label>", { "for": "username" }).append("Username"));
    $modalelem.append($("<input>", { "name": "username", "class": "usr-input", "maxlength": "30", "required": true }));

    $modalelem1 = $("<div>", { "class": "form-elem" });
    $modalelem1.append($("<label>", { "for": "password" }).append("Password"));
    $modalelem1.append($("<input>", { "name": "password", "class": "usr-input", "maxlength": "20", "required": true }));

    $modalfooter = $("<div>", { "class": "modal-footer" });
    $exec = $("<button>", { "class": "execute", "type": "submit" }).append(formname);
    $exit = $("<button>", { "class": "exit" }).append("Cancel");

    $modalfooter.append($exec, $exit);

    if (formname == "Sign up") {
        $modalelem2 = $("<div>", { "class": "form-elem" });
        $modalelem2.append($("<label>", { "for": "r-password" }).append("Retype password"));
        $modalelem2.append($("<input>", { "name": "r-password", "class": "usr-input", "maxlength": "20", "required": true }));
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
$("#login").click(function() {
    modalwindow("Login")
})
$("#signup").click(function() {
    modalwindow("Sign up")
})
