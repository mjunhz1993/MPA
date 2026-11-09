function list_show(el, module, d = []){
	loadCSS('list');

	d.popup = createPOPUPbox();
	d.popupBox = d.popup.find('.popupBox');
	d.module = module;
	d.placeholder = el.closest('.formField').find('.inputPlaceholder');
	d.input = el.closest('.formField').find('.listInput');

	d.input.blur();

	d.popupBox.html(list_HTML());
	d.search = d.popupBox.find('input');
	d.box = d.popupBox.find('.rowBox');

	d.popup.data('value', d.input.val().split(','));

	d.popup.find('form').on('submit', function(e){
		e.preventDefault();
		list_get_rows(d);
	})

	d.popup.find('.buttonBlue').click(function(){ list_save(d) })
	if (d.input.prop('disabled')){
		d.popup
		.data('disabled', true)
		.find('.buttonBlue').remove()
	}

	GET_module({
		module:module,
		done:function(m){
			if(m.error){
				removePOPUPbox();
				return createAlertPOPUP(m.error)
			}
			d.popup.fadeIn('fast', function(){
				d.search.focus();
				list_get_rows(d);
			})
		}
	})
}

// EVENTS

function list_get_rows(d){
	GET_row({
		module:d.module,
		dropdownMenu:true,
		dropdownMenu_search_value:d.search.val(),
		done:function(rows){
			d.box.empty();
      		rows.forEach(r=>{ d.box.append(list_row_HTML(d, r)) })

      		if(d.popup.data('disabled') == true){ return }
      		d.box.find('.row').click(function(){ list_toggle_row(d, $(this)) })
		}
	});
}

function list_toggle_row(d, el) {
    let val = d.popup.data('value').filter(Boolean);
    let id = String(el.data('id'));

    if (el.hasClass('active')) {
        el.removeClass('active');
        val = val.filter(v => v !== id);
    }
    else {
        el.addClass('active');

        if (!val.includes(id)) {
            val.push(id);
        }
    }

    d.popup.data('value', val);
}

function list_save(d){
	d.input.val(d.popup.data('value'));
	list_refreshAllFormData(d.input.parent());
	removePOPUPbox();
}

function list_refreshAllFormData(form){
	form.find('.listInput').each(function(){
		let placeholder = $(this).closest('.formField').find('.inputPlaceholder');
		if($(this).val() != ''){
			placeholder.text(`${slovar('Accepted')} - ${$(this).val().split(',').length}`)
		} else {
			placeholder.text(slovar('Select'));
		}
	})
}

function list_readOnly(module, v){
	$('body').append(`
	<div id="listreadonly" class="formField">
		<input class="listInput" value="${v}" disabled>
	</div>
	`);
	let tempBox = $('#listreadonly');
	list_show(tempBox.find('input'), module);
	tempBox.remove();
}

// HTML

function list_HTML(){
	return `
		<form id="list">
			<input type="text" placeholder="${slovar('Search')}">
			<div class="rowBox"></div>
			<div class="button buttonBlue" >${slovar('Save_changes')}</div>
			<div class="button buttonGrey" onclick="removePOPUPbox()">${slovar('Cancel')}</div>
		</form>
	`
}

function list_row_HTML(d, r) {
    return `
        <div data-id="${r[0]}" class="row ${d.popup.data('value').includes(String(r[0])) ? 'active' : ''}">
            ${r[1]}
        </div>
    `;
}