function config_homepage(){
	$('#Main').append(HTML_h1_table('Dashboard')+'<div id="homeTop"></div>');
	var box = $('#homeTop');
	GET_module({
		module:'dashboard',
		done:function(dashboard){
			if(!dashboard.can_view.includes(user_role_id)){ $('#Main').empty(); return }
			homepage_getUser(dashboard, box)
		}
	})
}

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

function homepage_getNotification(dashboard, box = $('#lastnotification .lastnotification')){
	get_notifications(box, function(el, note){
		homepage_getEvent(dashboard);
		box.html(display_notifications(note));
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
			if (!event.length) return box.append(slovar('Is_empty'));

			let e = event[0],
				from = stringToDate(getCurrentDate('UTC'), 'UTC') > stringToDate(e.start_date, 'UTC') 
					? `<b style="color:#2d70b6">${slovar('Is_happening')}</b>` 
					: `${slovar('From')}: ${displayLocalDate(e.start_date)}`;

			box.append(`
				<div class="notificationBox">
					<div class="eventColorStatus" style="background-color:${e.color}"></div>
					<b>${e.subject}</b>
					<div class="nDesc">
						${from} - ${slovar('To')}: ${displayLocalDate(e.end_date)}
					</div>
					<a class="buttonSquare button100 buttonBlue"
						onclick="loadJS('main/read-box-mini', el => open_readBoxMini(el, 'row', 'event', ${e.id}), $(this))">
						${slovar('View')}
					</a>
				</div>
			`);
		}
	})
})}

function homepage_getConversation(dashboard, box = $('#lastconversation')){
	loadJS('GET/chat', function(){
		GET_conversation({
			limit:1,
			done:function(con){
				loadJS('home/widgets',()=>loadWidgets(dashboard));
				if(con.error){ return createAlert(box, 'Red', slovar(con.error)) }
				if(con.length == 0){
					return box.append(`
					<button class="buttonSquare button100 buttonGreen"
					onclick="loadJS(\'chat/conversation_create\', ()=>openAddConversation())">${slovar('Add_new')}</button>
					`)
				}
				con = con[0];
				let lastMessage = con.lastMessage;
			    if(lastMessage.length > 100){ lastMessage = lastMessage.substring(0, 100) + '...' }
				return box.append(`
				<div class="notificationBox">
					<div class="nTop">
						<h2 class="nTitle">${con.subject}</h2>
						<span class="nTime">${getSVG('clock')} ${displayLocalDate(con.time)}</span>
					</div>
					<div class="nDesc">${lastMessage}</div>
					<button 
						class="buttonSquare button100 buttonBlue"
						onclick="loadJS(\'chat/chat\', ()=>chat(()=>chat_box(${con.id})))"
					>${slovar('View')}</button>
				</div>
				`)
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
	return '<div class="homeUserImgBox"><div class="homeUserImg" style="background-image:url('+APP.uploadDir+'/user/' + u.user_avatar + ')"></div></div>'
}

function HTML_UserTopright(){
	return `
	<div class="homeUserRight">
		<div class="homeUserBubbleBox">
			<div class="homeUserBubble" id="lastnotification">
				<h3>${getSVG('bell')} ${slovar('Latest_notification')}</h3>
				<div class="lastnotification"></div>
			</div>
			<div class="homeUserBubble" id="upcomingevent">
				<h3>${getSVG('calendar')} ${slovar('Upcoming_event')}</h3>
			</div>
			<div class="homeUserBubble" id="lastconversation">
				<h3>${getSVG('chat')} ${slovar('Last_conversation')}</h3>
			</div>
		</div>
	</div>
	`
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