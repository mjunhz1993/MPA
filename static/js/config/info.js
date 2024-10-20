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
    })
}

function get_public_ip(el, html = ''){
    $.get('/crm/php/admin/info.php?get_public_ip=1', function(data){
        data = JSON.parse(data);
        var box = el.parent();
        html += '<label>'+slovar('Public_IP_address')+'</label>';
        html += '<input type="text" disabled>';
        box.html(html);
        box.find('input').val(data);
    })
}