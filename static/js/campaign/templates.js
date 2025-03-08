function campaign_openTemplateList(){
	hideDropdownMenu();
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	var html = '<h2>' + slovar('Templates') + '</h2><div id="templateListBox" style="max-height:300px;overflow:auto;"></div><hr>';
	html += '<button class="button buttonGreen" onclick="campaign_createTemplate()">' + slovar('Add_new') + '</button>';
	html += '<button class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</button>';
	popupBox.html(html);
	campaign_loadTemplateList();
	popup.fadeIn('fast');
}

function campaign_loadTemplateList(){
	var box = $('#templateListBox');
	if(box.length == 1){
		box.html(HTML_loader());
		$.getJSON('/crm/php/campaign/campaign.php?get_all_templates=1', function(data){
			var html = '<table class="table"><thead><tr>';
			html += '<th></th><th>ID</th><th>' + slovar('Name') + '</th>';
			html += '</tr></thead><tbody>';
			if(data){for(var i=0; i<data.length; i++){
				var t = data[i];
				html += '<tr><td>';
				html += '<a class="linksvg" data-tooltip="' + slovar('Edit') + '" onclick="campaign_editTemplate(' + t.id + ', \'' + t.name + '\')">' + getSVG('edit') + '</a>';
				html += '<a class="linksvg" data-tooltip="' + slovar('Delete') + '" onclick="campaign_deleteTemplate(' + t.id + ')">' + getSVG('delete') + '</a>';
				html += '</td><td>' + t.id + '</td><td>' + t.name + '</td></tr>';
			}}
			html += '</tbody></table>';
			box.html(html);
			tooltips();
		})
	}
}

function campaign_createTemplate(){
	removePOPUPbox();
	loadJS('campaign/emailTemplateEditor', function(){ openEmailTemplateEditor(); })
}
function campaign_editTemplate(id, name){
	removePOPUPbox();
	loadJS('campaign/emailTemplateEditor', function(){
		openEmailTemplateEditor(function(){
			$.getJSON('/crm/php/campaign/campaign.php?get_template_body=1', {id:id}, function(data){
				$('#etebodybox').html(data.body);
				$('#etesavebutton').attr('data-id', id).attr('data-name', name);
				ETE_refreshTools();
			});
		});
	})
}

function campaign_deleteTemplate(id){
	POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
		var popupBox = $('.popupBox').last();
		if(GLOBAL_delete.includes(user_role_id)){
			$.post('/crm/php/campaign/campaign.php?delete_template=1', {
				id: id,
				csrf_token: $('input[name=csrf_token]').val()
			}, function(data){
			    data = JSON.parse(data);
			    if(data.error){ createAlert(popupBox, 'Red', data.error); }
			    else{ campaign_loadTemplateList(); }
			})
		}
		else{ createAlert(popupBox, 'Red', slovar('Access_denied')) }
	});
}