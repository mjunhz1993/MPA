function displayReadForm(data, EditBox, breadcrumb, module, id, boxYear){
    APP.lastVisit = {
        module:module,
        column:'',
        row:id
    };
    // ADD BREADCRUMBS
    updateEdtiBoxBreadCrumbs(breadcrumb, module, id);
    // ELEMENTS
    $('#EditBox').data({
        'module': module,
        'cookie': 'ModuleGroupsLock_'+module
    });
    var LeftNav = EditBox.find('.EditBoxNav');
    var EditBoxInner = EditBox.find('.EditBoxInner');
    var html = '';
    var cookieName = 'ModuleGroupsLock_'+module;

    // CREATE FORM FIELDS
    if(data){for(var c=0; c<data.length; c++){ html += createFormField(data[c], 'READ'); }}
    EditBoxInner.html(html).hide();

    // REMOVE OLD CONTENT
    EditBox.find('#readOnlyBox').remove();
    EditBox.append('<div id="readOnlyBox"></div>');
    var ReadBox = EditBox.find('#readOnlyBox');

    // CREATE NAVIGATION + FORMS
    LeftNav.html('<div class="verticalToggleButtons"></div>').show();
    var LeftNavBox = LeftNav.find('.verticalToggleButtons');
    if(boxYear == ''){
        LeftNavBox.append('<a class="buttonBlue" onclick="clickEditButton(' + id + ')">' + getSVG('edit') + '<span>' + slovar('Edit') + '</span></a>');
    }
    EditBoxInner.find('.formField').each(function(){
        var group = $(this).data('group');
        if(LeftNavBox.find('a[data-group="' + group + '"]').length != 1){
            LeftNavBox.append('<a data-group="' + group + '"><span>' + slovar(group) + '</span></a>');
            html = '<div class="box readOnlyFormBox" data-group="' + group + '" style="flex-grow:1;">';
            html += '<form class="boxInner readOnlyForm">';
            html += '<h2>' + slovar(group) + '</h2>';
            html += '<div class="editFormInner"></div></form></div>';
            ReadBox.append(html);
        }
        var ReadBoxGroup = ReadBox.find('.readOnlyFormBox[data-group="' + group + '"]');
        ReadBoxGroup.css('flex-grow', parseInt(ReadBoxGroup.css('flex-grow')) + 1);
        $(this).appendTo(ReadBoxGroup.find('.editFormInner'));
    });

    // DISABLE FORM POSTING + EDIT INPUTS
    ReadBox.find('.readOnlyForm').each(function(){
        $(this).on('submit', function(e){ e.preventDefault(); });
        $(this).find('input').prop('disabled', true);
        $(this).find('input[type=file]').prev('label').remove();
        $(this).find('.flag').remove();
    });

    // CHECK FOR TABLE JOINS (JOIN_GET) + ADD THEM
    if(boxYear == ''){
        if(data){
            for(var c = 0; c < data.length; c++){
                var d = data[c];
                if(d.type == 'BUTTON'){
                    ReadBox.find('[data-button="'+d.column+'"]').replaceWith(buttonInput(module,id,d.list));
                }
                else if(d.type == 'JOIN_GET'){
                    var temp = d.list.split(',');
                    addReadBoxJOIN({
                        module:temp[1],
                        name:d.name,
                        group:temp[1],
                        filter:[temp[2]],
                        filtervalue:[id],
                        buttons: ['add']
                    });
                }
            }
        }
        // ADD DIARY TABLE
        if(module != 'diary'){
            addReadBoxJOIN({
                module:'diary',
                name:'Diary',
                group:'diary',
                filter:['diary_module','diary_row'],
                filtervalue:[module,id],
                svg:'clock',
                simplify:true,
                buttons: ['archive']
            });
        }
    }

    // ADD HOVER TOOL
    EditBox.append('<div id="tabLockTool" class="hoverTool linksvg"></div><div class="tabSortTool hoverTool linksvg">' + getSVG('move') + '</div>');
    var tool = $('#tabLockTool');
    var sortTool = $('.tabSortTool');
    tool.hide();
    sortTool.css({
        'position':'absolute',
        'top':'5px',
        'left':'5px',
        'cursor':'grabbing',
        'background-color':'white',
        'box-shadow':'0 0 5px grey'
    }).hide().find('svg').css('stroke','black');
    var tabs = LeftNavBox.find('a[data-group]');

    // DISPLAY FORM BOXES
    ReadBox.find('.readOnlyFormBox').hide();
    LeftNav.show();
    overwriteReadBoxTabs(EditBox, LeftNav, tool);

    tabs.unbind('mouseover').mouseover(function(){
        var tab = $(this);
        configHoverGroupTools(tab, tool, sortTool);
        tool.unbind('click').click(function(){
            clickLockReadBoxTab(EditBox.data('module'), tab, tool, sortTool, LeftNav, EditBox, EditBox.data('cookie'))
        });
    });

    // ADD CLICK EVENT ON NAVIGATION BUTTONS
    refreshClickReadBoxTab();

    loadJS('https://code.jquery.com/ui/1.12.1/jquery-ui.js', function(){
        LeftNav.find('.verticalToggleButtons').sortable({
            items: "a[data-group]",
            handle: ".tabSortTool",
            placeholder: "ui-state-highlight",
            axis: 'x',
            revert: true,
            activate: function(event, ui){
                ui.item.css('transition','0s');
                tool.css('visibility','hidden');
            },
            deactivate: function(event, ui){
                ui.item.css('transition','');
                tool.css('visibility','');
                setLockCookie(module, LeftNavBox.find('a[data-group]'), cookieName);
                sortReadBoxes(LeftNav, ReadBox);
            }
        });
    });

    // LOAD IN ROW DATA
    GET_row({
        readonly:true,
        module:module,
        id:id,
        archive:boxYear,
        done: function(data){
            MoveRowDataToFormFields(data, module, EditBox, 'READ');
            var extraTitleData = [];
            ReadBox.find('input[type=text][data-list=PRIMARY]').each(function(){
                if($(this).val() != ''){ extraTitleData.push($(this).val()) }
            });
            if(extraTitleData.length > 0){ breadcrumb.find('span:last-child').append(' / '+extraTitleData.join(', ')) }
            turnEditInputsToReadInputs(ReadBox);
            EditBox.fadeIn('fast', function(){ loadJS('main/addons', function(){
                data.id = id;
                checkForModuleAddons(module, EditBox, 'READ', data) 
            })});
        },
        error: function(error){
            EditBox.find('.readOnlyFormBox').text('');
            createAlertPOPUP(error);
        }
    })
}

