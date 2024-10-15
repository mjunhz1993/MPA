function loadAddFilter(el){
    var box = el.closest('.calendarBox');
    $.get('/crm/php/main/module.php?get_all_users=1', function(data){
        displayAddFilter(box, createPOPUPbox(), JSON.parse(data), box.attr('data-filteraccess'));
    })
}

function displayAddFilter(box, popup, data, role_module_filter_access){
    if(!data){ return }
    var boxMain = box.find('.calendarBoxMain');
    var popupBox = popup.find('.popupBox');
    var html = '<h2>' + slovar('Select_user_calendar') + '</h2><div class="userEventViewBox">';
    for(var i=0; i<data.length; i++){
        var checked = false;
        if(box.find('.activeFilters div[data-id=' + data[i]['user_id'] + ']').length == 1){ checked = true }
        else if(checkCookie('calendarFilter')){if(getCookie('calendarFilter').split(',').includes(data[i]['user_id'])){ checked = true; }}
        html += checkboxInput({
            id:'filter_user_'+i,
            name:data[i].user_id,
            label:data[i].user_username,
            checked:checked
        })
    }
    html += '</div>';
    html += '<div style="display:flex"><button class="buttonSquare buttonBlue" style="flex-grow:1" ';
    html += 'onclick="toggleUserEventViews($(this))">' + slovar('Toggle_all') + '</button>';
    if(role_module_filter_access == 1){
        html += '<button class="buttonSquare buttonGreen" style="flex-grow:1" ';
        html += 'onclick="loadJS(\'filter/filter\', function(){ removePOPUPbox(); ';
        html += 'openFilterTable(\''+boxMain.attr('data-module')+'\', ' + role_module_filter_access + '); })">' + slovar('Extra') + '</button>';
    }
    html += '</div><hr><button class="button buttonBlue buttonAddFilter">' + slovar('Save') + '</button>';
    html += '<button class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</button>';
    popupBox.html(html);
    popup.fadeIn('fast');
    
    popup.find('.buttonAddFilter').click(function(){ AddFilter(popup, box); });
}

function toggleUserEventViews(el){
    var cb = el.closest('.popupBox').find('[type=checkbox]');
    cb.prop("checked", !cb.prop("checked"));
}

function AddFilter(popup, box){
    box.find('.activeFilters').remove();
    var inputs = popup.find('input[type=checkbox]:checked');
    if(inputs.length != 0){
        box.append('<div class="activeFilters"></div>');
        var activeFilters = box.find('.activeFilters');
        var arr = [];
        inputs.each(function(){
            activeFilters.append('<div data-id="' + $(this).attr('name') + '"></div>');
            arr.push($(this).attr('name'));
        });
        setCookie('calendarFilter', arr);
    }
    else{ deleteCookie('calendarFilter'); }
    createCalendar(box);
    removePOPUPbox();
}