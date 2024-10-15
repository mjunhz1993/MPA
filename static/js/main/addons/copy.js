function ADDON_copy(module, box, type, addon, i, html = ''){
    if(!['ADD','EDIT'].includes(type)){ return }
    var copy = addon[3];
    var clickEvent = 'copyFromFormInput($(this))';
    var label = addon[2];
    var group = addon[1];
    html += '<b class="button buttonBlue" data-copy="' + copy + '" onclick="' + clickEvent + '">' + slovar(label) + '</b>';

    if(box.find('legend[data-group="' + group + '"]').parent().find('.addonButtonBox').length == 0){
        box.find('legend[data-group="' + group + '"]').after('<div class="addonButtonBox" data-group="' + group + '"></div>');
    }
    
    box.find('.addonButtonBox[data-group="' + group + '"]').append(html);
}

function copyFromFormInput(el){
    var box = el.closest('form');
    var arr = el.attr('data-copy').split(',');
    for(var i=0; i<arr.length; i += 2){
        var from = arr[i];
        var to = arr[i+1];
        var inputTo = box.find('[name="' + to + '"]');
        var inputFrom = box.find('[name="' + from + '"]');
        inputTo.val(inputFrom.val());
    }
    refreshFormData(box);
}