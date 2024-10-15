function loadModulesAccess(html = ''){loadJS('GET/module', function(){
    GET_module({
        each: function(d){
            if(d.active == 0){ return }
            html += '<tr>';
            html += '<td>' + slovar(d.name) + '</td>';
            html += '<td>';
            html += '<a class="linksvg" ';
            html += 'data-module="' + d.module + '" ';
            html += 'data-name="' + slovar(d.name) + '" ';
            html += 'data-view="' + d.can_view + '" ';
            html += 'data-add="' + d.can_add + '" ';
            html += 'data-edit="' + d.can_edit + '" ';
            html += 'data-delete="' + d.can_delete + '" ';
            html += 'onclick="openEditAccess($(this), \'MODULE\')" data-tooltip="' + slovar('Edit_module') + '">' + getSVG('edit') + '</a>';
            if(d.url == '' || d.url == null){
                html += '<a class="linksvg" onclick="openColumns(\'' + d.module + '\', \'' + slovar(d.name) + '\')" ';
                html += 'data-tooltip="' + slovar('Edit_columns') + '">' + getSVG('list') + '</a>';
            }
            html += '</td>';
            html += '</tr>';
        },
        done: function(data){
            var table = $('#modul_table tbody');
            table.html(html);
            tooltips();
            $('.DropdownMenuContent').parent().unbind().click(function(e){ e.stopPropagation() });
        }
    })
})}

// EDIT MODULE
function openEditAccess(el, type){
    hideDropdownMenu();
    var popup = createPOPUPbox();
    popup.find('.popupBox').html('<form></form>');
    var form = popup.find('form');
    
    form.prepend($('input[name=csrf_token]').first().clone());
    if(type == 'MODULE'){ form.append('<input type="hidden" name="module" value="' + el.attr('data-module') + '">'); }
    else if(type == 'COLUMN'){ form.append('<input type="hidden" name="column" value="' + el.attr('data-column') + '">'); }
    
    form.append('<h2>' + el.attr('data-name') + '</h2><hr>');
    form.append('<h2>' + slovar('View') + '</h2><div class="edit_view_box"></dov>');
    if(type == 'MODULE'){ form.append('<h2>' + slovar('Add_new') + '</h2><div class="edit_add_box"></dov>'); }
    form.append('<h2>' + slovar('Edit') + '</h2><dov class="edit_edit_box"></dov>');
    if(type == 'MODULE'){ form.append('<h2>' + slovar('Delete') + '</h2><dov class="edit_delete_box"></dov>'); }
    
    $.get('/crm/php/main/module.php?get_all_roles=1', function(data){
        data = JSON.parse(data);
        for(var i=0; i<data.length; i++){
            form.find('.edit_view_box').append(checkboxInput({
                name:'view[]',
                id:'view_'+i,
                value:data[i].role_id,
                label:data[i].role_name
            }));
            if(type == 'MODULE'){
                form.find('.edit_add_box').append(checkboxInput({
                    name:'add[]',
                    id:'add_'+i,
                    value:data[i].role_id,
                    label:data[i].role_name
                }));
            }
            form.find('.edit_edit_box').append(checkboxInput({
                name:'edit[]',
                id:'edit_'+i,
                value:data[i].role_id,
                label:data[i].role_name
            }));
            if(type == 'MODULE'){
                form.find('.edit_delete_box').append(checkboxInput({
                    name:'delete[]',
                    id:'delete_'+i,
                    value:data[i].role_id,
                    label:data[i].role_name
                }));
            }

            form.find('.edit_view_box, .edit_add_box, .edit_edit_box, .edit_delete_box').css({
                'display':'flex',
                'flex-wrap':'wrap',
                'gap':'5px',
                'padding':'0 5px'
            });
        }
        
        if(type == 'MODULE'){
            form.append('<h2>' + slovar('Extra') + '</h2><button class="button buttonBlue" data-button="full">' + slovar('Set_columns') + '</button>');
        }
        
        checkAccessFields(el, form, type);
        popup.find('#popupBox').append('<hr><button class="button buttonBlue">' + slovar('Save_changes') + '</button>');
        popup.find('#popupBox').append('<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span>');
        
        popup.find('.buttonBlue').click(function(){ submitEditAccess(form, popup, type, $(this).attr('data-button')) })
        
        popup.fadeIn('fast');
    }).fail(function(){console.log('ERROR: backend napaka');});
}

