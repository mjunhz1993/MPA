function tableLoadColumns(box, callback){
    if(box.length == 0){ return console.log('ERROR: no outer table box') }
    var module = box.attr('data-module');
    var tableBox = box.find('.horizontalTable');
    if(tableBox.length == 0){ return console.log('ERROR: no inner table box') }
    tableLoadMoreButton();
    loadJS('form/form', function(){loadJS('GET/module', function(){
        GET_module({
            module:module,
            done: function(moduleData){
                addTableAccessRules(moduleData, tableBox.closest('.tableBox'));
                checkIfMainTable(box, tableBox, moduleData);
                if(!valEmpty(box.attr('data-button'))){ tableDisplayButtons(box, module) }
                var year = '';
                if(box.find('.archiveSelect').length == 1){ year = box.find('.archiveSelect').val() }
                tableBox.append(HTML_loader());
                GET_column({
                    module:module,
                    archive:year,
                    replaceFakeColumns:true,
                    done: function(data){ tableDisplayColumns(tableBox, data, callback) },
                    error: function(error){ createAlert(box,'Red',error) }
                })
            },
            error: function(error){ createAlert(box,'Red',error) }
        })
    })})
}

function addTableAccessRules(data, table){
    table.attr({
        'data-edit':data.can_edit,
        'data-delete':data.can_delete
    })
}

function checkIfMainTable(box, tableBox, moduleData, html = ''){
    if(tableBox.closest('.tableBox').attr('id') != 'main_table'){ return }
    if(tableBox.css('max-height') == 'none'){
        tableBox.css({'max-height':getMainBoxFreeHaight() - 5})
    }
    // ADD DATA TO OPTIONS BUTTON
    var tableTop = box.find('.tableTop').first();
    tableTop.find('td:nth-child(2)').html(HTML_toggleTableView(moduleData.accessories));


    var options_button = tableTop.find('.options_table .DropdownMenuContent');
    if(options_button.length == 0){ return }
    var access = box.attr('data-filteraccess');

    html += '<a onclick="loadJS(\'filter/filter\', function(){openFilterTable(\''+moduleData.module+'\','+access+')})">';
    html += getSVG('filter')+' <span>'+slovar('Filter_table')+'</span></a>';

    if(access == 1){
        html += '<a onclick="loadJS(\'table/resize_columns\', function(){resize_columns()})">';
        html += getSVG('move')+' </span>'+slovar('Resize_columns')+'</span></a>';
    }
    if(user_id == 1){
        html += '<a onclick="loadJS(\'table/archive\', function(){open_archiveMaker()})">';
        html += slovar('Archive_data')+'<sup>admin</sup></a>';
    }
    options_button.html(html);
    if(!valEmpty(moduleData.archive) && box.find('.archiveSelect').length == 0){loadJS('table/archive', function(){ getArchiveYears(box) })}
    resetDropdownMenuConfig();
}

function HTML_toggleTableView(accessories, html = ''){
    if(
        !accessories.includes('calendar')
    ){ return '' }

    html += '<a class="act" onclick="toggleTableView($(this),\'list\')" data-tooltip="'+slovar('General')+'">'+getSVG('list')+'</a>';
    if(accessories.includes('calendar')){
        html += '<a onclick="toggleTableView($(this),\'calendar\')" data-tooltip="'+slovar('Calendar')+'">'+getSVG('calendar')+'</a>';
    }
    if(accessories.includes('pipeline')){
        html += '<a onclick="toggleTableView($(this),\'pipeline\')" data-tooltip="'+slovar('Pipeline')+'">'+getSVG('pipeline')+'</a>';
    }
    return html;
}

function toggleTableView(el,type){
    el.parent().find('a').removeClass('act');
    el.addClass('act');
    if(type == 'list'){
        return removeCalendar(function(){
            tableLoadColumns(el.closest('.tableBox'));
        })
    }
    if(type == 'calendar'){
        return loadJS('table/calendar', function(){
            openCalendarTable(el.closest('.tableBox').attr('data-module'))
        })
    }
    if(type == 'pipeline'){
        return loadJS('table/pipeline', function(){
            openPipeline(el.closest('.tableBox').attr('data-module'))
        })
    }
}

