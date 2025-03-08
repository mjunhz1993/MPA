// ADD MODULE
function openAddModule(){
    getModuleCategories();
    $('#modul_table').parent().fadeOut('fast', function(){
        $('#AddModuleBox').fadeIn('fast');

        if($('#AddModuleBox select[name=custom_file] option').length == 1){
            $.post('/crm/php/admin/custom_files.php?get_custom_files=1', {
                csrf_token:$('#csrf_token').val(),
                ProjectExt: 'php'
            }, function(data){
                data = JSON.parse(data);
                for(var i=0; i<data.length; i++){if(data[i].name != ''){
                    $('#AddModuleBox select[name=custom_file]').append('<option value="' + data[i].name + '">' + data[i].name + '</option>');
                }}
            }).fail(function(){ console.log('ERROR: backend-error'); });
        }
    });
}

function SQLTableNameFriendly(el){ el.val(el.val().replace(/_|\s+/g, '').toLowerCase()) }

function closeAddModule(){
    $('#AddModuleBox').fadeOut('fast', function(){
        $('#modul_table').parent().fadeIn('fast');
    });
}

$('.addModuleForm').on('submit', function(e){
    e.preventDefault();
    var form = $(this);
    var token = $('#csrf_token');
    form.prepend(token);
    form.find('.alert').remove();
    $.post('/crm/php/admin/module.php?add_module=1', form.serialize(), function(data){
        data = JSON.parse(data);
        if(data.error){ createAlert(form, 'Red', data.error); }
        else{ location.reload(); }
    })
});


// EDIT MODULE
function openEditModule(module){
    GET_module({
        module:module,
        done:function(m){
            form.find('[name=accessories]').val(m.accessories.join('|'))
        }
    })
    getModuleCategories();
    hideDropdownMenu();
    var form = $('#EditModuleBox');
    var tr = $('#modul_table').find('tr[data-module="' + module + '"]');

    form.find('[name=module]').val(module);
    form.find('[name=name]').val(tr.attr('data-name'));
    form.find('[name=category]').val(tr.attr('data-category'));
    form.find('[name=icon]').val(tr.find('.Micon').data('svg'));

    $('#modul_table').parent().fadeOut('fast', function(){
        form.fadeIn('fast');
    });
}

function closeEditModule(){
    $('#EditModuleBox').fadeOut('fast', function(){
        $('#modul_table').parent().fadeIn('fast');
    });
}

$('.editModuleForm').on('submit', function(e){
    e.preventDefault();
    var form = $(this);
    var token = $('#csrf_token');
    form.prepend(token);
    $.post('/crm/php/admin/module.php?edit_module=1', form.serialize(), function(data){
        data = JSON.parse(data);
        if(!data.error){ location.reload(); }
        else{ createAlert(form, 'Red', data.error); }
    })
});


// EDIT MODULE NOTIFICATIONS
function openEditNotifications(module){
    hideDropdownMenu();
    var form = $('#EditNotificationsBox');
    var tr = $('#modul_table').find('tr[data-module="' + module + '"]');

    form.find('[name=module]').val(module);
    form.find('#notification_column').html('');

    GET_column({
        module:module,
        showAll:true,
        done: function(data){
            for(var i=0; i<data.length; i++){
                var col = data[i];
                if(col.type != 'JOIN_ADD'){ continue }
                if(!['user','role'].includes(col.list.split(',')[1])){ continue }
                form.find('#notification_column').append('<input type="checkbox" name="notification_column[]" id="nc' + i + '" value="' + col.column + '">');
                form.find('#notification_column').append('<label class="checkboxLabel" for="nc' + i + '">' + slovar(col.name) + '</label>');
            }

            var note_config = tr.attr('data-notification').split('|');
            var note_config_columns = note_config[0].split(',');
            for(var i=0; i<note_config_columns.length; i++){
                form.find('#notification_column input[value="' + note_config_columns[i] + '"]').prop('checked', true);
            }
            form.find('#notification_title').val(note_config[1]);
            form.find('#notification_desc').val(note_config[2]);
            form.find('.tag_info').text('{' + module + '_columnID}');

            $('#modul_table').parent().fadeOut('fast', function(){ form.fadeIn('fast'); });
        }
    })
}