function checkAccessFields(el, form, type){
    var v = el.attr('data-view').split(',');
    form.find('.edit_view_box input').each(function(){
        if(v.includes($(this).val())){ $(this).prop('checked', true); }
    });
    if(type == 'MODULE'){
        var v = el.attr('data-add').split(',');
        form.find('.edit_add_box input').each(function(){
            if(v.includes($(this).val())){ $(this).prop('checked', true); }
        });
    }
    var e = el.attr('data-edit').split(',');
    form.find('.edit_edit_box input').each(function(){
        if(e.includes($(this).val())){ $(this).prop('checked', true); }
    });
    if(type == 'MODULE'){
        var d = el.attr('data-delete').split(',');
        form.find('.edit_delete_box input').each(function(){
            if(d.includes($(this).val())){ $(this).prop('checked', true); }
        });
    }
}

function submitEditAccess(form, popup, type, button = ''){
    var extra = '';
    if(button == 'full'){ extra = '&set_columns=1' }
    form.unbind().on('submit', function(e){
        e.preventDefault();
        $.post('/crm/php/admin/access.php?edit_access=1' + extra, form.serialize(), function(data){
            data = JSON.parse(data);
            if(data.error){ return createAlert(form, 'Red', data.error) }
            if(type == 'MODULE'){ loadModulesAccess() }
            else if(type == 'COLUMN'){ openColumns($('#column_table').attr('data-module'), $('#column_table').attr('data-name')) }
            removePOPUPbox()
        }).fail(function(data){ console.log('ERROR: backend-error'); });
        
    });
    form.submit();
}

// OPEN COLUMN EDITOR
function openColumns(module, name){
    hideDropdownMenu();
    loadColumns(module, function(){
        $('h1').html(name + ' / ' + slovar('Columns'));
        $('#column_table').attr('data-module', module).attr('data-name', name);
        $('#column_table .buttonGreen').attr('onclick', "openAddColumn('" + module + "')");
        $('#modul_table').fadeOut('fast', function(){
            $('#column_table').fadeIn('fast');
        });
    });
}

function closeColumns(){
    $('h1').text(slovar('Module_access'));
    $('#column_table').fadeOut('fast', function(){
        $('#modul_table').fadeIn('fast');
    });
}

// LOAD COLUMNS
function loadColumns(module, callback){
    GET_column({
        module:module,
        showAll:true,
        done: function(data){
            displayColumns(data)
            if(typeof callback === 'function'){ callback() }
        }
    })
}

// DISPLAY COLUMNS
function displayColumns(data, rows = ''){
    var table = $('#column_table .table');
    table.find('tbody tr').remove();
    for(var r = 0; r < data.length; r++){
        var col = data[r];
        rows += '<tr>';
        rows += '<td>' + slovar(col.name) + '</td>';
        rows += '<td>';
        rows += '<a class="linksvg" ';
        rows += 'data-column="' + col.column + '" ';
        rows += 'data-name="' + slovar(col.name) + '" ';
        rows += 'data-view="' + col.can_view + '" ';
        rows += 'data-edit="' + col.can_edit + '" ';
        rows += 'onclick="openEditAccess($(this), \'COLUMN\')" data-tooltip="' + slovar('Edit_column') + '">' + getSVG('edit') + '</a>';
        rows += '</td>';
        rows += '</tr>';
    }
    table.find('tbody').html(rows);
    tooltips();
}

$(document).ready(function(){ loadModulesAccess(); });