function tableDisplayButtons(box, module, html = ''){
    if(box.find('.tableTop').length == 1){ return }
    box.prepend('<table class="tableTop"><tr><td></td><td></td></tr></table>');
    var tableTop = box.find('.tableTop').first();
    buttons = box.attr('data-button').split(',');
    for(var i=0; i<buttons.length; i++){
        if(buttons[i] == 'add'){
            html = '<button class="button buttonGreen" ';
            html += 'onclick="loadJS(\'main/add-box\', function(){ openAddBoxQuick(\'' + module + '\'); })">';
            html += getSVG('plus-circle') + '<span class="SVGdesc">' + slovar('Add_new') + '</span></buttons>';
            tableTop.find('td').first().append(html);
        }
    }
}

function tableDisplayColumns(tableBox, data, callback){
    var box = tableBox.closest('.tableBox');
    tableBox.text('');
    var html = '';
    if(data){
        html += '<table class="table"><thead><tr>';
        if(valEmpty(box.data('simplify'))){
            html += '<th class="no-sort toolColumn">';
            html += '<button class="linksvg" data-tooltip="'+slovar('Refresh_data')+'" onClick="tableLoad($(this))">';
            html += getSVG('refresh')+'</button></th>';
        }
        for(var c = 0; c < Object.keys(data).length; c++){
            var col = data[c];
            if(col == undefined){ continue }
            html += tableCreateColumn(col);
        }
        html += '</tr></thead><tbody></tbody></table>';
        tableBox.html(html);
        tooltips();
        tableCreateFilters(tableBox);
        tableLoad(tableBox, 0, callback);
    }
    else{console.log('ERROR: no data for columns')}
}

function tableCreateColumn(col, html = ''){
    if(!col.active){ return '' }

    html += '<th data-module="' + col.module + '" data-column="' + col.column + '" data-type="' + col.type + '" ';
    if(col.columnWidth != 0){ html += 'data-width="' + col.columnWidth + '" ' }
    if(!valEmpty(col.list)){ html += 'data-list="' + col.list + '" ' }
    if(col.type == 'JOIN_GET'){ html += 'data-preselected_option="' + col.preselected_option + '" ' }

    if(!table_FakeColumns.includes(col.type))
    {
        html += 'data-tooltip="' + slovar('Sort_by') + slovar(col.name) + '" ';
        html += 'onclick="sortByColumn($(this))" ';
    }

    html += 'class="column ';
    if(table_FakeColumns.includes(col.type)){ html += 'no-sort ' }
    html += '" ';

    html += '>' + slovar(col.name) + '</th>';
    return html;
}

function tableCreateFilters(tableBox){
    tableBox.find('.tableFilterRow').remove();
    var html = '<tr class="tableFilterRow ignoreRow">';
    tableBox.find('thead th').each(function(){
        var module = $(this).attr('data-module');
        var column = $(this).attr('data-column');
        var type = $(this).attr('data-type');
        var list = $(this).attr('data-list');
        if(column == undefined){ html += '<td class="toolRow">'; }
        else{ html += '<td data-module="' + module + '" data-column="' + column + '" data-type="' + type + '" data-list="' + list + '">'; }
        if(column == undefined && tableBox.closest('.tableBox').attr('id') == 'main_table'){
            html += '<button class="button button100 buttonBlue" onclick="loadJS(\'table/selectmultiple\', function(el){ openSelectMultiple(el); }, $(this))">';
            html += getSVG('more') + '<span class="SVGdesc">' + slovar('Select_multiple') + '</span></button>';
        }
        else{ html += tableCreateFiltersHTML($(this), column, type, list); }
        html += '</td>';
    });
    html += '</tr>';
    tableBox.find('tbody').prepend(html);
}

