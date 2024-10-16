function getCustomFiles(table, callback){
	var ProjectExt = '';
	if($('#FileTableExtFilter').length == 1){ ProjectExt = $('#FileTableExtFilter').val() }
	var ProjectFilter = '';
	if($('#FileTableProjectFilter').length == 1){ ProjectFilter = $('#FileTableProjectFilter').val() }
	$.post('/crm/php/admin/custom_files.php?get_custom_files=1', {
		csrf_token:$('input[name=csrf_token]').val(),
		ProjectExt: ProjectExt,
		ProjectFilter: ProjectFilter
	}, function(data){
		data = JSON.parse(data);
		var nextProject = '';
		var html = '';
		for(var i=0; i<data.length; i++){
			var d = data[i];
			if(nextProject == ''){ nextProject = d.project }
			if(nextProject != d.project){
				nextProject = d.project;
				html += '<tr><td colspan="4"></td></tr>';
			}
			var ext = d.path.split('.').pop();
			d.path = '/crm/'+d.path.split('/crm/')[1];
			html += '<tr>';
			html += '<td style="color:white;font-weight:600;text-align:center;font-size:20px;background-color:';
			if(ext == 'js'){ html += 'blue' }
			else if(ext == 'css'){ html += 'green' }
			else{ html += 'orange' }
			html += '">' + ext.toUpperCase() + '</td>';
			html += '<td>';
			html += '<b>' + d.name + '</b><br>';
			html += '<input style="border:0;outline:0;background-color:inherit;width:100%;box-sizing: border-box;"';
			html += 'value="' + d.path + '" readonly>';
			html += '</td>';
			html += '<td>' + d.project + '</td>';
			html += '<td>' + getDate(defaultDateFormat + ' ' + defaultTimeFormat, stringToDate(d.tstamp, 'UTC')) + '</td>';
			html += '<td>';
			html += '<button class="buttonSquare buttonBlue" data-name="' + d.name + '" onclick="editCustomFile($(this))">' + slovar('Edit') + '</button>';
			html += '<button class="buttonSquare buttonRed" data-name="' + d.name + '" onclick="deleteCustomFile($(this))">' + slovar('Delete') + '</button>';
			html += '</tr>';
		}
		table.find('tbody').html(html);
		if(typeof callback === 'function'){ callback() }
	}).fail(function(data){ console.log('ERROR: backend-error'); });
}

function openCreateCustomFile(){
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	var html = '<form><textarea name="file_data" style="display:none"></textarea>';
	html += '<h2>' + slovar('Add_new') + '</h2>';
	html += '<label>' + slovar('Name') + '</label>';
	html += '<input type="text" name="file_name" onkeyup="fileNameFriendly($(this))" required>';
	html += '<label>' + slovar('Project') + '</label>';
	html += '<input type="text" name="file_project" required>';
	html += '<label>' + slovar('Type') + '</label>';
	html += '<select name="file_ext" onchange="toggleAddTamplate()">';
	html += '<option value="php">PHP</option>';
	html += '<option value="js">JavaScript</option>';
	html += '<option value="css">CSS</option>';
	html += '</select>';
	html += '<input type="checkbox" onClick="toggleAddTamplate()" id="newfileTemplate">';
	html += '<label for="newfileTemplate">' + slovar('Add_template') + '</label>';
	html += '<hr><button class="button buttonGreen">' + slovar('Save_changes') + '</button>';
	html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span>';
	html += '</form>';
	popupBox.html(html);

	popupBox.find('form').on('submit', function(e){
		e.preventDefault();
		$.post('/crm/php/admin/custom_files.php?create_custom_file=1', {
			csrf_token:$('input[name=csrf_token]').val(),
			file_name: popup.find('[name=file_name]').val(),
			file_project: popup.find('[name=file_project]').val(),
			file_ext: popup.find('[name=file_ext]').val(),
			file_data: popup.find('[name=file_data]').val()
		}, function(data){
	        data = JSON.parse(data);
	        if(data.error){ createAlert(popupBox, 'Red', data.error); }
	        else{ getCustomFiles($('#FileTable')); removePOPUPbox(); }
	    }).fail(function(data){ console.log('ERROR: backend-error'); });
	})
	
	popup.fadeIn('fast');
}