function addReadBoxJOIN(d){
    var LeftNavBox = $('#EditBox .verticalToggleButtons');
    var ReadBox = $('#readOnlyBox');
    var tempNav = $('#LeftNav [title="'+slovar(d.name)+'"]');
    if(d.svg){ svg = getSVG(d.svg) }
    else if(tempNav.length == 1){ svg = tempNav.find('svg')[0].outerHTML }
    else{ svg = getSVG('link') }
    html = '<a data-group="'+d.group+'">'+svg+'<span>'+slovar(d.name)+'</span></a>'
    if(LeftNavBox.find('[data-group="diary"]').length == 1){ LeftNavBox.find('[data-group="diary"]').before(html) }
    else{ LeftNavBox.append(html) }
    html = '<div class="box col100 readOnlyFormBox" data-group="'+d.group+'" style="display:none;">';
    html += '<h2>'+slovar(d.name)+'</h2>';
    html += '<div class="tableBox" ';
    if(d.buttons){ html += 'data-button="'+d.buttons.join(',')+'" ' }
    if(d.simplify){ html += 'data-simplify="1" ' }
    html += 'data-module="'+d.module+'" ';
    if(d.filter){ html += 'data-filter="'+d.filter.join(',')+'" ' }
    if(d.filtervalue){ html += 'data-filtervalue="'+d.filtervalue.join(',')+'"' }
    html += '><div class="horizontalTable" style="max-height:75vh"></div></div></div>';
    
    ReadBox.append(html);
}

function refreshClickReadBoxTab(){
    var EditBox = $('#EditBox');
    var LeftNav = EditBox.find('.EditBoxNav');
    var tabs = LeftNav.find('a[data-group]');
    var tool = $('#tabLockTool');
    var sortTool = $('.tabSortTool');

    tabs.unbind('click').click(function(){
        clickReadBoxTab($(this), LeftNav, EditBox, function(){ getJoinTable(EditBox) });
    });
}

