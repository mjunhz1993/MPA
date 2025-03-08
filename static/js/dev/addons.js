function openEditAddons(module){
	hideDropdownMenu();
	var popup = createPOPUPbox();
	popup.find('.popupBox').html('<form></form>');
	var form = popup.find('form');
	displayModuleAddons(module, form, function(){ popup.fadeIn('fast'); });

	form.on('submit', function(e){
		e.preventDefault();
		if(form.find('input[name=csrf_token]').length == 0){ form.prepend($('input[name=csrf_token]').clone()); }
		$.post('/crm/php/admin/module.php?add_module_addon=1&module=' + module, form.serialize(), function(data){
	        data = JSON.parse(data);
	        if(data.error){ createAlert(form, 'Red', data.error); }
	        else{ displayModuleAddons(module, form); }
	    })
	});
}


function displayModuleAddons(module, form, callback){
	$.getJSON('/crm/php/admin/module.php?get_module_addons=1&module=' + module, function(data){
        var html = '<h2>' + slovar('Addons') + '</h2>';
        if(data){
        	for(var i=0; i<data.length; i++){
        		var tstamp = data[i].tstamp;
        		var addon = data[i].addon.split('|');
        		html += '<div style="display:flex;">';
        		html += '<table class="table"><tr><th>' + addon[0] + '</th>';
        		for(var j=1; j<addon.length; j++){
        			if(addon[0] == 'JSCommand' && j == 2){ html += '<td><pre><code>' + addon[j] + '</code></pre></td>'; }
        			else{ html += '<td>' + addon[j] + '</td>'; }
        		}
        		html += '</tr></table>';
        		html += '<span style="align-self:center;" data-module="' + module + '" ';
        		html += 'onclick="deleteModuleAddon($(this), ' + tstamp + ')">' + getSVG('x') + '</span>';
        		html += '</div>';
        	}
        }
        html += '<hr><span class="button buttonGreen">' + slovar('Add_new') + '</span>';
        html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</span>';
        form.html(html);
        form.find('.buttonGreen').click(function(){ createModuleAddon(module, form); });
        if(typeof callback === 'function'){ callback(); }
    })
}

function createModuleAddon(module, form){
	var html = '';
	html += '<select name="addon_type" required>';
	html += '<option value="">' + slovar('Select_addon') + '</option>';
	html += '<optgroup label="' + slovar('Copy') + '">'
	html += '<option value="copy">' + slovar('Copy_button') + '</option>';
	html += '<option value="copyDifferentModule">' + slovar('Copy_module_button') + '</option>';
	html += '<option value="FURS">' + slovar('FURS') + '</option>';
	html += '</optgroup>';
	html += '<optgroup label="' + slovar('Parent_input') + '">';
	html += '<option value="parent_filter">' + slovar('Parent_filter') + '</option>';
	html += '<option value="parent_copy">' + slovar('Parent_copy') + '</option>';
	html += '</optgroup>';
	html += '<optgroup label="' + slovar('Other') + '">';
	html += '<option value="hide_inputs">' + slovar('Hide_inputs') + '</option>';
	html += '<option value="checkbox_group">' + slovar('Checkbox_group') + ' (CHECKBOX)</option>';
	html += '<option value="varchar_multiselect">' + slovar('Varchar_multiselect') + '</option>';
	html += '<option value="select_to_progress">' + slovar('Select_to_progress') + '</option>';
	html += '<option value="add_multiple">' + slovar('add_multiple') + '</option>';
	html += '<option value="loadJS">' + slovar('loadJS') + '</option>';
	html += '<option value="JSCommand">' + slovar('JavaScript_Command') + '</option>';
	html += '</optgroup>';
	html += '</select>';
	html += '<div></div>';
	html += '<hr><button class="button buttonGreen">' + slovar('Save_changes') + '</button>';
    html += '<span class="button buttonGrey">' + slovar('Cancel') + '</span>';
	form.html(html);
	form.find('select').change(function(){ changeAddonSelect1(module, $(this)); });
	form.find('.buttonGrey').click(function(){ displayModuleAddons(module, form); });
}

