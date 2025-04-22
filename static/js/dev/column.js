// OPEN COLUMN EDITOR
function openColumns(module){
    hideDropdownMenu();
    loadColumns(module, function(){
        $('h1').html(module + ' / ' + slovar('Columns'));
        $('#column_table').attr('data-module', module);
        $('#column_table .buttonGreen').attr('onclick', "openAddColumn('" + module + "')");
        $('#modul_table').fadeOut('fast', function(){
            $('#column_table').fadeIn('fast');
        });
    });
}

function closeColumns(){
    $('h1').text(slovar('Modules'));
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
            displayColumns(data);
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
        rows += '<tr data-column="' + col.column + '" ';
        rows += 'data-type="' + col.type + '" ';
        rows += 'data-custom="' + col.custom + '" ';
        rows += 'data-special="' + col.special + '" ';
        rows += 'data-active="' + col.active + '" ';
        rows += 'data-mandatory="' + col.mandatory + '" ';
        rows += 'data-show_in_create="' + col.show_in_create + '" ';
        rows += 'data-preselected_option="' + col.preselected_option + '" ';
        rows += 'data-width="' + col.width + '" ';
        rows += 'data-category="' + col.category + '" ';
        rows += 'data-editable="'+col.editable+'"';
        if(['ID','JOIN_ADD','JOIN_GET','SELECT'].includes(col.type)){ rows += 'data-list="' + col.list + '" ' }
        rows += '>';
        rows += '<td style="cursor: move;">' + getSVG('move') + '</td>';
        rows += '<td class="no-drag"><b>'+slovar(col.name)+'</b>';
        if(col.mandatory == 1){ rows += ' <span style="color:red">*</span>'; }
        if(col.type == 'VARCHAR' && col.list == 'PRIMARY'){ rows += ' <span style="color:blue">(PRIMARY)</span>'; }
        rows += '<br>'+col.column+'</td>';
        rows += `<td class="no-drag">${col.type} <b>[${col.length}]</b></td>`;
        rows += '<td class="no-drag Ccategory">' + slovar(col.category) + '</td>';
        rows += `<td class="no-drag">
            Vidno v tabeli: <b>${col.active}</b><hr>
            Možno urejati: <b>${col.editable}</b><hr>
            Prednastavljena vrednost: <b>${col.preselected_option}</b><hr>
            Širina polja: <b>${col.width}</b>
        </td>`;
        rows += '<td class="no-drag">';
        if(col.custom == 1){
            rows += '<a class="linksvg" onclick="openEditColumn(\'' + col.column + '\')">';
            rows += getSVG('edit');
            rows += '</a>';
        }
        if(col.custom == 1){
            rows += '<a class="linksvg" onclick="deleteColumn(\'' + col.column + '\')">';
            rows += getSVG('delete');
            rows += '</a>';
        }
        rows += '</td>';
        rows += '</tr>';
    }
    table.find('tbody').html(rows);
}

// ADD COLUMN
function openAddColumn(module){
    getColumnCategories();
    var form = $('.addColumnForm');
    form.find('[name=module]').val(module);
    changeColumnType();

    $('#column_table').parent().fadeOut('fast', function(){
        $('#AddColumnBox').fadeIn('fast');
    });
}

function closeAddColumn(){
    $('#AddColumnBox').fadeOut('fast', function(){
        $(this).find('[name=type]').val($(this).find('[name=type] option:first').val());
        $('#column_table').parent().fadeIn('fast');
        $('#AddColumnBox').find('[type=text], [type=number]').val('');
    });
}

