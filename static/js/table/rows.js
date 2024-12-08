function tableAddLoadedTools(module, box, id, data, html = ''){
    if(!valEmpty(box.data('simplify'))){ return '' }
    html += '<td class="toolRow">';
    var archive = box.find('.archiveSelect').val();
    if(valEmpty(archive)){ archive = '' }

    html += '<a class="linksvg" href="/crm/templates/modules/main/main.php?module=' + module.module + '#' + id + '-READ-' + archive + '" ';
    html += 'data-tooltip="' + slovar('View') + '">' + getSVG('list') + '</a>';

    if(archive == '' && String(module.edit).split(',').includes(user_role_id)){
        if(box.attr('id') == 'main_table'){
            html += '<a class="linksvg" onClick="loadJS(\'main/edit-box\', function(){clickEditButton(' + id + ')})" ';
            html += 'data-tooltip="'+slovar('Edit_row') + '">' + getSVG('edit') + '</a>';
        }
        else{
            html += '<a class="linksvg" onClick="loadJS(\'main/edit-box\', function(){openEditBoxQuick(\'' + module.module + '\', ' + id + ', \'' + archive + '\')})" data-tooltip="';
            html += slovar('Edit_row') + '">' + getSVG('edit') + '</a>';
        }
    }

    html += '<div class="linksvg" onClick="showDropdownMenu($(this),true)" data-tooltip="'+slovar('Show_more')+'">'
    html += getSVG('more');
    html += '<div class="DropdownMenuContent">';
    html += '<a onClick="loadJS(\'main/extra/copy\',function(){copy_row({module:\''+module.module+'\',id:'+id+'})})">';
    html += getSVG('plus_circle')+' '+slovar('Copy_row')+'</a>';
    if(archive == '' && String(module.delete).split(',').includes(user_role_id)){
        html += '<hr><a class="red" onClick="tableClickDeleteButton($(this), \''+module.module+'\', '+id+')">';
        html += getSVG('delete')+' '+slovar('Delete_row')+'</a>';
    }
    html += '</div>';
    html += '</div>';

    if(box.attr('data-filter') == 'trash' && box.attr('data-filtervalue', 1) && box.attr('id') == 'main_table'){
        html += '<a class="linksvg" onClick="loadJS(\'table/table_trash\', function(){ clickRecoverFromTrash(' + id + ') })"';
        html += ' data-tooltip="' + slovar('Recover_row') + '">' + getSVG('refresh') + '</a>';
    }

    html += '</td>';
    return html;
}

function tableAddLoadedRows(module, id, value, c, table){
    var th = table.find('thead th:nth-child(' + (c + 1) + ')');
    if(table.find('thead .toolColumn').length == 0){ th = table.find('thead th:nth-child(' + c + ')'); }
    var type = th.attr('data-type');
    var list = th.attr('data-list');
    var archive = th.closest('.tableBox').find('.archiveSelect').val();
    if(valEmpty(archive)){ archive = '' }

    if(type == 'SELECT'){ return tableAddLoadedRows_SELECT(list, value) }
    if(type == 'JOIN_GET'){ return tableAddLoadedRows_JOIN_GET(value, id, th) }
    if(type == 'BUTTON'){ return tableAddLoadedRows_BUTTON(module, list, id, th) }
    if(type == 'CHECKBOX'){ return tableAddLoadedRows_CHECKBOX(value, th, id, c) }
    
    if(['',null].includes(value)){ return '<td></td>' }

    if(type == 'VARCHAR'){ return tableAddLoadedRows_VARCHAR(list, value, th, id, module, archive) }
    if(['PRICE','PERCENT'].includes(type)){ return tableAddLoadedRows_CURRENCY(type, value) }
    if(['DATE','TIME','DATETIME'].includes(type)){ return tableAddLoadedRows_DATE(type, value) }
    if(type == 'FILE'){ return tableAddLoadedRows_FILE(list, value, module, id, th) }
    if(type == 'TEXTAREA'){ return tableAddLoadedRows_TEXTAREA(value, module, id, th, archive) }
    if(type == 'JOIN_ADD'){ return '<td>'+getSVG('link')+value+'</td>' }

    return tableAddLoadedRows_DEFAULT(value)
}

