// CONFIG
const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

function openEmailTemplateEditor(callback){loadJS('https://code.jquery.com/ui/1.12.1/jquery-ui.js', function(){
	loadCSS('emailTemplateEditor');
	loadCSS('jq_ui_tools');
	var html = '<div id="emailtemplateeditor">';
	html += '<div id="etehead"></div>';
	html += '<div id="etebody"><div id="etebodybox"></div>';
	html += '<div id="etemainbutton" class="hoverTool linksvg" ';
	html += 'onclick="showDropdownMenu($(this), true)">' + getSVG('settings') + '<div class="DropdownMenuContent"></div></div>';
	html += '</div></div>';
	$('body').append(html);
	$('#etebody').bind('contextmenu', function(e){ return false; });
	$(window).bind('beforeunload', function(){ return 'test page leave'; });
	resetDropdownMenuConfig();
	ETE_createHead($('#etehead'));
	if(typeof callback === 'function'){ callback(); }
	else{ ETE_createNewTemplate(); }
})}

function ETE_createHead(box){
	var html = '<div class="etetab"><div class="etebutton eteclosebutton" data-tooltip="' + slovar('Close') + '">' + getSVG('x') + '</div></div>'
	html += '<div class="etetab"><div id="etelogo"></div></div>';
	html += '<div class="etetab">';
	html += '<div class="etebutton" id="etesavebutton" data-tooltip="' + slovar('Save') + '" onclick="ETE_save($(this))">' + getSVG('download') + '</div>';
	html += '</div>';
	box.html(html);
	box.find('.eteclosebutton').click(function(){ ETE_clickX(); });
	tooltips();
}


// MAIL BOX
function ETE_addBox(){
	var id = 'etebox' + new Date().getTime();
	var html = '<div id="' + id + '" class="etebox" style="background-color:#edf1f3;padding:10px 0px;text-align:center;min-width:600px;"></div>';
	$('#etebox1').before(html);
	ETE_addEL(id, 'prepend');
}
function ETE_editBox(id){
	hideDropdownMenu();
	var el = $('#'+id);
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');

	var html = '<h2>' + slovar('Backgorund') + '</h2>' + ETE_html('colorpicker');
	html += '<hr><button class="button buttonGreen">' + slovar('Save') + '</button>';
	html += '<button class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</button>';
	popupBox.html(html);
	popupBox.find('#colorpickerInput1').val(rgb2hex(el.css('background-color')));

	popupBox.find('.buttonGreen').click(function(){
		el.css('background-color', $('#colorpickerInput1').val());
		removePOPUPbox();
	});

	loadJS('form/colorpicker', function(){
		createColorPickers(popupBox);
		popup.fadeIn('fast');
	})
}
function ETE_removeBox(id){if($('.etebox').length > 1){ $('#'+id).remove(); ETE_hideMainButton(); }}