function changeAddonSelect1(module, el){
	var box = el.next('div');
	var html = '';

	if(el.val() == 'copy'){ // ------------------------- COPY FROM SAME MODULE
		GET_column({
			module:module,
			showAll:true,
			done: function(data){
				html += '<label>' + slovar('Button_position') + '</label>';
		        html += '<select name="button_position">';
				var arr = [];
	        	for(var i=0; i<data.length; i++){
	        		var col = data[i];
	        		if(arr.includes(col.category)){ continue }
        			html += '<option value="' + col.category + '">' + slovar(col.category) + '</option>';
        			arr.push(col.category);
	        	}
				html += '</select>';
				html += '<label>' + slovar('Button_label') + '</label>';
				html += '<input type="text" name="button_label" required>';
				html += '<label>' + slovar('Copy_from_to') + '</label>';
				html += '<div style="display:flex;">';
				html += '<select name="from[]">';
	        	for(var i=0; i<data.length; i++){
	        		col = data[i];
	        		html += '<option value="' + col.column + '">' + slovar(col.name) + '</option>';
	        	}
	        	html += '</select>';
	        	html += '<select name="to[]">';
	        	for(var i=0; i<data.length; i++){
	        		col = data[i];
	        		html += '<option value="' + col.column + '">' + slovar(col.name) + '</option>';
	        	}
	        	html += '</select>';
	        	html += '<span style="align-self:center;" onclick="removeParentDiv($(this))">' + getSVG('x') + '</span>';
	        	html += '</div>';
	        	html += '<span class="button buttonBlue" onclick="copyBeforeDiv($(this))">' + getSVG('plus_circle') + '</span>';
		        box.html(html);
			}
		})
	}
	else if(el.val() == 'copyDifferentModule'){ // ------------------------- COPY FROM DIFFERENT MODULE
		html += '<label>' + slovar('Module') + '</label>';
		html += '<select name="from_module" onchange="getColumnsForCopy(\'' + module + '\', $(this))" required>';
		html += '<option value=""></option>';
		$('#modul_table tbody tr').each(function(){
			if($(this).attr('data-url') == '' || $(this).attr('data-url') == null){
				html += '<option value="' + $(this).attr('data-module') + '">' + slovar($(this).attr('data-name')) + '</option>';
			}
		});
		html += '</select>';
		box.html(html);
	}
	else if(el.val() == 'FURS'){ // ------------------------- COPY FROM FURS
		GET_column({
			module:module,
			showAll:true,
			done: function(data){
				html += '<label>' + slovar('Button_position') + '</label>';
		        html += '<select name="button_position">';
				var arr = [];
	        	for(var i=0; i<data.length; i++){
	        		var col = data[i];
	        		if(arr.includes(col.category)){ continue }
        			html += '<option value="' + col.category + '">' + slovar(col.category) + '</option>';
        			arr.push(col.category);
	        	}
	        	html += '</select>';
				html += '<label>' + slovar('Button_label') + '</label>';
				html += '<input type="text" name="button_label" required>';
				html += '<label>' + slovar('Copy_from_to') + '</label>';
				html += '<div style="display:flex;">';
				html += '<select name="from[]">';
	        	html += '<option value="davcna">Davčna Številka</option>';
	        	html += '<option value="placnik">Status ali je plačnik DDV (0 ali 1)</option>';
	        	html += '<option value="maticna">Matična Številka</option>';
	        	html += '<option value="naziv">Naziv podjetja</option>';
	        	html += '<option value="ulica">Ulica podjetja</option>';
	        	html += '<option value="posta">Poštna številka podjetja</option>';
	        	html += '<option value="mesto">Mesto podjetja</option>';
	        	html += '</select>';
	        	html += '<select name="to[]">';
	        	for(var i=0; i<data.length; i++){
	        		col = data[i];
	        		html += '<option value="' + col.column + '">' + slovar(col.name) + '</option>';
	        	}
	        	html += '</select>';
	        	html += '<span style="align-self:center;" onclick="removeParentDiv($(this))">' + getSVG('x') + '</span>';
	        	html += '</div>';
	        	html += '<span class="button buttonBlue" onclick="copyBeforeDiv($(this))">' + getSVG('plus_circle') + '</span>';
	        	box.html(html);
			}
		})
	}
	else if(el.val() == 'parent_filter'){ // ------------------------- PARENT INPUT FILTER
		GET_column({
			module:module,
			showAll:true,
			done: function(data){
				html += '<label>' + slovar('Select_parent_input') + '</label>';
		        html += '<select name="button_label">';
	        	for(var i=0; i<data.length; i++){
	        		var col = data[i];
	        		if(!['VARCHAR','INT','SELECT','JOIN_ADD'].includes(col.type)){ continue }
	        		html += '<option value="' + col.column + '">' + slovar(col.name) + '</option>';
	        	}
	        	html += '</select>';
				html += '<label>' + slovar('Select_child_inputs') + '</label>';
				html += '<div style="display:flex;">';
				html += '<select name="from[]" onchange="Select_child_input($(this))" required><option value=""></option>';
	        	for(var i=0; i<data.length; i++){
	        		col = data[i];
	        		if(col.type != 'JOIN_ADD'){ continue }
	        		html += '<option data-list="' + col.list + '" value="' + col.column + '">' + slovar(col.name) + '</option>';
	        	}
	        	html += '</select>';
	        	html += '<select name="to[]" required></select>';
	        	html += '<span style="align-self:center;" onclick="removeParentDiv($(this))">' + getSVG('x') + '</span>';
	        	html += '</div>';
	        	html += '<span class="button buttonBlue" onclick="copyBeforeDiv($(this))">' + getSVG('plus_circle') + '</span>';
		        box.html(html);
			}
		})
	}
	else if(el.val() == 'parent_copy'){ // ------------------------- PARENT INPUT COPY
		GET_column({
			module:module,
			showAll:true,
			done: function(data){
				html += '<label>' + slovar('Select_parent_input') + '</label>';
		        html += '<select name="button_label" onchange="getParentCopyColumns(\'' + module + '\', $(this))"><option data-list="" value=""></option>';
	        	for(var i=0; i<data.length; i++){
	        		var col = data[i];
	        		if(col.type != 'JOIN_ADD'){ continue }
	        		html += '<option data-list="' + col.list + '" value="' + col.column + '">' + slovar(col.name) + '</option>';
	        	}
	        	html += '</select>';
		        box.html(html);
			}
		})
	}
	else if(el.val() == 'hide_inputs'){ // ------------------------- HIDE INPUTS
		GET_column({
			module:module,
			showAll:true,
			done: function(data){
				html += '<label>' + slovar('Button_label') + '</label>';
				html += '<input type="text" name="button_label">';
				html += '<label>' + slovar('Select_inputs_to_hide') + '</label>';
				html += '<div style="display:flex;">';
				html += '<select name="from[]">';
	        	for(var i=0; i<data.length; i++){
	        		var col = data[i];
	        		html += '<option value="' + col.column + '">' + slovar(col.name) + '</option>';
	        	}
	        	html += '</select>';
	        	html += '<span style="align-self:center;" onclick="removeParentDiv($(this))">' + getSVG('x') + '</span>';
	        	html += '</div>';
	        	html += '<span class="button buttonBlue" onclick="copyBeforeDiv($(this))">' + getSVG('plus_circle') + '</span>';
		        box.html(html);
			}
		})
	}
	else if(el.val() == 'checkbox_group'){ // ------------------------- CHECKBOX GROUP
		GET_column({
			module:module,
			showAll:true,
			done: function(data){
				html += '<label>' + slovar('Max_checkbox_active') + '</label>';
		        html += '<input type="number" name="button_label" value="1" min="1" required>';
				html += '<label>' + slovar('Select_checkbox') + '</label>';
				html += '<div style="display:flex;">';
				html += '<select name="from[]">';
	        	for(var i=0; i<data.length; i++){
	        		var col = data[i];
	        		if(col.type != 'CHECKBOX'){ continue }
	        		html += '<option value="' + col.column + '">' + slovar(col.name) + '</option>';
	        	}
	        	html += '</select>';
	        	html += '<span style="align-self:center;" onclick="removeParentDiv($(this))">' + getSVG('x') + '</span>';
	        	html += '</div>';
	        	html += '<span class="button buttonBlue" onclick="copyBeforeDiv($(this))">' + getSVG('plus_circle') + '</span>';
		        box.html(html);
			}
		})
	}
	else if(el.val() == 'varchar_multiselect'){ // ------------------------- MULTISELECT
		GET_column({
			module:module,
			showAll:true,
			done: function(data1){
	        	var opt = '';
	        	GET_module({
	        		each: function(col){
	        			if(!['',null].includes(col.url)){ return }
			        	opt += '<option value="' + col.module + '">' + slovar(col.name) + '</option>';
	        		},
	        		done: function(data2){
	        			html += '<label>' + slovar('Select_input') + '</label>';
						html += '<select name="from_module">';
			        	for(var i=0; i<data1.length; i++){
			        		var col = data1[i];
			        		if(col.type == 'VARCHAR' && col.list == ''){
				        		html += '<option value="' + col.column + '">' + slovar(col.name) + '</option>';
				        	}
			        	}
			        	html += '</select>';
			        	html += '<label>' + slovar('Select_module') + '</label>';
						html += '<select name="button_position">' + opt + '</select>';
				        box.html(html);
	        		}
	        	})
			}
		})
	}
	else if(el.val() == 'select_to_progress'){
		GET_column({
			module:module,
			showAll:true,
			done: function(data){
				html += '<label>' + slovar('Select_input') + '</label>';
				html += '<select name="from_module">';
	        	for(var i=0; i<data.length; i++){
	        		var col = data[i];
	        		if(col.type != 'SELECT'){ continue }
		        	html += '<option value="' + col.column + '">' + slovar(col.name) + '</option>';
	        	}
	        	html += '</select>';
		        box.html(html);
			}
		})
	}
	else if(el.val() == 'add_multiple'){}
	else if(el.val() == 'loadJS'){
		html += '<label>' + slovar('Type') + '</label>';
		html += '<select name="custom_data_type" required>';
		html += '<option value="ADD">' + slovar('Add_new') + '</option>';
		html += '<option value="EDIT">' + slovar('Edit_row') + '</option>';
		html += '<option value="READ">' + slovar('View') + '</option>';
		html += '</select>';
		html += '<label>' + slovar('File') + '</label>';
		html += '<input type="text" name="custom_data" required>';
		box.html(html);
	}
	else if(el.val() == 'JSCommand'){
		html += '<label>' + slovar('Type') + '</label>';
		html += '<select name="custom_data_type" required>';
		html += '<option value="ADD">' + slovar('Add_new') + '</option>';
		html += '<option value="EDIT">' + slovar('Edit_row') + '</option>';
		html += '<option value="READ">' + slovar('View') + '</option>';
		html += '</select>';
		html += '<label>' + slovar('Custom_command') + '</label><br>';
		html += '<div class="openCodeEditor">';
		html += '<pre><code></code></pre>';
		html += '<textarea name="custom_data" style="display:none" required></textarea>';
		html += '</div><div>';
		box.html(html);
		box.find('.openCodeEditor').click(function(){
			loadJS('form/codeEditor', function(el){
				openCodeEditor({
					box: el,
					type: 'js'
				})
			}, $(this))
		})
	}
	else{ box.empty() }
}



