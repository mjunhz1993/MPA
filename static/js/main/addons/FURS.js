function ADDON_FURS(module, box, type, addon, i, html = ''){
    if(!['ADD','EDIT'].includes(type)){ return }
	var copy = addon[3];
    var clickEvent = 'openCopyFromFURS($(this))';
    var label = addon[2];
    var group = addon[1];
    html += '<b class="button buttonBlue" data-copy="'+copy+'" onclick="'+clickEvent+'">'+slovar(label)+'</b>';
    if(box.find('legend[data-group="'+group+'"]').parent().find('.addonButtonBox').length == 0){
        box.find('legend[data-group="'+group+'"]').after('<div class="addonButtonBox" data-group="'+group+'"></div>');
    }
    box.find('.addonButtonBox[data-group="'+group+'"]').append(html);
}

function openCopyFromFURS(el, html = ''){
    var popup = createPOPUPbox();
    var popupBox = popup.find('.popupBox');
    html += '<div class="toggleDiv"><div class="horizontalTable"><table class="table"><thead><tr>';
    html += '<th class="no-sort">' + slovar('Company') + '</th>';
    html += '<th class="no-sort">' + slovar('Street') + '</th>';
    html += '<th class="no-sort">' + slovar('Postal') + '</th>';
    html += '<th class="no-sort">' + slovar('City') + '</th>';
    html += '<th class="no-sort">' + slovar('Tax_number') + '</th>';
    html += '<th class="no-sort">' + slovar('Registration_number') + '</th>';
    html += '<th class="no-sort">' + slovar('Taxpayer') + '</th>';
    html += '</tr></thead><tbody></tbody></table></div><hr>';
    html += '<input type="text" placeholder="' + slovar('Search') + '"  style="width:100%;box-sizing:border-box;padding:5px;">';
    html += '<hr><button class="button buttonBlue">' + slovar('Search') + '</button></div>';
    html += '<button class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</button>';
    popupBox.html(html);
    popupBox.find('input[type=text]').keyup(function(e){if(e.keyCode == 13){ searchFURS(popup, el) }});
    popupBox.find('.buttonBlue').click(function(){ searchFURS(popup, el) });
    popup.fadeIn('fast', function(){ popupBox.find('input[type=text]').focus() });
}
function searchFURS(popup, el, html = ''){
    var popupBox = popup.find('.popupBox');
    var box = popupBox.find('.toggleDiv')
    var table = popupBox.find('.table tbody');
    var value = popup.find('input[type=text]').val();
    if(valEmpty(value)){ return }
    popupBox.prepend(HTML_loader());
    box.hide();
    $.get('/crm/php/main/FURS.php?search_FURS=1', {search:value}, function(data){
        data = JSON.parse(data);
        if(data){for(var i=0; i<data.length; i++){ html += FURSToTable(data[i]) }}
        table.html(html);
        table.find('.hoverEffect').click(function(){ copyFromFURS($(this), el) });
        remove_HTML_loader(popupBox);
        box.show();
    })
}
function FURSToTable(comp){
    var html = '';
    html += '<tr class="hoverEffect">';
    html += '<td data-col="naziv">' + comp.ime + '</td>';
    html += '<td  data-col="ulica">' + comp.ulica + '</td>';
    html += '<td  data-col="posta">' + comp.posta + '</td>';
    html += '<td  data-col="mesto">' + comp.mesto + '</td>';
    html += '<td  data-col="davcna">' + comp.davcna + '</td>';
    html += '<td  data-col="maticna">' + comp.maticna + '</td>';
    html += '<td  data-col="placnik">' + comp.zavezanec + '</td>';
    html += '</tr>';
    return html;
}
function copyFromFURS(row, el){
    var box = el.closest('form');
    var arr = el.attr('data-copy').split(',');
    for(var i=0; i<arr.length; i += 2){
        var from = row.find('td[data-col="' + arr[i] + '"]').text();
        var to = arr[i+1];
        var input = box.find('[name="' + to + '"]');
        var formField = input.closest('.formField');
        input.val(from);
    }
    refreshFormData(box);
    removePOPUPbox();
}