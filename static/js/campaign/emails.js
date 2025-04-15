function campaign_openEmails(id){
	hideDropdownMenu();
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	var html = '';
	html += '<table class="tableTop"><tr><td><h2>' + slovar('Emails') + '</h2></td><td>';
	html += '<input type="text" id="emailSearch" placeholder="' + slovar('Search') + '"></td></tr></table>'
	html += '<div class="tableBox" style="max-height:300px;overflow:auto;"></div><hr>';
	html += '<button class="button buttonGreen" onclick="campaign_openAddEmail(' + id + ')">' + slovar('Add_new') + '</button>';
	html += '<button class="button buttonGrey" onclick="closePOPUPemailBox()">' + slovar('Close') + '</button>';
	popupBox.html(html);

	popupBox.find('#emailSearch').keyup(function(e){ if(e.which == 13){ campaign_loadEmails(id) } });

	campaign_loadEmailTable(id, popupBox);
	popup.fadeIn('fast');
}

function campaign_loadEmailTable(id, popupBox){
	var box = popupBox.find('.tableBox');
	var html = '<table class="table"><thead><tr>';
	html += '<th></th>';
	html += '<th class="sorted ascending" onclick="campaign_emailOrderBy(' + id + ', $(this))" data-name="email">' + slovar('Email') + '</th>';
	html += '<th onclick="campaign_emailOrderBy(' + id + ', $(this))" data-name="name">' + slovar('Name') + '</th>';
	html += '<th onclick="campaign_emailOrderBy(' + id + ', $(this))" data-name="subscribed">' + slovar('Status') + '</th>';
	html += '</tr></thead><tbody></tbody></table>';
	html += '<button class="button buttonBlue" onclick="campaign_loadMoreEmails(' + id + ', $(this))">' + slovar('Show_more') + '</button>';
	box.html(html);
	campaign_loadEmails(id);
}

function campaign_loadEmails(id, offset = 0){
	var box = $('.popup').last().find('.tableBox');
	var table = box.find('.table tbody');
	var html = '';

	var search = $('.popup').last().find('#emailSearch').val();

	var sortColumn = box.find('.sorted').first();
	var sortColumnName = sortColumn.attr('data-name');
	var sortColumnDir = 'ASC';
	if(sortColumn.hasClass('descending')){ sortColumnDir = 'DESC'; }

	if(offset == 0){ table.text(''); }

	box.append(HTML_loader());
	$.getJSON('/crm/php/campaign/campaign?get_emails=1', {
		id: id,
		search: search,
		orderBy: sortColumnName,
		orderDir: sortColumnDir,
		offset: offset
	}, function(data){
		var arrTest = [];
		if(data){for(var i=0; i<data.length; i++){
			var e = data[i], hideTR = false;
			if(arrTest.includes(e.email) || table.find('td:contains("' + e.email + '")').length != 0){ hideTR = true; }
			else{ arrTest.push(e.email); }
			if(hideTR){ html += '<tr style="display:none;">'; }else{ html += '<tr>'; }
			html += '<td>';
			if(id != 0){
				html += '<a class="linksvg" data-tooltip="' + slovar('Edit') + '" onclick="campaign_openAddEmail(' + id + ', $(this))">' + getSVG('edit') + '</a>';
			}
			html += '<a class="linksvg" data-tooltip="' + slovar('Delete') + '" onclick="campaign_deleteEmail(' + id + ', $(this))">' + getSVG('delete') + '</a>';
			html += '</td>';
			html += '<td>' + e.email + '</td><td>' + e.name + '</td><td>';
			if(e.status == 1){ html += '<b style="color:green;">' + slovar('Subscribed') + '</b>'; }
			else{ html += '<b style="color:red;">' + slovar('Unsubscribed') + '</b>'; }
			html += '</td>';
			html += '</tr>';
		}}
		table.append(html);
		remove_HTML_loader(box);
		tooltips();
	})
}

function campaign_emailOrderBy(id, el){
	el.parent().find('th').removeClass('sorted');
	el.addClass('sorted');
	if(el.hasClass('ascending')){ el.removeClass('ascending').addClass('descending') }
	else{ el.removeClass('descending').addClass('ascending') }
	campaign_loadEmails(id);
}
function campaign_loadMoreEmails(id, el){ campaign_loadEmails(id, el.parent().find('table tbody').find('tr').length); }

function campaign_openAddEmail(listID, el = ''){
	var emailPopup = createPOPUPbox();
	var popupBox = emailPopup.find('.popupBox');
	var html = '<form>';
	html += '<label for="email_email">' + slovar('Email') + '</label><input type="email" id="email_email">';
	html += '<label for="email_name">' + slovar('Name') + '</label><input type="text" id="email_name">';
	html += '<hr><button class="button buttonGreen">' + slovar('Add_new') + '</button>';
	html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</span></form>';
	popupBox.html(html);
	var form = popupBox.find('form');
	var old_email = '';

	if(el != ''){
		old_email = el.closest('tr').find('td:eq(1)').text();
		popupBox.find('#email_email').val(el.closest('tr').find('td:eq(1)').text());
		popupBox.find('#email_name').val(el.closest('tr').find('td:eq(2)').text());
	}

	form.on('submit', function(e){
		e.preventDefault();
		var email = form.find('#email_email').val();
		var name = form.find('#email_name').val();
		if(name != '' && email != ''){
			$.post('/crm/php/campaign/campaign?add_email=1', {
				csrf_token: $('input[name=csrf_token]').val(),
				campaign_list: listID,
				old_email: old_email,
				email: email,
				name: name
			}, function(data){ data = JSON.parse(data);
				if(data.error){ createAlert(popupBox, 'Red', data.error); }
				else{ removePOPUPbox(); setTimeout(function(){ campaign_loadEmails(listID); }, 500); }
			})
		}
		else{ createAlert(popupBox, 'Red', slovar('Name_empty')); }
	});

	emailPopup.fadeIn('fast');
}

function campaign_deleteEmail(listID, el){
	POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
		var popupBox = $('.popupBox').last();
		if(GLOBAL_delete.includes(user_role_id)){
			$.post('/crm/php/campaign/campaign?delete_email=1', {
				campaign_list: listID,
				email: el.closest('tr').find('td:eq(1)').text(),
				csrf_token: $('input[name=csrf_token]').val()
			}, function(data){
			    data = JSON.parse(data);
			    if(data.error){ createAlert(popupBox, 'Red', data.error); }
			    else{ campaign_loadEmails(listID); }
			})
		}
		else{ createAlert(popupBox, 'Red', slovar('Access_denied')) }
	});
}

function closePOPUPemailBox(){ removePOPUPbox(); campaign_loadTableList($('.table tbody').first()); }