function tableCreateFiltersHTML(el, column, type, list, html =''){
    if(type == 'VARCHAR' && list != 'COLOR'){ return '<input type="text" onkeyup="keyupVARCHARtableFitler($(this), event.keyCode)">' }
    if(table_NumberColumns.includes(type)){ return '<input type="number" onkeyup="if(event.keyCode==13){ tableLoad($(this)) }">' }
    if(type == 'SELECT')
    {
        html += '<div class="selectMenu inputPlaceholder" data-callback="tableLoad(input)" data-list="' + list + '" ';
        html += 'onclick="loadJS(\'form/selectMenu\', function(el){ openSelectMenu(el); }, $(this))">';
        html += '<input type="text" name="' + column + '">';
        html += '<div>' + slovar('Select') + '</div></div>';
        return html
    }
    if(type == 'CHECKBOX'){
        html += '<select onchange="tableLoad($(this))">';
        html += '<option></option>';
        html += '<option value="1">' + slovar('Yes') + '</option>';
        html += '<option value="0">' + slovar('No') + '</option>';
        html += '</select>';
        return html
    }
    if(type == 'DATETIME'){ return '<input type="text" class="DateStartEndPickerInput" onfocus="openDateStartEndPicker($(this))" data-type="DATETIME">' }
    if(type == 'DATE'){ return '<input type="text" class="DateStartEndPickerInput" onfocus="openDateStartEndPicker($(this))">' }
    if(type == 'TIME'){ return '<input type="text" class="DateStartEndPickerInput" onfocus="openDateStartEndPicker($(this), \'time\')">' }
    if(type == 'JOIN_ADD'){
        html += '<input type="text" ';
        html += 'data-list="' + list + '" onfocusout="focusOutJOIN_ADDInput($(this))" ';
        html += 'autocomplete="off" style="display:none;" placeholder="' + slovar('Search') + '">';
        html += '<div class="inputPlaceholder JOIN_ADD_placeholder" data-list="' + list + '" onclick="focusJOIN_ADDInput($(this))">' + slovar('Search') + '</div>';
        return html
    }
    return ''
}

function keyupVARCHARtableFitler(el, key){
    el.removeAttr('style');
    if(el.val()[0] === '*'){ el.css({'color':'#ff7f50','font-weight':'600'}) }
    if(key == 13){ return tableLoad(el) }
}

// SUM
function tableCreateSumColumns(box){
    if(!valEmpty(box.data('simplify'))){ return }
    var tableBox = box.find('.horizontalTable');
    tableBox.find('tfoot').remove();
    var sumColumns = 0;
    var html = '<tfoot><tr class="tableSumRow ignoreRow">';
    tableBox.find('thead th').each(function(){
        var colModule = $(this).attr('data-module');
        var column = $(this).attr('data-column');
        var type = $(this).attr('data-type');
        html += '<td>';
        if(['ID','INT','DECIMAL','PRICE','PERCENT'].includes(type)){
            var calcType = 'SUM';
            if(type == 'ID'){ calcType = 'COUNT'; }
            else if(type == 'PERCENT'){ calcType = 'AVG'; }
            var buttonLabel = 'Total';
            if(type == 'ID'){ buttonLabel = 'Count'; }
            else if(type == 'PERCENT'){ buttonLabel = 'Average'; }
            html += '<button class="button button100 buttonBlue" ';
            html += 'onclick="getColumnSum($(this), \'' + colModule + '\', \'' + column + '\', \'' + calcType + '\')">' + slovar(buttonLabel); + '</button>';
            sumColumns++;
        }
        html += '</td>';
    });
    html += '</tr></tfoot>';
    if(sumColumns != 0){ tableBox.find('tbody').after(html); }
}


function getColumnSum(el, module, col, type){
    var box = el.closest('.tableBox');
    var F = getFilterData(box, module);
    var filters = F[0];
    var filter_values = F[1];
    var year = '';
    if(box.find('.archiveSelect').length == 1){ year = box.find('.archiveSelect').val() }
    el.hide();
    $.get('/crm/php/main/module.php?get_column_sum=1&module=' + module, {
        column: col,
        filters: filters,
        filter_values: filter_values,
        archive: year,
        type: type
    }, function(data){
        data = JSON.parse(data);
        if(data){ el.before(data.sum); }
    }).fail(function(){console.log('ERROR: backend napaka');});
}