// ON COLUMN CHANGE TYPE EVENT
function changeColumnType(){
    var module = $('#column_table').attr('data-module');
    var type = $('#AddColumnBox [name=type]').val();
    var box = $('#AddColumnExtra');
    var html = '';

    if(type == 'VARCHAR'){
        html += '<label for="add_length">Maksimalno število znakov</label>';
        html += '<input type="number" name="length" id="add_length" required>';
        html += '<label for="list">Dodatki</label>';
        html += '<select name="list" id="list">';
        html += '<option value="">Brez dodatka</option>';
        html += '<option value="PRIMARY">Primarni stolpec</option>';
        html += '<option value="URL">Vnos URL povezave</option>';
        html += '<option value="PHONE">Vnos telefonske številke</option>';
        html += '<option value="EMAIL">Vnos E-mail naslova</option>';
        html += '<option value="COLOR">Izbira barve</option>';
        html += '</select>';
    }
    else if(type == 'INT'){
        html += '<label for="add_length">Maksimalno število znakov</label>';
        html += '<input type="number" name="length" id="add_length" required>';
    }
    else if(
        type == 'DECIMAL' ||
        type == 'PRICE' ||
        type == 'PERCENT'
    ){
        html += '<label for="add_length">Maksimalno število znakov</label>';
        html += '<input type="number" name="length" id="add_length" required>';
        html += '<label for="add_list">Število decimalk</label>';
        html += '<input type="number" name="decimal_points" id="add_list" required>';
    }
    else if(type == 'SELECT'){
        html += '<label for="add_list">Možne izbire</label><br>';
        html += '<b class="button button100 buttonGreen" onclick="addSelectOptions($(this))">Dodaj več opcij</b>';
    }
    else if(type == 'FILE'){
        html += '<label for="file_op1">Tip datotek</label>';
        html += '<select name="file_op1" id="file_op1" required>';
        html += '<option value="ALL">Možno nalaganje vsega</option>';
        html += '<option value="IMG">Samo slike</option>';
        html += '</select>';
        html += '<label for="file_op2">Maksimalno število datotek</label>';
        html += '<input type="number" name="file_op2" id="file_op2" value="1" min="1" required>';
    }
    else if(type == 'JOIN_ADD'){
        html += '<label for="JOIN_ADD">Tabela</label>';
        html += '<select name="ref_table" id="JOIN_ADD" onchange="removeOldJOIN_ADDfilters($(this))" required>';
        html += '<option></option>';
        $('#modul_table tbody tr').each(function(){
            if($(this).attr('data-archive') == '' && $(this).attr('data-url') == ''){
                html += '<option value="' + $(this).data('module') + '">' + slovar($(this).data('name')) + '</option>';
            }
        });
        html += '<select>';
        html += '<label>Dodaj filter</label><br>';
        html += '<b class="button button100 buttonGreen" onclick="addJOIN_ADDfilters($(this), $(\'#JOIN_ADD\').val())">Dodaj več opcij</b>';
    }
    else if(type == 'JOIN_ADD_SELECT'){
        html += '<label for="JOIN_ADD_SELECT">Tabela</label>';
        html += '<select name="ref_table" id="JOIN_ADD_SELECT" onchange="changeColumnTypeExtra($(this))" required>';
        html += '<option></option>';
        $('#column_table tbody tr').each(function(){
            if($(this).attr('data-type') == 'JOIN_ADD' && $(this).attr('data-list').split(',')[1] != module){
                html += '<option value="' + $(this).attr('data-list').split(',')[1] + '">' + $(this).attr('data-list').split(',')[1] + '</option>';
            }
        });
        html += '<select>';
    }
    else if(type == 'JOIN_GET'){
        html += '<label for="JOIN_GET">Tabela</label>';
        html += '<select name="ref_table" id="JOIN_GET" onchange="changeColumnTypeExtra($(this))" required>';
        html += '<option></option>';
        $('#modul_table tbody tr').each(function(){
            if($(this).data('module') != module && $(this).attr('data-archive') == '' && $(this).attr('data-url') == ''){
                html += '<option value="' + $(this).data('module') + '">' + slovar($(this).data('name')) + '</option>';
            }
        });
        html += '<select>';
    }
    else if(type == 'BUTTON'){
        html += '<label for="list1">URL do JS datoteke</label>';
        html += '<input type="text" name="list[]" id="list1" required>';
        html += '<label for="list2">Ime JS funkcije</label>';
        html += '<input type="text" name="list[]" id="list2" required>';
        html += '<label for="list3">Naslov tipke</label>';
        html += '<input type="text" name="list[]" id="list3" required>';
    }

    box.html(html);
}

