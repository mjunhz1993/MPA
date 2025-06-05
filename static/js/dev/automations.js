function openEditAutomations(module){
	hideDropdownMenu();
	var popup = createPOPUPbox();
	popup.find('.popupBox').html('<form></form>');
	var form = popup.find('form');
	displayModuleAutomations(module, form, function(){ popup.fadeIn('fast'); });

	form.on('submit', function(e){
		e.preventDefault();
		if(form.find('input[name=csrf_token]').length == 0){ form.prepend($('input[name=csrf_token]').clone()); }
		$.post('/crm/php/admin/module.php?add_module_automation=1&module=' + module, form.serialize(), function(data){
	        data = JSON.parse(data);
	        if(data.error){ createAlert(form, 'Red', data.error); }
	        else{ displayModuleAutomations(module, form); }
	    })
	});
}

function displayModuleAutomations(module, form, callback){
	$.getJSON('/crm/php/admin/module.php?get_module_automations=1&module=' + module, function(data){
        var html = '<h2>' + slovar('Automations') + '</h2>';
        if(data){
    		html += '<table class="table"><tr>';
    		html += '<th>' + slovar('Sequence') + '</th>';
    		html += '<th>' + slovar('Action') + '</th>';
    		html += '<th>' + slovar('Module') + '</th>';
    		html += '<th>' + slovar('Command') + '</th>';
    		html += '<th></th>';
    		html += '</tr>';
    		for(var i=0; i<data.length; i++){
    			var conn = data[i];
        		html += '<tr data-module="'+conn.module+'" data-action="'+conn.action+'" data-ordernum="'+conn.order_num+'">';
        		html += '<td>' + (i+1) + '</td>';
        		html += '<td>' + conn.action + '</td>';
        		html += '<td>' + conn.module + '</td>';
        		html += '<td>' + conn.command + '</td>';
        		html += '<td>';
        		html += '<span class="buttonSquare buttonBlue" onclick="editThisAutomation($(this))">'+slovar('Edit_row')+'</span>';
        		html += '<span class="buttonSquare buttonRed" onclick="deleteModuleAutomation($(this))">'+slovar('Delete')+'</span>';
        		html += '</td>';
        		html += '</tr>';
        	}
    		html += '</table>';
        }
        html += '<hr><span class="button buttonGreen">' + slovar('Add_new') + '</span>';
        html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</span>';
        form.html(html);
        form.find('.buttonGreen').click(function(){ selectAutomationAction(module, form); });
        if(typeof callback === 'function'){ callback(); }
    })
}

function editThisAutomation(el){
	let action = el.closest('tr').data('action');
	let module = el.closest('tr').data('module');
	let ordernum = el.closest('tr').data('ordernum');
	let form = el.closest('form');
	form.empty();
	loadJS(
		'dev/custom_files',
		()=>createModuleAutomation(action, module, form, ordernum)
	)
}

function selectAutomationAction(module, form){
	html = '<label>' + slovar('Action') + '</label>';
	html += '<select name="action" required>';
	html += '<option></option>';
	html += '<option value="ADD_CHECK">' + slovar('Check_add_row') + '</option>';
	html += '<option value="ADD">' + slovar('Add_row') + '</option>';
	html += '<option value="EDIT_CHECK">' + slovar('Check_edit_row') + '</option>';
	html += '<option value="EDIT">' + slovar('Edit_row') + '</option>';
	html += '<option value="DELETE">' + slovar('Delete_row') + '</option>';
	html += '</select>';
	form.html(html);
	form.find('select').change(function(){
		loadJS('dev/custom_files', ()=>createModuleAutomation($(this).val(), module, form))
	});
}

function createModuleAutomation(eventType, module, form, order_num = false){ 
	form.find('.getAutomationModuleType').remove();

	var html = '<div class="getAutomationModuleType">';

	html += '<input type="hidden" name="module" value="'+module+'">';
	if(order_num){ html += '<input type="hidden" name="order_num" value="'+order_num+'">' }

	html += '<label>' + slovar('File') + '</label>';
	html += '<select name="file" required><option value="">'+slovar('Select')+'</option></select>';
	html += '<label>' + slovar('Function') + '</label>';
	html += '<input type="text" name="function" required>';

	html += '<ul>';
	if(eventType == 'ADD_CHECK'){ html += '<li>function($SQL, $module)</li><li>ERROR = return "error msg"</li>' }
	else if(eventType == 'ADD'){ html += '<li>function($SQL, $module, $id)</li>' }
	else if(eventType == 'EDIT_CHECK'){ html += '<li>function($SQL, $module, $id)</li><li>ERROR = return "error msg"</li>' }
	else if(eventType == 'EDIT'){ html += '<li>function($SQL, $module, $id)</li>' }
	else if(eventType == 'DELETE'){ html += '<li>function($SQL, $module, $id, $rowData)</li>' }
	html += '</ul>';

	html += '<hr><button class="button buttonGreen">' + slovar('Save_changes') + '</button>';
    html += '<span class="button buttonGrey">' + slovar('Cancel') + '</span></div>';
	form.append(html);

	form.find('.buttonGrey').click(function(){ displayModuleAutomations(module, form) });

	loadCustomFiles({
		ext:'php',
		done:function(files){
			files.forEach(file => {
				form.find('[name=file]').append(`<option>${file.name}</option>`)
			});
		}
	});
}

function deleteModuleAutomation(el){
	POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
		var tr = el.closest('tr');
		var module = tr.attr('data-module');
		var order_num = tr.attr('data-ordernum');
		var form = el.closest('form');
		$.post('/crm/php/admin/module.php?delete_module_automation=1', {
			csrf_token: $('input[name=csrf_token]').val(),
			module: module,
			order_num: order_num
		}, function(data){
	        data = JSON.parse(data);
	        if(data.error){ createAlert(form, 'Red', data.error); }
	        else{ displayModuleAutomations(module, form); }
	    })
	});
}