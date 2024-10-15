function php2excel(module){
    hideDropdownMenu();
    var popup = createPOPUPbox();
    var popupBox = popup.find('.popupBox');
    var module = $('#main_table').attr('data-module');
    var selected = $('.selectmultiple[type=checkbox]:checked');
    var html = '';

    html += '<form>';
    html += '<label for="export_type">' + slovar('Export_type') + '</label>';
    html += '<select id="export_type" required>';
    if(selected.length != 0){ html += '<option value="1">' + slovar('Export_selected') + '</option>'; }
    html += '<option value="2">' + slovar('Export_all_filterd') + '</option>';
    html += '</select>';

    html += '<hr><button class="button buttonGreen">' + slovar('Export') + '</button>';
    html += '<div class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</div>';
    html += '</form>';
    popupBox.html(html);
    var form = popupBox.find('form');

    form.on('submit', function(e){
        e.preventDefault();
        form.hide().before(HTML_loader());
        popupBox.find('.alert').remove();
        var selectedID = [];
        if(form.find('#export_type').val() == 1){ selected.each(function(){ selectedID.push($(this).closest('tr').attr('data-id')); }); }

        $.post('/crm/php/export/excel/export.php?excel_module=1', {
            csrf_token: $('[name=csrf_token]').val(),
            module:module,
            export_type: form.find('#export_type').val(),
            selectedID: selectedID.join(',')
        }, function(url){
            url = JSON.parse(url);
            if(url.error){ remove_HTML_loader(popupBox); form.show(); }
            else{ removePOPUPbox(); window.location.href = url; }
        }).fail(function(){console.log('ERROR: backend napaka');});
    });

    popup.fadeIn('fast');
}