function getColumnsForCopy(module, el){
	el.parent().find('.getcolumnsforcopy').remove();
	if(el.val() != ''){
		GET_column({
			module:el.val(),
			showAll:true,
			done: function(from){
				GET_column({
					module:module,
					showAll:true,
					done: function(to){
						var html = '<div class="getcolumnsforcopy">';
				        html += '<label>' + slovar('Button_position') + '</label>';
				        html += '<select name="button_position">';
						var arr = [];
			        	for(var i=0; i<to.length; i++){
			        		var col = to[i];
			        		if(arr.includes(col.category)){ continue }
		        			html += '<option value="' + col.category + '">' + slovar(col.category) + '</option>';
		        			arr.push(col.category);
			        	}
						html += '</select>';
						html += '<label>' + slovar('Button_label') + '</label>';
						html += '<input type="text" name="button_label" required>';
						html += '<label>' + slovar('Copy_from_to') + '</label>';
				        html += '<div style="display:flex;">';
						html += '<select name="from[]">';
						for(var i=0; i<from.length; i++){
			        		var col = from[i];
			        		html += '<option value="' + col.column + '">' + slovar(col.name) + '</option>';
			        	}
			        	html += '</select>';
			        	html += '<select name="to[]">';
			        	for(var i=0; i<to.length; i++){
			        		var col = to[i];
			        		html += '<option value="' + col.column + '">' + slovar(col.name) + '</option>';
			        	}
			        	html += '</select>';
			        	html += '<span style="align-self:center;" onclick="removeParentDiv($(this))">' + getSVG('x') + '</span>';
			        	html += '</div>';
			        	html += '<span class="button buttonBlue" onclick="copyBeforeDiv($(this))">' + getSVG('plus_circle') + '</span>';
						html += '</div>';
						el.after(html);
					}
				})
			}
		})
	}
}

