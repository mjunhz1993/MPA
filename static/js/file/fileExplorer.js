function open_fileExplorer(d = {}, html = ''){loadJS('file/file', function(){
	loadCSS('fileExplorer');
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	html += '<div id="fileExplorer">';
	html += '<div id="fileExplorerSearch"><h2>'+slovar('File_explorer')+'</h2>';
	html += '<div><input placeholder="'+slovar('Search')+'"></div>';
	if(user_id == 1){ html += '<button id="move_files_by_year" style="display:none;">move_files_by_year</button>'; }
	html += '</div>';
	html += '<div class="fileExplorerBox"><button class="buttonSquare button100 buttonBlue goback">' + slovar('Go_back') + '</button>';
	html += '<div class="horizontalTable" style="max-height:60vh"><table class="table"><thead><tr>';
	html += '<th></th><th>' + slovar('Name') + '</th>';
	html += '<th>' + slovar('Tools') + '</th>';
	html += '</tr></thead><tbody></tbody><tfoot></tfoot></table></div>';
	html += '</div>';
	html += '<hr><form enctype="multipart/form-data">';
	html += '<input type="hidden" name="path">';
	html += '<input type="file" id="upload_file" name="file">';
	html += '<label for="upload_file" class="button buttonGreen">'+slovar('Upload_file')+'</label></form>';
	html += '<input type="text" name="new_dir" placeholder="'+slovar('Add_directory')+'">';
	html += '<button class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</button></div>';
	popupBox.html(html);

	var fileBox = popupBox.find('.fileExplorerBox');
	popupBox.find('#fileExplorerSearch input').keyup(function(e){
		if(e.which == 13){ load_fileDir(d, fileBox, fileBox.attr('data-path')) }
	})
	popupBox.find('#upload_file').change(function(){ upload_file_here(d, $(this)) });
	popupBox.find('[name=new_dir]').keyup(function(e){if(e.which == 13){ create_dir(d, $(this)) }})

	if(user_id == 1){ $('#move_files_by_year').click(function(){ move_files_by_year(d, fileBox, fileBox.attr('data-path')) }) }

	load_fileDir(d, fileBox, '/', 0, function(){
		popup.fadeIn('fast');
	});
})}

function goback_fileDir(d, el){
	var fileBox = el.closest('.fileExplorerBox');
	var path = fileBox.attr('data-path');
	if(path == '/'){ return }
	path = path.split('/');
	path.splice(path.length - 2, 2);
	load_fileDir(d, fileBox, path.join('/') + '/');
}

function load_fileDir(d, fileBox, path, OFFSET = 0, callback){
	fileBox.find('.alert').remove();
	fileBox.find('tfoot').text('');
	if(OFFSET == 0){
		fileBox.prepend(HTML_loader()).find('table').hide();
		fileBox.find('tbody').text('');
	}
	$.get('/crm/php/file/fileExplorer.php?get_files=1', {
		path:path,
		filter:$('#fileExplorerSearch input').val(),
		OFFSET:OFFSET
	}, function(data){
        data = JSON.parse(data);
        if(data.error){ createAlert(fileBox, 'Red', slovar(data.error)) }
        else{ display_fileDir(d, fileBox, path, data) }
        remove_HTML_loader(fileBox);
        fileBox.find('table').fadeIn('fast');
        add_events_to_file_explorer(d, fileBox, data);
        if(typeof callback === 'function'){ callback() }
    }).fail(function(){console.log('ERROR: backend napaka');});
}

function move_files_by_year(d, fileBox, path){POPUPconfirm('Premakni po letnicah ?','',function(){
	$.post('/crm/php/file/fileExplorer.php?move_files_by_year=1', {
		path:path
	}, function(data){
        data = JSON.parse(data);
        console.log(data);
        load_fileDir(d, fileBox, path);
    }).fail(function(){console.log('ERROR: backend napaka');});
})}

function display_fileDir(d, fileBox, path, data){
	fileBox.attr('data-path', path);
	if(path == '/'){ fileBox.find('.goback').hide() }else{ fileBox.find('.goback').show() }
	if(!data.file){ return }
	var html = '';
	for(var i=0; i<data.file.length; i++){
		var f = data.file[i];
		html += '<tr data-path="' + path + f.name + '">';
		html += '<td>';
		if(!f.extension){ html += getSVG() }else{ html += getSVG('attachment') }
		html += '</td><td class="renameFile">' + f.name + '</td>';
		html += '<td>' + display_fileDirTools(path, f) + '</td>';
		html += '</tr>';
	}
	fileBox.find('tbody').append(html);

	if(!data.OFFSET){ return }
	fileBox.find('tfoot').html('<tr><td colspan="3"><button class="buttonSquare button100 buttonBlue buttonShowMore">' + slovar('Show_more') + '</button></td></tr>');
}

function display_fileDirTools(path, f){
	if(!f.extension){ return toolsForDir() }
	else{ return toolsForFiles(path, f) }
}

