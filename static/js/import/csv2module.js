function csv2module(d = {}){
	popup = createPOPUPbox();
	popupBox = popup.find('.popupBox');

	GET_column({
		module: d.module,
		done: function(c){
			popupBox.html(HTML_csv2module(d, c));
			popupBox
			.find('[name="csv_file[]"]')
			.attr('accept','.csv');
			submit_csv2module(popup.find('form'));
		}
	})

	popup.fadeIn('fast');
}

function HTML_csv2module(d, c){
	return `
		<form>
			<h2>Import CSV</h2>
			<input type="hidden" name="table" value="${d.module ?? ''}">

			${createFormField({
				editable: true,
				type: 'CHECKBOX',
				name: 'Skip header row',
				column: 'skip',
				order_num: 99
			})}

			<label>Table columns</label>
			<div class="clonediv" style="display:flex;align-items:center;">
				<select type="text" name="columns[]">
					${c.map(c =>`<option value="${c.column}">${c.name}</option>`).join("")}
				</select>
				<div class="buttonSquare buttonRed" onclick="removethisrow($(this))">X</div>
			</div>
			<div class="button buttonBlue" onclick="addinputtop($(this))">${slovar('Add_new')}</div>
			<hr>

			${createFormField({
				editable: true,
				type: 'FILE',
				name: 'CSV file',
				column: 'csv_file',
				list: 'ALL,1'
			})}

			<hr>
			<button class="button buttonGreen">${slovar('Import')}</button>
			<div class="button buttonGrey" onclick="removePOPUPbox()">${slovar('Close')}</div>
		</form>
	`;
}

function submit_csv2module(form){
	form.on('submit', function(e){
		e.preventDefault();

		var formData = new FormData(form[0]);
	    return $.ajax({ 
	        url: '/crm/php/import/run?csv_to_sql', 
	        type: 'post', data: formData, contentType: false, processData: false,
	        success: function(data){ success_csv2module(form, JSON.parse(data)) }
	    }).fail(function(data){ console.log(data) });
	})
}

function success_csv2module(form, data){
	if(data.error){ return createAlertPOPUP(data.error) }
	tableLoad($('#main_table'));
	removePOPUPbox();
}

function addinputtop(el){
	el.before(el.prev().clone())
}
function removethisrow(el){
	if(el.closest('form').find('.clonediv').length <= 1){ return }
	el.parent().remove();
}