function getCustomFiles(table, callback){
	let ProjectExt = '';
	if($('#FileTableExtFilter').length == 1){ ProjectExt = $('#FileTableExtFilter').val() }
	let ProjectFilter = '';
	if($('#FileTableProjectFilter').length == 1){ ProjectFilter = $('#FileTableProjectFilter').val() }
	if($('#FileContentProjectFilter').length == 1){ ContentFilter = $('#FileContentProjectFilter').val() }
	
	let FileTableGroupFilter = $('#FileTableGroupFilter');
	let testProjectGroups = FileTableGroupFilter.find('option').length == 0 ? true : false;
	if(testProjectGroups){ FileTableGroupFilter.html(`<option value="">All Projects</option>`) }

	loadCustomFiles({
		ext:ProjectExt,
		filter:ProjectFilter,
		content:ContentFilter,
		group: FileTableGroupFilter.val(),
		done:function(data){
			var nextProject = '';
			var html = '';
			for(var i=0; i<data.length; i++){
				var d = data[i];
				// if(nextProject == ''){ nextProject = d.project }
				if(nextProject != d.project){
					nextProject = d.project;
					html += '<tr><td colspan="4"></td></tr>';
					if(testProjectGroups){ FileTableGroupFilter.append(`<option>${nextProject}</option>`) }
				}
				var ext = d.path.split('.').pop();
				d.path = '/crm/'+d.path.split('/crm/')[1];
				html += '<tr>';
				html += '<td style="color:white;font-weight:600;text-align:center;font-size:20px;background-color:';
				if(ext == 'js'){ html += 'blue' }
				else if(ext == 'css'){ html += 'green' }
				else if(ext == 'sql'){ html += 'purple' }
				else{ html += 'orange' }
				html += '">' + ext.toUpperCase() + '</td>';
				html += '<td>';
				html += '<b>' + d.name + '</b><br>';
				html += '<input style="border:0;outline:0;background-color:inherit;width:100%;box-sizing: border-box;"';
				html += 'value="' + d.path + '" readonly>';
				html += '</td>';
				html += '<td>' + d.project + '</td>';
				html += '<td>' + displayLocalDate(d.tstamp) + '</td>';
				html += '<td>';
				html += '<a class="linksvg" target="_blank" href="'+d.path+'"';
				html += '>'+getSVG('link')+'</a> ';
				html += '<button class="buttonSquare buttonBlue" data-name="' + d.name + '" onclick="editCustomFile($(this))">' + slovar('Edit') + '</button>';
				html += '<button class="buttonSquare buttonRed" data-name="' + d.name + '" onclick="deleteCustomFile($(this))">' + slovar('Delete') + '</button>';
				html += '</tr>';
			}
			table.find('tbody').html(html);
			if(typeof callback === 'function'){ callback() }
		}
	})
}

function loadCustomFiles(d){
	$.post('/crm/php/admin/custom_files.php?get_custom_files=1', {
		ProjectExt: d.ext,
		ProjectFilter: d.filter,
		GroupFilter: d.group,
		ContentFilter: d.content
	}, function(data){ d.done(JSON.parse(data)) })
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
	html += '<option value="api">API</option>';
	html += '<option value="sql">SQL</option>';
	html += '</select>';
	html += '<input type="checkbox" onClick="toggleAddTamplate()" id="newfileTemplate">';
	html += '<label for="newfileTemplate">' + slovar('Add_template') + '</label>';
	html += '<hr><button class="button buttonGreen">' + slovar('Save_changes') + '</button>';
	html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span>';
	html += '</form>';
	popupBox.html(html);

	popupBox.find('form').on('submit', function(e){
		e.preventDefault();
		file_name = popup.find('[name=file_name]').val();
		file_ext = popup.find('[name=file_ext]').val();
		if(file_ext == 'api'){
			file_name = 'api_'+file_name;
			file_ext = 'php';
		}
		$.post('/crm/php/admin/custom_files.php?create_custom_file=1', {
			file_name: file_name,
			file_project: popup.find('[name=file_project]').val(),
			file_ext: file_ext,
			file_data: popup.find('[name=file_data]').val()
		}, function(data){
	        data = JSON.parse(data);
	        if(data.error){ createAlert(popupBox, 'Red', data.error); }
	        else{ getCustomFiles($('#FileTable')); removePOPUPbox(); }
	    })
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
			data += "if(isset($_SESSION['user_id'])){\n";
			data += "\tif(isset($_POST['"+name+"'])){ echo json_encode("+name+"()); }\n";
			data += "}\n";
			data += "?>";
		}
		else if(ext == 'js'){
			data += "function "+name+"(){\n";
			data += "\tloadCSS('"+APP.customDir+"/CustomCSS.css');\n";
			data += "}\n\n$(document).ready(function(){ "+name+"() });";
		}
		else if(ext == 'api'){
			data += "<?php\n";
			data += "include(loadPHP('file/path'));\n\n";
			data += "function API_run($SQL){ return "+name+"(); }\n\n";
			data += "function "+name+"(){\n\n}\n";
			data += "?>";
		}
	}
	textarea.val(data);
}

