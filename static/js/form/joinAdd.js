function focusJOIN_ADDInput(placeholder){
    var input = placeholder.prev();
    input.blur();
    if(input.prop('disabled')){ return }
    JOINADD_showDropdownMenu(input);
}

function focusOutJOIN_ADDInput(input){
    var placeholder = input.next();
    if(input.val() == ''){
        placeholder.text(slovar('Search'));
        if(input.closest('.tableBox').length >= 1){ tableLoad(input) }
    }
    if(input.attr('data-childinput') != undefined && input.val() != ''){
        var data = input.attr('data-list').split('|')[0].split(',');
        GET_row({
            module:data[1],
            id:input.val(),
            done: function(data){
                var dataAttr = input.attr('data-childinput').split(',');
                var form = input.closest('form');
                for(var i=0; i<dataAttr.length; i+=2){
                    var inputTo = form.find('[name="' + dataAttr[i+1] + '"]');
                    inputTo.val(data[dataAttr[i]]);
                }
                refreshFormData(input.closest('form'));
            }
        })
    }
    if(placeholder.data('callback')){ eval(placeholder.data('callback')) }
    input.closest('.formField').next().find('input').focus();
}

function JOINADD_showDropdownMenu(el, html = ''){setTimeout(function(){
    var placeholder = el.next();
    var ST = $(document).scrollTop();
    var DropdownMenu = $('#DropdownMenu');
    var el_L = placeholder.offset().left;
    var el_T = placeholder.offset().top;
    var el_W = placeholder.outerWidth();
    if(el_W < 200){ el_W = 200 }
    var el_H = placeholder.outerHeight();
    var top = el_T - ST;

    var ph = slovar('Search');
    if(placeholder.text() != ''){ ph = placeholder.text() }

    html += '<input type="text" class="DropdownMenuSearchBox" placeholder="'+ph+'">';
    html += '<div style="position:relative;max-height:200px;overflow:auto;">'+HTML_loader()+'</div>';
    html += '<div class="rightBox"><a>%a%</a>'+getSVG('x')+'</div>';
    DropdownMenu.html(html);

    var searchInput = DropdownMenu.find('.DropdownMenuSearchBox');
    var searchModeButton = DropdownMenu.find('.rightBox a');
    var Xbutton = DropdownMenu.find('svg');

    searchInput.unbind('keyup').keyup(function(e){
        $(this).removeAttr('style');
        if($(this).val()[0] === '*'){ $(this).css({'color':'#ff7f50','font-weight':'600'}) }
        if([13,27,38,39,40].includes(e.keyCode)){ return JOINADD_keyEvent(el, searchInput, placeholder, e.keyCode) }
        JOINADD_search(el, placeholder, searchInput, DropdownMenu)
    });

    JOINADD_search(el, placeholder, searchInput, DropdownMenu, function(){
        setTimeout(function(){
            if($(window).height() < DropdownMenu.height() + top){ DropdownMenu.css('top', $(window).height() - DropdownMenu.height()) }
            if($(window).width() < DropdownMenu.width() + el_L){ DropdownMenu.css('left', $(window).width() - DropdownMenu.width()) }
        }, 201)
    });

    DropdownMenu.css({'top': top, 'left': el_L, 'width': el_W, 'opacity': 0}).slideDown(200).animate({ opacity: 1 },{ queue: false, duration: 'fast' });
    searchModeButton.click(function(){ JOINADD_changeSearchMode($(this), el, placeholder, searchInput) });
    Xbutton.attr('class','clearFieldSvg').click(function(){ JOINADD_clear(el) });
    searchInput.css('padding-right', Xbutton.outerWidth());

    setTimeout(function(){
        tooltips();
        if(!smallDevice()){ searchInput.focus() }
    }, 100);
}, 100);}

function JOINADD_changeSearchMode(but, el, placeholder, searchInput){
    if(but.text() == 'a%'){ but.text('%a%') }
    else{ but.text('a%') }
    return JOINADD_search(el, placeholder, searchInput, $('#DropdownMenu'))
}

function JOINADD_keyEvent(el, searchInput, placeholder, k){
    var box = searchInput.next('div');
    var tr = box.find('tr');
    var actTr = box.find('tr.act');
    if(k == 13){
        if(tr.length == 0){ return }
        if(actTr.length == 0){ return JOINADD_click(el, placeholder, tr.first()) }
        return JOINADD_click(el, placeholder, actTr)
    }
    if(k == 27){
        if(searchInput.val() != ''){ return searchInput.val('') }
        return JOINADD_clear(el);
    }
    if(k == 38){
        if(actTr.length == 0){ return JOINADD_moveToEl(box, tr.last()) }
        actTr.removeClass('act');
        if(actTr.prev('tr').length == 0){ return JOINADD_moveToEl(box, tr.last()) }
        return JOINADD_moveToEl(box, actTr.prev('tr'));
    }
    if(k == 39){
        if(actTr.length == 0){ return }
        searchInput.val(actTr.find('td').first().text())
        return JOINADD_search(el, placeholder, searchInput, $('#DropdownMenu'))
    }
    if(k == 40){
        if(actTr.length == 0){ return JOINADD_moveToEl(box, tr.first()) }
        actTr.removeClass('act');
        if(actTr.next('tr').length == 0){ return JOINADD_moveToEl(box, tr.first()) }
        return JOINADD_moveToEl(box, actTr.next('tr'));
    }
}
function JOINADD_moveToEl(box, el){
    el.addClass('act');
    var elH = el.outerHeight(true);
    var elP = el.position().top + elH;
    if(box.height() > elP && elP >= elH){ return }
    if(elP < elH){ boxST = box.scrollTop() - (Math.abs(elP) + elH) }
    else{ boxST = (box.scrollTop() + elP) - box.height() }
    box.scrollTop(boxST);
}

