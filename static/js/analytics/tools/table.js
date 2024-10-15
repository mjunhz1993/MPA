function FORM_analytic_content_generate(pid, id){
	hideDropdownMenu();
	popup = createPOPUPbox();
	popupBox = popup.find('.popupBox');
	popupBox.css('width','90vw');
	popupBox.html(HTML_ANAL_form());

	form = popup.find('.addFormInner');
	form.append(
		'<input type="hidden" name="analytic_content_create">'+
		'<input type="hidden" name="pid" value="'+id+'">'
	);

	analytic_tables_get(function(data){
			FORM_analytic_content_TABLE(data[0], form)
	}, pid, id);

	popup.find('form').on('submit', function(e){
		e.preventDefault();
		$.post(ANALobj.post, $(this).serialize(), function(data){ data = JSON.parse(data);
			if(data.error){ return createAlertPOPUP(data.error) }
			removePOPUPbox();
			$('.'+ANALobj.box+'[data-id='+id+']').addClass('loading');
			find_loading_analytic_tables($('#anal_box'));
		},
		)
	});

	popup.find('.buttonGreen').text(slovar('Generate'));
	popup.fadeIn('fast');
}

function FORM_analytic_content_TABLE(data, form, html = ''){analytics_get_module_list(function(list){
	html = HTML_tabs({
		a: [
			{
				class: 'buttonSquare buttonGrey',
				name: 'aSelect',
				onclick: 'toggle_analytic_content_tabs($(this), \'aSelect\')'
			},
			{
				class: 'buttonSquare buttonGrey',
				name: 'aJoin',
				onclick: 'toggle_analytic_content_tabs($(this), \'aJoin\')'
			},
			{
				class: 'buttonSquare buttonGrey',
				name: 'aWhere',
				onclick: 'toggle_analytic_content_tabs($(this), \'aWhere\')'
			},
			{
				class: 'buttonSquare buttonGrey',
				name: 'aHaving',
				onclick: 'toggle_analytic_content_tabs($(this), \'aHaving\')'
			},
			{
				class: 'buttonSquare buttonGrey',
				name: 'aGroup',
				onclick: 'toggle_analytic_content_tabs($(this), \'aGroup\')'
			},
			{
				class: 'buttonSquare buttonGrey',
				name: 'aOrder',
				onclick: 'toggle_analytic_content_tabs($(this), \'aOrder\')'
			},
		]
	});
	form.append(
		createFormField({
			editable:true,
			name:'Module',
			type:'SELECT',
			column:'aFrom[module]',
			list:list,
			mandatory:true,
			width:50,
		})+
		createFormField({
			editable:true,
			name:'Module_label',
			type:'VARCHAR',
			column:'aFrom[label]',
			width:50,
		})+
		html+'<div></div>');
	form.find('.buttonGrey').first().trigger('click');

	analytic_content_get(function(cont){if(cont.pid){ edit_analytic_table_form(form, cont) }}, data.id)
})}

function toggle_analytic_content_tabs(el, name){
	el.parent().find('a').removeClass('act');
	el.addClass('act');
	box = el.parent().next();
	box.children().hide();
	if(box.find('[data-name="'+name+'"]').length == 0){ add_analytic_content_to_form(box, name) }
	box.find('[data-name="'+name+'"]').show();
}

function add_analytic_content_to_form(box, name, html = ''){
	html += '<div class="'+ANALobj.fragment+'" data-name="'+name+'" style="display:none">';
	html += '<div></div><a class="buttonSquare buttonBlue" onclick="click_button_add_fragment($(this))">'+slovar('Add_new')+'</a></div>';
	box.append(html);
}

function click_button_add_fragment(el){
	analytic_content_add_select_type(el)
}

// EDIT

function edit_analytic_table_form(form, data){loadJS('form/form', function(){
		form.find('[name="aFrom[module]"]').val(data.aFrom.module);
		form.find('[name="aFrom[label]"]').val(data.aFrom.label);

		form.find('.tabs a').each(function(){
			name = $(this).text();
			for(const [key, value] of Object.entries(eval('data.'+name))){
				toggle_analytic_content_tabs($(this), name);
				edit_analytic_table_form_tab(form, value, name);
			}
		})

		setTimeout(function(){ refreshFormData(form) }, 1000);
})}

