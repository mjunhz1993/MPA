// -------------------- ADDING NEW FILTER

function openFilterTableAdd(module, callback){
    $.get('/crm/php/main/module.php?get_all_users=1', function(users){
        users = JSON.parse(users);
        GET_column({
            module:module,
            showAll:true,
            done: function(cols){
                $('#filterTableBox').css({ 'width':'90%','max-height':'90%' });
                var box = $('#filterTableBoxInner');
                box.html(generateFilterFrom(cols, users));

                loadJS('https://code.jquery.com/ui/1.12.1/jquery-ui.js', function(){
                    box.find('.thisSortable').sortable({
                        items: "div",
                        handle: ".sortHandle",
                        placeholder: "ui-state-highlight",
                        axis: 'x',
                        revert: true,
                        activate: function(event, ui){
                            box.find('.ui-state-highlight').css({
                                'width': '100px',
                                'height':'20px'
                            })
                        },
                        deactivate: function(event, ui){
                            
                        }
                    });
                });

                // MOVE HIDDEN OPTIONS TO FILTER ORDER
                box.find('.order_by, .filter_column').append(box.find('.filter_options').html());
                // ADD CREATING EVENT ON MAIN BUTTON
                box.parent().find('.SaveChangesButton').unbind().click(function(){ createFilter(module) });
                box.find('form').on('submit', function(e){ createFilter(module); e.preventDefault(); });
                if(typeof callback === 'function'){ callback(); }
            }
        })
    })
}

function generateFilterFrom(cols, users, html = ''){
    html += '<select class="filter_options" style="display: none;">';
    html += '<option class="empty"></option>';
    for(var r = 0; r < cols.length; r++){
        var col = cols[r];
        if(col.active){
            html += '<option data-type="' + col.type + '" ';
            if(['SELECT','JOIN_ADD'].includes(col.type)){ html += 'data-list="' + col.list + '" '; }
            html += 'value="' + col.column + '">';
            html += slovar(col.name) + '</option>';
        }
    }
    html += '</select>';
    html += '<form method="post">';
    html += '<div style="display:flex;align-items:center;">';
    html += checkboxInput({
        name:'public',
        id:'public_filter',
        label:slovar('Public'),
        onchange:'togglePublicFilter()'
    })
    html += '<input type="text" name="name" id="filter_name" placeholder="' + slovar('Filter_name') + '" required>';
    html += '</div>';
    // SHARE WITH
    html += '<h2 class="assignfilterboxh2">'+slovar('Share_with')+'</h2>'
    html += '<div class="assignfilterbox">';
    for(var i=0; i<users.length; i++){
        thisUser = users[i];
        if(thisUser.user_id == user_id){ continue }
        html += checkboxInput({
            name:'share[]',
            value:thisUser.user_id,
            id:'share'+thisUser.user_id,
            label:thisUser.user_username,
        })
    }
    html += '</div>';
    // FILTER ORDER
    html += '<h2>' + slovar('Filter_order') + '</h2>'
    html += '<div class="visible_columns_box"><div>';
    html += '<select class="order_by" name="order_by[]"></select>';
    html += '<select class="order_by_direction" name="order_by_direction[]">';
    html += '<option value="ASC">ASC</option>';
    html += '<option value="DESC">DESC</option>';
    html += '</select>';
    html += '<a style="display:none;" class="deleteXbutton" onclick="removeFilterColumn($(this))">' + getSVG('x') + '</a>';
    html += '</div></div>';
    html += '<b class="buttonSquare button100 buttonGreen" onclick="addOrderByColumn()">' + slovar('Add_new') + '</b>';
    // FILTER COLUMNS
    html += '<h2 style="margin-top:20px">' + slovar('Filter_columns') + '</h2>'
    html += '<div class="visible_columns_box thisSortable"><div>';
    html += '<a class="sortHandle">' + getSVG('move') + '</a>';
    html += '<select class="filter_column" name="filter_column[]" onchange="filterFilterColumns()"></select>';
    html += '<a style="display:none;" class="deleteXbutton" onclick="removeFilterColumn($(this))">' + getSVG('x') + '</a>';
    html += '</div></div>';
    html += '<b class="buttonSquare button100 buttonGreen" onclick="addFilterColumn()">' + slovar('Add_new') + '</b>';
    // FILTER SEARCH
    html += '<h2 style="margin-top:20px">' + slovar('Filter_conditions') + '</h2>'
    html += '<div class="conditionbox">';
    html += '<fieldset><legend><select class="filter_type_group" data-num="1" onchange="changeFilterConditionGroupVal($(this))">';
    html += '<option>AND</option>';
    html += '<option>OR</option>';
    html += '</select></legend>';
    html += '<b class="buttonSquare button100 buttonGreen" onclick="addFilterCondition($(this))">' + slovar('Add_filter_condition') + '</b>';
    if(user_id == 1){
        html += '<b class="buttonSquare button100 buttonBlue" onclick="addFilterCondition($(this), \'CUSTOM\')">' + slovar('Add_filter_condition') + ' (Admin)</b> ';
    }
    html += '</fieldset></div>';
    html += '<b class="buttonSquare button100 buttonGreen" onclick="addFilterConditionGroups()">' + slovar('Add_group') + '</b>';
    html += '</form>';
    return html;
}

