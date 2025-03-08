function campaign_openEvents(){loadJS('calendar/extras', function(){
	hideDropdownMenu();
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	var today = new Date();
	var html = '<h2>' + slovar('Events') + '</h2>';
	html += '<div class="statsdate"><div>';
    html += '<b onclick="campaign_changeYear($(this), -1)">' + slovar('Year') + ' -</b>';
    html += '<span class="calendarYear">' + today.getFullYear() + '</span>';
    html += '<b onclick="campaign_changeYear($(this), 1)">' + slovar('Year') + ' +</b>';
    html += '</div>';
    html += '<select onchange="campaign_loadEvents()">';
    for(var i = 1; i<=12; i++){ html += '<option value="' + i + '">' + getNameOfMonth(i) + '</option>'; }
    html += '</select></div>';
	html += '<div id="eventsBox" style="max-height:300px;overflow:auto;"></div><hr>';
	html += '<button class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</button>';
	popupBox.html(html);
	popup.find('.statsdate select').val(parseInt(today.getMonth() + 1));
	campaign_loadEvents();
	popup.fadeIn('fast');
})}

function campaign_changeYear(el, num){changeYear(el, num, function(){ campaign_loadEvents() })}

function campaign_loadEvents(){
	var box = $('#eventsBox');
	if(box.length == 1){
		var year = box.parent().find('.calendarYear').text();
		var month = box.parent().find('.statsdate select').val();
		box.html(HTML_loader());
		$.getJSON('/crm/php/campaign/campaign.php?get_all_events=1', {year:year,month:month}, function(data){
			var html = '<table class="table"><thead><tr>';
			html += '<th>' + slovar('Events') + '</th>';
			html += '<th>' + slovar('Progress') + '</th>';
			html += '<th>' + slovar('Scheduled') + '</th>';
			html += '</tr></thead><tbody>';
			if(data){for(var i=0; i<data.length; i++){
				var e = data[i];
				html += '<tr><td>';
				html += '<b>' + e.name + '</b><hr>';
				html += slovar('Template') + ': ' + e.campaign_template + '<br>'
				html += slovar('Email_list') + ': ' + e.campaign_list
				html += '</td><td>';
				if(e.finished == 0){ html += slovar('Emails_ready')+': '+e.offset }
				else{ html += '<b style="color:green">'+slovar('Finished')+'</b>' }
				html += '</td><td>';
				var eventDate = stringToDate(e.start_date, 'UTC');
				var currentDate = stringToDate(getCurrentDate());
				if(eventDate.getTime() < currentDate.getTime()){ html += '<b style="color:green">'+slovar('Finished')+'</b>' }
				else{ html += getDate(defaultDateFormat + ' ' + defaultTimeFormat, eventDate) }
				html += '</td></tr>';
			}}
			html += '</tbody></table>';
			box.html(html);
			tooltips();
		})
	}
}

// CREATE EVENT

function restart_event_form(box){ remove_HTML_loader(box); box.find('form').show(); }

function campaign_createEvent(){
	hideDropdownMenu();
	var popup = createPOPUPbox();
	$.getJSON('/crm/php/campaign/campaign.php?get_all_templates=1', function(templates){
		$.getJSON('/crm/php/campaign/campaign.php?get_all_lists=1', function(data){
			campaign_displaEventForm(popup, templates, data);
		})
	})
}

