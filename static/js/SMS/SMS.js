function write_SMS(to, html = ''){loadJS('SMS/slovar/'+slovar(), function(){
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	html += '<form><h2>' + slovar('Send_SMS') + '</h2><div></div>';
	html += createFormField({
		editable:true,
		name:'Phone_number',
		type:'VARCHAR',
		list:'PHONE',
		column:'to',
		mandatory:true,
		preselected_option:to
	});
	html += createFormField({
		editable:true,
		name:'Text',
		type:'VARCHAR',
		column:'text',
		mandatory:true
	});
	html += '<hr><button class="button buttonGreen">' + slovar('Send') + '</button>';
	html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span>';
	html += '</form>';
	popupBox.html(html);

	popupBox.find('form').on('submit', function(e){
		var form = $(this);
		form.hide().parent().append(HTML_loader());
		e.preventDefault();
		send_SMS({
			to:form.find('[name=to]').val(),
			text:form.find('[name=text]').val(),
			done:function(){ removePOPUPbox() },
			error:function(err){
				remove_HTML_loader(form.parent());
				createAlert(form, 'Red', err);
				form.show();
			}
		})
	})

	popup.fadeIn('fast');
})}

function send_SMS(d){
	if($('[name=csrf_token]').length == 0){ return }
	$.post('/crm/php/SMS/SMS.php?send_SMS=1', {
		csrf_token:$('[name=csrf_token]').val(),
		to:d.to,
		text:d.text
	}, function(data){
		data = JSON.parse(data);
		if(d.error && data.RestException){ return d.error(data.RestException.Message) }
		if(d.done){ return d.done() }
	})
}