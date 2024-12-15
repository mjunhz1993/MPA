function openCodeEditor(d){
	if(d.type == ''){ return }
	loadCSS('codeEditor');
	if(d.type == 'js'){ d.type = 'javascript' }

	loadJS('https://cdnjs.cloudflare.com/ajax/libs/ace/1.6.0/ace.js', function(){
		$('body').append(`
			<div id="codeEditor">
				<div id="codeEditorTop">
					<button class="buttonSquare buttonGreen save1">`+slovar('Save_changes')+`</button>
					<button class="buttonSquare buttonGreen save2">`+slovar('Save_changes_close')+`</button>
					<b>`+d.type+`</b>
					<button class="buttonSquare buttonGrey" onclick="closeCodeEditor()">`+slovar('Cancel')+`</button>
				</div>
				<div id="codeEditorInput"></div>
			</div>
		`);
		$('#codeEditorInput').css('height', $(window).height() - $('#codeEditorTop').outerHeight());
		var editor = ace.edit('codeEditorInput');
		editor.setTheme('ace/theme/monokai');
		editor.session.setMode('ace/mode/' + d.type);
		editor.setValue(d.box.find('textarea').val());

		$('#codeEditorTop .save1').click(function(){ 
			if(!valEmpty(d.callback)){ return saveChangesCodeEditorCallback($(this), editor, d) }
			saveChangesCodeEditor(editor, d)
		});
		$('#codeEditorTop .save2').click(function(){ saveChangesCodeEditor(editor, d) });
	});
}

function saveChangesCodeEditorCallback(but, editor, d){
	but.parent().hide();
	setTimeout(function(){but.parent().show()},500);
	d.box.find('textarea').val(editor.getValue());
	d.box.find('code').text(editor.getValue());
	d.callback();
}

function saveChangesCodeEditor(editor, d){
	d.box.find('textarea').val(editor.getValue());
	d.box.find('code').text(editor.getValue());
	closeCodeEditor();
}

function closeCodeEditor(){ $('#codeEditor').remove() }