function campaign_displaEventForm(popup, templates, lists){
	var popupBox = popup.find('.popupBox');
	var html = '<form>';
	html += '<label for="event_name">' + slovar('Email_title') + '</label><input type="text" id="event_name" required>';
	html += '<label for="event_tamplate">' + slovar('Template') + '</label><select id="event_tamplate" required>';
	for(var i=0; i<templates.length; i++){
		var t = templates[i];
		html += '<option value="' + t.id + '">' + t.name + '</option>';
	}
	html += '</select>';
	html += '<label for="event_list">' + slovar('Email_list') + '</label><select id="event_list" required>';
	for(var i=0; i<lists.length; i++){
		var l = lists[i];
		html += '<option value="' + l.id + '">' + l.name + '</option>';
	}
	html += '</select>';
	html += '<div><label for="event_date">' + slovar('Event_date') + '</label>';
	html += '<input type="text" id="event_date" class="datetimepickerinput" value="' + getCurrentDate() + '"><div>';
	html += '<div style="text-align:left;"><span style="color:red;">*</span>' + slovar('Event_date_info_1') + '<br>';
	html += '<span style="color:red;">*</span>' + slovar('Event_date_info_2') + '</div>';
	html += '<hr><button class="button buttonGreen">' + slovar('Send') + '</button>';
	html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span></form>';
	popupBox.html(html);
	var form = popupBox.find('form');

	loadJS('form/datepicker', function(){ checkForDatePickerInputs(form); });

	form.on('submit', function(e){
		e.preventDefault();
		form.hide();
		form.after(HTML_loader());

		var send_at = stringToDate(popupBox.find('#event_date').val());
		var current_date = stringToDate(getCurrentDate());

		if(send_at.getTime() <= current_date.getTime() + 3600000){
			createAlert(popupBox, 'Red', slovar('Wrong_date'));
			restart_event_form(popupBox);
			return;
		}
		if(send_at.getTime() >= current_date.getTime() + 172800000){
			createAlert(popupBox, 'Red', slovar('Wrong_date'));
			restart_event_form(popupBox);
			return;
		}

		send_at = getDate('Y-m-d H:i:s', send_at, 'UTC');
		campaign_addEvent('', send_at, popupBox);
		/*  BATCH_ID ERROR !!!
		$.post('/crm/php/campaign/campaign.php?create_batch_id=1', {
			csrf_token: $('input[name=csrf_token]').val()
		}, function(data){ data = JSON.parse(data); console.log(data);
			if(data.error){ createAlert(popupBox, 'Red', data.error); restart_event_form(popupBox); }
			else{ campaign_sendEvent(data.batch_id, 0, popupBox); }
		})
		*/
	});

	popup.fadeIn('fast', function(){ popupBox.find('#event_name').focus(); });
}

function campaign_addEvent(batch_id, send_at, popupBox){
	var subject = popupBox.find('#event_name').val();
	var template = popupBox.find('#event_tamplate').val();
	var list = popupBox.find('#event_list').val();

	$.post('/crm/php/campaign/campaign.php?add_event=1', {
		csrf_token: $('input[name=csrf_token]').val(),
		batch_id: batch_id,
		name: subject,
		campaign_template: template,
		campaign_list: list,
		start_date: send_at
	}, function(data){ data = JSON.parse(data);
		if(data.error){ createAlert(popupBox, 'Red', data.error); restart_event_form(popupBox); return; }
		removePOPUPbox()
	})
}

function campaign_sendEvent(batch_id, send_at, OFFSET, popupBox){
	var subject = popupBox.find('#event_name').val();
	var template = popupBox.find('#event_tamplate').val();
	var list = popupBox.find('#event_list').val();

	$.post('/crm/php/campaign/campaign.php?send=1', {
		csrf_token: $('input[name=csrf_token]').val(),
		batch_id: batch_id,
		subject: subject,
		template: template,
		list: list,
		OFFSET: OFFSET,
		send_at: send_at
	}, function(data){ data = JSON.parse(data);
		if(data.errors){ return createAlert(popupBox, 'Red', data.errors[0].message); restart_event_form(popupBox) }
		if(data.error){ return createAlert(popupBox, 'Red', data.error); restart_event_form(popupBox) }
		if(data.OFFSET > OFFSET){ return campaign_sendEvent(batch_id, send_at, data.OFFSET, popupBox) }
		campaign_addEvent(batch_id, subject, template, list, send_at, popupBox)
	})
}