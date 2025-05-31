var GLOBAL_view, GLOBAL_edit, GLOBAL_delete;

function campaign_checkEnvironment(mainBox){
	loadCSS('campaign');
	loadJS('campaign/slovar/' + slovar(), function(){
		GET_module({
			module:'campaign',
			done: function(data){
				if(data.active){
	        		GLOBAL_view = data.can_view;
		        	GLOBAL_edit = data.can_edit;
		        	GLOBAL_delete = data.can_delete;
	        		if(data.can_view.includes(user_role_id)){
	        			$.get('/crm/php/campaign/campaign?check_environment=1', function(){
			        		campaign_createEnvironment(mainBox, data);
			        	})
			        }
				}
			}
		})
	})
}

function campaign_createEnvironment(mainBox, data){
	var html = '<h1>' + slovar(data.name) + '</h1>';
	html += '<div class="box col100"><div class="boxInner"></div></div>';
	mainBox.html(html);
	var box = mainBox.find('.boxInner');
	html = '<table class="tableTop"><tr><td>';
	html += '<div class="button buttonGreen" onclick="showDropdownMenu($(this), true)">' + slovar('Add_new');
	html += '<div class="DropdownMenuContent">';
	html += '<a onclick="loadJS(\'campaign/templates\', function(){ campaign_openTemplateList() })">' + slovar('Campaign_template') + '</a>';
	html += '<a onclick="loadJS(\'campaign/events\', function(){ campaign_createEvent() })">' + slovar('Campaign_event') + '</a>';
	html += '<hr>';
	html += '<a onclick="campaign_openAddEmailList()">' + slovar('Email_list') + '</a>';
	html += '</div></div>';
	html += '</td><td>';
	html += '<div class="button buttonBlue" onclick="showDropdownMenu($(this), true)">' + slovar('Show_more_options');
	html += '<div class="DropdownMenuContent">';
	html += '<a onclick="loadJS(\'campaign/emails\', function(){ campaign_openEmails(0) })">' + slovar('Unsubscribed_list') + '</a>';
	html += '<a onclick="loadJS(\'campaign/events\', function(){ campaign_openEvents() })">' + slovar('Scheduled_events') + '</a>';
	if(user_id == 1){
		html += '<hr><a data-stats="';
		if(data.accessories.includes('STATS')){ html += 'show'; }else{ html += 'hide'; }
		html += '" onclick="toggle_stats($(this))">'
		if(data.accessories.includes('STATS')){ html += getSVG('check') }
		html += slovar('Toggle_stats') + '</a>';
	}
	html += '</div></div>';
	html += '</td></tr></table><hr>';
	box.before(html);
	if(data.accessories.includes('STATS')){ box.html('<div id="stats"></div>'); }
	campaign_createTable(box);
}

function toggle_stats(el){
	if(el.attr('data-stats') == 'show'){ el.attr('data-stats','hide') }else{ el.attr('data-stats','show') }
	$.get('/crm/php/campaign/stats', { toggle_stats:el.attr('data-stats') }, function(data){ location.reload() })
}

function campaign_createTable(box){
	var html = '';
	html += '<h2>' + slovar('Email_list') + '</h2><div class="horizontalTable">';
	html += '<table class="table"><thead><tr><th></th>';
	html += '<th>' + slovar('Name') + '</th>';
	html += '<th>' + slovar('Emails') + '</th>';
	html += '</tr></thead><tbody></tbody></table>';
	html += '</div>';
	box.append(html);
	campaign_loadTableList(box.find('tbody'), function(){
		if($('#stats').length == 1){ loadJS('campaign/stats', function(){ stats_load($('#stats')); }); }
	});
}

function campaign_loadTableList(tbody, callback){
	$.getJSON('/crm/php/campaign/campaign?get_all_lists=1', function(data){
		campaign_displayTableList(tbody, data);
		if(typeof callback === 'function'){ callback(); }
	})
}

function campaign_displayTableList(tbody, data){
	if(data){
		var html = '';
		for(var i=0; i<data.length; i++){
			html += '<tr data-id="' + data[i].id + '">' + campaign_displayTableListTools(data[i].id);
			html += '<td>' + data[i].name + '</td>';
			html += '<td>' + data[i].subscribed + '</td>';
			html += '</tr>';
		}
		tbody.html(html);
	}
	resetDropdownMenuConfig();
}

function campaign_displayTableListTools(id){
	var html = '<td>';
	html += '<div class="linksvg" onclick="showDropdownMenu($(this), true)">' + getSVG('edit');
	html += '<div class="DropdownMenuContent">';
	html += '<a onclick="campaign_openAddEmailList(' + id + ')">' + slovar('Edit_list') + '</a>';
	html += '<a onclick="loadJS(\'campaign/emails\', function(){ campaign_openEmails(' + id + ') })">' + slovar('Edit_emails') + '</a>';
	html += '</div>';
	html += '</div>'; 
	html += '<a onclick="campaign_deleteEmailList(' + id + ')" class="linksvg">' + getSVG('delete') + '</a>'; 
	html += '</td>';
	return html;
}

function campaign_openAddEmailList(id = ''){
	hideDropdownMenu();
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	var html = '<form><label for="list_name">' + slovar('Name') + '</label><input type="text" id="list_name"><hr>';
	html += '<button class="button buttonGreen">' + slovar('Add_new') + '</button>';
	html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</span></form>';
	popupBox.html(html);
	var form = popupBox.find('form');

	if(id != ''){ popupBox.find('#list_name').val($('.table tr[data-id="' + id + '"] td:eq(1)').text()); }

	form.on('submit', function(e){
		e.preventDefault();
		var name = form.find('#list_name').val();
		if(name != ''){
			$.post('/crm/php/campaign/campaign?add_email_list=1', {
				csrf_token: $('input[name=csrf_token]').val(),
				id:id,
				name: form.find('#list_name').val()
			}, function(data){ data = JSON.parse(data);
				if(data.error){ createAlert(popupBox, 'Red', data.error); }
				else{ removePOPUPbox(); campaign_loadTableList($('.table tbody')); }
			})
		}
		else{ createAlert(popupBox, 'Red', slovar('Name_empty')); }
	});

	popup.fadeIn('fast');
}

function campaign_deleteEmailList(id){
	POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
		var box = $('.horizontalTable');
		if(GLOBAL_delete.includes(user_role_id)){
			$.post('/crm/php/campaign/campaign?delete_email_list=1', {
				id: id,
				csrf_token: $('input[name=csrf_token]').val()
			}, function(data){
			    data = JSON.parse(data);
			    if(data.error){ createAlert(box, 'Red', data.error) }
			    else{ campaign_loadTableList($('.table tbody')); }
			})
		}
		else{ createAlert(box, 'Red', slovar('Access_denied')) }
	});
}

$(document).ready(function(){ campaign_checkEnvironment($('#Main')); });