function changeColumnTypeExtra(el){
    var box = $('#AddColumnExtra');
    var type = el.attr('id');
    var value = el.val();
    if(value == ''){ return }
    var module = $('#column_table').attr('data-module');
    box.find('#columnTypeExtra').remove();
    box.append('<div id="columnTypeExtra"></div>');
    var boxExtra = box.find('#columnTypeExtra');

    if(type == 'JOIN_GET'){
        GET_column({
            module:value,
            showAll:true,
            done: function(data){
                var testColumn = module + '_id';
                h = '<label for="JOIN_COLUMN">Stolpec</label>';
                h += '<select name="ref_column" id="JOIN_COLUMN" required>';
                for(var r = 0; r < data.length; r++){
                    if(data[r].type != 'JOIN_ADD'){ continue }
                    var c = data[r].list.split('|')[0].split(',');
                    if(c[2] != testColumn){ continue }
                    h += '<option value="' + data[r].column + '">' + slovar(data[r].name) + '</option>';
                }
                h += '</select>';
                boxExtra.append(h);
            }
        })
        return
    }
    if(type == 'JOIN_ADD_SELECT'){
        GET_column({
            module:value,
            showAll:true,
            done: function(data){
                h = '<label for="JOIN_COLUMN">Stolpec</label>';
                h += '<select name="ref_column" id="JOIN_COLUMN" required>';
                for(var r = 0; r < data.length; r++){
                    if(['JOIN_ADD','JOIN_ADD_SELECT','JOIN_GET'].includes(data[r].type)){ continue }
                    h += '<option value="' + data[r].column + '">' + slovar(data[r].name) + '</option>'
                }
                h += '</select>';
                h += '<label for="JOIN_COLUMN_ADDON">Številka povezovalnega stolpca (Opcijsko)</label>';
                h += '<select id="JOIN_COLUMN_ADDON" name="ref_table_counter">';
                $('#column_table tbody tr').each(function(){
                    if($(this).attr('data-type') != 'JOIN_ADD' || $(this).attr('data-list').split(',')[1] != value){ return }
                    h += '<option value="' + $(this).attr('data-list').split(',')[0] + '">' + $(this).find('td:eq(1)').text() + '</option>';
                });
                h += '</select>';
                boxExtra.append(h);
            }
        })
    }
}


function addSelectOptions(el){
    var html = '<div style="display: flex;">';
    html += '<input type="text" name="select_option_1[]" placeholder="Value_1" required>';
    html += '<input type="text" name="select_option_2[]" placeholder="My label" required>';
    html += '<input type="color" name="select_option_3[]" value="#ffffff">';
    html += '<b style="align-self: center;" onclick="removeParentDiv($(this))">' + getSVG('x') + '</b>';
    html += '</div>';
    el.before(html);
}
function addJOIN_ADDfilters(el, module = ''){
    if(module == ''){ return }
    GET_column({
        module:module,
        showAll:true,
        done: function(data){
            var html = '<div class="join_add_filter_box" style="display: flex;">';
            html += '<select type="text" name="select_option_1[]" required>';
            if(data){for(var i=0; i<data.length; i++){
                html += '<option value="' + data[i].column + '">' + slovar(data[i].name) + '</option>';
            }}
            html += '</select>';
            html += '<input type="text" name="select_option_2[]" placeholder="filter value" required>';
            html += '<b style="align-self: center;" onclick="removeParentDiv($(this))">' + getSVG('x') + '</b>';
            html += '</div>';
            el.before(html);
        }
    })
}
function copyBeforeDiv(el){ el.before(el.prev('div').clone()); }
function removeOldJOIN_ADDfilters(el){ el.parent().find('.join_add_filter_box').remove(); }
function removeParentDiv(el){ el.parent().remove(); }



// SUBMIT NEW COLUMN
$('.addColumnForm').on('submit', function(e){
    e.preventDefault();
    var form = $(this);
    var token = $('#csrf_token');
    form.prepend(token);
    var module = $('#column_table').attr('data-module');
    $.post('/crm/php/admin/module.php?add_column=1&module=' + module, form.serialize(), function(data){
        data = JSON.parse(data);
        if(data.error){ createAlert(form, 'Red', data.error); }
        else{
            loadColumns(module, function(){ closeAddColumn(); });
        }
    })
});


// EDIT COLUMN
function openEditColumn(column){
    getColumnCategories();
    var form = $('#EditColumnBox');
    form.find('.alert').remove();
    form.find('[name=column_id]').val(column);
    configEditColumn($('#column_table').find('[data-column=' + column + ']'));

    $('#column_table').parent().fadeOut('fast', function(){
        form.fadeIn('fast');
    });
}

function closeEditColumn(){
    $('#EditColumnBox').fadeOut('fast', function(){
        $('#column_table').parent().fadeIn('fast');
    });
}

