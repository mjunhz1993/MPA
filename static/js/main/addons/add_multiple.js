function ADDON_add_multiple(module, box, type, addon, i, html = ''){
    if(!['ADD'].includes(type)){ return }
    if(box.closest('.popup').length == 1){ return }
    var addBox = box.closest('#AddBoxInner');
	var form = box.closest('form');
    form.find('.buttonBlack').remove();
    form.find('.buttonSubmit').hide().attr('onclick','submitAddBoxMultipleEvent()');
    if(addBox.find('.buttonAddMultiple').length != 0){ return }
    html += '<button class="buttonSquare button100 buttonBlue buttonAddMultiple">'+getSVG('plus-circle')+' Add more</button>';
    html += '<div style="padding:5px;">';
    html += '<button class="button buttonGreen" onclick="submitAddBoxMultiple($(this))">'+slovar('Add_new')+'</button> ';
    html += '<button class="button buttonBlack" onclick="closeAddBox()">'+slovar('Cancel')+'</button>';
    html += '</div>';
    addBox.append(html);
    addBox.find('.buttonAddMultiple').click(function(){ add_new_form_into_AddBox(module) });
}

function add_new_form_into_AddBox(module){
    var form = $('#AddBox form').first();
    form.after(form.clone());
    var newForm = form.next('form');
    newForm.hide();
    loadInColumnsForAddBox(module, newForm, newForm.find('#addFormInner'), 1, function(){
        newForm.prepend('<hr>');
    });
}

function submitAddBoxMultiple(el){
    $('#AddBox form').first().find('.buttonSubmit').trigger('click');
}

function submitAddBoxMultipleEvent(){
    var form = $('#AddBox form').first();
    if(!checkHiddenRequiredFields(form)){ return }
    form.unbind('submit').on('submit', function(e){
        e.preventDefault();
        submitForm($(this), function(){ submitNextAddBoxMultiple(form) });
    });
}

function submitNextAddBoxMultiple(form){
    if($('#AddBox form').length == 1){ return tableLoad($('#main_table'), 0, function(){ closeAddBox() }) }
    form.fadeOut('fast', function(){
        form.remove();
        $('#AddBox form').first().find('.buttonSubmit').trigger('click');
    })
}