function clickReadBoxTab(tab, LeftNav, EditBox, callback){
    LeftNav.find('.verticalToggleButtons a').removeClass('act');
    tab.addClass('act');
    EditBox.find('.readOnlyFormBox').hide();
    var selectedBox = EditBox.find('.readOnlyFormBox[data-group="' + tab.attr('data-group') + '"]');
    selectedBox.fadeIn('fast');

    if(tab.hasClass('lock')){
        LeftNav.find('.verticalToggleButtons a.lock').addClass('act');
        EditBox.find('.readOnlyFormBox.lock').fadeIn('fast');
    }

    if(typeof callback === 'function'){ callback() }
}

function overwriteReadBoxTabs(EditBox, LeftNav, tool){
    var LeftNavBox = LeftNav.find('.verticalToggleButtons');
    var ReadBox = EditBox.find('#readOnlyBox');
    cookieName = EditBox.data('cookie');
    if(checkLocalStorage(cookieName)){
        var cookie = getLocalStorage(cookieName);
        for(var i=0; i<cookie.length; i++){
            var tab = LeftNavBox.find('a[data-group="' + cookie[i] + '"]');
            tab.appendTo(LeftNavBox);
            lockReadBoxTab(tab, tool, LeftNav, EditBox);
        }
        LeftNavBox.find('.lock').insertAfter(LeftNavBox.find('a').first());
        sortReadBoxes(LeftNav, ReadBox);
    }
    else{
        ReadBox.find('.readOnlyFormBox:lt(3)').show(500);
        setTimeout(function(){ getJoinTable(ReadBox) }, 550);
    }
}

function clickLockReadBoxTab(module, tab, tool, sortTool, LeftNav, EditBox, cookieName){
    lockReadBoxTab(tab, tool, LeftNav, EditBox);
    configHoverGroupTools(tab, tool, sortTool);
    setLockCookie(module, LeftNav.find('a[data-group]'), cookieName);
}

function lockReadBoxTab(tab, tool, LeftNav, EditBox){
    tab.toggleClass('lock');
    EditBox.find('.readOnlyFormBox[data-group="' + tab.attr('data-group') + '"]').toggleClass('lock');
    if(tab.hasClass('lock')){
        tool.html(getSVG('lock'));
        setTimeout(function(){ clickReadBoxTab(tab, LeftNav, EditBox, function(){ getJoinTable(EditBox) }) }, 100);
    }
    else{ tool.html(getSVG('unlock')) }
}

function setLockCookie(module, tabs, cookieName){
    var arr = [];
    tabs.each(function(){if($(this).hasClass('lock')){ arr.push($(this).attr('data-group')); }});
    if(arr.length == 0){ deleteLocalStorage(cookieName) }
    else{ setLocalStorage(cookieName, arr) }
}

function configHoverGroupTools(tab, tool, sortTool){
    if(tab.hasClass('lock')){ tool.html(getSVG('lock')) }else{ tool.html(getSVG('unlock')) }
    tool.show().css({ 'top':tab.offset().top - tool.outerHeight(), 'left':tab.offset().left });
    sortTool.prependTo(tab).show();
    if(tab.hasClass('lock')){
        sortTool.show();
        tab.css('padding-left',sortTool.outerWidth() + 7);
    }else{
        tab.css('padding-left','');
        sortTool.hide()
    }
}

function sortReadBoxes(LeftNav, ReadBox){
    LeftNav.find('a[data-group]').each(function(){
        ReadBox.find('.readOnlyFormBox[data-group="' + $(this).attr('data-group') + '"]').appendTo(ReadBox);
    });
}

function getJoinTable(EditBox){
    var joinTable = EditBox.find('.tableBox[data-module]:visible:not(.finished)').first();
    if(joinTable.length == 1){
        tableLoadColumns(joinTable, function(){
            joinTable.addClass('finished');
            setTimeout(function(){ getJoinTable(EditBox) }, 500);
        })
    }
}

