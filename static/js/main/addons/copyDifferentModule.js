function ADDON_copyDifferentModule(module, box, type, addon, i, html = ''){
    if(!['ADD','EDIT'].includes(type)){ return }
	var copy = addon[4];
	var clickEvent = 'openCopyFromDifferentModule(\'' + addon[1] + '\', $(this))';
    var label = addon[3];
    var group = addon[2];
    html += '<b class="button buttonBlue" data-copy="' + copy + '" onclick="' + clickEvent + '">' + slovar(label) + '</b>';

    if(box.find('legend[data-group="' + group + '"]').parent().find('.addonButtonBox').length == 0){
        box.find('legend[data-group="' + group + '"]').after('<div class="addonButtonBox" data-group="' + group + '"></div>');
    }
    
    box.find('.addonButtonBox[data-group="' + group + '"]').append(html);
}

function openCopyFromDifferentModule(module, el){
    var list = ',' + module + ',' + module + '_id';
    var popup = createPOPUPbox();
    var popupBox = popup.find('.popupBox');
    var html = '<form>';
    html += '<input type="text" ';
    html += 'data-list="' + list + '" onfocusout="focusOutJOIN_ADDInput($(this))" ';
    html += 'autocomplete="off" style="display:none;" placeholder="' + slovar('Search') + '" required>';
    html += '<div class="inputPlaceholder JOIN_ADD_placeholder" data-list="' + list + '" onclick="focusJOIN_ADDInput($(this))">' + slovar('Search') + '</div>';
    html += '<hr><button class="button buttonBlue">' + slovar('Ok') + '</button>';
    html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span></form>';
    popupBox.html(html);
    popupBox.find('form').on('submit', function(e){
        e.preventDefault();
        copyFromDifferentModule(module, el, $(this));
    });
    popup.fadeIn('fast');
}

function copyFromDifferentModule(module, el, popupEl){
    var popupBox = popupEl.closest('.popupBox');
    var id = popupBox.find('input').val();
    var box = el.closest('form');
    var arr = el.attr('data-copy').split(',');
    GET_row({
        module:module,
        id:id,
        done: function(data){
            for(var i=0; i<arr.length; i += 2){
                var from = arr[i];
                var to = arr[i+1];
                var inputTo = box.find('[name="' + to + '"]');
                var formFieldTo = inputTo.closest('.formField');
                var typeTo = formFieldTo.attr('data-type');
                inputTo.val(data[from]);
            }
            refreshFormData(box);
            removePOPUPbox();
        }
    })
}