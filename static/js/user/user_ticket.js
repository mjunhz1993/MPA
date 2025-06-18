function showUserConfig_ticket(box){
	box.html(`
	<form>
		<div class="msg"></div>
		<input type="hidden" name="send_ticket">
		${createFormField({
			editable:true,
			category: 'help',
			order_num: 1,
			type:'VARCHAR',
			name: 'Subject',
			column: 'title',
			length: 255,
			mandatory: true,
		})}

		${createFormField({
			editable:true,
			category: 'help',
			order_num: 2,
			type:'TEXTAREA',
			name: 'Description',
			column: 'desc',
			mandatory: true,
		})}

		<button class="button buttonGreen">${slovar('Send')}</button>
	</form>
	`);
	let form = box.find('form');

	loadJS('form/cleditor', function(){ checkForTextAreaInputs(box) });
	form.find('.buttonGreen').css({
		position: 'sticky',
		bottom: 0
	});

	focusInput(form);
	createAlert(form.find('.msg'), 'Green', slovar('Ticket_msg'));

	form.on('submit', function(e){
		e.preventDefault();
		form.find('.buttonGreen').hide();
		$.post('/crm/php/API/ticket', form.serialize(), function(data){
			data = JSON.parse(data);
			form.find('.buttonGreen').show();
			if(data.error){ return createAlertPOPUP(slovar(data.error)); }
			removePOPUPbox();
			HTML_loader(slovar('Sending_ticket'), {popup:true});
			setTimeout(function(){ removePOPUPbox() }, 2000);
		})
	})
}