function toolsForDir(html = ''){
	html += '<button class="buttonSquare buttonBlue fileDir">' + slovar('Open') + '</button> ';
	html += '<button class="buttonSquare buttonBlack cutFile">' + slovar('Cut') + '</button> ';
	html += '<button class="buttonSquare buttonRed deleteFile">' + slovar('Delete') + '</button>';
	return html;
}

function toolsForFiles(path, f, html = ''){
	var dir = path.split('/');
	dir.shift();
	dir.pop();
	html += '<button class="buttonSquare buttonBlue" onclick="clickOnFile(\'' + dir.join('/') + '\', $(this), \'' + f.name + '\')">' + slovar('Open') + '</button> ';
	html += '<button class="buttonSquare buttonBlack cutFile">' + slovar('Cut') + '</button> ';
	html += '<button class="buttonSquare buttonRed deleteFile">' + slovar('Delete') + '</button>';
	return html;
}

// ----------------- TOOLS EVENTS

function add_events_to_file_explorer(d, fileBox, data){
	fileBox.find('.renameFile').dblclick(function(){ open_rename_file(d, fileBox, $(this)) });
	fileBox.find('.goback').unbind('click').click(function(){ goback_fileDir(d, $(this)) });
	fileBox.find('.fileDir').unbind('click').click(function(){ load_fileDir(d, fileBox, $(this).closest('tr').attr('data-path')+'/') });
	fileBox.find('.cutFile').unbind('click').click(function(){ cut_file(d, $(this)) });
	fileBox.find('.deleteFile').unbind('click').click(function(){ delete_file(d, $(this)) });
	fileBox.find('.buttonShowMore').click(function(){ $(this).remove(); load_fileDir(d, fileBox, fileBox.attr('data-path'), data.OFFSET) });
}

function open_rename_file(d, fileBox, el){
	if(el.find('input').length == 1){ return }
	el.html('<input type="text" value="'+el.text()+'">');
	el.find('input').keyup(function(e){ submit_rename_file(d, fileBox, e, $(this)) });
}
function submit_rename_file(d, fileBox, e, el){if(e.which == 13){
	var file = el.closest('tr').attr('data-path');
	$.get('/crm/php/file/fileExplorer.php?rename_file=1', {
		file:file,
		name:el.val()
	}, function(data){
        data = JSON.parse(data);
        if(data == false){ return createAlert(fileBox, 'Red', slovar('Rename_error')) }
        load_fileDir(d, fileBox, fileBox.attr('data-path'))
    })
}}

function create_dir(d, el){
	if(valEmpty(el.val())){ return }
	var popupBox = el.closest('.popupBox');
	popupBox.find('.alert').remove();
	var fileBox = popupBox.find('.fileExplorerBox');
	var path = fileBox.attr('data-path');
	$.post('/crm/php/file/fileExplorer.php?create_dir=1', {name:el.val(),path:path},
	function(data){ data = JSON.parse(data);
		if(data.error){ return createAlert(popupBox,'Red',data.error) }
		el.val('');
		load_fileDir(d, fileBox, path)
	})
}

function upload_file_here(d, el){
	var fileBox = el.closest('.popupBox').find('.fileExplorerBox');
	var path = fileBox.attr('data-path');
	var form = el.closest('form');
	form.find('.alert').remove();
	form.find('[name=path]').val(path);
    $.ajax({ 
        url: '/crm/php/file/fileExplorer.php?upload_file=1', 
        type:'post', data:new FormData(form[0]), contentType:false, processData:false,
        success: function(data){ data = JSON.parse(data);
        	console.log(data);
        	el.val('');
        	if(data.error){ return createAlert(form,'Red',data.error) }
        	load_fileDir(d, fileBox, path)
        }
    })
}

function cut_file(d, el){
	var file = el.closest('tr').attr('data-path');
	var box = el.closest('.fileExplorerBox');
	box.find('.cutFileBox').remove();
	var html = '<div class="cutFileBox">';
	html += '<button class="buttonSquare button100 buttonGreen pasteFile">' + slovar('Paste') + '</button></div>';
	box.prepend(html);
	box.find('.pasteFile').click(function(){ paste_file(d, file, $(this)) })
}

function paste_file(d, file, el){
	var fileBox = el.closest('.fileExplorerBox');
	var path = fileBox.attr('data-path');
	el.remove();
	$.post('/crm/php/file/fileExplorer.php?paste_file=1', {
		path:path,
		file:file
	}, function(data){
        data = JSON.parse(data);
        if(data == true){ load_fileDir(d, fileBox, path) }
        else{ createAlert(fileBox, 'Red', slovar('Paste_error')) }
    }).fail(function(){console.log('ERROR: backend napaka')});
}

function delete_file(d, el){POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
	var file = el.closest('tr').attr('data-path');
    var fileBox = el.closest('.fileExplorerBox');
    fileBox.find('.alert').remove();
    $.get('/crm/php/file/fileExplorer.php?delete_file=1', {
        file:file
    }, function(data){
        data = JSON.parse(data);
        if(data == false){ createAlert(fileBox, 'Red', slovar('Delete_error')) }
        else{ load_fileDir(d, fileBox, fileBox.attr('data-path')) }
    }).fail(function(){console.log('ERROR: backend napaka')});
})}