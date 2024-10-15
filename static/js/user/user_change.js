function showUserConfig_change(box){
	$.get('/crm/php/main/module.php?get_all_users=1', function(data){
        HTML_changeUser(box, JSON.parse(data));
    })
}

function HTML_changeUser(box, data, html = ''){
	html += '<table class="table"><tr>';
	html += '<th>'+slovar('Users')+'</th><th></th></tr>';
	for(var i=0; i<data.length; i++){
		var d = data[i];
		html += '<tr><td>'+d.user_username+' <b>('+d.user_role+')</b></td><td>';
		html += '<button class="button buttonBlue" onclick="changeToUser(\''+d.user_username+'\', $(this))">'+slovar('Select')+'</button>';
		html += '</td></tr>';
	}
	html += '</table>';
	box.html(html);
}

function changeToUser(username, el){
	box = el.closest('.popupBox');
	$.post('/crm/php/auth/auth.php?change_to_user=1', { username:username }, function(data){ data = JSON.parse(data);
		if(data.error){ return createAlert(box, 'Red', data.error) }
		box.html(HTML_loader('Changeing_user'));
		setTimeout(function(){ window.location.href = '/crm' }, 2000);
	})
}