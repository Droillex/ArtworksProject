 
let login_res;

 fetch('/api/log_check',{method: 'POST'})
         .then(res => res.json())
         .then(data => {
         	login_res = data;
            if(data['res'] != '0')
            {
            	console.log('logged in');
            	nms = ['fas fa-images|/albums','fas fa-cog|#','fas fa-door-open|/logout']
            	for (i = 0; i < 3; i++) 
    			{
    				$btn = $("<a>", {"href":nms[i].split('|')[1]});
    				$btn.append($("<div>", {"class":"header_item headerButton"}).append($("<i>", {"class":nms[i].split('|')[0]})));
    				console.log($btn)
    				$('.header_section').eq(1).append($btn);
    			}
            	
            }
            else
            {
            	console.log('not logged in');
            	nms = ['pics/login.png|login','pics/signup.png|signup']
            	for (i = 0; i < 2; i++) 
    			{
    				$btn = $("<div>", {"class":"header_item headerButton", "id":nms[i].split('|')[1]}).append($("<img>", {"src":nms[i].split('|')[0], 'class': 'icon'}));
    				$('.header_section').eq(1).append($btn);
    			}
            }
         });