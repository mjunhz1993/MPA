function HTMLeditor(obj){
	loadCSS('HTMLeditor');
	refresh_HTMLeditorTools(obj);
}

function refresh_HTMLeditorTools(obj){
	var el = obj.box.find('*:not(.'+HTMLeditorObj.el+')');
	el.addClass(HTMLeditorObj.el)
	.mouseover(function(m){
		m.stopPropagation();
		focus_on_element($(this));
	}).mouseout(function(m){
		m.stopPropagation();
		hideTooltip();
	}).contextmenu(function(m){
		m.preventDefault();
		m.stopPropagation();
		show_HTMLeditorTools(obj, m, $(this));
	});
}

function focus_on_element(el, tooltip = $('#tooltip'), html = ''){
	var thisEL = el[0];
	html += '<b>'+thisEL.localName+'</b>';
	if(!valEmpty(el.attr(HTMLeditorObj.attr))){ html = '<b>'+el.attr(HTMLeditorObj.attr)+'</b>'; }
	if(!valEmpty(thisEL.id)){ html += ' <b style="color:lightgreen">#'+thisEL.id+'</b>' }
	if(thisEL.classList.length > 1){
		var classes = thisEL.className.split(' ');
		if(classes.includes(HTMLeditorObj.el)){ classes.splice(classes.indexOf(HTMLeditorObj.el), 1) }
		if(classes.includes(HTMLeditorObj.module)){ classes.splice(classes.indexOf(HTMLeditorObj.module), 1) }
		if(classes.length != 0){ html += '<br><span style="color:orange">.'+classes.join(', .')+'</span>' }
	}
	tooltip.html(html);
	tooltip.css({
		'top':el.offset().top - tooltip.outerHeight() - $(window).scrollTop(),
		'left':el.offset().left
	}).show();
}

function show_HTMLeditorTools(obj, m, el, html = ''){setTimeout(function(){
	var menu = $('#DropdownMenu');
	html += '<div class="tooltip">'+$('#tooltip').html()+'</div>';
	html += '<div style="max-height:200px; overflow:auto">';
	html += '<a id="editTEXTbutton">Edit content</a>';
	html += '<a id="editCODEbutton">Edit code view</a>';
	html += '<a id="selectPARENTbutton">Select parent</a><hr>';
	html += '<a id="addMODULEbutton">Add module</a><hr>';
	html += '<a class="editCOPYbutton" data-type="COPY">Copy element</a>';
	html += '<a class="editCOPYbutton" data-type="CUT">Cut element</a>';
	html += '<a id="editPASTEbutton">Paste element</a><hr>';
	html += '<a class="editCSSbutton">Edit style</a>';
	html += '<hr><a id="deleteElement">Delete element</a>';
	html += '</div>';
	menu.html(html);
	menu.css({
		'top':m.pageY - 10 - $(window).scrollTop(),
		'left':m.pageX - 10
	}).show(function(){ repositionDropdownmenu(menu) });

	menu.find('#editTEXTbutton').click(function(){ open_TEXTeditor(obj, el) })
	menu.find('#editCODEbutton').click(function(){ open_TEXTeditor(obj, el, 'CODE') })
	menu.find('#selectPARENTbutton').click(function(m){
		var parent = el.parent();
		if(parent.is(obj.box)){ return alert('No parent') }
		if(parent.is('tr')){ parent = el.closest('table') }
		focus_on_element(parent);
		show_HTMLeditorTools(obj, m, parent)
	})
	menu.find('#addMODULEbutton').click(function(){ add_MODULE_into_html(obj, el) })
	menu.find('.editCOPYbutton').click(function(){ copy_HTMLcontent(obj, el, $(this).attr('data-type')) })
	menu.find('#editPASTEbutton').click(function(){ paste_HTMLcontent(obj, el) })
	menu.find('.editCSSbutton').click(function(){ open_CSSmenu(obj, el) })
	menu.find('#deleteElement').click(function(){ hideDropdownMenu(); el.remove(); })
}, 100)}

// TEXT

