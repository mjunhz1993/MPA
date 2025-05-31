function openAddBox(){
    var AddBox = $('#AddBox');
    var AddBoxInner = $('#addFormInner');
    var tableBox = $('#main_table');
    var module = tableBox.attr('data-module');
    if(tableBox.length == 0){ return console.log('ERROR: no tableBox') }
    if(AddBox.length == 0){ return console.log('ERROR: no AddBox') }
    tableBox.fadeOut('fast', function(){ loadInColumnsForAddBox(module, AddBox, AddBoxInner) })
}

function openAddBoxQuick(module, callback){
    GET_module({
        module:module,
        done: function(data){
            if(!data.can_add.includes(user_role_id)){ return createAlertPOPUP(slovar('Access_denied')) }
            var popup = createPOPUPbox();
            var html = '<h2>' + slovar('Add_new') + ' / ' + slovar(data.name) + '</h2>';
            html += '<form data-module="' + module + '" data-url="add_row"><div class="addFormInner"></div></form>';
            popup.find('.popupBox').css('width','90%').html(html);
            var form = popup.find('form');
            form.prepend('<input type="hidden" name="quick_add" value="1">');
            form.append('<hr><button class="button buttonGreen buttonSubmit" onclick="submitAddBoxQuick(\'' + module + '\')">' + slovar('Add_new') + '</button>');
            form.append('<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span>');
            loadInColumnsForAddBox(module, popup, form.find('.addFormInner'), 2, callback)
        }
    })
}

function loadInColumnsForAddBox(module, AddBox, AddBoxInner, show_in_create = 1, callback = ''){
    GET_column({
        module:module,
        showAll:true,
        done: function(data){
            displayAddForm(data, module, AddBox, AddBoxInner, show_in_create);
            if(typeof callback === 'function'){ callback() }
        },
        error: function(error){ console.log(error) }
    })
}

function displayAddForm(data, module, AddBox, AddBoxInner, show_in_create = 1){
    var html = '';
    AddBox.find('.alert').remove();
    if(data){
        for(var c = 0; c < data.length; c++){
            if(data[c].mandatory || data[c].show_in_create >= show_in_create || data[c].special){
                html += createFormField(data[c], 'ADD');
            }
        }
    }
    AddBoxInner.html(html);
    // CHECK FOR DATE PICKER INPUTS
    if(AddBoxInner.find('.datepickerinput, .timepickerinput, .datetimepickerinput').length > 0){
        loadJS('form/datepicker', function(){ checkForDatePickerInputs(AddBoxInner); });
    }
    // CHECK TEXTAREA
    if(AddBoxInner.find('textarea').length > 0){ loadJS('form/cleditor', function(){ checkForTextAreaInputs(AddBoxInner); }); }
    // CHECK FOR COLOR PICKER INPUTS
    if(AddBoxInner.find('.colorpicker').length > 0){ loadJS('form/colorpicker', function(){ createColorPickers(AddBoxInner); }); }
    // ADD enctype IF FILE INPUT
    if(AddBoxInner.find('input[type=file]').length != 0){ AddBoxInner.closest('form').attr('enctype', 'multipart/form-data'); }
    else{ AddBoxInner.closest('form').removeAttr('enctype'); }
    // COMBINE FORM FIELDS
    combineFormFields(AddBoxInner);
    // CHECK FOR MODULE ADDONS
    loadJS('main/addons', function(){ checkForModuleAddons(module, AddBoxInner, 'ADD'); });
    // DISPLAY ADD FORM
    AddBox.fadeIn('fast', function(){ focusInput(AddBox) });
}

function submitAddBox(){
    var form = $('#AddBox form');
    if(!checkHiddenRequiredFields(form)){ return }
    form.unbind('submit').on('submit', function(e){
        e.preventDefault();
        submitForm($(this), function(){
            tableLoadColumns($('#main_table'), function(){ closeAddBox() });
            // tableLoad($('#main_table'), 0, function(){ closeAddBox() })
        });
    });
}

function copyFromAddBoxToAddBoxQuick(form, data){
    var popup = $('.popup').last().find('form');
    data = data.split(',');
    for(var i=0; i<data.length; i += 2){
        if(data[i+1] == ''){ continue; }
        var formInput = form.find('[name="' + data[i+1] + '"]');
        var formInputValue = formInput.val();
        if(formInputValue == ''){ continue; }
        var formInputBox = formInput.closest('.formField');
        var formInputLabel = '';
        if(formInputBox.attr('data-type') == 'JOIN_ADD'){ formInputLabel = formInput.next().text() }
        if(formInput.hasClass('datetimepickerinput')){ formInputValue = UTCtoInput(formInputValue) }
        var popupInput = popup.find('[name="' + data[i] + '"]');
        var popupInputBox = popupInput.closest('.formField');
        popupInput.val(formInputValue);
        if(popupInputBox.attr('data-type') == 'JOIN_ADD'){ popupInput.next().text(formInputLabel) }
    }
    if(popup.find('.datepickerinput, .timepickerinput, .datetimepickerinput').length > 0){
        loadJS('form/datepicker', function(){ resetDatePickerInputs(popup); });
    }
    if(popup.find('.colorpicker').length > 0){ loadJS('form/colorpicker', function(){ resetColorPickerInputs(popup); }); }
    closeAddBox();
}

function submitAddBoxQuick(module){
    var form = $('.popup').last().find('form');
    if(!checkHiddenRequiredFields(form)){ return }
    form.unbind('submit').on('submit', function(e){
        e.preventDefault();
        submitForm($(this), function(){
            removePOPUPbox();
            if($('.tableBox[data-module="' + module + '"]').length > 0){ tableLoad($('.tableBox[data-module="' + module + '"]').last(), 0); }
            runTrigger({ id:'submitAddBox' });
        });
    });
}

function closeAddBox(callback){
    var AddBox = $('#AddBox');
    var AddBoxInner = $('#addFormInner');
    var tableBox = $('#main_table');
    AddBox.fadeOut('fast',function(){
        AddBoxInner.text('');
        tableBox.fadeIn('fast', function(){
            // CONTINUE FUNCTION
            if(typeof callback === 'function'){ callback(); }
        });
    });
}