// MAIL ELEMENTS
function ETE_addEL(id, position){
	var box = $('#'+id);
	var newID = 'etetd' + new Date().getTime();
	var html = '<tr>' + ETE_html('td', newID) + '</tr>';

	if(box.find('table').length == 0){ html = '<table style="table-layout:fixed;width:600px;margin:0px auto;border-spacing:0px;"><tbody class="sortable">' + html + '</tbody></table>' }
	else{ box = box.find('table').first(); }

	if(position == 'prepend'){ box.prepend(html); }
	else if(position == 'append'){ box.append(html); }
	ETE_refreshTools();
	ETE_editEL(newID);
	ETE_checkIfTableSplit($('#'+newID).closest('table'));
}
function ETE_splitEL(id){
	var el = $('#'+id);
	if(el.closest('tr').find('td').length == 1){
		var newID = 'etetd' + new Date().getTime();
		el.after(ETE_html('td', newID));
		ETE_refreshTools();
		ETE_checkImageSizes(el, el.css('padding').split('px')[0]);
		ETE_editEL(newID);
		ETE_checkIfTableSplit($('#'+newID).closest('table'));
	}
}
function ETE_checkIfTableSplit(table){
	var tableSplit = false;
	table.find('tr').each(function(){
		if($(this).find('td').length > 1){ tableSplit = true; return false; }
	});
	if(tableSplit){
		table.find('tr').each(function(){
			if($(this).find('td').length == 1){ $(this).find('td').attr('colspan',2); }
			else{ $(this).find('td').attr('colspan',''); }
		});
	}
	else{ table.find('td').attr('colspan',''); }
}
function ETE_editEL(id){
	hideDropdownMenu();
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	var el = $('#'+id);
	var elPadding = el.css('padding').split('px')[0];
	var html = '';

	html += ETE_html('textarea',1);
	html += '<div><a class="button buttonBlue" onclick="show_tag_info()">' + slovar('Show_tag_info') + '</a></div>';
	html += '<div id="show_tag_info" style="display:none;padding:10px;text-align:left;">';
	html += '<input value="{{user_name}}" onclick="copyInputValue($(this))" readonly> - ' + slovar('Info_user_name_tag') + '<br>';
	html += '</div>';
	html += '<hr><h2>' + slovar('Backgorund') + '</h2>' + ETE_html('colorpicker',1) + ETE_html('transperent') + '<hr>';
	html += '<h2>' + slovar('Padding') + '</h2>' + ETE_html('padding',1);
	html += '<hr><button class="button buttonGreen">' + slovar('Save') + '</button>';
	html += '<button class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</button>';
	popupBox.html(html);
	var paddingB = $('#paddingB1');
	$('#padding1').slider({ range: 'min', max: 50, value: elPadding, 
		create: function(){ paddingB.text( $(this).slider('value') ); },
		slide: function(event, ui){ paddingB.text(ui.value); }
	});

	popupBox.find('#textarea1').val(el.html());
	if(el.css('background-color') != 'rgba(0, 0, 0, 0)'){ popupBox.find('#colorpickerInput1').val(rgb2hex(el.css('background-color'))); }
	else{ $('#transperent').prop('checked', true); }

	popupBox.find('.buttonGreen').click(function(){
		var bg = $('#colorpickerInput1').val();
		if($('#transperent').is(':checked')){ bg = ''; }
		el.html(popupBox.find('#textarea1').val());
		el.css({
			'background-color': bg,
			'padding': $('#padding1').slider('value')
		});
		ETE_checkImageSizes(el, $('#padding1').slider('value'));
		var whitelist = 'br,hr,div,h1,h2,h3,h4,h5,h6,p,blockquote,span,b,font,a,ul,ol,li,img';
		strip_tags(el, whitelist);
		ETE_checkTagCSS(el);
		removePOPUPbox();
	});

	loadJS('form/cleditor', function(){loadJS('form/colorpicker', function(){
		createColorPickers(popupBox);
		popup.fadeIn('fast');
		setTimeout(function(){
			checkForTextAreaInputs(popupBox, function(){
				$('#textarea1').summernote('focus');
				$('.note-table').remove(); // REMOVE TABLE EDITOR
			});
		}, 100)
	});});
}
function ETE_removeEL(id){
	var table = $('#'+id).closest('table');
	$('#'+id).remove();
	if(table.find('td').length == 0){ table.remove(); }
	ETE_hideMainButton();
	ETE_checkIfTableSplit(table);
}