// DISPLAY CORRECT EDIT FORM
function configEditColumn(column){
    var box = $('#EditColumnExtra');
    var html = '';
    var type = column.data('type');
    var custom = column.data('custom');
    var special = column.data('special');
    var mandatory = column.data('mandatory');
    var show_in_create = column.data('show_in_create');
    var preselected_option = column.data('preselected_option');
    var width = column.data('width');
    var category = column.data('category');
    var list = column.data('list');
    var editable = column.data('editable');
    var active = column.data('active');

    html += '<div class="col col50"><input type="checkbox" name="active" id="active">';
    html += '<label for="active" class="chekboxLabel">Vidno v tabeli</label></div>';

    if(custom && !NotRealColumns.includes(type)){
        html += '<div class="col col50"><input type="checkbox" name="editable" id="editable">';
        html += '<label for="editable" class="chekboxLabel">Možno urejati</label></div>';
        html += '<div class="col col50"><input type="checkbox" name="special" id="special">';
        html += '<label for="special" class="chekboxLabel">Edinstveno polje</label></div>';
        html += '<div class="col col50"><input type="checkbox" name="mandatory" id="mandatory">';
        html += '<label for="mandatory" class="chekboxLabel">Obvezno polje</label></div>';
        html += '<div class="col col50"><input type="checkbox" name="show_in_create" id="show_in_create">';
        html += '<label for="show_in_create" class="chekboxLabel">Prikaži pri dodajanju</label></div>';
        html += '<div class="col col50"><input type="checkbox" name="show_in_create_quick" id="show_in_create_quick">';
        html += '<label for="show_in_create_quick" class="chekboxLabel">Prikaži pri hitrem dodajanju</label></div>';
    }
    
    // DEFAULT VALUE
    if(TextColumns.includes(type)){
        html += '<br><label for="preselected_option">Privzeta vrednost</label>';
        html += '<input type="text" name="preselected_option" id="preselected_option">';
    }
    else if(NumberColumns.includes(type)){
        html += '<br><label for="preselected_option">Privzeta vrednost</label>';
        html += '<input type="number" name="preselected_option" id="preselected_option">';
    }
    else if(type == 'SELECT'){
        list = list.split('|');
        html += '<br><label for="possible_choices">Spremeni izbiro</label>';
        html += '<b class="button button100 buttonGreen" onclick="addSelectOptions($(this))">Dodaj več opcij</b>';
        html += '<br><label for="preselected_option">Privzeta vrednost</label>';
        html += '<select name="preselected_option" id="preselected_option">';
        html += '<option></option>';
        for(var i=0; i<list.length; i++){
            var l = list[i].split(',');
            html += '<option value="' + l[0] + '">' + l[1] + '</option>';
        }
        html += '</select>';
    }
    else if(type == 'CHECKBOX'){
        html += '<br><label for="preselected_option">Privzeta vrednost</label>';
        html += '<input type="number" name="preselected_option" id="preselected_option" min="0" max="1">';
    }
    else if(type == 'JOIN_ADD'){
        html += '<br><label for="preselected_option">Privzeta vrednost</label>';
        html += '<select name="preselected_option" id="preselected_option">';
        html += '<option value="">' + slovar('Select') + '</option>';
        html += '<option value="{PARENT}">' + slovar('Get_from_child_module') + '</option>';
        html += '<option value="{USER}">' + slovar('Users') + '</option>';
        html += '<option value="{ROLE}">' + slovar('Roles') + '</option>';
        html += '</select>';
    }
    else if(type == 'JOIN_GET'){
        list = list.split(',');
        html += '<br><label>Tip JOIN GET</label>';
        html += '<input type="hidden" name="preselected_option" id="preselected_option">';
        html += '<div style="display:flex;">';
        html += '<select class="editColumnJoinGet1" onchange="editColumnJoinGet()">';
        html += '<option></option>';
        html += '<option>COUNT</option>';
        html += '<option>SUM</option>';
        html += '</select>';
        html += '<select class="editColumnJoinGet2" onchange="editColumnJoinGet()">';
        html += '<option></option>';
        html += '</select>';
        html += '<select class="editColumnJoinGet3" onchange="editColumnJoinGet()">';
        html += '<option></option>';
        html += '<option>PRICE</option>';
        html += '<option>PERCENT</option>';
        html += '</select>';
        html += '</div><div class="displayJGalert"></div>';
    }
    
    // SELECT WIDTH
    if(custom){
        html += '<br><label for="width">Širina polja</label>';
        html += '<select name="width" id="width">';
        html += '<option>10</option>';
        html += '<option>20</option>';
        html += '<option>25</option>';
        html += '<option>30</option>';
        html += '<option>40</option>';
        html += '<option>50</option>';
        html += '<option>60</option>';
        html += '<option>70</option>';
        html += '<option>75</option>';
        html += '<option>80</option>';
        html += '<option>90</option>';
        html += '<option>100</option>';
        html += '</select>';
    }
    
    box.html(html);

    // ADD DATA FROM CLICKED COLUMN
    if(special){ $('#special').prop('checked', true) }
    if(mandatory){ $('#mandatory').prop('checked', true) }
    if(show_in_create >= 1){ $('#show_in_create').prop('checked', true) }
    if(show_in_create >= 2){ $('#show_in_create_quick').prop('checked', true) }
    if(editable){ $('#editable').prop('checked',true) }
    if(active){ $('#active').prop('checked',true) }
    $('#preselected_option').val(preselected_option);
    $('#width').val(width);
    box.parent().find('select[name=category]').val(category);

    if(type == 'SELECT'){
        for(var i=0; i<list.length; i++){
            var l = list[i].split(',');
            addSelectOptions(box.find('.button100'));
            box.find('input[name="select_option_1[]"]').last().val(l[0]);
            box.find('input[name="select_option_2[]"]').last().val(l[1]);
            box.find('input[name="select_option_3[]"]').last().val(l[2]);
        }
    }
    else if(type == 'JOIN_GET'){
        GET_column({
            module:list[1],
            showAll:true,
            done: function(data){
                for(var r = 0; r < data.length; r++){
                    box.find('.editColumnJoinGet2').append('<option value="' + data[r].column + '">' + slovar(data[r].name) + '</option>');
                }
                if(preselected_option != null){
                    box.find('.editColumnJoinGet1').val(preselected_option.split(',')[0]);
                    box.find('.editColumnJoinGet2').val(preselected_option.split(',')[1]);
                    box.find('.editColumnJoinGet3').val(preselected_option.split(',')[2]);
                }
            }
        })
    }
}

