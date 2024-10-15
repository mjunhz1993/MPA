function showUserConfig_extra(box, html = ''){loadJS('notifications/pushNotifications', function(){
	html += '<div style="display:flex;align-items:center;gap:10px;">';
	html += '<button class="buttonSquare buttonBlue" onclick="PWA_button()">'+slovar('Download_app')+'</button>';
	html += '<p>'+slovar('PWA_text')+'</p>';
	html += '</div><hr>';
	html += '<div style="display:flex;align-items:center;gap:10px;">';
	html += '<button class="buttonSquare buttonBlue buttonPN" onclick="grant_permission_pushN($(this))">PushNotifications</button>';
	html += '<p>'+slovar('PN_text')+'</p>';
	html += '</div>';
	box.html(html);
	if(check_pushNotification()){ active_nb(box.find('.buttonPN')) }
})}

function grant_permission_pushN(el){
	request_pushNotification({
		onError:function(){ createAlertPOPUP(slovar('Access_denied')) },
		onGranted:function(){ active_nb(el) }
	})
}

function active_nb(el){ el.prop('disabled',true).addClass('buttonGreen').removeClass('buttonBlue').prepend(getSVG('check')+' ') }


function PWA_button(){
	PWA.prompt();
	PWA.userChoice.then((choiceResult) => {
		if(choiceResult.outcome === 'accepted'){ }
		else{ createAlertPOPUP(slovar('Access_denied')) }
		PWA = null;
	});
}