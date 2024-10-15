function openCodeEditor(box, type = ''){
	if(type == ''){ return }
	loadCSS('codeEditor');
	if(type == 'js'){ type = 'javascript' }
	$('body').append('<div id="codeEditor"><div id="codeEditorTop"></div><div id="codeEditorInput"></div></div>');
	loadJS('https://cdnjs.cloudflare.com/ajax/libs/ace/1.6.0/ace.js', function(){
		var html = '';
		html += '<button class="buttonSquare buttonGreen">' + slovar('Save_changes') + '</button>';
		html += '<b>' + type + '</b>';
		html += '<button class="buttonSquare buttonGrey" onclick="closeCodeEditor()">' + slovar('Cancel') + '</button>';
		$('#codeEditorTop').html(html);
		$('#codeEditorInput').css('height', $(window).height() - $('#codeEditorTop').outerHeight());
		var editor = ace.edit('codeEditorInput');
		editor.setTheme('ace/theme/monokai');
		editor.session.setMode('ace/mode/' + type);
		editor.setValue(box.find('textarea').val());
		$('#codeEditorTop .buttonGreen').click(function(){ saveChangesCodeEditor(editor, box) });
	});
}

function saveChangesCodeEditor(editor, box){
	box.find('textarea').val(editor.getValue());
	box.find('code').text(editor.getValue());
	closeCodeEditor();
}

function closeCodeEditor(){ $('#codeEditor').remove() }