function open_TEXTeditor(obj, el, type = '', html = ''){
	hideDropdownMenu();
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	html += '<textarea id="elText"></textarea>';
	html += '<hr><button class="button buttonBlue buttonSave">' + slovar('Save_changes') + '</button>';
	html += '<button class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</button>';
	
	popupBox.html(html);
	var cloneEL = el.clone().removeClass(HTMLeditorObj.el);
	cloneEL.find('.'+HTMLeditorObj.el).removeClass(HTMLeditorObj.el);
	popupBox.find('#elText').val($("<div />").append(cloneEL).html());
	loadJS('form/cleditor', function(){
		checkForTextAreaInputs(popupBox, function(){
			if(type == ''){ return }
			popupBox.find('.note-toolbar').height(0);
			setTimeout(function(){
				popupBox.find('#elText').summernote('codeview.toggle')
				popupBox.find('#elText').on('summernote.blur.codeview', function() {
					popupBox.find('#elText').val(popupBox.find('.note-codable').val());
				});
			}, 100)
		})
	})

	popupBox.find('.buttonSave').click(function(){
		el.replaceWith(popupBox.find('#elText').val());
		refresh_HTMLeditorTools(obj);
		removePOPUPbox();
	})

	popup.fadeIn('fast');
}

// MODULE

function add_MODULE_into_html(obj, el, html = ''){loadJS('dev/custom_files', function(){
	hideDropdownMenu();
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	html += '<form>';
	html += '<input type="hidden" id="FileTableExtFilter" value="php">';
	html += '<select class="place">';
	html += '<option value="BEFORE">Before</option>';
	html += '<option value="AFTER">After</option>';
	html += '<option value="PREPEND">Prepend</option>';
	html += '<option value="APPEND">Append</option>';
	html += '</select>';
	html += '<table class="table"><tbody></tbody></table>';
	html += '<hr><button class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</button>';
	html += '</form>';
	popupBox.html(html);
	var table = popupBox.find('.table');
	popupBox.find('form').on('submit', function(e){ e.preventDefault() });

	getCustomFiles(table, function(){
		table.find('.buttonBlue').replaceWith('<button class="buttonSquare buttonBlue">Select</button>');
		table.find('.buttonRed').remove();
		table.find('.buttonBlue').click(function(){ add_MODULE_select_event(obj, el, $(this)) });
	});

	popup.fadeIn('fast');
})}
function add_MODULE_select_event(obj, el, button){
	var place = button.closest('.popupBox').find('.place').val();
	var module = button.closest('tr').find('input');
	module.attr(HTMLeditorObj.attr,'module');
	var val = 'downloads/' + module.val().split('/downloads/')[1].split('.')[0];
	module.attr({
		'value':"<?php include(loadPHP('"+val+"')); ?>",
		'style':''
	});
	module.addClass(HTMLeditorObj.module);
	if(place == 'AFTER'){ el.after(module) }
	if(place == 'BEFORE'){ el.before(module) }
	if(place == 'APPEND'){ el.append(module) }
	if(place == 'PREPEND'){ el.prepend(module) }
	removePOPUPbox();
	refresh_HTMLeditorTools(obj);
}

// COPY + PASTE

function copy_HTMLcontent(obj, el, type){
	hideDropdownMenu();
	obj.box.find('.'+HTMLeditorObj.copy).removeClass(HTMLeditorObj.copy).removeAttr('data-copytype');
	el.addClass(HTMLeditorObj.copy).attr('data-copytype',type);
}
function paste_HTMLcontent(obj, el, html = ''){
	hideDropdownMenu();
	if(obj.box.find('.'+HTMLeditorObj.copy).length == 0){ return alert('No copied element') }
	var menu = $('#DropdownMenu');
	html += '<a data-type="BEFORE">Before</a>';
	html += '<a data-type="AFTER">After</a>';
	html += '<a data-type="PREPEND">Prepend</a>';
	html += '<a data-type="APPEND">Append</a>';
	menu.find('.tooltip').next().replaceWith(html);
	menu.find('a').click(function(){ paste_HTMLcontent_exec(obj,el,$(this).attr('data-type')) });
	menu.show(function(){ repositionDropdownmenu(menu) });
}
function paste_HTMLcontent_exec(obj, el, type){
	hideDropdownMenu();
	var thisEL = obj.box.find('.'+HTMLeditorObj.copy);
	if(thisEL.attr('data-copytype') == 'COPY'){
		thisEL = thisEL.clone().removeClass(HTMLeditorObj.el)
		thisEL.find('.'+HTMLeditorObj.el).removeClass(HTMLeditorObj.el);
	}
	if(type == 'AFTER'){ el.after(thisEL) }
	if(type == 'BEFORE'){ el.before(thisEL) }
	if(type == 'APPEND'){ el.append(thisEL) }
	if(type == 'PREPEND'){ el.prepend(thisEL) }
	obj.box.find('.'+HTMLeditorObj.copy).removeClass(HTMLeditorObj.copy);
	refresh_HTMLeditorTools(obj);
}

