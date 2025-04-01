function editTableSelectMenu(name, selected){
    var el = $('[data-name='+name+']');
    var data = el.closest('table').find(`thead ${colChild('th',el.closest('td').index()+1)}`).data();
    $.post('/crm/php/main/edit_in_table.php?change_selectmenu_in_table=1&module='+data.module, {
        csrf_token:$('[name=csrf_token]').val(),
        module:data.module,
        id:el.closest('tr').data('id'),
        column:data.column,
        table_value:selected.data('value')
    }, function(data){ data = JSON.parse(data);
        if(data.error){ el.find('.DropdownMenuContent').remove(); return createAlert(el.closest('.tableBox'),'Red',data.error) }
        var color = selected.data('color');
        if(valEmpty(color)){ color = '#ffffff' }
        el.css('transition','0.2s');
        var t = selected.text();
        if(valEmpty(selected.data('value'))){ t = '' }
        el.html('<b>'+t+'</b>'+getSVG('edit')).css({ 'background-color':color,'color':getContrastYIQ(color) })
    })
}

function hoverTDselectMenu(el){if(el.find('svg').length == 0){ el.append(getSVG('edit')) }}