function sortByColumn(el){
    var table = el.closest('table');
    var column = el.attr('data-column');
    if(el.hasClass('ascending')){
        table.find('thead th').removeClass('sorted ascending descending');
        el.addClass('sorted descending');
    }
    else{
        table.find('thead th').removeClass('sorted ascending descending');
        el.addClass('sorted ascending');
    }
    tableLoad(table);
}


// GET TABLE DATA
function tableLoad(box, offset = 0, callback){
    if(box.closest('.tableBox').length == 1){ box = box.closest('.tableBox'); }
    if(box.length == 0){ return console.log('ERROR: table has no box') }
    var module = box.attr('data-module');
    if(typeof module == 'undefined'){ return console.log('ERROR: box has no data-table link') }
    box.find('.tableLoadMoreButton').hide();
    // REMOVE ALL ROWS AND SELECT MULTIPLE TOOL - IF OFFSET 0
    if(offset == 0){
        box.find('.table tbody tr:not(.ignoreRow)').remove();
        if(box.find('.buttonCancelSelectMultiple').length > 0){ cancelSelectMultiple(box.find('.buttonCancelSelectMultiple').first()); }
    }
    // GET TABLE SORT
    var sortColumnName = null;
    var sortDirection = null;
    var sortColumn = box.find('.table thead th.sorted');
    if(sortColumn.length == 1){
        sortColumnName = sortColumn.attr('data-module') + '.' + sortColumn.attr('data-column');
        if(sortColumn.hasClass('ascending')){ sortDirection = 'ASC' }else{ sortDirection = 'DESC'; }
    }
    // GET TABLE FILTERS
    var F = getFilterData(box, module);
    // CHECK IF ARCHIVE EXSISTS
    var year = '';
    if(box.find('.archiveSelect').length == 1){ year = box.find('.archiveSelect').val() }
    // CHECK LIMIT
    var limit = null;
    if(!valEmpty(box.attr('data-limit'))){ limit = box.attr('data-limit') }
    // SEND DATA
    box.append(HTML_loader());
    GET_row({
        module:module,
        offset:offset,
        sort_column:sortColumnName,
        sort_direction:sortDirection,
        filter:F[0],
        filter_value:F[1],
        archive:year,
        limit:limit,
        done: function(data){
            remove_HTML_loader(box);
            box.find('.tableLoadMoreButton').show();
            if(offset == 0){ tableCreateSumColumns(box) }
            tableAddLoaded(module, box.find('.table'), data, callback);
        },
        error: function(err){ createAlert(box, 'Red', err) }
    })
}

function getFilterData(box, module){
    var filters = [];
    var filter_values = [];
    box.find('.tableFilterRow td:not(.toolRow)').find('input, select').each(function(){
        if($(this).val() == ''){ return }
        var td = $(this).closest('td');
        var col = td.attr('data-column');
        var colModule = td.attr('data-module');
        var moduleLabel = colModule + '.' + col;
        if($(this).attr('data-type') == 'DATETIME'){ // CHENGE TIMEZONE FROM LOCAL TO UTC
            if($(this).val().includes(',')){
                var temp = $(this).val().split(',');
                temp[0] = inputToUTC(temp[0]+' 00:00:00');
                temp[1] = inputToUTC(temp[1]+' 23:59:59');
                filter_values.push(temp.join(','));
            }
            else{ filter_values.push(inputToUTC($(this).val()+' 00:00:00')) }
        }
        else{ filter_values.push($(this).val()) }
        filters.push(moduleLabel);
    });
    // GET FILTERS FROM DATA ATTRIBUTE
    var attr_filter = box.attr('data-filter');
    var attr_filter_value = box.attr('data-filtervalue');
    if(typeof attr_filter != 'undefined' && typeof attr_filter_value != 'undefined'){
        attr_filter = attr_filter.split(',');
        attr_filter_value = attr_filter_value.split(',');
        for(var i = 0; i < attr_filter.length; i++){
            filters.push(module + '.' + attr_filter[i]);
            filter_values.push(attr_filter_value[i]);
        }
    }
    return [filters, filter_values];
}