// CSS

function open_CSSmenu(obj, el, html = ''){
	var menu = $('#DropdownMenu');
	html += '<div>'
	html += '<a class="editCSSbutton" data-type="BOX">Edit box style</a>';
	html += '<a class="editCSSbutton" data-type="TEXT">Edit text style</a>';
	html += '<a class="editCSSbutton" data-type="BORDER">Edit border style</a>';
	html += '</div>';
	menu.find('.tooltip').next().replaceWith(html);
	menu.find('.editCSSbutton').click(function(){ open_CSSeditor(obj, el, $(this).attr('data-type')) })
}

function open_CSSeditor(obj, el, type, html = ''){
	var menu = $('#DropdownMenu');
	html += '<div id="CSSeditorBox"><div id="CSStools">'+HTML_CSStools(el, type)+'</div></div>';
	
	menu.find('.tooltip').next().replaceWith(html);
	var tools = menu.find('#CSStools');

	tools.find('input[type=number],input[type=text]').keyup(function(){
		if(tools.find('[data-type='+$(this).attr('data-type')+']').length != 1){
			val = combine_CSS_inputs(tools, $(this))
		}
		else{
			var ext = '';
			if(!valEmpty($(this).attr('data-ext'))){ ext = $(this).attr('data-ext') }
			var val = $(this).val()+ext;
		}
		el.css($(this).attr('data-type'), val);
	});
	tools.find('select[data-type],input[type=color]').change(function(){
		el.css($(this).attr('data-type'), $(this).val());
	});

	tools.find('select[data-type]').each(function(){
		console.log(el.css($(this).attr('data-type')));
		$(this).val(el.css($(this).attr('data-type')))
	});
	tools.find('.reset_CSSvalue').click(function(){ remove_CSSvalue(el, $(this)) });
	menu.show(function(){ repositionDropdownmenu(menu) });
}

function HTML_CSStools(el, type, html = ''){
	if(type == 'BOX'){
		html += '<h3>Position</h3>';
		html += '<div class="cssbox"><label>Type</label>';
		html += '<select data-type="position">';
		html += '<option></option>';
		html += '<option>absolute</option>';
		html += '<option>relative</option>';
		html += '<option>fixed</option>';
		html += '<option>sticky</option>';
		html += '<option>static</option>';
		html += '</select></div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Top',min:0,type:'top',val:'top'}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Right',min:0,type:'right',val:'right'}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Bottom',min:0,type:'bottom',val:'bottom'}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Left',min:0,type:'left',val:'left'}) + '</div>';

		html += '<h3>Padding</h3>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Top',min:0,type:'padding',val:'padding-top'}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Right',min:0,type:'padding',val:'padding-right'}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Bottom',min:0,type:'padding',val:'padding-bottom'}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Left',min:0,type:'padding',val:'padding-left'}) + '</div>';

		html += '<h3>Margin</h3>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Top',min:0,type:'margin',val:'margin-top'}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Right',min:0,type:'margin',val:'margin-right'}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Bottom',min:0,type:'margin',val:'margin-bottom'}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Left',min:0,type:'margin',val:'margin-left'}) + '</div>';

		html += '<h3>Colors</h3>';
		html += '<div class="cssbox"><label>Background</label>';
		html += '<input type="color" data-type="background-color" value="'+rgb2hex(el.css('background-color'))+'">';
		html += HTML_removeStyleButton() + '</div>';

		html += '<h3>Size</h3>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Width',min:0,type:'width',val:'width',unit:true}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Min-Width',min:0,type:'min-width',val:'min-width',unit:true}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Max-Width',min:0,type:'max-width',val:'max-width',unit:true}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Height',min:0,type:'height',val:'height',unit:true}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Min-Height',min:0,type:'min-height',val:'min-height',unit:true}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Max-Height',min:0,type:'max-height',val:'max-height',unit:true}) + '</div>';
		return html
	}
	if(type == 'TEXT'){
		html += '<h3>Text</h3>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Size',min:0,type:'font-size',val:'font-size'}) + '</div>';
		html += '<div class="cssbox"><label>Align</label>';
		html += '<select data-type="text-align">';
		html += '<option>left</option>';
		html += '<option>center</option>';
		html += '<option>right</option>';
		html += '</select></div>';
		html += '<div class="cssbox"><label>Color</label>';
		html += '<input type="color" data-type="color" value="'+rgb2hex(el.css('color'))+'">';
		html += HTML_removeStyleButton() + '</div>';
		return html
	}
	if(type == 'BORDER'){
		html += '<h3>Border</h3>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Top',min:0,type:'border-width',val:'border-top'}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Right',min:0,type:'border-width',val:'border-right'}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Bottom',min:0,type:'border-width',val:'border-bottom'}) + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Left',min:0,type:'border-width',val:'border-left'}) + '</div>';
		html += '<div class="cssbox"><label>Style</label>';
		html += '<select data-type="border-style">';
		html += '<option></option>';
		html += '<option>solid</option>';
		html += '</select></div>';
		html += '<div class="cssbox"><label>Color</label>';
		html += '<input type="color" data-type="border-color" value="'+rgb2hex(el.css('border-color'))+'">';
		html += HTML_removeStyleButton() + '</div>';
		html += '<div class="cssbox">' + HTML_inputNumber({el:el,name:'Radius',min:0,type:'border-radius',val:'border-radius'}) + '</div>';
		return html
	}
}

