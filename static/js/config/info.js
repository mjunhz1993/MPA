function update_app_version(el){
    el.hide();
    $.get('/crm/php/admin/info.php?update_app_version=1', function(data){
        data = JSON.parse(data);
        el.show();
        if(data.error){ return createAlert(el.parent(), 'Red', data.error) }
        location.reload();
    })
}

function showMoreSpaceInfo(el){
    el.hide();
    el.after(HTML_loader());
    $.get('/crm/php/admin/info.php?more_space_info=1', function(data){
        data = JSON.parse(data);
        if(data){
            var html = '';
            for(var i=0; i<data.length; i++){
                var d = data[i];
                html += '<div class="col col50">';
                html += '<label>' + slovar(d.name) + '</label>';
                html += '<input type="text" value="' + d.space + '" style="color:red" disabled>';
                html += '</div>';
            }
            el.after(html);
            remove_HTML_loader(el.parent());
            el.remove();
        }
    }).fail(function(){console.log('ERROR: backend napaka');});
}