function fileNameFriendly(el){ el.val(el.val().replace(/\s+/g, '_').toLowerCase()) }

function toggleAddTamplate(){
	var form = $('.popup').last().find('form');
	var cb = form.find('#newfileTemplate');
	var ext = form.find('[name=file_ext]').val();
	var name = form.find('[name=file_name]').val();
	var textarea = form.find('textarea');
	var data = '';
	if(cb.is(':checked')){
		if(ext == 'php'){
			data += "<?php\n";
			data += "include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');\n";
			data += "include(loadPHP('file/path'));\n\n";
			data += "function "+name+"(){\n\n}\n\n";
			data += "if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){\n";
			data += "\tif(isset($_POST['"+name+"'])){ echo json_encode("+name+"()); }\n";
			data += "}\n";
			data += "?>";
		}
		else if(ext == 'js'){
			data += "function "+name+"(){\n";
			data += "\tloadCSS('"+window.location.origin+"/crm/php/downloads/CustomCSS.css');\n";
			data += "}\n\n$(document).ready(function(){ "+name+"() });";
		}
	}
	textarea.val(data);
}

function editCustomFile(el){
	$.post('/crm/php/admin/custom_files.php?get_custom_file=1', {
		csrf_token:$('input[name=csrf_token]').val(),
		file_name: el.attr('data-name'),
	}, function(data){
		data = JSON.parse(data);
		var popup = createPOPUPbox();
		var popupBox = popup.find('.popupBox');
		var html = '<form>';
		html += '<input type="hidden" name="csrf_token" value="' + $('input[name=csrf_token]').val() + '">';
		html += '<input type="hidden" name="update" value="1">';
		html += '<input type="hidden" name="file_name" value="' + el.attr('data-name') + '">';
		html += '<h2>' + slovar('Update') + '</h2>';
		html += '<label>' + slovar('Project') + '</label>';
		html += '<input type="text" name="file_project" value="' + data[1] + '" required>';
		html += '<label>' + slovar('Data') + '</label>';
		html += '<div onclick="loadJS(\'form/codeEditor\', function(el){ openCodeEditor(el, \'' + data[0].split('.').pop() + '\') }, $(this))">';
		html += '<pre><code></code></pre><textarea style="display:none" name="file_data">' + data[2] + '</textarea>';
		html += '</div><hr>';
		html += '<button class="button buttonGreen">' + slovar('Save_changes') + '</button>';
		html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span>';
		html += '</form>';
		popupBox.html(html);
		popupBox.find('code').text(data[2]);

		popupBox.find('form').on('submit', function(e){
			e.preventDefault();
			$.post('/crm/php/admin/custom_files.php?create_custom_file=1', $(this).serialize(), function(data){
		        data = JSON.parse(data);
		        if(data.error){ createAlert(popupBox, 'Red', data.error); }
		        else{ getCustomFiles($('#FileTable')); removePOPUPbox(); }
		    }).fail(function(data){ console.log('ERROR: backend-error'); });
		});

		popup.fadeIn('fast');
	}).fail(function(data){ console.log('ERROR: backend-error'); });
}

function deleteCustomFile(el){
	POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
		var box = el.closest('.boxInner');
		var name = el.attr('data-name');
		$.post('/crm/php/admin/custom_files.php?delete_custom_file=1', {
			csrf_token:$('input[name=csrf_token]').val(),
			file_name: name
		}, function(data){
	        data = JSON.parse(data);
	        if(data.error){ createAlert(box, 'Red', data.error); }
	        else{ getCustomFiles($('#FileTable')); removePOPUPbox(); }
	    }).fail(function(data){ console.log('ERROR: backend-error'); });
	});
}

if($('#FileTableExtFilter').length == 1){
	$('#FileTableExtFilter').change(function(){ getCustomFiles($('#FileTable')) });
}
if($('#FileTableProjectFilter').length == 1){
	$('#FileTableProjectFilter').keyup(function(e){if(e.which == '13'){ getCustomFiles($('#FileTable')) }});
}