// MAIL LINK STYLES
function refresh_link_example(){
	var bg = $('#colorpickerInput1').val();
	if($('#transperent').is(':checked')){ bg = ''; }
	var color = $('#colorpickerInput2').val();
	var underline = 'none';
	if($('#underline').is(':checked')){ underline = 'underline' }
	$('#link_example').css({
		'background-color': bg,
		'color': color,
		'padding-top': $('#padding1').slider('value'),
		'padding-bottom': $('#padding1').slider('value'),
		'padding-left': $('#padding2').slider('value'),
		'padding-right': $('#padding2').slider('value'),
		'border-radius': $('#padding3').slider('value'),
		'text-decoration-line': underline
	});
}
function colorPickerChange(el){if($('#link_example').length == 1){ refresh_link_example(); }}
function ETE_editELa(id){
	hideDropdownMenu();
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	var el = $('#'+id);
	var a = el.find('a').first();
	var aPaddingTop = a.css('padding-top').split('px')[0];
	var aPaddingLeft = a.css('padding-left').split('px')[0];
	var aBorderRadius = a.css('border-radius').split('px')[0];
	var aUnderline = a.css('text-decoration-line');
	var html = '';

	html += '<div style="display:flex;align-items:stretch;">'
	html += '<div style="padding-right:20px;border-right:1px solid gainsboro;margin-right:10px;">';
	html += '<table style="height:100%;"><tr><td>';
	html += '<span id="link_example" style="display:inline-block;transition:0.2s;">' + slovar('Link_example') + '</span>';
	html += '</td></tr></table>';
	html += '</div><div style="max-height:74vh;overflow:auto;padding-right:20px;">'
	html += '<h2>' + slovar('Backgorund') + '</h2>' + ETE_html('colorpicker',1) + ETE_html('transperent') + '<hr>';
	html += '<h2>' + slovar('Text_color') + '</h2>' + ETE_html('colorpicker',2) + '<hr>';
	html += '<h2>' + slovar('Padding_top') + '</h2>' + ETE_html('padding',1);
	html += '<h2>' + slovar('Padding_left') + '</h2>' + ETE_html('padding',2);
	html += '<h2>' + slovar('Border_radius') + '</h2>' + ETE_html('padding',3);
	html += ETE_html('underline');
	html += '</div></div>'
	html += '<hr><button class="button buttonGreen">' + slovar('Save') + '</button>';
	html += '<button class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</button>';
	popupBox.html(html);

	$('#transperent, #underline').on('change', function(){ refresh_link_example(); })

	var paddingB1 = $('#paddingB1');
	$('#padding1').slider({ range: 'min', max: 50, value: aPaddingTop, 
		create: function(){ paddingB1.text( $(this).slider('value') ); },
		slide: function(event, ui){ paddingB1.text(ui.value); },
		stop: function(){ refresh_link_example(); }
	});
	var paddingB2 = $('#paddingB2');
	$('#padding2').slider({ range: 'min', max: 50, value: aPaddingLeft, 
		create: function(){ paddingB2.text( $(this).slider('value') ); },
		slide: function(event, ui){ paddingB2.text(ui.value); },
		stop: function(){ refresh_link_example(); }
	});
	var paddingB3 = $('#paddingB3');
	$('#padding3').slider({ range: 'min', max: 50, value: aBorderRadius, 
		create: function(){ paddingB3.text( $(this).slider('value') ); },
		slide: function(event, ui){ paddingB3.text(ui.value); },
		stop: function(){ refresh_link_example(); }
	});

	if(a.css('background-color') != 'rgba(0, 0, 0, 0)'){ popupBox.find('#colorpickerInput1').val(rgb2hex(a.css('background-color'))); }
	else{ $('#transperent').prop('checked', true); }
	if(a.css('color') != 'rgba(0, 0, 0, 0)'){ popupBox.find('#colorpickerInput2').val(rgb2hex(a.css('color'))); }
	if(aUnderline == 'underline'){ $('#underline').prop('checked', true); }

	popupBox.find('.buttonGreen').click(function(){
		var bg = $('#colorpickerInput1').val();
		if($('#transperent').is(':checked')){ bg = ''; }
		var color = $('#colorpickerInput2').val();
		if($('#transperent').is(':checked')){ color = ''; }
		var underline = 'none';
		if($('#underline').is(':checked')){ underline = 'underline' }
		el.find('a').css({
			'display': 'inline-block',
			'background-color': bg,
			'color': color,
			'padding-top': $('#padding1').slider('value'),
			'padding-bottom': $('#padding1').slider('value'),
			'padding-left': $('#padding2').slider('value'),
			'padding-right': $('#padding2').slider('value'),
			'border-radius': $('#padding3').slider('value'),
			'text-decoration-line': underline
		});
		removePOPUPbox();
	});

	loadJS('form/colorpicker', function(){
		createColorPickers(popupBox);
		refresh_link_example();
		popup.fadeIn('fast');
	});
}


