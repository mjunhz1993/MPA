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
        		html += '<tr data-module="' + conn.module + '" data-ordernum="' + conn.order_num + '">';
        		html += '<td>' + (i+1) + '</td>';
        		html += '<td>' + conn.action + '</td>';
        		html += '<td>' + conn.module + '</td>';
        		html += '<td><pre><code>' + conn.command + '</code></pre></td>';
        		html += '<td><span onclick="deleteModuleAutomation($(this))">' + getSVG('x') + '</span></td>';
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

function selectAutomationAction(module, form){
	html += '<label>' + slovar('Action') + '</label>';
	html = '<select name="action" required>';
	html += '<option></option>';
	html += '<option value="ADD_CHECK">' + slovar('Check_add_row') + '</option>';
	html += '<option value="ADD">' + slovar('Add_row') + '</option>';
	html += '<option value="EDIT_CHECK">' + slovar('Check_edit_row') + '</option>';
	html += '<option value="EDIT">' + slovar('Edit_row') + '</option>';
	html += '<option value="DELETE">' + slovar('Delete_row') + '</option>';
	html += '</select>';
	form.html(html);
	form.find('select').change(function(){ createModuleAutomation($(this), module, form); });
}

function createModuleAutomation(el, module, form){
	var eventType = el.val();
	form.find('.getAutomationModuleType').remove();
	GET_column({
		module:module,
		showAll:true,
		done: function(data){
			var html = '<div class="getAutomationModuleType">';

			html += '<input type="hidden" name="module" value="' + module + '">';

			html += '<label>' + slovar('Custom_command') + '</label><br>';
			html += '<div class="openCodeEditor">';
			html += '<pre><code></code></pre>';
			html += '<textarea name="command" style="display:none" required></textarea>';
			html += '</div><div>';
			html += '<ul>';
			if(['ADD_CHECK','EDIT_CHECK'].includes(eventType)){
				html += '<li>return \'\' - success</li>';
				html += '<li>return \'some text\' - fail + error message</li>';
			}
			else if(eventType == 'ADD'){ html += '<li><b>$newRowID</b> - ID of user added row</li>' }
			else if(eventType == 'EDIT'){ html += '<li><b>$EditedRowID</b> - ID of user edited row</li>' }
			else if(eventType == 'DELETE'){ html += '<li><b>$DeletedRowID</b> - ID or IDs of user deleted row</li>' }
			html += '</ul>';
			html += '</div>';

			html += '<hr><button class="button buttonGreen">' + slovar('Save_changes') + '</button>';
		    html += '<span class="button buttonGrey">' + slovar('Cancel') + '</span></div>';
			form.append(html);

			form.find('.openCodeEditor').click(function(){
				loadJS('form/codeEditor', function(el){
					openCodeEditor({
						box: el,
						type: 'php'
					}) 
				}, $(this))
			});

			form.find('.buttonGrey').click(function(){ displayModuleAutomations(module, form); });
		}
	})
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