function turnEditInputsToReadInputs(EditBox){
    // CHECK DATEPICKER INPUTS
    if(EditBox.find('.datepickerinput, .timepickerinput, .datetimepickerinput').length > 0){
        EditBox.find('.datepickerinput, .timepickerinput, .datetimepickerinput').each(function(){
            $(this).removeClass('hiddenInput');
            if(valEmpty($(this).val())){ return }
            if($(this).hasClass('datetimepickerinput')){ $(this).val(getDate(defaultDateFormat + ' ' + defaultTimeFormat, $(this).val())); }
            else if($(this).hasClass('datepickerinput')){ $(this).val(getDate(defaultDateFormat, $(this).val())); }
            else if($(this).hasClass('timepickerinput')){ $(this).val(getDate(defaultTimeFormat, $(this).val())); }
        });
    }
    // CHECK COLOR PICKER INPUTS
    if(EditBox.find('.colorpicker').length > 0){
        EditBox.find('.colorpicker').each(function(){
            $(this).css({ 'background-color': $(this).next('input').val(), 'height': '20px', 'margin': '10px 0' });
            $(this).next('input').remove();
        });
    }
    // CHECK URL INPUTS
    var input = EditBox.find('input[type=url]');
    if(input.length > 0){
        input.each(function(){
            if(valEmpty($(this).val())){ return }
            var val = urlifyMessage($(this).val());
            $(this).replaceWith('<div class="inputPlaceholder">'+val+'</div>');
        });
    }
    // CHECK E-MAIL INPUTS
    input = EditBox.find('input[type=email]');
    if(input.length > 0){
        input.each(function(){
            if(valEmpty($(this).val())){ return }
            var val = $(this).val();
            $(this).replaceWith('<div class="inputPlaceholder"><a class="link" onclick="clickMailToLink(\''+val+'\')">'+val+'</a></div>');
        });
    }
    // CHECK PHONE INPUTS
    input = EditBox.find('input[data-list=PHONE][type=text]');
    if(input.length > 0){
        input.each(function(){
            html = '<div class="inputPlaceholder"><a class="link" onclick="clickTelLink(\''+$(this).val()+'\')">'+$(this).val()+'</a></div>';
            $(this).parent().replaceWith(html);
        });
    }
    // CHECK CHECKBOX INPUTS
    input = EditBox.find('input[type=checkbox]');
    if(input.length > 0){
        input.each(function(){
            var label = $(this).next('label');
            var val = slovar('No');
            if($(this).prop('checked')){ val = slovar('Yes') }
            html = '<label>'+label.text()+'</label>';
            html += '<div class="inputPlaceholder" data-column="'+$(this).attr('name')+'">'+val+'</div>';
            $(this).parent().css('text-align','').html(html);
        });
    }
    // CHECK MULTISELECT INPUTS
    EditBox.find('input[data-list^="MULTISELECT"][type=text]').each(function() {
        const inputVal = $(this).val();
        if (valEmpty(inputVal)) return;

        const listModule = $(this).data('list').split('|')[1];
        const html = inputVal.split('|').map(v => {
            const [id, text] = v.split(';');
            if (valEmpty(id)) return '';
            const onClick = !valEmpty(listModule)
                ? `onclick="loadJS('main/read-box-mini', el => open_readBoxMini(el, 'row', '${listModule}', ${id}), $(this))"`
                : '';
            return `<div class="multiselectinputbox" ${onClick}><span>${text}</span></div>`;
        }).join('');

        $(this).replaceWith(`<div class="inputPlaceholder">${html}</div>`);
    });
    // CHECK TEXTAREA INPUTS
    EditBox.find('textarea').each(function(){ $(this).replaceWith('<div class="readonlyTextarea">'+$(this).val()+'</div>') });
    // CHECK JOIN_ADD INPUTS
    EditBox.find('.JOIN_ADD_placeholder').each(function(){
        if(valEmpty($(this).prev('input').val())){ return $(this).text(slovar('Is_empty')) }
        var thisID = $(this).prev('input').val();
        var thisMod = $(this).attr('data-list').split(',')[1];
        $(this).attr({
            'onclick':'loadJS(\'main/read-box-mini\',function(el){open_readBoxMini(el,\'row\',\''+thisMod+'\', '+thisID+')},$(this))'
        }).addClass('link')
    });
    // REMOVE FLAGS
    EditBox.find('.fileArea svg').remove();
}