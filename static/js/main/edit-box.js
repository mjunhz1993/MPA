function openEditBox(id, boxType, boxYear = ''){
    var EditBox = $('#EditBox');
    var tableBox = $('#main_table');
    var breadcrumb = $('.h1_table').first();
    if(tableBox.length == 0){ return console.log('ERROR: no tableBox') }
    var module = tableBox.attr('data-module');
    if(EditBox.length == 0){ return console.log('ERROR: no editBox') }
    EditBox.find('.alert, .hoverTool').remove();
    tableBox.fadeOut('fast', function(){
        GET_column({
            module:module,
            showAll:true,
            done: function(data){
                if(boxType == 'READ'){loadJS('main/read-box', function(){ displayReadForm(data, EditBox, breadcrumb, module, id, boxYear) })}
                else{ displayEditForm(data, EditBox, breadcrumb, module, id, boxYear) }
            },
            error: function(error){ console.log(error) }
        })
    })
}

function openEditBoxQuick(module, id, boxYear = ''){loadJS('GET/module', function(){
    GET_module({
        module:module,
        done: function(data){
            var popup = createPOPUPbox();
            popup.find('.popupBox').css('width','90%').html('<h2>' + slovar(data.name) + '</h2><div class="EditBoxInner"></div>');
            GET_column({
                module:module,
                showAll:true,
                archive:boxYear,
                done: function(data){ displayEditForm(data, popup, popup.find('h2').first(), module, id, boxYear) },
                error: function(error){ console.log(error) }
            })
        }
    })
})}

function displayEditForm(data, EditBox, breadcrumb, module, id, boxYear){
    // CHECK IF EDIT IS IN POPUP
    var isPopup = false;
    if(EditBox.attr('class') == 'popup'){ isPopup = true; }
    // ADD BREADCRUMBS
    updateEdtiBoxBreadCrumbs(breadcrumb, module, id, slovar('Edit'));

    // ELEMENTS
    var LeftNav = EditBox.find('.EditBoxNav');
    var EditBoxInner = EditBox.find('.EditBoxInner');

    // CREATE FORM FIELDS
    var html = '';
    if(data){
        for(var c=0; c<data.length; c++){
            html += createFormField(data[c], 'EDIT');
        }
    }
    EditBoxInner.html(html);

    LeftNav.hide();

    // COMBINE FORM FIELDS
    combineFormFields(EditBoxInner);
    EditBoxInner.wrapInner('<form class="boxInner" method="POST" data-module="' + module + '" data-url="edit_row"><div class="editFormInner"></div></form>');

    // ADD SUBMIT BUTTONS, ID, CATEGORY TO EDIT FORMS + enctype
    EditBoxInner.find('form').each(function(){
        html = '<input type="hidden" name="id" value="' + id + '">';
        html += '<hr/><button class="button buttonBlue buttonSubmit" onclick="submitEditBox($(this))">' + slovar('Save_changes') + '</button> ';
        if(isPopup){ html += '<a class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</a>'; }
        else{ html += '<a class="button buttonGrey" onclick="clickEditButton(' + id + ', \'READ\')">' + slovar('Cancel') + '</a>'; }
        // ADD enctype IF FILE INPUT
        if($(this).find('input[type=file]').length != 0){ $(this).attr('enctype', 'multipart/form-data'); }
        else{ $(this).removeAttr('enctype'); }
        $(this).append(html);
    });

    // MAKE FIRST NAVIGATION BUTTON ACTIVE + SHOW FIRST EDIT FORM
    if(!isPopup){ EditBoxInner.show(); EditBox.find('.readOnlyFormBox').remove(); }
    EditBoxInner.find('form').first().show();

    // LOAD IN ROW DATA
    GET_row({
        module:module,
        id:id,
        archive:boxYear,
        done: function(data){
            MoveRowDataToFormFields(data, module, EditBox);
            var extraTitleData = [];
            EditBox.find('input[type=text][data-list=PRIMARY]').each(function(){
                if($(this).val() != ''){ extraTitleData.push($(this).val()) }
            });
            if(extraTitleData.length > 0){ breadcrumb.find('span:last-child').append(' / ' + extraTitleData.join(', ')) }
            if(EditBox.find('.datepickerinput,.timepickerinput,.datetimepickerinput').length > 0){loadJS('form/datepicker', function(){ checkForDatePickerInputs(EditBoxInner) })}
            if(EditBoxInner.find('textarea').length > 0){loadJS('form/cleditor', function(){ checkForTextAreaInputs(EditBoxInner.find('form').first()) })}
            if(EditBox.find('.colorpicker').length > 0){loadJS('form/colorpicker', function(){ createColorPickers(EditBoxInner) })}
            loadJS('main/addons', function(){ checkForModuleAddons(module, EditBox, 'EDIT', data) });
            EditBox.fadeIn('fast', function(){ });
        },
        error: function(error){
            EditBoxInner.text('');
            if(isPopup){ removePOPUPbox() }
            createAlertPOPUP(error)
        }
    })
}

function updateEdtiBoxBreadCrumbs(breadcrumb, module, id, text1 = ''){
    var h1 = breadcrumb.find('h1');
    h1.find('span').first().html(breadcrumb.find('span').first().text());
    h1.find('span:not(:first)').remove();
    h1.find('span').first().wrapInner('<a onClick="clickEditButton(\'\')">');
    h1.append('<span> / ' + text1 + ' ID ' + id + '</span>');
    breadcrumb.find('td:last-child').html('<a class="svg" data-tooltip="'+slovar('Close')+'" onClick="clickEditButton(\'\')">'+getSVG('x')+'</a>')
}

function submitEditBox(el){
    var form = el.closest('form');
    if(!checkHiddenRequiredFields(form)){ return }
    var id = form.find('input[name=id]').val();
    form.unbind('submit').on('submit', function(e){
        e.preventDefault();
        submitForm($(this), function(){
            if(form.closest('.popup').length == 1){
                var module = form.attr('data-module');
                removePOPUPbox();
                if($('.tableBox[data-module="' + module + '"]').length > 0){ tableLoad($('.tableBox[data-module="' + module + '"]').last(), 0); }
                if(typeof submitEditBoxQuickAfterEvent === 'function'){ submitEditBoxQuickAfterEvent(); }
            }
            else{
                tableLoad($('#main_table'), 0, function(){
                    clickEditButton(id, 'READ');
                });
            }
        });
    });
}

function closeEditBox(callback){
    var EditBox = $('#EditBox');
    var tableBox = $('#main_table');
    var breadcrumb = $('.h1_table').first();

    breadcrumb.find('span').first().html(breadcrumb.find('span').first().text());
    breadcrumb.find('span:not(:first)').remove();
    breadcrumb.find('svg').parent().remove();
    hideTooltip();

    window.location.hash = '';

    EditBox.fadeOut('fast',function(){
        tableBox.fadeIn('fast', function(){
            EditBox.find('.EditBoxInner').text('');
            // CONTINUE FUNCTION
            if(typeof callback === 'function'){ callback() }
        });
    });
}

function clickEditButton(id, type = '', year = ''){ window.location.hash = id + '-' + type + '-' + year; }