function togglePublicFilter(){
    var box = $('#filterTableBoxInner');
    if($('#public_filter').is(':checked')){ return box.find('.assignfilterbox,.assignfilterboxh2').hide() }
    box.find('.assignfilterbox,.assignfilterboxh2').show();
}

// ON SELECTING COLUMN ORDER EVENT
function addOrderByColumn(){
    var html = '<div>' + $('#filterTableBoxInner .order_by').last().parent().html() + '</div>';
    $('#filterTableBoxInner .order_by').closest('.visible_columns_box').append(html);
    $('#filterTableBoxInner .order_by').last().parent().find('a').show();
}

function filterFilterColumns(){
    var arr = [];
    $('#filterTableBoxInner .filter_column').each(function(){ arr.push($(this).val()) });
    $('#filterTableBoxInner .filter_column option:not(:selected)').each(function(){
        if(arr.includes($(this).attr('value'))){ $(this).attr('disabled','disabled') }else{ $(this).removeAttr('disabled') }
    });
}

function addFilterColumn(){
    var html = '<div>' + $('#filterTableBoxInner .filter_column').last().parent().html() + '</div>';
    $('#filterTableBoxInner .filter_column').last().parent().after(html);
    $('#filterTableBoxInner .filter_column').last().parent().find('a').show();
    filterFilterColumns();
}

function removeFilterColumn(el){ el.parent().remove(); filterFilterColumns(); }

