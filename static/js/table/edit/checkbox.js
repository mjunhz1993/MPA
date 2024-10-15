function editTableCheckbox(el){
    var data = el.closest('table').find('thead th:nth-child(' + (el.closest('td').index() + 1) + ')').data();
    $.post('/crm/php/main/edit_in_table.php?change_checkbox_in_table=1&module='+data.module, {
        csrf_token:$('[name=csrf_token]').val(),
        id:el.closest('tr').data('id'),
        column:data.column,
        table_value:el.prop('checked')
    }, function(data){ data = JSON.parse(data);
        if(data.error){
            el.prop('checked', !el.prop('checked'));
            return createAlert(el.closest('.tableBox'),'Red',data.error)
        }
    })
}