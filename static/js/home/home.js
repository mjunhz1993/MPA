function config_homepage(){loadJS('GET/module', function(){
	$('#Main').append(HTML_h1_table('Dashboard')+'<div id="homeTop"></div>');
	var box = $('#homeTop');
	GET_module({
		module:'dashboard',
		done:function(dashboard){
			if(!dashboard.can_view.includes(user_role_id)){ $('#Main').empty(); return }
			homepage_getUser(dashboard, box)
		}
	})
})}

function homepage_getUser(dashboard, box, html = ''){
	GET_myself({
		done:function(u){
			box.css('border-bottom', '2px solid ' + u.user_color);
			html += '<div class="homeUserBox">';
			html += HTML_UserTopLeft(dashboard, u);
			html += HTML_UserTopright();
			html += '</div>';
			box.html(html);
			homepage_getNotepad(dashboard, box);
		}
	})
}

function homepage_getNotepad(dashboard, box){
	$.get('/crm/php/home/notepad.php?get_notepad=1', function(data){
        box.find('.homeNotePad textarea').val(data);
        homepage_getNotification(dashboard);
    })
}

function homepage_getNotification(dashboard, box = $('#lastnotification')){
	get_notifications('', function(el, note){
		homepage_getEvent(dashboard);
		if(note.length == 0){ return box.append(slovar('Is_empty')) }
		box.append(get_HTML_notifications(note[0]));
		box.find('h2').replaceWith('<div><b>' + box.find('h2').text() + '</b></div>');
		// box.find('button,hr').remove();
	})
}

function homepage_getEvent(dashboard, box = $('#upcomingevent'), html = ''){loadJS('GET/calendar', function(){
	GET_event({
		module:'event',
		startCol:'event_start_date',
		endCol:'event_end_date',
		assignedCol:'event_assigned',
		shareCol:'event_share',
		colorCol:'event_color',
		limit:1,
		done:function(event){
			homepage_getConversation(dashboard);
			if(event.length == 0){ return box.append(slovar('Is_empty')) }
			event = event[0];
			var currentDate = stringToDate(getCurrentDate('UTC'),'UTC');
			var startDate = stringToDate(event.start_date, 'UTC');
			if(currentDate.getTime() > startDate.getTime()){ startDate = '<b style="color:#2d70b6">'+slovar('Is_happening')+'</b>' }
			else{ startDate = getDate(defaultDateFormat + ' ' + defaultTimeFormat, startDate) }
			html += '<div class="notificationBox">';
			html += '<div class="eventColorStatus" style="background-color:'+event.color+'"></div><b>'+event.subject+'</b><div class="nTime">';
			html += slovar('From')+': '+startDate+'<br>';
			html += slovar('To')+': '+getDate(defaultDateFormat+' '+defaultTimeFormat, stringToDate(event.end_date, 'UTC'));
			html += '</div><a class="buttonSquare button100 buttonBlue" ';
			html += 'onclick="loadJS(\'main/read-box-mini\', function(el){open_readBoxMini(el,\'row\',\'event\','+event.id+')}, $(this))">';
			html += slovar('View') + '</a></div>';
			box.append(html);
		}
	})
})}

function homepage_getConversation(dashboard, box = $('#lastconversation'), html = ''){
	loadJS('GET/chat', function(){
		GET_conversation({
			limit:1,
			done:function(con){
				loadJS('home/widgets', function(){ loadWidgets(dashboard) })
				if(con.error){ return createAlert(box, 'Red', con.error) }
				if(con.length == 0){
					html += '<button class="buttonSquare button100 buttonGreen" ';
					html += 'onclick="loadJS(\'chat/conversation_create\', function(){openAddConversation()})">'+slovar('Add_new')+'</button>';
					return box.append(html)
				}
				con = con[0];
				html += '<div class="notificationBox"><b>' + con.subject + '</b>';
				html += '<span class="nTime">'+getDate(defaultDateFormat+' '+defaultTimeFormat, stringToDate(con.time, 'UTC'))+'</span>';
				html += '<button class="buttonSquare button100 buttonBlue" ';
				html += 'onclick="loadJS(\'chat/chat\', function(){chat(function(){chat_box('+con.id+')})})">'+slovar('View')+'</button>';
				html += '</div>';
				return box.append(html)
			}
		})
	})
}

function HTML_UserTopLeft(dashboard, u, html = ''){
	html += HTML_UserAvatar(u);
	html += '<div class="homeUserLeft">';
	html += '<div class="homeUserInfo">';
	if(dashboard.can_edit.includes(user_role_id)){
		html += '<div class="homeNotePad"><h3>' + getSVG('edit')  + slovar('Notepad') + '</h3>';
		html += '<div>';
		html += '<textarea placeholder="' + slovar('Type_your_notes_here') + '" onkeyup="showSaveNotes($(this))"></textarea>';
		html += '<button class="buttonSquare button100 buttonGreen" style="display:none" onclick="saveNotes($(this))">' + slovar('Save_changes') + '</button>';
		html += '</div></div>';
	}
	html += '</div></div>';
	return html
}

function HTML_UserAvatar(u){
	if(valEmpty(u.user_avatar)){ return '' }
	return '<div class="homeUserImgBox"><div class="homeUserImg" style="background-image:url(/crm/static/uploads/user/' + u.user_avatar + ')"></div></div>'
}

function HTML_UserTopright(html = ''){
	html += '<div class="homeUserRight">';
	html += '<div class="homeUserBubbleBox">';

	html += '<div class="homeUserBubble" id="lastnotification">';
	html += '<h3>' + getSVG('bell') + slovar('Latest_notification') + '</h3>';
	html += '</div>';
	html += '<div class="homeUserBubble" id="upcomingevent">';
	html += '<h3>' + getSVG('calendar') + slovar('Upcoming_event') + '</h3>';
	html += '</div>';
	html += '<div class="homeUserBubble" id="lastconversation">';
	html += '<h3>' + getSVG('chat') + slovar('Last_conversation') + '</h3>';
	html += '</div>';

	html += '</div>';
	html += '</div>';
	return html
}

function showSaveNotes(el){ el.next().show() }
function saveNotes(el){
	$.post('/crm/php/home/notepad.php?write_notepad=1', {
		csrf_token:$('[name=csrf_token]').val(),
		notepad:el.prev().val()
	}, function(data){ el.hide() })
}

loadCSS('home');
$(document).ready(function(){loadJS('home/slovar/' + slovar(), function(){ config_homepage() })});