function changeNotificationType(el){
    if(el.val() == 'CONFIRM'){ el.parent().find('.notificationBoxTypeConfirm').show(); }
    else{ el.parent().find('.notificationBoxTypeConfirm').hide(); }
}

function closeEditNotifications(){
    $('#EditNotificationsBox').fadeOut('fast', function(){
        $('#modul_table').parent().fadeIn('fast');
    });
}

$('.editNotificationsForm').on('submit', function(e){
    e.preventDefault();
    var form = $(this);
    var token = $('#csrf_token');
    form.prepend(token);
    $.post('/crm/php/admin/module.php?edit_module_notifications=1', form.serialize(), function(data){ console.log(data);
        data = JSON.parse(data);
        if(!data.error){ location.reload(); }
        else{ createAlert(form, 'Red', data.error); }
    })
});

// TOGGLE MODULE
function toggleModule(el){
    el.hide();
    var module = el.closest('tr').data('module');
    var form = $('.toggleModuleForm');
    var token = $('#csrf_token');
    form.prepend(token);

    form.find('[name=module]').val(module);
    if(el.prop('checked')){ form.find('[name=active]').val(1); }
    else{ form.find('[name=active]').val(0); }

    $.post('/crm/php/admin/module.php?toggle_module=1', form.serialize(), function(data){
        if(!data.error){ el.show(); }
    })
}


// DELETE MODULE
function deleteModule(module){
    hideDropdownMenu();
    POPUPconfirm('Delete Module', 'Do you realy want to delete ' + module, function(){
        var form = $('.deleteModuleForm');
        var token = $('#csrf_token');
        $('#modul_table').find('.alert').remove();
        form.prepend(token);
        form.find('[name=module]').val(module);
        $.post('/crm/php/admin/module.php?delete_module=1', form.serialize(), function(data){
            data = JSON.parse(data);
            if(!data.error){ location.reload(); }
            else{ createAlert($('#modul_table'), 'Red', data.error); }
        })
    });
}

// GET CATEGORY LIST
function getModuleCategories(add = 0){
    if(add == 0){
        var arr = [];
        $('#modul_table .table tbody tr').each(function(){
            if(!arr.includes($(this).attr('data-category'))){ arr.push($(this).attr('data-category')); }
        });

        cat = '<select name="category">';
        for(var i = 0; i<arr.length; i++){ cat += '<option value="' + arr[i] + '">' + slovar(arr[i]) + '</option>'; }
        cat += '</select>';
        cat += '<a class="button button100 buttonBlue" onclick="getModuleCategories(1)">' + slovar('Category_add') + '</a>';
    }
    else{
        cat = '<input type="text" name="category">';
        cat += '<a class="button button100 buttonBlue" onclick="getModuleCategories()">' + slovar('Category_select') + '</a>';
    }
    $('.getModuleCategories').html(cat);
}


// IMPORT MODULE
function openImportModule(){
    var popup = createPOPUPbox();
    popup.find('.popupBox').html('<form></form>');
    var form = popup.find('form');
    var html = '';

    html += '<label>' + slovar('Table_name') + '</label>';
    html += '<input type="text" name="table_name" required>';
    html += '<hr><button class="button buttonBlue">' + slovar('Search') + '</button>';
    html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span>';
    form.html(html);
    popup.fadeIn('fast');

    form.on('submit', function(e){ e.preventDefault(); findImportModule($(this)); })
}

function findImportModule(form){
    var table_name = form.find('input[name=table_name]').val();
    form.find('.alert').remove();
    $.post('/crm/php/admin/module.php?find_import_module=1', {csrf_token: $('input[name=csrf_token]').val(), table_name: table_name}, function(data){
        data = JSON.parse(data);
        if(data.error){ createAlert(form, 'Red', data.error); }
        else{ openConfigImportModule(form, table_name, data); }
    })
}

