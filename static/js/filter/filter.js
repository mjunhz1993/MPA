function openFilterTable(module = '', filter_access = 0){loadJS('filter/slovar/' + slovar(), function(){
    hideDropdownMenu();
    if(module == ''){ return }
    var html = '<div id="filterTable" style="display:none"><div id="filterTableBox" class="col50">';
        html += '<h2>' + slovar('Filter_table') + '</h2>';
        html += '<div id="filterTableBoxInner"></div>';
        html += '<hr><button class="buttonSquare buttonBlue SaveChangesButton">' + slovar('Save_changes') + '</button>';
        html += '<button class="buttonSquare buttonBlack" onclick="closeFilterTable()">' + slovar('Cancel') + '</button>';
        html += '</div></div>';
    $('#Main').append(html);
    var box = $('#filterTable')
    var boxInner = $('#filterTableBoxInner');
    
    $('#filterTable').fadeIn('fast');
    
    if(filter_access == 1){
        html = '<div class="filterHorButtons">';
        html += '<button class="buttonSquare buttonRed" onclick="deleteFilter(\''+module+'\','+filter_access+')">';
        html += getSVG('x') + '<span class="SVGdesc">' + slovar('Delete') + '</span></button>';
        html += '<button class="buttonSquare buttonGreen openFilterTableAdd">';
        html += getSVG('plus_circle') + '<span class="SVGdesc">' + slovar('Add_new') + '</span></button></div>';
        boxInner.html(html);
    }

    box.find('.SaveChangesButton').click(function(){ selectFilter(module) })
    boxInner.find('.openFilterTableAdd').click(function(){loadJS('filter/filterEditor', function(){ openFilterTableAdd(module) })})

    loadInFilters(module, boxInner, filter_access);
})}

function loadInFilters(module, boxInner, filter_access){
    $.get('/crm/php/main/module_filters.php?get_filters=1&module=' + module, function(data){
        data = JSON.parse(data);
        if(data.error){ return }
        html = '<form><select name="filter_id" onchange="changeFilter($(this), \''+module+'\')">';
        if(filter_access == 1){ html += '<option value="0">'+slovar('No_filter')+'</option>' }
        for(var i = 0; i < data.length; i++){
            var f = data[i];
            if(f.public == 0 && !f.share.includes(user_id) && f.user_id != user_id){ continue }
            html += '<option value="'+f.id+'" ';
            if(f.using == 1){ html += 'selected'; }
            html += '>';
            if(f.public == 1){ html += '('+slovar('Public')+') ' }
            html += f.name +'</option>';
        }
        html += '</select>';
        if(filter_access == 1){ html += '<span class="button buttonBlue" onclick="toggleAssigns()">'+slovar('Toggle_all')+'</span>' }
        html += '</form>';
        boxInner.prepend(html);
        changeFilter(boxInner.find('select'), module);
    })
}

function changeFilter(el, module, box = $('#filterTableBoxInner'), html = ''){
    if(el.find('option').length == 0){ createAlertPOPUP(slovar('No_filter')); return closeFilterTable() }
    $('#filterTableBox').find('.alert').remove();
    box.find('.openFilterTableEdit').remove();
    if(el.val() != 0){
        html += '<button class="buttonSquare buttonBlue openFilterTableEdit">';
        html += getSVG('edit') + '<span class="SVGdesc">' + slovar('Edit') + '</span></button>';
        box.find('.buttonGreen').before(html);
        box.find('.openFilterTableEdit').click(function(){loadJS('filter/filterEditor', function(){ openFilterTableEdit(module) })});
    }
    openFilterTableAssing(module)
}

function closeFilterTable(){ $('#filterTable').remove() }

function activateEventsBehindFilterTable(){
    if($('#main_table').length == 1){ tableLoadColumns($('#main_table')) }
    if($('#main_calendar').length == 1){ createCalendar($('#main_calendar')) }
    if($('#analytics_main').length == 1){ get_analytics($('#analytics_main')) }
}

function selectFilter(module){
    var form = $('#filterTableBoxInner form');
    var token = $('input[name=csrf_token]').first();
    form.prepend(token.clone());
    $.post('/crm/php/main/module_filters.php?select_filter=1&module=' + module, form.serialize(), function(data){
        data = JSON.parse(data);
        if(!data.error){
            closeFilterTable();
            activateEventsBehindFilterTable();
        }
    });
}

function deleteFilter(module, filter_access){
    var form = $('#filterTableBoxInner form');
    form.find('.alert').remove();
    var token = $('input[name=csrf_token]').first();
    POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
        form.prepend(token.clone());
        $.post('/crm/php/main/module_filters.php?delete_filter=1&module=' + module, form.serialize(), function(data){
            data = JSON.parse(data);
            if(data.error){ return createAlert(form, 'Red', data.error) }
            openFilterTable(module, filter_access);
            activateEventsBehindFilterTable();
        });
    });
}

function openFilterTableAssing(module, html = ''){
    var form = $('#filterTableBoxInner form');
    var filter_id = form.find('select').val();
    var filter = 'filter_id='+filter_id;
    if(filter_id == 0){ filter = 'filter_module='+module }
    var filter_access = 1;
    if(form.find('select option[value=0]').length == 0){ filter_access = 0 }

    form.find('#assignfilterbox').remove();
    $.get('/crm/php/main/module_filters.php?get_filter_assigns=1&' + filter, function(data){
        var assigns = JSON.parse(data);
    $.get('/crm/php/main/module.php?get_all_users=1', function(data){
        data = JSON.parse(data);
        html += '<div id="assignfilterbox" class="assignfilterbox" ';
        if(filter_access == 0){ html += 'style="display:none"' }
        html += '>';
        for(var i=0; i<data.length; i++){
            var cd = false;
            if(
                (assigns.includes(data[i].user_id) && filter_id != 0) ||
                (!assigns.includes(data[i].user_id) && filter_id == 0)
            ){ cd = true }
            html += checkboxInput({
                name:'assignuser[]',
                value:data[i].user_id,
                id:'assignuser'+data[i].user_id,
                label:data[i].user_username,
                checked:cd,
                disabled:cd
            })
        }
        html += '</div>';
        form.append(html);
        if(filter_access == 0){ selectCurrentFilterForMe() }
    })
    })
}

function selectCurrentFilterForMe(){ $('#assignuser'+user_id).prop('checked',true) }

function toggleAssigns(){
    $('#assignfilterbox input:not(:disabled)').each(function(){
        $(this).prop('checked', !$(this).prop('checked'));
    });
}

loadCSS('filter');