function addFilterCondition(el, extra = ''){
    var box = el.closest('fieldset');
    var filter_condition_groups = box.find('.filter_type_group');
    var html = '<div style="display:flex;">';
    html += '<input type="hidden" name="filter_group_num[]" value="' + filter_condition_groups.attr('data-num') + '">';
    html += '<input type="hidden" name="filter_type[]" value="' + filter_condition_groups.val() + '">';
    // ADD SELECT FILED FOR COLUMN
    html += '<div class="filter_condition" style="flex-grow:1">'
    html += '<select class="filter_condition_1" name="filter_column_id[]" ';
    html += 'onchange="checkFilterConditionColumn($(this))">' + $('#filterTableBoxInner .filter_options').html() + '</select>';
    html += '</div>';
    // ADD SELECT FILED FOR SEARCH TYPE
    html += '<div class="filter_condition" style="flex-grow:1"></div>'
    // ADD INPUT FILED FOR SEARCH TEXT
    html += '<div class="filter_condition" style="flex-grow:1"></div>'
    html += '<a style="align-self:center" class="deleteXbutton" onclick="removeFilterColumn($(this))">' + getSVG('x') + '</a>';
    html += '</div>';
    // DISPLAY FIELDS
    box.append(html);
    box.find('.filter_condition_1').last().prepend('<option data-type="JOIN_ADD" data-list="added,user,user_id|" value="added">' + slovar('Users') + '</option>');
    // REMOVE EMPTY SELECT OPTION
    box.find('.filter_condition_1:last-child .empty').remove();
    // REMOVE JOIN_GET SELECT OPTION
    box.find('.filter_condition_1:last-child [data-type=JOIN_GET]').remove();
    // REMOVE SPECIAL SELECT OPTIONS
    for(var s=0; s<filter_SpecialConditionColumns.length; s++){
        box.find('.filter_condition_1:last-child [data-type=' + filter_SpecialConditionColumns[s] + ']').remove();
    }
    // IF CUSTOM FILTER - ADMIN ONLY
    if(extra == 'CUSTOM'){
        html = '<input type="text" class="filter_condition_1" name="filter_column_id[]" placeholder="module.column">';
        box.find('.filter_condition_1').last().replaceWith(html);
    }
    // ADD FILTER CONDITION FIELDS FOR SELECTED COLUMN
    checkFilterConditionColumn(box.find('.filter_condition_1').last());
}

function checkFilterConditionColumn(el, value = ''){
    var box1 = el.parent().next();
    var box2 = el.parent().next().next();
    var type = el.find('option:selected').attr('data-type');
    if(valEmpty(type)){ type = 'VARCHAR' }
    [html1,html2] = generateFilterConditionColumn(el, type, value);
    box1.html(html1);
    box2.html(html2);
    if(['DATE','TIME','DATETIME'].includes(type)){loadJS('form/datepicker', function(){ checkForDatePickerInputs(box2) })}
}

function generateFilterConditionColumn(el, type, value, html1 = '', html2 = ''){
    var name1 = 'filter_condition_type[]';
    var name2 = 'filter_value[]';

    if(filter_NumberConditionColumns.includes(type))
    {
        html1 += '<select class="filter_condition_2" name="' + name1 + '" onchange="checkFilterConditionType($(this))">';
        for(var ft = 0; ft<filter_NumberConditionTypes.length; ft++)
        { html1 += '<option value="' + filter_NumberConditionTypes[ft] + '">' + slovar(filter_NumberConditionTypes[ft]) + '</option>'; }
        html1 += '</select>';
        html2 += '<input type="number" name="' + name2 + '" value="' + value + '">';
        return [html1,html2]
    }
    if(filter_TextConditionColumns.includes(type))
    {
        html1 += '<select class="filter_condition_2" name="' + name1 + '" onchange="checkFilterConditionType($(this))">';
        for(var ft = 0; ft<filter_TextConditionTypes.length; ft++)
        { html1 += '<option value="' + filter_TextConditionTypes[ft] + '">' + slovar(filter_TextConditionTypes[ft]) + '</option>'; }
        html1 += '</select>';
        html2 += '<input type="text" name="' + name2 + '" value="' + value + '">';
        return [html1,html2]
    }
    else if(type == 'SELECT'){
        html1 += '<select class="filter_condition_2" name="' + name1 + '" onchange="checkFilterConditionType($(this))">';
        for(var ft = 0; ft<filter_TextConditionTypes.length; ft++)
        { html1 += '<option value="' + filter_TextConditionTypes[ft] + '">' + slovar(filter_TextConditionTypes[ft]) + '</option>'; }
        html1 += '</select>';
        html2 = createFormField({
            editable:true,
            type:'SELECT',
            column:name2,
            list:el.find('option:selected').attr('data-list'),
            preselected_option:value
        });
        return [html1,html2]
    }
    else if(type == 'CHECKBOX'){
        html1 += '<select class="filter_condition_2" name="' + name1 + '" onchange="checkFilterConditionType($(this))">';
        html1 += '<option value="Equals">' + slovar('Equals') + '</option>';
        html1 += '</select>';
        html2 = createFormField({
            editable:true,
            type:'SELECT',
            column:name2,
            list:'0,No|1,Yes',
            preselected_option:value
        });
        return [html1,html2]
    }
    else if(['DATE','DATETIME'].includes(type))
    {
        html1 += '<select class="filter_condition_2" name="' + name1 + '" onchange="checkFilterConditionType($(this))">';
        for(var ft = 0; ft<filter_DateConditionTypes.length; ft++)
        { html1 += '<option value="' + filter_DateConditionTypes[ft] + '">' + slovar(filter_DateConditionTypes[ft]) + '</option>'; }
        html1 += '</select>';
        html2 = createFormField({
            editable:true,
            type:'DATE',
            column:name2,
            preselected_option:value
        });
        return [html1,html2]
    }
    else if(type == 'TIME')
    {
        html1 += '<select class="filter_condition_2" name="' + name1 + '" onchange="checkFilterConditionType($(this))">';
        for(var ft = 0; ft<filter_DateConditionTypes.length; ft++)
        { html1 += '<option value="' + filter_DateConditionTypes[ft] + '">' + slovar(filter_DateConditionTypes[ft]) + '</option>'; }
        html1 += '</select>';
        html2 = createFormField({
            editable:true,
            type:'TIME',
            column:name2,
            preselected_option:value
        });
        return [html1,html2]
    }
    else if(type == 'JOIN_ADD'){
        html1 += '<select class="filter_condition_2" name="' + name1 + '" onchange="checkFilterConditionType($(this))">';
        for(var ft = 0; ft<filter_NumberConditionTypes.length; ft++)
        { html1 += '<option value="' + filter_NumberConditionTypes[ft] + '">' + slovar(filter_NumberConditionTypes[ft]) + '</option>'; }
        html1 += '</select>';
        html2 = createFormField({
            editable:true,
            type:'JOIN_ADD',
            column:name2,
            list:el.find('option:selected').attr('data-list'),
            preselected_option:[value,value]
        });
        return [html1,html2]
    }
}

