function ADDON_parent_filter(module, box, type, addon, i){
    if(!['ADD','EDIT'].includes(type)){ return }
    add_clearChildEventToParent(box, addon)
	for(var j=0; j<addon[2].split(',').length; j += 2){
        var thisInput = box.find('[name="' + addon[2].split(',')[j] + '"]');
        var thisCol = addon[2].split(',')[j + 1];
        if(thisInput.attr('data-parentinput') != undefined){
            var thisAttr = thisInput.attr('data-parentinput');
            thisInput.attr('data-parentinput', thisAttr + '|' + addon[1] + ',' + thisCol);
        }
        else{ thisInput.attr('data-parentinput', addon[1] + ',' + thisCol); }
    }
}

function add_clearChildEventToParent(box, addon){
    var input = box.find('[name="' + addon[1] + '"]');
    var el = input.closest('.formField');
    var type = el.attr('data-type');
    if(['VARCHAR','INT'].includes(type)){input.change(function(){ return clearChildInput(box, addon[2]) })}
    if(['SELECT', 'JOIN_ADD'].includes(type)){el.find('.inputPlaceholder').mouseup(function(){ return clearChildInput(box, addon[2]) })}
}

function clearChildInput(box, allEl){
    el = allEl.split(',');  
    for(var j=0; j<el.length; j += 2){
        var thisInput = box.find('[name="' + el[j] + '"]');
        thisInput.val('');
        box.find('.JOIN_ADD_placeholder').text(slovar('Search'));
        // focusOutJOIN_ADDInput(thisInput);
    }
}