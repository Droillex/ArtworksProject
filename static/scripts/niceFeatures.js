


function typeWriter(elem ,txt, speed, underscore=true) {
  	if (txt.length>1) {
  		elem.html(elem.text()+txt.charAt(0));
    	setTimeout(typeWriter, speed, elem, txt.substr(1), speed);
  	}
  	else
  	{
  		if(underscore)
  			elem.parent().children().eq(1).html('_');
  		elem.html(elem.text()+txt.charAt(0));
  	}

}


function addmodal(typ, head_text, body_text, exec_func, params={}, add_to ,inp_value="")
{
    let $wdw = $("<div>", {"id":"renameModal", "class": "modal"});
    $modalcontent = $("<div>", {"class": "modal-content"});
    $modalcontent.append($("<div>", {"class":"modal-header"}).append(head_text));
    $modalbody = $("<div>", {"class":"modal-body"});
    if(typ == "input")
    {
        $modalbody.append($("<label>", {"for":"inp"}).append(`>${body_text}`));
        $inp = $("<input>", {"autocomplete":"off", "type":"text", "value":"", "id":"inp", "maxlength":"30"});
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
    add_to.append($wdw);
    if(typ == "input")
    {
    $inp.focus();
    $inp.val(inp_value);
    }
}
