


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