function JOINADD_search(el, placeholder, searchInput, DropdownMenu, callback = ''){
    var list = el.attr('data-list').split('|');
    var module = list[0].split(',')[1];
    var DropdownMenuTable = searchInput.next('div');
    var filter = JOINADD_filters(el, list);

    DropdownMenuTable.html(HTML_loader());
    dropdownMenuDelay(function(){loadJS('GET/module', function(){
        GET_row({
            module:module,
            dropdownMenu:true,
            searchMode:DropdownMenu.find('.rightBox a').text(),
            dropdownMenu_filter:filter['type'],
            dropdownMenu_filter_value:filter['value'],
            dropdownMenu_search_value:searchInput.val(),
            done: function(data){
                var html = '<table id="DropdownMenuSelectTable"></table>';
                html += '<div style="display:flex;">';
                html += '<b class="buttonSquare button100 buttonGreen"';
                html += 'onclick="loadJS(\'main/add-box\', function(){ hideDropdownMenu(); openAddBoxQuick(\''+module+'\'); })">';
                html += getSVG('plus_circle')+' <span>'+slovar('Add_new')+'</span></b>';
                html += '<b class="buttonSquare buttonBlue" ';
                html += 'onclick="loadJS(\'filter/filter\', function(){openFilterTable(\''+module+'\')})"'
                html += '>'+getSVG('filter')+'</b>'
                html += '</div>';
                DropdownMenuTable.html(html);
                if(typeof callback === 'function'){ callback() }
                loadJS('table/table', function(){
                    tableAddLoaded(module, DropdownMenu.find('#DropdownMenuSelectTable'), data, function(){
                        $('#DropdownMenuSelectTable tr').mousedown(function(){ JOINADD_click(el, placeholder, $(this)) });
                    });
                });
            }
        })
    })}, 600);
}

function JOINADD_filters(el, list){
    var filter = {type:[],value:[]};
    for(var i=1; i<list.length; i++){if(list[i] != ''){
        var f = list[i].split(',');
        filter.type.push(f[0]);
        filter.value.push(f[1]);
    }}
    if(el.attr('data-parentinput') != undefined){
        var parentData = el.attr('data-parentinput').split('|');
        for(var i=0; i<parentData.length; i++){
            var parentVal = el.closest('form').find('[name="' + parentData[i].split(',')[0] + '"]').val();
            filter.type.push(parentData[i].split(',')[1])
            filter.value.push(parentVal);
        }
    }
    return filter;
}

function JOINADD_click(input, placeholder, el){
    input.val(el.attr('data-id'));
    var arr = [];
    el.find('td').each(function(){ arr.push($(this).text()) });
    placeholder.text(arr.join(', '));
    if(input.closest('.tableBox').length == 1){ tableLoad(input) }
    focusOutJOIN_ADDInput(input);
    hideDropdownMenu();
}

function JOINADD_clear(el){ el.val(''); hideDropdownMenu(); focusOutJOIN_ADDInput(el); }

function JOINADD_refreshAllFormData(form){
    form.find('[data-type=JOIN_ADD]').addClass('loadingJOINADD');
    form.find('.loadingJOINADD .inputPlaceholder').html(HTML_loader());
    JOINADD_refreshFormData(form);
}
function JOINADD_refreshFormData(form){
    const box = form.find('.loadingJOINADD').first();
    const input = box.find('input[type=text]');
    const placeholder = input.next();
    box.removeClass('loadingJOINADD');
    if(valEmpty(input.val())){ return JOINADD_errorLoading(form, placeholder) }
    var module = input.attr('data-list').split(',')[1];
    GET_column({
        module:module,
        done:function(col){GET_row({
            module:module, id:input.val(), readonly:true,
            done:function(data){
                if(data.error){ return JOINADD_errorLoading(form, placeholder) }
                col = col.filter(function(el){return el.list == 'PRIMARY'})
                .map(function(el){ return data[el.column] });
                if(col.length == 0){ return JOINADD_errorLoading(form, placeholder) }
                placeholder.text(col.join(' - '));
                setTimeout(function(){ JOINADD_refreshFormData(form) }, 250);
            }
        })}
    })
}
function JOINADD_errorLoading(form, placeholder){
    placeholder.text(slovar('Search'));
    setTimeout(function(){ JOINADD_refreshFormData(form) }, 500);
}

var dropdownMenuDelay = (function(){
    var timer = 0;
    return function(callback, ms){ clearTimeout(timer); timer = setTimeout(callback, ms); };
})();