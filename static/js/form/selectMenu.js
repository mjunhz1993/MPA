function openSelectMenu(el){
    if(el.find('input').prop('disabled')){ return }
    el.find('input').blur();
    if(el.find('.DropdownMenuContent').length == 0){
        var name = 'sm' + new Date().getTime();
        el.attr('data-name', name);
        var list = el.attr('data-list').split('|');
        var callback = '';
        if(!valEmpty(el.attr('data-callback'))){ callback = el.attr('data-callback'); }
        
        var html = '';
        html += '<div class="DropdownMenuContent"><div class="selectOptions">';
        html += '<a class="selectOption" data-value="" onClick="selectMenuChoose(\'' + name + '\', $(this), \'' + callback + '\')">' + slovar('Empty') + '</a>';
        html += '</div></div>';
        el.append(html);
        var box = el.find('.selectOptions');
        box.append(loadSelectMenuDataDefault(name, list, callback));
        turnOnNewSelectMenu(el);
    }
    else{
        showDropdownMenu(el, true);
        if($('#DropdownMenu input').length == 1 && !smallDevice()){ $('#DropdownMenu input').focus(); }
    }
}

function loadSelectMenuDataDefault(name, list, callback){
    var html = '';
    for(var i=0; i<list.length; i++){
        var l = list[i].split(',');
        html += '<a class="selectOption" data-value="' + l[0] + '" ';
        html += 'onClick="selectMenuChoose(\'' + name + '\', $(this), \'' + callback + '\')" ';
        if(!valEmpty(l[2])){ html += 'data-color="'+l[2]+'" style="background-color:' + l[2] + ';color:' + getContrastYIQ(l[2]) + ';" '; }
        html += '>' + slovar(l[1]) + '</a>';
    }
    return html;
}

function turnOnNewSelectMenu(el){
    if(el.find('a').length > 6){
        var html = '<input type="text" class="DropdownMenuSearchBox" placeholder="' + slovar('Search') + '" onkeyup="search_selectMenu($(this))">';
        el.find('.DropdownMenuContent').prepend(html);
    }
    resetDropdownMenuConfig();
    setTimeout(function(){
        showDropdownMenu(el, true);
        if($('#DropdownMenu input').length == 1 && !smallDevice()){ $('#DropdownMenu input').focus(); }
    } , 50);
}

function search_selectMenu(el){
    var c = el.parent().find('a');
    if(el.val() != ''){
        c.each(function(){
            var t = $(this).text().toLowerCase();
            if(t.includes(el.val().toLowerCase())){ $(this).show(); }
            else{ $(this).hide(); }
        });
    }
    else{ c.show(); }
}

function selectMenuChoose(name, el, callback){
    var input = $('[data-name="' + name + '"] input').first();
    var t = el.text();
    if(valEmpty(el.attr('data-value'))){ t = slovar('Select') }
    input.val(el.attr('data-value')).next().text(t);
    hideDropdownMenu();
    if(!valEmpty(callback)){ eval(callback) }
    input.closest('.formField').next().find('input').focus();
}

function selectMenuRefreshPlaceholders(box){box.find('.selectMenu input').each(function(){selectMenuRefreshPlaceholder($(this))})}
function selectMenuRefreshPlaceholder(el){
    var placeholder = el.next();
    placeholder.text(slovar('Select'));
    var list = el.parent().attr('data-list').split('|');
    for(var i=0; i<list.length; i++){
        var l = list[i].split(',');
        if(el.val() == l[0]){ placeholder.text(slovar(l[1])); break; }
    }
}