function tableAddLoaded(module, table, data, callback){loadJS('table/rows', function(){
    var box = table.closest('.tableBox');
    box.find('.alert').remove();
    var newRow = tableCreateLoadedRows(box, table, data);
    // CREATE TBODY IF NOT EXISTING
    if(table.find('tbody').length == 0){ table.append('<tbody></tbody>') }
    // GET OLD ROW COUNT
    var prevTrL = table.find('tbody > tr.countme').length;
    // ADD ROWS TO TABLE
    newRow = table.find('tbody').first().append(newRow);
    newRow = newRow.find('tr:hidden');
    // FADE IN NEW ROWS
    table.find('tbody tr').fadeIn('fast');
    setTimeout(function(){
        tableCreateFixedWidthColumns(table);
        resetDropdownMenuConfig();
    }, 200);
    // GET NEW ROW COUNT
    var newTrL = table.find('tbody > tr.countme').length;
    // SHOW ROW COUNT
    if(box.find('.tableRowCount').length != 0){ box.find('.tableRowCount').text(newTrL) }
    // CREATE ALERT IF NO NEW ROWS ADDED
    if(prevTrL == newTrL){ createAlert(box, 'Red', slovar('No_items')) }
    // RESTART TOOLTIPS
    tooltips();
    // CONTINUE FUNCTION
    if(typeof callback === 'function'){ callback() }
})}

function tableCreateLoadedRows(box, table, data, newRow = ''){
    if(data.error){ return createAlert(box, 'Red', data.error) }
    var module = box.data();
    for(const [key, col] of Object.entries(data)){
        if(key == 'extra'){ continue }
        newRow += '<tr style="display:none" class="countme" data-id="' + col[0] + '">';
        if(table.attr('id') != 'DropdownMenuSelectTable'){ newRow += tableAddLoadedTools(module, box, col[0], data) }
        for(var c = 1; c < col.length; c++){ newRow += tableAddLoadedRows(module, col[0], col[c], c, table) }
        newRow += '</tr>';
    }
    return newRow
}

function tableResetFixedWidthColumns(box){ box.css('table-layout',''); tableCreateFixedWidthColumns(box); }
function tableCreateFixedWidthColumns(box){
    if(box.css('table-layout') != 'fixed' && box.find('thead th').first().width() != 0){
        var w = 0;
        box.find('thead th').each(function(){
            if($(this).attr('data-width') != undefined){ w = $(this).attr('data-width') }
            else{ w = $(this).width() }
            $(this).css('width', w);
        });
        box.css('table-layout','fixed');
    }
}

function tableLoadMoreButton(){
    $('.tableLoadMoreButton').unbind('click').click(function(){
        var box = $(this).closest('.tableBox');
        if(box.length == 1){
            var table = box.find('.table').first();
            if(box.length == 1){
                var tr = table.find('tbody > tr.countme');
                tableLoad(table, tr.length);
            }
            else{console.log('ERROR: button has no table');}
        }
        else{console.log('ERROR: button has no box');}
    });
}

function tableClickDeleteButton(el, module, id){POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
    $.post('/crm/php/main/module.php?delete_row=1&module='+module, {
        csrf_token: $('[name=csrf_token]').val(),
        id: id
    }, function(data){
        data = JSON.parse(data);
        if(data.error){ return createAlertPOPUP(data.error) }
        tableLoad($('.tableBox[data-module="'+module+'"]'))
    })
})}

function refreshAreaFromEl(el){
    if(el.closest('.tableBox').length != 0){ return tableLoad(el.closest('.tableBox')) }
    if(el.closest('#EditBox').length == 1){
        openEditBox(getRowFromURL().id, 'READ');
        tableLoad($('#main_table'));
    }
}

function getRowFromURL(){
    var h = window.location.hash.substring(1).split('-');
    return {'id':h[0],'type':h[1],'year':h[2]};
}

var table_FakeColumns = ['FILE','JOIN_GET','TEXTAREA','BUTTON'];
var table_NumberColumns = ['INT','ID','DECIMAL','PRICE','PERCENT'];