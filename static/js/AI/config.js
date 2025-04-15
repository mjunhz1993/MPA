function open_AI_config(){
	popup = createPOPUPbox();
	popupBox = popup.find('.popupBox');
	popupBox.html(HTML_loader());
	popup.fadeIn('fast');
	$.getJSON('/crm/php/AI/AI_config', {
		check_for_AI_table:true
	}, function(data){
		if(data.error){ removePOPUPbox(); return createAlertPOPUP(data.error) }
		popupBox.html(`
			<div class="AI_models horizontalTable"></div>
			<hr>
			<button class="button buttonGreen" onclick="add_AI_model($(this))">Add AI model</button>
			<button class="button buttonGrey" onclick="removePOPUPbox()">Close</button>
		`);
		load_AI_models(popupBox.find('.AI_models'));
	})
}

function load_AI_models(box){
	$.getJSON('/crm/php/AI/AI_config', {
		load_AI_models: true
	}, function(data){
		if(data.error){ return createAlertPOPUP(data.error) }
		display_AI_models(box, data);
	})
}

function display_AI_models(box, data, html = ''){
	data.forEach(ai => {
		html += `
			<tr>
				<td>${ai.name}</td>
				<td>
					<button class="buttonSquare buttonBlue" onclick="add_AI_model($(this), ${ai.id})">Update</button>
					<button class="buttonSquare buttonRed" onclick="delete_AI_model($(this), ${ai.id})">Delete</button>
				</td>
			</tr>
		`
	})
	box.html(`
		<table class="table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Tools</th>
				</tr>
			</thead>
			<tbody>${html}</tbody>
		</table>
	`);
}

function add_AI_model(el, id = false){
	GET_users({
		done:function(data){
			popup = createPOPUPbox();
			popupBox = popup.find('.popupBox');
			popupBox.html(`
			<form>
				${add_id_input(id)}
				<label>Name</label>
				<input type="text" name="name" required>
				${HTML_share_AI_users(data)}
				<label>instructions</label><br>
				<textarea
				name="instructions"
				style="min-width:500px;min-height:175px;"
				></textarea>
				<hr>
				<button class="button buttonGreen">${slovar('Add_new')}</button>
				<span class="button buttonGrey" onclick="removePOPUPbox()">Close</span>
			</form>
			`)

			if(id){ add_data_to_form(popupBox.find('form'), id) }

			popupBox.find('form').on('submit', function(e){
				e.preventDefault();
				save_AI_model(el, $(this));
			})

			popup.fadeIn('fast');
		}
	})
}
function add_id_input(id){
	if(!id){ return '' }
	return `<input type="hidden" name="id" value="${id}">`
}
function HTML_share_AI_users(data, html = ''){
    html += '<label>'+slovar('Share')+'</label>';
    html += '<div class="analshare">';
    for(var i=0; i<data.length; i++){
        html += checkboxInput({
            name:'share[]',
            value:data[i].user_id,
            id:'share'+data[i].user_id,
            label:data[i].user_username,
        })
    }
    html += '</div>';
    return html;
}
function add_data_to_form(form, id){
	$.getJSON('/crm/php/AI/AI_config', {
		load_AI_models: true,
		id:id
	}, function(data){
		data = data[0];
		form.find('[name=name]').val(data.name);
		form.find('[name=instructions]').val(data.instructions);
		data.share.forEach(s => { form.find('#share'+s).prop('checked', true) })
	})
}
function save_AI_model(el, form){
	$.post('/crm/php/AI/AI_config?save_AI_model', form.serialize(), function(data){
		data = JSON.parse(data);
		if(data.error){ return createAlertPOPUP(data.error) }
		removePOPUPbox();
		load_AI_models(el.closest('.popupBox').find('.AI_models'));
	})
}

function delete_AI_model(el, id){POPUPconfirm('Delete this AI ?','', function(){
	$.getJSON('/crm/php/AI/AI_config', {
		delete_AI_model:id
	}, function(data){
		if(data.error){ return createAlertPOPUP(data.error) }
		load_AI_models(el.closest('.popupBox').find('.AI_models'));
	})
})}