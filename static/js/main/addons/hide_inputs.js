function ADDON_hide_inputs(module, box, type, addon, i, html = ''){
    if(!['ADD','EDIT'].includes(type)){ return }
	for(var j=0; j<addon[2].split(',').length; j++){
        var thisInput = addon[2].split(',')[j];
        thisInput = box.find('[name="' + thisInput + '"]');
        if(type == 'ADD' || (type == 'EDIT' && addon[1] == ''))
        { thisInput.closest('.formField').addClass('hiddenUntilButtonShowEvent' + i).hide(); }
    }
    if(type == 'ADD' && addon[1] != ''){
        html += '<b class="button button100 buttonBlue" onclick="showFirstHiddenInput($(this), ' + i + ')">' + slovar(addon[1]) + '</b>';
        box.find('.hiddenUntilButtonShowEvent' + i).first().after(html);
    }
}

function showFirstHiddenInput(el, i){
    var form = el.closest('form');
    form.find('.hiddenUntilButtonShowEvent' + i).first().removeClass('hiddenUntilButtonShowEvent' + i).show();
    if(form.find('.hiddenUntilButtonShowEvent' + i).length != 0){ form.find('.hiddenUntilButtonShowEvent' + i).first().after(el); }
    else{ el.remove(); }
}