function editCustomFile(el){
	$.post('/crm/php/admin/custom_files.php?get_custom_file=1', {
		file_name: el.attr('data-name'),
	}, function(data){
		data = JSON.parse(data);
		var popup = createPOPUPbox();
		var popupBox = popup.find('.popupBox');
		var html = '<form>';
		html += '<input type="hidden" name="update" value="1">';
		html += '<input type="hidden" name="file_name" value="' + el.attr('data-name') + '">';
		html += '<h2>' + slovar('Update') + '</h2>';
		html += '<label>' + slovar('Project') + '</label>';
		html += '<input type="text" name="file_project" value="' + data[1] + '" required>';
		html += '<label>' + slovar('Data') + '</label>';
		html += '<div class="openCodeEditor">';
		html += '<pre><code></code></pre><textarea style="display:none" name="file_data">' + data[2] + '</textarea>';
		html += '</div><hr>';
		html += '<button class="button buttonGreen">' + slovar('Save_changes') + '</button>';
		html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span>';
		html += '</form>';
		popupBox.html(html);
		popupBox.find('code').text(data[2]);

		popupBox.find('.openCodeEditor').click(function(){
			loadJS('form/codeEditor', function(el){ 
				openCodeEditor({
					box: el,
					name: getFileName(data[0]),
					type: data[0].split('.').pop(),
					callback: function(){ save_editCustomFile(popupBox) }
				})
			}, $(this));
		});

		popupBox.find('form').on('submit', function(e){
			e.preventDefault();
			save_editCustomFile(popupBox, true);
		});

		popup.fadeIn('fast');
	})
}

function save_editCustomFile(popupBox, close = false){
	$.post('/crm/php/admin/custom_files.php?create_custom_file=1', popupBox.find('form').serialize(), function(data){
        data = JSON.parse(data);
        if(data.error){ return createAlert(popupBox, 'Red', data.error) }
        getCustomFiles($('#FileTable'));
    	if(close){ removePOPUPbox() }
    })
}

function deleteCustomFile(el){
	var name = el.attr('data-name');
	POPUPconfirm(
		slovar('Confirm_event'), 
		`${slovar('Confirm_delete')}<br> datoteka: <b>${name}</b>`, 
		function(){
			var box = el.closest('.boxInner');
			$.post('/crm/php/admin/custom_files.php?delete_custom_file=1', {
				file_name: name
			}, function(data){
		        data = JSON.parse(data);
		        if(data.error){ createAlert(box, 'Red', data.error); }
		        else{ getCustomFiles($('#FileTable')); removePOPUPbox(); }
		    })
		}
	);
}

// EXTRA

function getFileName(url){
	if(!url){ return "" }
	try {
		const pathname = new URL(url).pathname;
		const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
		const filenameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'));
		return filenameWithoutExtension || filename;
	} catch (e) {
		return ""
	}
}

if($('#FileTableProjectFilter').length == 1){
	$('#FileTableProjectFilter, #FileContentProjectFilter').keyup(function(e){if(e.which == '13'){ getCustomFiles($('#FileTable')) }});
}