function editColumnJoinGet(){
    var box = $('#EditColumnExtra');
    var alertBox = box.find('.displayJGalert');
    alertBox.find('.alert').remove();
    var preselected_option = box.find('#preselected_option');
    var type = box.find('.editColumnJoinGet1').val();
    var column = box.find('.editColumnJoinGet2').val();
    var columnType = box.find('.editColumnJoinGet3').val();
    if(type != '' && column != ''){
        preselected_option.val(type + ',' + column + ',' + columnType);
        createAlert(alertBox,'Red',slovar('Performance_decrease_warning'));
    }
    else{ preselected_option.val(''); }
}

// SUBMIT EDIT COLUMN
$('.editColumnForm').on('submit', function(e){
    e.preventDefault();
    var form = $(this);
    var token = $('#csrf_token');
    form.prepend(token);
    var module = $('#column_table').attr('data-module');
    var column = form.find('[name=column_id]').val();
    form.find('.alert').remove();
    $.post('/crm/php/admin/module.php?edit_column=1&column=' + column, form.serialize(), function(data){
        data = JSON.parse(data);
        if(data.error){ createAlert(form, 'Red', data.error); }
        else{
            loadColumns(module, function(){ closeEditColumn(); });
        }
    })
});

// GET CATEGORY LIST
function getColumnCategories(add = 0){
    if(add == 0){
        var arr = [];
        $('#column_table .table tbody tr').each(function(){
            if(!arr.includes($(this).attr('data-category'))){ arr.push($(this).attr('data-category')); }
        });

        cat = '<select name="category">';
        for(var i = 0; i<arr.length; i++){ cat += '<option>' + arr[i] + '</option>'; }
        cat += '</select>';
        cat += '<a class="button button100 buttonBlue" onclick="getColumnCategories(1)">Dodaj novo skupino</a>';
    }
    else{
        cat = '<input type="text" name="category" required>';
        cat += '<a class="button button100 buttonBlue" onclick="getColumnCategories()">Izberi skupino</a>';
    }
    $('.getColumnCategories').html(cat);
}

// DELETE COLUMN
function deleteColumn(column){
    hideDropdownMenu();
    POPUPconfirm('Izbriši stolpec', 'Ali res želite izbrisati ' + column, function(){
        $('#column_table').find('.alert').remove();
        var form = $('.deleteColumnForm');
        var token = $('#csrf_token');
        form.prepend(token);
        var module = $('#column_table').attr('data-module');
        form.find('[name=column_id]').val(column);
        $.post('/crm/php/admin/module.php?delete_column=1', form.serialize(), function(data){
            data = JSON.parse(data);
            if(!data.error){ loadColumns(module); }
            else{ createAlert($('#column_table'), 'Red', data.error); }
        })
    });
}

$(document).ready(function(){
    $('#AddColumnBox [name=type]').change(function(){ changeColumnType(); });
});

var NotRealColumns = ['JOIN_GET'];
var NumberColumns = ['INT', 'DECIMAL', 'PRICE', 'PERCENT'];
var TextColumns = ['VARCHAR'];