function checkFilterConditionType(el){
    var selected = el.val();
    if(['Is_empty','Is_not_empty'].includes(selected)){ el.parent().next().find('input, .inputPlaceholder').css('opacity', 0); }
    else{ el.parent().next().find('input, .inputPlaceholder').css('opacity', 1); }
}

function addFilterConditionGroups(html = ''){
    var form = $('#filterTableBoxInner form');
    var num = parseInt(form.find('.filter_type_group').last().attr('data-num')) + 1;
    html += '<fieldset><legend><div>';
    html += '<select class="filter_type_group" data-num="' + num + '" onchange="changeFilterConditionGroupVal($(this))">';
    html += '<option>AND</option>';
    html += '<option>OR</option>';
    html += '</select>';
    html += '<a style="vertical-align:-7px" class="deleteXbutton" onclick="removeFilterConditionGroup($(this))">' + getSVG('x') + '</a></div>';
    html += '</legend>';
    html += '<b class="buttonSquare button100 buttonGreen" onclick="addFilterCondition($(this))">' + slovar('Add_filter_condition') + '</b>';
    if(user_id == 1){
        html += '<b class="buttonSquare button100 buttonBlue" onclick="addFilterCondition($(this), \'CUSTOM\')">' + slovar('Add_filter_condition') + ' (Admin)</b> ';
    }
    html += '</fieldset>';
    $('#filterTableBoxInner .conditionbox').append(html);
}

function changeFilterConditionGroupVal(el){ el.closest('fieldset').find('[name="filter_type[]"]').val(el.val()) }

function removeFilterConditionGroup(el){ el.closest('fieldset').remove() }

function createFilter(module){
    var form = $('#filterTableBoxInner form');
    form.find('.alert').remove();
    var token = $('input[name=csrf_token]').first();
    form.find('input[name=csrf_token]').remove();
    form.prepend(token.clone());
    $.post('/crm/php/main/module_filters.php?create_filter=1&module=' + module, form.serialize(), function(data){
        data = JSON.parse(data);
        if(data.error){ return createAlert(form, 'Red', data.error) }
        closeFilterTable();
        activateEventsBehindFilterTable();
    });
}