// REFRESHING TOOLS
function ETE_refreshTools(){
	hideDropdownMenu();
	var box = $('#etebodybox');
	var button = $('#etemainbutton');
	var allEl = $('.etebox, .etetd');

	allEl.unbind('mouseover, mousedown');
	allEl.mouseover(function(e){ e.stopPropagation(); ETE_mouseover($(this), allEl, button); });
	$('.etebox').mouseover(function(e){ ETE_mouseover_box($(this), button); });
	$('.etebox').mousedown(function(e){
		if(e.which == 3){
			showDropdownMenu($('#etemainbutton'), true);
			$('#DropdownMenu').css({'left':e.pageX + 1, 'top':e.pageY + 1});
		}
	});
	$('.etetd').mouseover(function(e){ ETE_mouseover_el($(this), button); });
	$('.sortable').sortable({
		placeholder: 'etetdplaceholder',
		start: function(e, ui){ ui.placeholder.height(ui.item.height()); }
	});
}

function ETE_mouseover(el, allEl, button){
	hideDropdownMenu();
	allEl.css('outline',0);
	el.css('outline','1px solid black');
	button.css({ 'top': el.offset().top, 'left': el.offset().left + 10 }).show();
}
function ETE_mouseover_box(el, button){
	var html = '<a onclick="ETE_editBox(\'' + el.attr('id') + '\')">' + slovar('Edit') + '</a>';
	html += '<a onclick="ETE_addEL(\'' + el.attr('id') + '\',\'prepend\')">' + slovar('Add_new_el') + '</a>';
	html += '<a onclick="ETE_addBox()">' + slovar('Add_new_box') + '</a>';
	if(el.attr('id') != 'etebox1'){ html += '<hr><a onclick="ETE_removeBox(\'' + el.attr('id') + '\')">' + slovar('Delete') + '</a>'; }
	button.find('.DropdownMenuContent').html(html);
}
function ETE_mouseover_el(el, button){
	var html = '<a onclick="ETE_editEL(\'' + el.attr('id') + '\')">' + slovar('Edit') + '</a>';
	if(el.find('a').length != 0){ html += '<a onclick="ETE_editELa(\'' + el.attr('id') + '\')">' + slovar('Edit_links') + '</a>'; }
	html += '<a onclick="ETE_addEL(\'' + el.closest('.etebox').attr('id') + '\',\'append\')">' + slovar('Add_new_el') + '</a>';
	if(el.closest('tr').find('td').length == 1){ html += '<a onclick="ETE_splitEL(\'' + el.attr('id') + '\')">' + slovar('Split_el') + '</a>'; }
	html += '<hr><a onclick="ETE_removeEL(\'' + el.attr('id') + '\')">' + slovar('Delete') + '</a>';
	button.find('.DropdownMenuContent').html(html);
}

function ETE_checkImageSizes(box, padding){
	padding = padding * 2;
	box.find('img').each(function(){
		$(this).css('vertical-align','middle');
		var maxW = 600 - padding;
		if($(this).closest('tr').find('td').length == 2){ maxW = 300 - padding; }
		if($(this).width() > maxW){
			$(this).css('height','auto');
			$(this).width(maxW);
			$(this).height($(this).height());
		}
	});
}
function ETE_checkTagCSS(box){ box.find('h1,h2,h3,h4,h5,h6,p').css({ 'padding':0,'margin':0 }) }


