function openEditCalendar(module, html = ''){
	hideDropdownMenu();
	popup = createPOPUPbox();
	popupBox = popup.find('.popupBox');

	html += '<form>';
	html += '<input type="hidden" name="module" value="'+module+'">';

	html += '<div class="col col40">';
	html += '<label>'+slovar('Subject_custom')+'</label>';
	html += '<input type="text" name="subject_custom">';
	html += '</div><div class="col col30">';
	html += '<label>'+slovar('LEFT_JOIN')+'</label>';
	html += '<input type="text" name="LEFT_JOIN">';
	html += '</div><div class="col col30">';
	html += '<label>'+slovar('LEFT_JOIN_COL')+'</label>';
	html += '<input type="text" name="LEFT_JOIN_COL">';
	html += '</div>';

	html += '<label>'+slovar('startCol')+'</label>';
	html += '<select name="startCol"><option></option></select>';
	html += '<label>'+slovar('endCol')+'</label>';
	html += '<select name="endCol"><option></option></select>';
	html += '<label>'+slovar('assignedCol')+'</label>';
	html += '<select name="assignedCol"><option></option></select>';
	html += '<label>'+slovar('shareCol')+'</label>';
	html += '<select name="shareCol"><option></option></select>';
	html += '<label>'+slovar('colorCol')+'</label>';
	html += '<select name="colorCol"><option></option></select>';

	html += '<button class="button buttonBlue">'+slovar('Save_changes')+'</button>';
	html += '<span class="button buttonGrey" onclick="removePOPUPbox()">'+slovar('Cancel')+'</span>';
	html += '</form>';
	popupBox.html(html);

	GET_column({
		module:module,
		showAll:true,
		each:function(c){ appendColumnToCalendarForm(popup, c) },
		done:function(){ checkPreSelectedValuesForCalendar(popup, module) }
	})

	popup.find('form').on('submit', function(e){
		e.preventDefault();
		updateEditCalendar(popup);
	})

	popup.fadeIn('fast');
}

function appendColumnToCalendarForm(popup, c){
	html = '<option value="'+c.column+'">'+slovar(c.name)+'</option>';
	if(c.type == 'DATETIME'){ popup.find('[name=startCol],[name=endCol]').append(html) }
	if(c.type == 'JOIN_ADD' && c.list.includes(',user_id|')){ popup.find('[name=assignedCol]').append(html) }
	if(c.type == 'VARCHAR' && c.list == 'MULTISELECT'){ popup.find('[name=shareCol]').append(html) }
	if(c.type == 'VARCHAR' && c.list == 'COLOR'){ popup.find('[name=colorCol]').append(html) }
}

function checkPreSelectedValuesForCalendar(popup, module){
	$.get('/crm/php/calendar/presets.php', {
		get_presets:true,
		module:module
	}, function(data){ data = JSON.parse(data);
		if(!data){ return }
		data = data.data;
		popup.find('[name=subject_custom]').val(data.subject_custom)
		popup.find('[name=LEFT_JOIN]').val(data.LEFT_JOIN)
		popup.find('[name=LEFT_JOIN_COL]').val(data.LEFT_JOIN_COL)
		popup.find('[name=startCol]').val(data.startCol)
		popup.find('[name=endCol]').val(data.endCol)
		popup.find('[name=assignedCol]').val(data.assignedCol)
		popup.find('[name=shareCol]').val(data.shareCol)
		popup.find('[name=colorCol]').val(data.colorCol)
	})
}

function updateEditCalendar(popup){
	$.post('/crm/php/calendar/presets.php?update_presets=1', popup.find('form').serialize(), function(data){
		data = JSON.parse(data);
		if(data.error){ return createAlertPOPUP(data.error) }
		removePOPUPbox();
	})
}