// ---------------------- EDIT

function openFilterTableEdit(module){
    var id = $('#filterTableBoxInner select').val();
    $.get('/crm/php/main/module_filters.php?get_filter=1&id=' + id, function(data){
        data = JSON.parse(data); console.log(data);
        if(data.error){ return console.log(data.error) }
        openFilterTableAdd(module, function(){
            var box = $('#filterTableBoxInner');

            if(data.public == 1){ box.find('#public_filter').prop('checked', true); }
            togglePublicFilter();
            box.find('#filter_name').val(data.name);

            for(var i=0; i<data.share.length; i++){
                box.find('.assignfilterbox #share'+data.share[i]).prop('checked',true)
            }

            for(var i=0; i<data.order_by.length; i++){if(data.order_by[i] != ''){
                var col = data.order_by[i].split('|');
                box.find('.order_by').last().val(col[0]);
                box.find('.order_by_direction').last().val(col[1]);
                if(i + 1 == data.order_by.length){ continue }
                addOrderByColumn();
            }}

            for(var i=0; i<data.column_order.length; i++){
                var col = data.column_order[i];
                box.find('.filter_column').last().val(col);
                if(i + 1 == data.column_order.length){ continue }
                addFilterColumn();
            }
            filterFilterColumns();

            var currentGroupNum = 1;
            if(data.group_num){for(var i=0; i<data.group_num.length; i++){
                if(currentGroupNum != data.group_num[i]){ currentGroupNum = data.group_num[i]; addFilterConditionGroups(); }
                box.find('.filter_type_group').last().val(data.type[i]);
                addFilterCondition(box.find('fieldset .buttonGreen').last());
                if(box.find('.filter_condition_1').last().find('option[value="' + data.column_id[i] + '"]').length == 0){
                    var html = '<option data-type="VARCHAR" value="' + data.column_id[i]+ '">' + data.column_id[i] + '</option>';
                    box.find('.filter_condition_1').last().append(html);
                }
                box.find('.filter_condition_1').last().val(data.column_id[i]);
                checkFilterConditionColumn(box.find('.filter_condition_1').last(), data.value[i]);
                box.find('.filter_condition_2').last().val(data.condition_type[i]);
            }}
            box.parent().find('.SaveChangesButton').unbind().click(function(){ editFilter(id) });
        });
    })
}

function editFilter(id){
    var form = $('#filterTableBoxInner form');
    form.find('.alert').remove();
    var token = $('input[name=csrf_token]').first();
    form.find('input[name=csrf_token]').remove();
    form.prepend(token.clone());
    $.post('/crm/php/main/module_filters.php?edit_filter=1&id=' + id, form.serialize(), function(data){
        data = JSON.parse(data);
        if(data.error){ return createAlert(form, 'Red', data.error) }
        closeFilterTable();
        activateEventsBehindFilterTable();
    });
}

var filter_SpecialConditionColumns = ['FILE', 'JOIN_ADD_SELECT','BUTTON'];
var filter_NumberConditionColumns = ['INT', 'ID', 'DECIMAL', 'PRICE', 'PERCENT'];
var filter_TextConditionColumns = ['VARCHAR', 'TEXTAREA'];

var filter_NumberConditionTypes = ['Equals', 'Not_equal_to', 'Less_then', 'Greater_then', 'Is_empty', 'Is_not_empty'];
var filter_TextConditionTypes = ['Equals', 'Not_equal_to', 'Begins_with', 'Ends_with', 'Contains', 'Does_not_contain', 'Is_empty', 'Is_not_empty'];
var filter_DateConditionTypes = ['Equals', 'Not_equal_to', 'Less_then', 'Greater_then', 'Is_empty', 'Is_not_empty'];