function Select_child_input(el){
	if(el.val() != ''){
		var module = el.find('[value="' + el.val() + '"]').attr('data-list').split('|')[0].split(',')[1];
		GET_column({
			module:module,
			showAll:true,
			done: function(data){
				var html = '';
				for(var i=0; i<data.length; i++){
	        		var col = data[i];
	        		html += '<option value="' + col.column + '">' + slovar(col.name) + '</option>';
	        	}
	        	el.next('select').html(html);
			}
		})
	}
}

function getParentCopyColumns(module, el){
	el.parent().find('.getParentCopyColumns').remove();
	if(el.val() != ''){
		var parentModule = el.find('option:selected').attr('data-list').split('|')[0].split(',')[1];
		GET_column({
			module:module,
			showAll:true,
			done: function(from){
				GET_column({
					module:parentModule,
					showAll:true,
					done: function(to){
						var html = '<div class="getParentCopyColumns">';
						html += '<label>' + slovar('Copy_from_to') + '</label>';
				        html += '<div style="display:flex;">';
						html += '<select name="from[]">';
						for(var i=0; i<to.length; i++){
			        		var col = to[i];
			        		html += '<option value="' + col.column + '">' + slovar(col.name) + '</option>';
			        	}
			        	html += '</select>';
			        	html += '<select name="to[]">';
			        	for(var i=0; i<from.length; i++){
			        		var col = from[i];
			        		html += '<option value="' + col.column + '">' + slovar(col.name) + '</option>';
			        	}
			        	html += '</select>';
			        	html += '<span style="align-self:center;" onclick="removeParentDiv($(this))">' + getSVG('x') + '</span>';
			        	html += '</div>';
			        	html += '<span class="button buttonBlue" onclick="copyBeforeDiv($(this))">' + getSVG('plus_circle') + '</span>';
						html += '</div>';
						el.after(html);
					}
				})
			}
		})
	}
}