function combine_CSS_inputs(tools, el, val = []){
	tools.find('[data-type='+el.attr('data-type')+']').each(function(){
		var ext = '';
		if(!valEmpty($(this).attr('data-ext'))){ ext = $(this).attr('data-ext') }
		val.push($(this).val()+ext);
	});
	return val.join(' ')
}

function rgb2hex(c){
	rgb = c.replace(/rgba\(|rgb\(|\)| /gi, '').split(',');
	return "#" + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

function hex(x){
	var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"); 
	return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
 }

 function repositionDropdownmenu(menu){
 	if(menu.offset().top + menu.outerHeight() - $(window).scrollTop() > $(window).height()){
 		menu.css('top', $(window).height() - menu.outerHeight())
 	}
 	if(menu.offset().left + menu.outerWidth() > $(window).width()){
 		menu.css('left', $(window).width() - menu.outerWidth())
 	}
 }

// HTML

function get_elValue(el, val){
	var v = el.css(val);
	if(v.includes('px')){ return [v.split('px')[0], 'px'] }
	if(v.includes('%')){ return [v.split('%')[0], '%'] }
	return [0, 'px']
}

function HTML_inputNumber(d, html = ''){
	[val, ext] = get_elValue(d.el, d.val);
	html += '<label>'+d.name+'</label>';
	html += '<input type="number" ';
	if(!valEmpty(d.min)){ html += 'min="'+d.min+'" ' }
	html += 'data-type="'+d.type+'" ';
	html += 'data-ext="'+ext+'" ';
	html += 'value="'+val+'">';
	if(!valEmpty(d.unit)){ html += HTML_unitSelect(ext) }
	html +=  HTML_removeStyleButton();
	return html
}

function HTML_unitSelect(v, html = ''){
	html += '<select class="unitselect" onchange="selectUnit($(this))">';
	html += '<option ';
	if(v == 'px'){ html += 'selected' }
	html += '>px</option>';
	html += '<option ';
	if(v == '%'){ html += 'selected' }
	html += '>%</option>';
	html += '</select>';
	return html
}
function selectUnit(el){ el.prev().attr('data-ext', el.val()) }

function HTML_removeStyleButton(){ return '<a class="reset_CSSvalue">' + getSVG('x') + '</a>' }
function remove_CSSvalue(el, button){
	var css = button.parent().find('[data-type]');
	el.css(css.attr('data-type'), '');
	css.val(get_elValue(el, css.attr('data-type'))[0]);
}

var HTMLeditorObj = {
	el: 'HTMLeditorAct',
	copy: 'copythisEL',
	module: 'customModuleAct',
	attr: 'data-htmleditortype'
};