function edit_analytic_table_form_tab(form, data, name){
	fragment = form.find('.'+ANALobj.fragment+'[data-name='+name+']');
	click_button_add_fragment(fragment.find('.buttonBlue'));

	box = fragment.find('.'+name+'box');
	boxL = box.length;
	box = box.last();

	inputType = fragment.find('input[name="'+name+'['+boxL+'][type]"]');
	inputType.val(data.type);
	analytic_content_add_type(inputType);
	box.find('input[name="'+name+'['+boxL+'][code]"]').val(data.code);
}

// COMMON

function analytic_content_add(el, name, callback){
	el.prev().append('<div class="'+name+'box"><div class="'+name+'inner"></div>'+
	HTML_ANAL_remove_analytic_content()+'</div>');
	callback(el.prev().find('.'+name+'box').last(), analytics_get_content_count(el,name));
}

function analytic_content_add_select_type(el, list = []){
	name = el.parent().data('name');
	list.push('custom,Custom');
	analytic_content_add(el, name, function(el, count){
		el.prepend(createFormField({
			editable:true,
			name:'Type',
			type:'SELECT',
			column:name+'['+count+'][type]',
			list:list.join('|'),
			callback:'analytic_content_add_type(input)',
			mandatory:true,
		}))
	})
}

function analytic_content_add_type(el){
	id = el.attr('name').split('[')[1].split(']')[0];
	name = el.closest('.'+ANALobj.fragment).data('name');
	box = el.closest('.formField').next();
	return analytic_content_add_type_custom(box, name, id)
}

function analytics_get_module_list(callback){loadJS('GET/module', function(){
	GET_module({
		done:function(data, arr = []){
			for(i=0; i<data.length; i++){
				d = data[i];
				if(
					d.active == 0 ||
					!d.can_view.includes(user_role_id) ||
					!valEmpty(d.url)
				){ continue }
				arr.push(d.module+','+d.name);
			}
			callback(arr.join('|'));
		}
	})
})}

function analytics_get_content_count(el, name){
	id = el.closest('form').find('.'+name+'box');
	id = id.find('input').last();
	if(id.length != 0){ id = parseInt(id.attr('name').split('[')[1].split(']')[0]) + 1 }
	else{ id = el.closest('form').find('.'+name+'box').length }
	return id
}

function analytic_content_add_type_column(el, name, id, loop = 1, callback, html = ''){
	analytics_get_module_list(function(list){
		colArr = '[]';
		if(loop == 1){ colArr = '' }
		for(i=0; i<loop; i++){
			html += createFormField({
				editable:true,
				name:'Module',
				type:'SELECT',
				column:name+'['+id+'][module]'+colArr,
				list:list,
				callback:'analytics_module_select(input)',
				mandatory:true,
				width:25,
			})+
			createFormField({
				editable:true,
				name:'Column',
				type:'SELECT',
				column:name+'['+id+'][column]'+colArr,
				list:'',
				mandatory:true,
				width:25,
			})+
			createFormField({
				editable:true,
				name:'Name',
				type:'VARCHAR',
				column:name+'['+id+'][name]'+colArr,
				width:25,
			})+
			createFormField({
				editable:true,
				name:'Module_label',
				type:'VARCHAR',
				column:name+'['+id+'][label]'+colArr,
				width:25,
			})
		}
		el.html(html);
		if(callback){ callback() }
	})
}

function analytics_module_select(el, callback = false, arr = []){
	box = el.closest('.formField').next().find('.selectMenu');
	if(box.length == 0){ return }
	GET_column({
		module:el.val(),
		done:function(data){
			for(i=0; i<data.length; i++){
				d = data[i];
				arr.push(d.column+','+d.name);
			}
			box.attr('data-list', arr.join('|'));
			box.find('input').val('');
			box.find('.DropdownMenuContent').remove();
			selectMenuRefreshPlaceholder(box.find('input'));
			if(callback){ callback() }
		}
	})
}

function analytic_content_add_type_custom(el, name, id){
	el.html(createFormField({
		editable:true,
		name:'Custom_code',
		type:'VARCHAR',
		column:name+'['+id+'][code]',
		mandatory:true,
	}))
}

function HTML_ANAL_remove_analytic_content(){ return '<a onclick="remove_analytic_content($(this))">'+getSVG('delete')+'</a>' }
function remove_analytic_content(el){ el.parent().remove() }