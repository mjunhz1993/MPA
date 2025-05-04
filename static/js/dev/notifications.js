function checkEnvironment(){
	var html = '';

	html += '<div class="box col80">';
	html += '<table class="tableTop"><tr><td>';
	html += '<button class="button buttonGreen" onclick="addNewNotification()">' + slovar('Add_new') + '</button>';
	html += '</td><td>';
	html += '</td></tr></table>';
	html += '<table class="table"><thead><tr>';
	html += '<th></th>';
	html += '<th>' + slovar('Time') + '</th>';
	html += '<th>' + slovar('Users') + '</th>';
	html += '<th>' + slovar('Type') + '</th>';
	html += '<th>' + slovar('Message') + '</th>';
	html += '</thead><tbody></tbody></table>';
	html += '</div>';
	$('#Main').append(html);
	loadAllNotifications();
}

function loadAllNotifications(){
	$.getJSON('/crm/php/admin/notifications.php?get_notifications=1', function(data){
        displayAllNotifications(data, $('#Main .table tbody'));
    })
}

function displayAllNotifications(data, tbody){
	if (!data) return;
	tbody.html(data.map(d => `
	<tr>
		<td><button class="button buttonRed" onclick="deleteThisNotification($(this), ${d.user}, '${d.time}')">${slovar('Delete')}</button></td>
		<td>${displayLocalDate(d.time)}</td>
		<td>${d.username}</td>
		<td>${d.type}</td>
		<td>
			<b>${slovar(d.title)}</b><hr>
			<button class="button buttonBlue" onclick="showDesc(${d.user}, '${d.time}')">Description</button>
			<button class="button buttonBlue" onclick="showButtons(${d.user}, '${d.time}')">Buttons</button>
		</td>
	</tr>`).join(''));
}

function showDesc(user, time){
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	var html = '';
	$.getJSON('/crm/php/admin/notifications.php?show_nData=1', {user:user, time:time}, function(data){
		html = '<pre style="text-align:left;">' + data.desc + '</pre><hr><button class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</button>';
		popupBox.html(html);
		popup.fadeIn('fast');
	})
}
function showButtons(user, time){
	$.getJSON('/crm/php/admin/notifications.php?show_nData=1', {user:user, time:time}, function(data){
		console.log(data.buttons)
	})
}

function addNewNotification(){
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	var html = '';

	GET_users({done:function(data){
        html += '<h2>' + slovar('Add_notification') + '</h2><form>';
		html += '<label for="nTitle">' + slovar('Title') + '</label>';
		html += '<input type="text" name="title" id="nTitle" required>';
		html += '<label>' + slovar('Description') + '</label>';
		html += '<textarea name="desc"></textarea><br>';
		html += '<input type="checkbox" id="noButton" name="noButton">';
		html += '<label for="noButton">No buttons</label>'
		html += '<label>' + slovar('Send_to') + '</label>';
		html += '<span class="button buttonBlue" onclick="toggleAssigns()">'+slovar('Toggle_all')+'</span>';
		html += '<br><div style="display:flex;flex-wrap:wrap;gap:5px;">';
		for(var i=0; i<data.length; i++){
			html += checkboxInput({
				id:'nUser'+data[i].user_id,
				name:'user[]',
				value:data[i].user_id,
				checked:true,
				label:data[i].user_username
			})
		}
		html += '</div><hr><button class="button buttonGreen">' + slovar('Add_new') + '</button>';
		html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span>';
		html += '</form>';

		popupBox.html(html);
		var form = popupBox.find('form');

		form.on('submit', function(e){
			e.preventDefault();
			addNewNotificationEvent(form);
		});

		popup.fadeIn('fast', function(){
			loadJS('form/cleditor', function(){ checkForTextAreaInputs(form) })
		});
    }})
}

function toggleAssigns(){
    $('.popup input[name="user[]"]').each(function(){
        $(this).prop('checked', !$(this).prop('checked'));
    });
}

function addNewNotificationEvent(form){
	form.find('.alert').remove();
	$.post('/crm/php/admin/notifications.php?add_notification=1', form.serialize(), function(data){
        data = JSON.parse(data);
        if(data.error){ createAlert(form, 'Red', data.error); }
    	else{ removePOPUPbox(); loadAllNotifications(); }
    })
}

function deleteThisNotification(el, user, time){
	POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
		el.closest('.box').find('.alert').remove();
		$.getJSON('/crm/php/admin/notifications.php?delete_notification=1', {user:user, time:time}, function(data){
	        if(data.error){ createAlert(el.closest('.box'), 'Red', data.error); }
        	else{ loadAllNotifications(); }
	    })
	});
}

$(document).ready(function(){ checkEnvironment() });