// OTHER
function ETE_html(el, id = 1){
	var html = '';
	if(el == 'td'){ html = '<td id="' + id + '" class="etetd" style="background-color:white;padding:0px;text-align:left;"></td>' }
	else if(el == 'colorpicker'){
		html = '<div><div class="colorpicker" id="colorpicker' + id + '"></div>';
		html += '<input id="colorpickerInput' + id + '"></div>';
	}
	else if(el == 'transperent'){
		html = '<div><input type="checkbox" id="transperent" class="checkbox"><label for="transperent">' + ' ' + slovar('Transperent') + '</label></div>';
	}
	else if(el == 'underline'){
		html = '<div><input type="checkbox" id="underline" class="checkbox"><label for="underline">' + ' ' + slovar('Underline') + '</label></div>';
	}
	else if(el == 'textarea'){ html = '<h2>' + slovar('Content') + '</h2><div><textarea id="textarea' + id + '"></textarea></div>'; }
	else if(el == 'padding'){ html = '<div><div id="padding' + id + '"><div id="paddingB' + id + '" class="ui-slider-handle"></div></div></div>' }
	return html;
}
function show_tag_info(){ $('#show_tag_info').toggle() }
function copyInputValue(el){ el.select() }
function ETE_hideMainButton(){ $('#etemainbutton').hide(); hideDropdownMenu(); }
function ETE_createNewTemplate(){
	var html = '<div id="etebox1" class="eteboxunsub" style="background-color:#edf1f3;padding:10px 0px;text-align:center;min-width:600px;">';
	html +=  '<span>' + slovar('To_unsubscribe') + '</span> <a href="' + window.location.origin + '/crm/unsubscribe?email={{user_id}}">' + slovar('Click_here') + '</a>';
	html += '</div>';
	$('#etebodybox').append(html);
	ETE_addBox();
}

// SAVE
function ETE_save(el){
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	var html = '<form><label>' + slovar('Template_name') + '</label>';
	html += '<input type="text" name="template_name">';
	html += '<hr><button class="button buttonGreen">' + slovar('Save') + '</button>';
	html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span></form>';
	popupBox.html(html);
	if(el.attr('data-name') != undefined){ popupBox.find('[name="template_name"]').val(el.attr('data-name')) }

	popup.fadeIn('fast');

	var form = popupBox.find('form');
	form.on('submit', function(e){
		e.preventDefault();
		var id = '';
		if(el.attr('data-id') != undefined){ id = el.attr('data-id'); }
		var name = popupBox.find('[name="template_name"]').val();
		if(name != ''){
			popupBox.append(HTML_loader());
			form.hide();
			ETE_save_template(id, name, popupBox);
		}
		else{ createAlert(popupBox, 'Red', slovar('Template_name_empty')); }
	});
}
function ETE_save_template(id, name, popupBox){
	$.post('/crm/php/campaign/campaign?save_template=1', {
		id: id,
		name: name,
		csrf_token: $('input[name=csrf_token]').val()
	}, function(data){
	    data = JSON.parse(data);
	    if(data.error){ createAlert(popupBox, 'Red', data.error); }
	    else{
	    	$('#etebodybox').find('img').addClass('eteLoading');
	    	ETE_save_template_images(data.id, popupBox);
	    }
	})
}
function ETE_save_template_images(id, popupBox){
	if($('#etebodybox').find('.eteLoading').length == 0){ return ETE_save_template_body(id, popupBox) }
	var img = $('#etebodybox').find('.eteLoading').first();
	$.post('/crm/php/campaign/campaign?save_template_img=1', {
		id: id,
		img: img.attr('src'),
		width: img.width(),
		csrf_token: $('input[name=csrf_token]').val()
	}, function(data){
		data = JSON.parse(data);
		img.attr('src', APP.uploadDir + '/campaign/campaign' + id + '/' + data.name);
		img.removeClass('eteLoading');
	    setTimeout(function(){ ETE_save_template_images(id, popupBox) }, 1000);
	})
}
function ETE_save_template_body(id, popupBox){
	$.post('/crm/php/campaign/campaign?save_template_body=1', {
		id: id,
		body: $('#etebodybox').html(),
		csrf_token: $('input[name=csrf_token]').val()
	}, function(data){
	    data = JSON.parse(data);
	    if(data.error){ createAlert(popupBox, 'Red', data.error); }
	    else{ removePOPUPbox(); ETE_close(); }
	})
}

// CLOSE
function ETE_clickX(){ POPUPconfirm(slovar('Close_editor_title'),slovar('Close_editor_desc'), function(){ ETE_close(); }); hideTooltip(); }
function ETE_close(){ $('#emailtemplateeditor').remove(); $(window).unbind('beforeunload'); }