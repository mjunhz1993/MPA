function config_cronjob_app(){
	$('#Main').append('<div class="box col80 cronjobBox"></div>');
	var box = $('.cronjobBox');
	var html = '';
	html += '<table class="tableTop"><tr>';
	html += '<td><button class="button buttonGreen" onclick="add_cronjob()">' + slovar('Add_new') + '</button></td>';
	html += '<td></td>';
	html += '</tr></table>';
	html += '<table class="table cronjobTable"><thead><tr><th></th>';
	html += '<th>' + slovar('Name') + '</th>';
	html += '<th>' + slovar('Url') + '</th>';
	html += '<th>' + slovar('Time') + '</th>';
	html += '</thead><tbody></tbody></table>';
	box.html(html);
	$.get('/crm/php/cron_jobs/cron_jobs_config.php?test_cron_jobs_table=1', function(data){ load_cronjob_table() })
}

function load_cronjob_table(){
	$.get('/crm/php/cron_jobs/cron_jobs_config.php?get_cron_jobs=1', function(data){
        data = JSON.parse(data);
        var html = '';
        for(var i=0; i<data.length; i++){
        	var d = data[i];
        	html += '<tr>';
        	html += '<td class="toolRow">';
        	html += '<a class="linksvg" onclick="edit_cronjob(\''+d.name+'\',\''+d.extra+'\',\''+d.wait_for+'\')">'+getSVG('edit')+'</a>';
        	html += '<a class="linksvg" onclick="delete_cronjob(\''+d.name+'\')">'+getSVG('delete')+'</a>';
        	html += '</td>';
        	html += '<td>' + d.name + '<hr>';
        	if(d.extra != ''){ html += '<b>$CJvalue =</b> ' + d.extra; }
        	html += '</td>';
        	html += '<td>' + d.url + '</td>';
        	html += '<td><b>' + slovar('Next_schedule') + ':</b> ' + getDate(defaultDateFormat + ' ' + defaultTimeFormat, stringToDate(d.tstamp, 'UTC'));
        	html += '<hr><b>Interval:</b> ' + d.wait_for + 's</td>';
        	html += '</tr>';
        }
        $('.cronjobTable tbody').html(html);
    }).fail(function(){ console.log('ERROR: backend-error'); });
}

function add_cronjob(){
	$.post('/crm/php/admin/custom_files.php?get_custom_files=1', {
		csrf_token:$('input[name=csrf_token]').val(),
		ProjectExt: 'php',
		ProjectFilter: ''
	}, function(data){
		data = JSON.parse(data);
		var popup = createPOPUPbox();
		var popupBox = popup.find('.popupBox');
		popupBox.html('<h2>'+slovar('Add_new')+'</h2>'+HTML_cronjob(data));
		popup.find('form').on('submit', function(e){
			e.preventDefault();
			$.post('/crm/php/cron_jobs/cron_jobs_config.php?add_cron_job=1', {
				csrf_token:$('input[name=csrf_token]').val(),
				name: popup.find('[name=name]').val(),
				url: popup.find('[name=url]').val(),
				extra: popup.find('[name=extra]').val(),
				wait_for: popup.find('[name=wait_for]').val()
			}, function(data){
		        data = JSON.parse(data);
		        if(data.error){ createAlert(popupBox, 'Red', data.error) }
		        else{ removePOPUPbox(); load_cronjob_table(); }
		    }).fail(function(){ console.log('ERROR: backend-error'); });
		})
		popup.fadeIn('fast');
	})
}

function edit_cronjob(name, extra, wait_for){
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	popupBox.html('<h2>'+slovar('Edit_row')+'</h2>'+HTML_cronjob(data));
	popupBox.find('[name=name]').val(name).parent().hide();
	popupBox.find('[name=url]').parent().remove();
	popupBox.find('[name=extra]').val(extra);
	popupBox.find('[name=wait_for]').val(wait_for);
	popup.find('form').on('submit', function(e){
		e.preventDefault();
		$.post('/crm/php/cron_jobs/cron_jobs_config.php?update_cron_job=1', {
			csrf_token:$('input[name=csrf_token]').val(),
			name: popup.find('[name=name]').val(),
			extra: popup.find('[name=extra]').val(),
			wait_for: popup.find('[name=wait_for]').val()
		}, function(data){
	        data = JSON.parse(data);
	        if(data.error){ createAlert(popupBox, 'Red', data.error) }
	        else{ removePOPUPbox(); load_cronjob_table(); }
	    }).fail(function(){ console.log('ERROR: backend-error'); });
	})
	popup.fadeIn('fast');
}

function delete_cronjob(name){
	POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
		$.post('/crm/php/cron_jobs/cron_jobs_config.php?delete_cron_job=1', {
			csrf_token:$('input[name=csrf_token]').val(),
			name: name
		}, function(data){
	        data = JSON.parse(data);
	        if(data.error){ createAlert(popupBox, 'Red', data.error) }
	        else{ load_cronjob_table(); }
	    }).fail(function(){ console.log('ERROR: backend-error'); });
    });
}

function HTML_cronjob(data = [], html = ''){
	html += '<form>';
	html += '<div><label>' + slovar('Name') + '</label>';
	html += '<input type="text" name="name" required></div>';
	html += '<div><label>' + slovar('Module') + '</label>';
	html += '<select name="url" required>';
	for(var i=0; i<data.length; i++){
		var d = data[i];
		html += '<option value="' + d.path + '">' + d.name + '</option>';
	}
	html += '</select></div>';
	html += '<label>' + slovar('Extra') + ' ($CJvalue = 1)</label>';
	html += '<input type="text" name="extra">';
	html += '<label>' + slovar('Time') + ' (1min = 60, 1h = 3600, 1day = 86400)</label>';
	html += '<input type="number" name="wait_for" required>';
	html += '<hr><button class="button buttonGreen">' + slovar('Add_new') + '</button>';
	html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span>';
	html += '</form>';
	return html
}

config_cronjob_app();