function tableAddLoadedRows_VARCHAR(list, value, th, id, module, archive, html = ''){
    if(valEmpty(list)){ return tableAddLoadedRows_DEFAULT(value) }
    html += '<td ';
    if(list == 'COLOR'){ html += 'style="background-color:' + value + ';"' }
    html += '>';
    if(list == 'PRIMARY'){
        html += '<a class="link primary" title="' + value.replace('"', '') + '"';
        if(th.closest('.tableBox').attr('id') == 'main_table'){
            html += 'onClick="loadJS(\'main/edit-box\',function(){clickEditButton('+id+',\'READ\','+archive+')})"';
        }
        if(!valEmpty(th.closest('.tableBox').data('simplify'))){
            html += 'onClick="loadJS(\'main/read-box-mini\',function(el){open_readBoxMini(el,\'row\',\''+module.module+'\','+id+')},$(this))"';
        }
        else{ html += 'href="/crm/templates/modules/main/main.php?module='+module.module+'#'+id+'-READ-'+archive+'"' }
        html += '>'+value+'</a>';
    }
    else if(list == 'URL'){ html += urlifyMessage(value) }
    else if(list == 'PHONE'){ html += '<a class="link" onclick="clickTelLink(\'' + value + '\')">' + value + '</a>' }
    else if(list == 'EMAIL'){ html += '<a class="link" onclick="clickMailToLink(\'' + value + '\')">' + value + '</a>' }
    else if(list == 'MULTISELECT'){
        valueSplit = value.split('|');
        for(i=0; i<valueSplit.length; i++){
            var v = valueSplit[i].split(';');
            if(valEmpty(v[0])){ continue }
            html += '<div class="multiselectinputbox"><span>'+v[1]+'</span></div>';
        }
    }
    return html+'</td>';
}
function tableAddLoadedRows_SELECT(list, value, html = ''){
    html += '<td onmouseover="loadJS(\'table/edit/selectMenu\',function(el){ hoverTDselectMenu(el) },$(this))" ';
    html += 'onclick="loadJS(\'form/selectMenu\',function(el){ openSelectMenu(el) },$(this))" data-list="'+list+'" ';
    html += 'data-callback="editTableSelectMenu(name,el)" class="td_select" title="'+slovar('Edit_row')+'" ';
    list = list.split('|');
    var err = true;
    for(var i=0; i<list.length; i++){
        var l = list[i].split(',');
        if(l[0] != value){ continue } err = false;
        if(valEmpty(l[2])){ value = slovar(l[1]); break; }
        var bg = 'background-color:'+l[2]+';';
        var c = 'color:'+getContrastYIQ(l[2])+';';
        value = '<b>' + slovar(l[1]) + '<b>';
        break;
    }
    if(err){ value = ''; }
    html += 'style="'+bg+c+'">'+value+'</td>';
    return html;
}
function tableAddLoadedRows_CURRENCY(type, value, html = ''){
    html += '<td>'
    if(type == 'PERCENT'){ html += Percent(value) }
    else{ html += Price(value) }
    html += '</td>';
    return html;
}
function tableAddLoadedRows_CHECKBOX(value, th, id, c, html = ''){
    html += '<td>'
    html += '<input type="checkbox" id="tcb'+id+c+'" ';
    html += 'onchange="loadJS(\'table/edit/checkbox\', function(el){ editTableCheckbox(el) },$(this))" '
    if(value == 1){ html += 'checked' }
    html += '><label for="tcb'+id+c+'">';
    html += th.text()+'</label></td>';
    return html;
}
function tableAddLoadedRows_DATE(type, value, html = ''){
    html += '<td>'
    if(type == 'DATETIME'){ html += getDate(defaultDateFormat + ' ' + defaultTimeFormat, stringToDate(value, 'UTC')) }
    else if(type == 'DATE'){ html += getDate(defaultDateFormat, value) }
    else if(type == 'TIME'){ html += getDate(defaultTimeFormat, value) }
    return html+'</td>';
}
function tableAddLoadedRows_FILE(list, value, module, id, th, html = ''){
    if(list == 'IMG,1'){
        html += '<td><div class="avatarSmall" ';
        var valueSplit = value.split('.');
        html += 'style="background-image:url(/crm/static/uploads/' + module.module + '/' + valueSplit[0] + '_small.' + valueSplit.pop() + ')"';
        html += '></div></td>';
        return html;
    }
    html += '<td><a class="button buttonBlue buttonShowMore" ';
    html += 'onclick="tableClickOnShowMoreButtonFile($(this),\''+th.attr('data-module')+'\',\''+th.attr('data-column')+'\','+id+')">';
    html += slovar('Show_more') + '</a></td>';
    return html;
}
function tableAddLoadedRows_TEXTAREA(value, module, id, th, archive, html = ''){
    var col = th.attr('data-column');
    html += '<td><a class="button buttonBlue buttonShowMore" ';
    html += 'onclick="loadJS(\'form/cleditor\', function(){ tableClickOnShowMoreButtonTextarea(\'' + module.module + '\', \'' + col + '\', ' + id + ', \'' + archive + '\') })">';
    html += slovar('Show_more') + '</a></td>';
    return html;
}
function tableAddLoadedRows_JOIN_GET(value, id, th, html = ''){
    if(!valEmpty(th.attr('data-preselected_option'))){ return tableAddLoadedRows_DEFAULT(value) }
    html += '<td><a class="button buttonBlue buttonShowMore" onclick="';
    html += 'loadJS(\'main/read-box-mini\', function(el){open_readBoxMini(el,\'table\',\''+th.attr('data-list')+'\','+id+')},$(this))';
    html += '">'+slovar('Show_more') + '</a></td>';
    return html;
}
function tableAddLoadedRows_BUTTON(module, list, id, th, html = ''){
    return '<td>'+buttonInput(module.module,id,list)+'</td>'
}
function tableAddLoadedRows_DEFAULT(value){ return '<td>'+value+'</td>' }


function tableClickOnShowMoreButtonFile(el, module, column, id){
    var archive = el.closest('.tableBox').find('.archiveSelect').val();
    if(valEmpty(archive)){ archive = '' }
    GET_row({
        module:module,
        id:id,
        archive:archive,
        done: function(data){
            var popup = createPOPUPbox();
            var popupBox = popup.find('.popupBox');
            popupBox.html('<div class="fileArea"></div><hr><button class="button buttonGrey" onclick="removePOPUPbox()">'+slovar('Close')+'</button>');
            var fileArea = popupBox.find('.fileArea');
            if(data.file){for(var i=0; i<data.file.name.length; i++){
                if(column != data.file.column[i]){ continue }
                html = '<div class="file" data-file="'+data.file.name[i]+'"><div class="img" ';
                if(data.file.type[i].includes('image/')){ html += 'style="background-image:url(\'/crm/static/uploads/'+module+'/'+data.file.name[i]+'\')"' }
                html += '></div>';
                html += '<div class="fileDesc">'+data.file.oldName[i]+'</div></div>';
                fileArea.append(html);
                fileArea.find('.file').last().attr('data-tooltip', data.file.oldName[i]);
            }}
            popupBox.find('.img').click(function(){loadJS('file/file', function(el){ clickOnFile(module, el) }, $(this))});
            tooltips();
            popup.fadeIn('fast');
        }
    })
}