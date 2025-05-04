function get_notifications_COUNT(){
    let counter = $('#TopNavBell span'), parent = counter.parent();
    parent.removeClass('shake');
    $.getJSON('/crm/php/notifications/notifications_exec?get_notifications_COUNT=1', data => {
        let count = data[0];
        counter.text(count).toggle(count != '0');
        if(count != '0') {
            parent.addClass('shake');
            if(!$('#DropdownMenu').is(':visible')) run_pushNotification();
        }
        setTimeout(get_notifications_COUNT, 10000);
    });
}

function get_notifications(el, callback) {
	let num = el?.data?.('num') || 1;
	$.getJSON('/crm/php/notifications/notifications_exec', { get_notifications: true, num }, data => {
		if (typeof callback === 'function') callback(el, data);
	});
}

function popup_notifications(el, data){
    el.find('.DropdownMenuContent').remove();
    el.append(`<div class="DropdownMenuContent popupNotif" data-num="${el.data('num')}">${display_notifications(data)}</div>`);
    showDropdownMenu(el);
    el.find('.DropdownMenuContent').remove();
}

function run_pushNotification(){
	loadJS('notifications/pushNotifications', function(){ init_pushNotification() })
}

function display_notifications(data){
	return (data.length ? data.map(get_HTML_notifications).join('') : `<p class="noNotifications">${slovar('Is_empty')}</p>`)
}

function get_HTML_notifications(note){
    let desc = note.descText;
    if (desc.length > 100) {
        desc = desc.substring(0, 100) + '... <b onclick="showMore_notifications($(this))">' + slovar('Show_more') + '</b>';
    }
    return `
    <div class="notificationBox" data-type="${note.type}" data-time="${note.time}">
        <div class="nTop">
			<h2 class="nTitle">${slovar(note.subject)}</h2>
			<span class="nTime">${getSVG('clock')} ${displayLocalDate(note.time)}</span>
        </div>
        <div class="nDesc">${desc}</div>
        <div class="nButtons">${get_notifications_buttons(note.buttons)}</div>
    </div>`;
}

function get_notifications_buttons(buttons){
	if(buttons == 'NONE'){ return '' }
	if(typeof buttons === 'object' && buttons !== null){ return get_HTML_notifications_buttons(buttons) }
	return `
	<button class="buttonSquare buttonBlue" onclick="delete_notification($(this))">${slovar('Got_it')}</button>
	`;
}

function get_HTML_notifications_buttons(buttons) {
	let html = '';
	for (const key in buttons){
		if(!buttons.hasOwnProperty(key)) continue;
		let { color, onclick, delete: del } = buttons[key];
		if(del !== false){ onclick = `delete_notification($(this), ()=>{ ${onclick} })` }

		html += `
		<button
			class="buttonSquare button${color ?? 'Blue'}"
			onclick="${onclick ?? ''}"
		>
			${slovar(key)}
		</button>
		`;
	}
	return html;
}

function showMore_notifications(button){
	hideDropdownMenu();
	note = button.closest('.notificationBox')
	$.getJSON('/crm/php/notifications/notifications_exec', {
		get_notifications: true,
		type: note.attr('data-type'),
		time: note.attr('data-time')
	}, function(data){
		if(data.error){ return createAlert(note, 'Red', data.error) }
		var popup = createPOPUPbox();
		var popupBox = popup.find('.popupBox');
		popupBox.html(`
			<pre style="text-align:left;">${data[0].desc}</pre>
			<hr>
			<button class="button buttonGrey" onclick="removePOPUPbox()">${slovar('Close')}</button>
		`);
		popup.fadeIn('fast');
	})
}

function delete_notification(el, callback){
	var note = el.closest('.notificationBox');

	$.getJSON('/crm/php/notifications/notifications_exec', {
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
	var allNotes = $(`.notificationBox[data-type="${note.attr('data-type')}"][data-time="${note.attr('data-time')}"]`);
	var DropdownMenu = $('#DropdownMenu');

	if(bell_num > 0){ bell.find('span').first().text(bell_num - 1) }

	allNotes.each(function(){
		let thisNote = $(this);
		thisNote.fadeOut('fast', function(){
			let noteBox = thisNote.parent();
			get_notifications(noteBox, function(el, data){ noteBox.html(display_notifications(data)) })
			// thisNote.remove();
			// if(DropdownMenu.find('.notificationBox').length == 0){}
			if(typeof callback === 'function'){ callback() }
		});
	})
}

$(document).ready(function(){ get_notifications_COUNT() });