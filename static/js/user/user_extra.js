function showUserConfig_extra(box, html = ''){loadJS('notifications/pushNotifications', function(){
	box.html(`
	<div style="display:flex;align-items:center;gap:10px;">
		<button class="buttonSquare buttonBlue" onclick="PWA_button()">${slovar('Download_app')}</button>
		<p>${slovar('PWA_text')}</p>
	</div>
	<hr>
	<div style="display:flex;align-items:center;gap:10px;">
		<button class="buttonSquare buttonBlue buttonPN" onclick="grant_permission_pushNotification($(this))">
			PushNotifications
		</button>
		<p>${slovar('PN_text')}</p>
	</div>
	`);
	if(check_pushNotification()){ active_pushNotification(box.find('.buttonPN')) }
})}

function grant_permission_pushNotification(el){
	request_pushNotification({
		onError:function(){ createAlertPOPUP(slovar('Access_denied')) },
		onGranted:function(){ active_pushNotification(el) }
	})
}

function active_pushNotification(el){
	el.prop('disabled',true).addClass('buttonGreen').removeClass('buttonBlue').prepend(getSVG('check')+' ');
}

function PWA_button(){
	$.post('/crm/php/API/android', {
		get_android_app: true
	}, function(data){
		data = JSON.parse(data);
		if(data.error){ return createAlertPOPUP(data.error) }
		POPUPconfirm(slovar('Unknown_file_title'), slovar('Unknown_file_desc'), function(){
			window.location.href = data.url
		})
	})
}

function request_pushNotification(d){
    Notification.requestPermission().then(function(permission) {
        if(d.onGranted && permission === 'granted'){ return d.onGranted() }
        if(d.onError){ return d.onError() }
    })
}