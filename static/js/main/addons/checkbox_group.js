function ADDON_checkbox_group(module, box, type, addon, i){
    if(!['ADD','EDIT'].includes(type)){ return }
	var checkedCount = 1;
    for(var j=0; j<addon[2].split(',').length; j++){
        var thisInput = addon[2].split(',')[j];
        thisInput = box.find('[name="' + thisInput + '"]');
        thisInput.attr('data-checkboxgroup', 'checkboxgroup' + i).attr('onchange', 'checkCheckboxGroup($(this), ' + addon[1] + ')');
        if(thisInput.is(':checked')){ thisInput.attr('data-checkboxgrouphistory', checkedCount); checkedCount++; }
    }
}

function checkCheckboxGroup(el, max){
    var form = el.closest('form');
    var group = form.find('[data-checkboxgroup=' + el.attr('data-checkboxgroup') + ']');
    var groupChecked = form.find('[data-checkboxgroup=' + el.attr('data-checkboxgroup') + ']:checked');
    if(el.is(':checked')){
        el.attr('data-checkboxgrouphistory', groupChecked.length);
        if(groupChecked.length > max){
            groupChecked.each(function(){
                var checkboxgrouphistory = parseInt($(this).attr('data-checkboxgrouphistory')) - 1;
                if(checkboxgrouphistory > 0){ $(this).attr('data-checkboxgrouphistory', checkboxgrouphistory) }
                else{ $(this).attr('data-checkboxgrouphistory', '').prop('checked', false) }
            });
        }
    }
    else{
        var checkedCount = 1;
        groupChecked.each(function(){ $(this).attr('data-checkboxgrouphistory', checkedCount); checkedCount++; });
    }
}