function get_notifications_COUNT(){
    let counter = $('#TopNavBell span'), parent = counter.parent();
    parent.removeClass('shake');
    $.getJSON('/crm/php/notifications/notifications_exec.php?get_notifications_COUNT=1', data => {
        let count = data[0];
        counter.text(count).toggle(count != '0');
        if(count != '0') {
            parent.addClass('shake');
            if(!$('#DropdownMenu').is(':visible')) run_pushNotification();
        }
        setTimeout(get_notifications_COUNT, 10000);
    });
}

function run_pushNotification(){loadJS('notifications/pushNotifications', function(){
	if(check_pushNotification()){get_notifications('', function(el, data){
		for(var i=0; i<data.length; i++){ d = data[i];
			create_pushNotification({
				title:slovar(d.title),
				tag:d.title,
				body:d.desc,
				icon:'https://'+window.location.hostname+'/crm/static/img/OKTAGON-IT.jpg',
				callback:function(){
					get_notifications($('#TopNavBell'), function(el, notes){
						display_notifications(el, notes)
					})
				}
			})
		}
	})}
})}

function get_notifications(el, callback){
	$.getJSON('/crm/php/notifications/notifications_exec.php?get_notifications=1', function(data){
		if(typeof callback === 'function'){ callback(el, data) }
	})
}

function display_notifications(el, data, html = ''){
	el.find('.DropdownMenuContent').remove();
	html += '<div class="DropdownMenuContent">';
	if(data.length != 0){
		for(var i=0; i<data.length; i++){ html += get_HTML_notifications(data[i]) }
	}
	else{ html += '<p class="noNotifications">'+slovar('Empty')+'</p>' }
	html += '</div>';

	el.append(html);
	showDropdownMenu(el);
}

function get_HTML_notifications(note, html = ''){
	note.desc = note.desc.substring(0, 50)+'... ';
	note.desc += '<b onclick="showMore_notifications($(this))">' + slovar('Show_more') + '</b>';
	html += '<div class="notificationBox" data-type="' + note.type + '" data-time="' + note.time + '">';
	html += '<h2 class="nTitle">' + slovar(note.title) + '</h2>';
	html += '<span class="nTime">' + getDate(defaultDateFormat + ' ' + defaultTimeFormat, stringToDate(note.time, 'UTC')) + '</span>';
	html += '<div class="nDesc">' + note.desc + '</div><hr>';
	html += '<div>'+get_notifications_buttons(note.list)+'</div>';
	html += '</div>';
	return html
}

function get_notifications_buttons(list, html = ''){
	if(list[0] == 'LOOK'){ return '<button class="button buttonBlue" data-value="'+list[1]+'" onclick="confirm_notifications($(this))">'+slovar('View')+'</button>' }
	if(list[0] == 'JSbutton'){ return '<button class="button buttonBlue" onclick="'+list[2]+'">'+slovar(list[1])+'</button>' }
	return '<button class="button buttonBlue" onclick="confirm_notifications($(this))">'+slovar('Got_it')+'</button>'
}

function showMore_notifications(button, html = ''){
	hideDropdownMenu();
	note = button.closest('.notificationBox')
	$.getJSON('/crm/php/notifications/notifications_exec.php?get_notifications=1', {
		type: note.attr('data-type'),
		time: note.attr('data-time')
	}, function(data){
		if(data.error){ return createAlert(note, 'Red', data.error) }
		var popup = createPOPUPbox();
		var popupBox = popup.find('.popupBox');
		var note = button.closest('.notificationBox');
		html = '<pre style="text-align:left;">' + data[0].desc + '</pre><hr><button class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</button>';
		popupBox.html(html);
		popup.fadeIn('fast');
	})
}

function confirm_notifications(button){
	var note = button.closest('.notificationBox');
	var value = button.attr('data-value');
	var type = note.attr('data-type');
	$.getJSON('/crm/php/notifications/notifications_exec.php', {
		confirm_notifications: true,
		type: type,
		time: note.attr('data-time'),
		value: value,
	}, function(data){
		if(data.error){ return createAlert(note, 'Red', data.error) }
		hide_notification(note, function(){
			if(!valEmpty(value) && value.substring(0,8) == 'https://'){ return window.open(value, '_blank') }
			if(type == 'CHAT'){ return open_chat_notification(value) }
			if(!valEmpty(type) && !valEmpty(value)){ return window.location.href = '/crm/templates/modules/main/main.php?module='+type+'#'+value+'-READ' }
		})
	})
}

function open_chat_notification(id){loadJS('chat/chat', function(){chat(function(){chat_box(id)})})}

function delete_notification(el, callback){
	var note = el.closest('.notificationBox');
	$.getJSON('/crm/php/notifications/notifications_exec.php', {
		delete_notification: true,
		time: note.attr('data-time'),
	}, function(data){
		if(data.error){ return createAlert(note, 'Red', data.error) }
		hide_notification(note);
		if(typeof callback === 'function'){ callback() }
	})
}

function hide_notification(note, callback){
	var bell = $('#TopNavBell');
	var bell_num = parseInt(bell.find('span').first().text());
	var DropdownMenu = $('#DropdownMenu');
	note.fadeOut('fast', function(){
		note.remove();
		if(bell_num > 0){ bell.find('span').first().text(bell_num - 1) }
		if(DropdownMenu.find('.notificationBox').length == 0){get_notifications(bell, function(el, data){ display_notifications(el, data) })}
		if(typeof callback === 'function'){ callback() }
	});
}

$(document).ready(function(){ get_notifications_COUNT() });