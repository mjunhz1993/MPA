function showUserConfig_ticket(box){
	box.html(`
	<form>
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

	loadJS('form/cleditor', function(){ checkForTextAreaInputs(box) });

	focusInput(box.find('form'));

	box.find('form').on('submit', function(e){
		e.preventDefault();
		let form = $(this);
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