function openConfigImportModule(form, table_name, data){
    var popup = $('#popup');
    form.parent().html('<form></form>');
    form = popup.find('form');
    var html = '';

    html += '<input type="hidden" name="csrf_token" value="' + $('input[name=csrf_token]').val() + '">';
    html += '<input type="hidden" name="module" value="' + table_name + '">';
    html += '<b>' + slovar('Module') + ' - (' + table_name + ')</b>';
    html += '<input type="text" name="name" placeholder="' + slovar('Module_name') + '" required>';

    if(data){
        for(var i=0; i<data.length; i++){
            var col = data[i];
            html += '<input type="hidden" name="col_id[]" value="' + col.COLUMN_NAME + '">';
            html += '<b>' + slovar('Column') + ' ' + (i + 1) + ' - (' + col.COLUMN_NAME + ')</b>';
            if(col.COLUMN_KEY == 'PRI'){
                html += '<input type="hidden" name="col_name[]" value="">';
                html += '<select  name="col_index[]"><option>PRIMARY</option></select>';
                html += '<input type="hidden" name="data_type[]" value="">';
                html += '<input type="hidden" name="col_default[]" value="">';
            }
            else{
                html += '<input type="text" name="col_name[]" placeholder="' + slovar('Column_name') + '" required>';

                html += '<select  name="col_index[]">';
                if(col.COLUMN_KEY == 'MUL'){ html += '<option>INDEX</option>'; }
                else if(col.COLUMN_KEY == 'UNI'){ html += '<option>UNIQUE</option>'; }
                else{ html += '<option value="NONE">NO INDEX</option>'; }
                html += '</select>';

                html += '<input type="hidden" name="data_type[]" value="' + col.DATA_TYPE + '" required>';
                if(col.COLUMN_DEFAULT == null){ col.COLUMN_DEFAULT = ''; }
                html += '<select  name="col_default[]"><option value="' + col.COLUMN_DEFAULT + '">Default value: ' + col.COLUMN_DEFAULT + '</option></select>';
            }
            html += '<select  name="col_type[]"><option value="' + col.COLUMN_TYPE + '">Column type: ' + col.COLUMN_TYPE + '</option></select>';
        }
    }

    html += '<hr><button class="button buttonGreen">' + slovar('Add_new') + '</button>';
    html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span>';

    form.html(html);

    form.on('submit', function(e){ e.preventDefault(); addImportModule($(this)); })
}

function addImportModule(form){
    form.find('.alert').remove();
    $.post('/crm/php/admin/module.php?add_import_module=1', form.serialize(), function(data){
        data = JSON.parse(data);
        if(data.error){ createAlert(form, 'Red', data.error); }
        else{ location.reload(); }
    })
}

// SORT
loadJS('https://code.jquery.com/ui/1.12.1/jquery-ui.js', function(){
    $('#modul_table .table tbody').sortable({
        cancel: ".no-drag",
        axis: "y",
        cursor: "move",
        opacity: 0.5,
        stop: function( event, ui ){
            var module = [];
            $('#modul_table .table tbody tr').each(function(){
                module.push($(this).data('module'));
            });
            var form = $('.sortColumnsForm');
            var token = $('#csrf_token');
            $.post('/crm/php/admin/module.php?sort_modules=1', {
                modules:module,
                csrf_token: token.val()
            }, function(data){console.log(data)})
        },
    });

    $('#column_table .table tbody').sortable({
        cancel: ".no-drag",
        axis: "y",
        cursor: "move",
        opacity: 0.5,
        stop: function( event, ui ){
            var column = [];
            $('#column_table .table tbody tr').each(function(){
                column.push($(this).data('column'));
            });

            var form = $('.sortColumnsForm');
            var token = $('#csrf_token');
            form.prepend(token);
            form.find('[name=column_id]').val(column);

            $.post('/crm/php/admin/module.php?sort_columns=1', form.serialize(), function(data){
            })
        },
    });
});