function getColumnsForQuickAdd(module, el){
	el.parent().find('.getColumnsForQuickAdd').remove();
	GET_column({
		module:el.val(),
		showAll:true,
		done: function(fromData){
			GET_column({
				module:module,
				showAll:true,
				done: function(toData){
					var html = '<div class="getColumnsForQuickAdd"><label>' + slovar('Module_to_module') + '</label>';
					for(var f=0; f<fromData.length; f++){
						var from = fromData[f];
						if(!from.special && !from.mandatory && from.show_in_create != 2){ continue }
						if(from.type == 'ID' || from.type == 'PASSWORD' || from.type == 'FILE'){ continue }
						html += '<div style="display:flex;">';
						html += '<select name="from[]"><option value="' + from.column + '">' + slovar(from.name) + '</option></select>';
						html += '<select name="to[]"><option value=""></option>';
			        	for(var t=0; t<toData.length; t++){
			        		var to = toData[t];
			        		if(!to.special && !to.mandatory && to.show_in_create != 2){ continue }
							if(to.type == 'ID' || to.type == 'PASSWORD' || to.type == 'FILE'){ continue }
			        		html += '<option value="' + to.column + '">' + slovar(to.name) + '</option>';
			        	}
			        	html += '</select>';
			        	html += '</div>';
			        }
			        html += '</div>';
			        el.after(html);
				}
			})
		}
	})
}

function deleteModuleAddon(el, tstamp){
	POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
		var module = el.attr('data-module');
		var form = el.closest('form');
		$.post('/crm/php/admin/module.php?delete_module_addon=1', {
			csrf_token: $('input[name=csrf_token]').val(),
			tstamp: tstamp
		}, function(data){
	        data = JSON.parse(data);
	        if(data.error){ createAlert(form, 'Red', data.error); }
	        else{ displayModuleAddons(module, form); }
	    })
	});
}