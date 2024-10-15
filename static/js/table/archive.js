function getArchiveYears(tableBox){
	var module = tableBox.attr('data-module');
	$.get('/crm/php/main/module.php?get_archive_years=1&module=' + module, function(data){
		data = JSON.parse(data);
		if(data.length != 0){
			if(tableBox.find('.tableTop').length == 0){ tableBox.prepend('<table class="tableTop"><tr><td></td><td></td></tr></table>'); }
			var td = tableBox.find('.tableTop').first().find('td').last();
			var html = '<select class="archiveSelect tableTopSelect" onchange="selectArchiveYear($(this))">';
			html += '<option value="">' + slovar('Select') + ' ' + slovar('Archive') + '</option>';
			for(var i=0; i<data.length; i++){ html += '<option value="' + data[i] + '">' + slovar('Archive') + ' ' + data[i] + '</option>'; }
			html += '</select>';
			td.prepend(html);
		}
	}).fail(function(){console.log('ERROR: backend napaka');});
}

function selectArchiveYear(el){ tableLoadColumns(el.closest('.tableBox')); }

function open_archiveMaker(){
	hideDropdownMenu();
	GET_column({
		module:$('#main_table').attr('data-module'),
		showAll:true,
		done: function(data){
			var popup = createPOPUPbox();
			var popupBox = popup.find('.popupBox');
			var html = '<form><h2>' + slovar('Archive') + '</h2>';
	        if(data.error){ createAlert(popupBox, 'Red', data.error) }
	        else{ html += HTML_archiveMakerDateSelector(data) }
	        html += '<hr><button class="button buttonGreen">' + slovar('Create_archive') + '</button>';
			html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span></form>';
	        popupBox.append(html);

	        popupBox.find('form').on('submit', function(e){
	        	e.preventDefault();
	        	submit_archiveMaker($(this));
	        });

			popup.fadeIn('fast');
		}
	})
}

function HTML_archiveMakerDateSelector(data){
	var html = '<label>' + slovar('Column') + '</label>';
	html += '<select name="col" onchange="archiveDateSelectorChange($(this))" required>';
	html += '<option value="">' + slovar('Select') + '</option>';
	for(var i=0; i<data.length; i++){
		var d = data[i];
		if(!['DATETIME','DATE'].includes(d.type)){ continue }
		html += '<option value="' + d.column + '">' + slovar(d.name) + '</option>';
	}
	html += '</select><label>' + slovar('Year') + '</label>';
	html += '<select name="year" required></select>';
	return html;
}

function archiveDateSelectorChange(el){
	$.get('/crm/php/main/module.php?get_date_column_years=1', {
		module:$('#main_table').attr('data-module'),
		col:el.val()
	}, function(data){
        data = JSON.parse(data);
        var html = '';
        for(var i=0; i<data.length; i++){
        	var d = data[i];
        	html += '<option value="' + d.year + '">' + slovar('Year') + ' - ' + d.year + ' (' + d.count + ' ' + slovar('Entries') + ')</option>';
        }
        el.nextAll('[name=year]').html(html);
    }).fail(function(){console.log('ERROR: backend napaka')});
}

function submit_archiveMaker(form){POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_archive'), function(){
	form.parent().find('.alert').remove();
	form.hide();
	$.post('/crm/php/main/module.php?archive_module=1', {
		csrf_token:$('[name=csrf_token]').val(),
		module:$('#main_table').attr('data-module'),
		col:form.find('[name=col]').val(),
		year:form.find('[name=year]').val()
	}, function(data){
        data = JSON.parse(data);
        if(data.error){ form.show(); createAlert(form, 'Red', data.error); }
        else{ removePOPUPbox(); tableLoadColumns($('#main_table')); }
    }).fail(function(){console.log('ERROR: backend napaka')});
})}