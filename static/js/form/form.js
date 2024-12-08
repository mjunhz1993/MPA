function checkHiddenRequiredFields(form, status = true){
    form.find('input,textarea,select').filter('[required]:hidden').each(function(){
        if($(this).val() == ''){
            createAlert($(this).closest('.formField'), 'Red', slovar('Fill_in_this_field'));
            focusInput($(this).closest('.formField'));
            status = false;
        }
    });
    return status
}

function combineFormFields(box){
    var formFields = box.find('.formField');
    formFields.each(function(){
        var group = $(this).data('group');
        if(box.find('legend[data-group="'+group+'"]').length == 0)
        { box.append('<fieldset><legend data-group="'+group+'" onclick="toggleFormFieldGroup($(this))">'+slovar(group)+'</legend></fieldset>') }
        box.find('legend[data-group="' + group + '"]').parent().append($(this))
    });
}

function toggleFormFieldGroup(el){
    var box = el.parent();
    if(box[0].localName != 'fieldset'){ return }
    if(box.find('.fieldset').length == 0){ box.wrapInner('<div class="fieldset" />'); box.prepend(el) }
    var fieldset = box.find('.fieldset');
    if(el.hasClass('closed')){ fieldset.show(); el.removeClass('closed') }
    else{ fieldset.hide(); el.addClass('closed') }
}

function MoveRowDataToFormFields(data, module, box, viewType = 'EDIT'){
    if(valEmpty(data)){ return }
    var form = box.find('form');
    form.find('input,textarea,select').each(function(){
        if($(this).hasClass('ignoreinput')){ return }
        if(
            viewType == 'COPY' &&
            $(this).closest('.formField').is(':hidden')
        ){ return }
            
        var inputBox = $(this).closest('.formField');
        var type = inputBox.attr('data-type');
        var inputName = $(this).attr('name');
        var value = data[inputName];
        var inputType = $(this).attr('type');

        // ADD VALUE TO HIDDEN TESTING INPUT
        if(viewType == 'EDIT'){
            var oldValueInput = inputBox.find('input[name="' + inputName + '_old"][type=hidden]');
            if(oldValueInput.length == 1){ oldValueInput.val(value); }
        }
        // TURN UTC TIME TO LOCAL
        if(type == 'DATETIME' && value != '' && value != undefined){ value = UTCtoInput(value) }

        
        if(type == 'CHECKBOX'){
            if(value == 1){ $(this).prop('checked', true) }else{ $(this).prop('checked', false) }
        }
        else if(type == 'SELECT'){
            $(this).val(value);
            var placeholder = $(this).next();
            var list = $(this).parent().attr('data-list').split('|');
            for(var i=0; i<list.length; i++){
                if(list[i].split(',')[0] == value){ placeholder.text(list[i].split(',')[1]); }
            }
        }
        else if(type == 'FILE'){}
        else if(['hidden','password'].includes(inputType)){}
        else{ $(this).val(value) }
        
        if(data['added'] != user_id){
            var view_access = [];
            if(inputBox.attr('data-view') != undefined){ view_access = inputBox.attr('data-view').split(',') }
            if(!view_access.includes(user_role_id)){inputBox.remove()}
        }
    });

    // GET UPLOADED FILES
    if(data.file && ['EDIT','READ'].includes(viewType)){ MoveRowFilesToFormFields(data, module, form) }
    
    // FIND JOIN_ADD PLACEHOLDERS
    RowDataToPlaceholder(form.find('.JOIN_ADD_placeholder'), data, [module]);
    tooltips();
}

function MoveRowFilesToFormFields(data, module, form){
    for(var i=0; i<data.file.column.length; i++){
        var fileColumn = data.file.column[i];
        var fileName = data.file.name[i];
        var fileType = data.file.type[i];
        var fileOldName = data.file.oldName[i];
        var fileInput = form.find('input[name="' + fileColumn + '[]"]');
        if(fileInput.length == 1){
            var fileArea = fileInput.parent().find('.fileArea');
            var maxCount = parseInt(fileInput.attr('data-list').split(',')[1]);
            var html = '<div class="file" data-file="' + fileName + '">';
                html += '<div class="img"></div>';
                html += '<div class="fileDesc">'+fileOldName+'</div>'+getSVG('x')+'</div>';
            fileArea.append(html);
            fileArea.find('.file').last().attr('data-tooltip',fileOldName);
            if(fileType.includes('image')){
                fileArea.find('.file').last().find('.img').css('background-image', 'url("/crm/static/uploads/' + module + '/' + fileName + '")');
            }
            fileInput.prop('required', false);
        }
    }
    // ADD CLICK EVENTS
    if(form.hasClass('readonly')){ form.find('.fileArea svg').remove() }
    else{form.find('.fileArea svg').click(function(){ removeFile($(this)) })}
    form.find('.fileArea .img').click(function(){ clickOnFile(module, $(this)) });
}

function RowDataToPlaceholder(placeholders, data, all_modules){
    placeholders.each(function(){
        var placeholder = $(this);
        var list = placeholder.attr('data-list').split(',');
        var module = list[1];
        if(all_modules.includes(module)){ module = module + (all_modules.length) }
        all_modules.push(module);
        var ref_module = module + '.' + list[1] + '_';
        var arr = [];
        for(const [key, col] of Object.entries(data)){
            if(key.includes(ref_module) && col != null){ arr.push(col) }
        }
        if(arr.length != 0){ placeholder.text(arr.join(', ')) }
        else{ placeholder.text(slovar('Search')) }
    });
}

// ----------------------- USER EVENTS

function openDateStartEndPicker(el, mode = 'date'){
    // REMOVE OLD ONE
    $('#DateStartEndPicker').remove();
    // CREATE DATE PICKER
    var html = '<div id="DateStartEndPicker">';
        if(mode == 'date'){
            html += '<input type="text" class="datepickerinput" id="dsep1" placeholder="' + slovar('From') + '">';
            html += '<input type="text" class="datepickerinput" id="dsep2" placeholder="' + slovar('To') + '">';
        }
        else{
            html += '<input type="text" class="timepickerinput" id="dsep1" placeholder="' + slovar('From') + '">';
            html += '<input type="text" class="timepickerinput" id="dsep2" placeholder="' + slovar('To') + '">';
        }
        html += '<button class="buttonSquare buttonBlue" style="width: 100%;">' + slovar('Save_changes') +'</button>';
        html += '</div>';
    $('#Main').append(html);
    var DateStartEndPicker = $('#DateStartEndPicker');
    loadJS('form/datepicker', function(){
        checkForDatePickerInputs(DateStartEndPicker);
        // DISPLAY DATE PICKER ON TOP OF INPUT
        DateStartEndPicker.css({
            'top': el.offset().top,
            'left': el.offset().left,
            'width': el.outerWidth() - 12,
        });
        DateStartEndPicker.find('input').first().focus();

        // ON BUTTON CLICK EVENT
        DateStartEndPicker.find('button').click(function(){
            // ADD DATES TO INPUT
            var dates = [];
            DateStartEndPicker.find('input').each(function(){
                if($(this).val() != ''){ dates.push($(this).val()); }
            });
            if(el.val() != dates){
                el.val(dates);
                tableLoad(el);
            }
            // CLOSE DATE PICKER
            DateStartEndPicker.remove();
        });
    });
}

function refreshFormData(form){loadJS('GET/module', function(){
    if(form.find('.selectMenu').length > 0){loadJS('form/selectMenu',function(){selectMenuRefreshPlaceholders(form)})}
    if(form.find('.datepickerinput,.timepickerinput,.datetimepickerinput').length > 0){loadJS('form/datepicker',function(){resetDatePickerInputs(form)})}
    // if(form.find('textarea').length > 0){loadJS('form/cleditor',function(){checkForTextAreaInputs(form.find('form').first())})}
    if(form.find('.colorpicker').length > 0){loadJS('form/colorpicker',function(){resetColorPickerInputs(form)})}
    if(form.find('[data-type=JOIN_ADD]').length > 0){form.find('[data-type=JOIN_ADD]').each(function(){
        JOINADD_refreshFormData($(this).find('input[type=text]'));
    })}
})}

// ----------------------- SUBMIT

function submitForm(form, callback, callbackError){
    if(form.hasClass('readonly')){ return }
    form.find('.alert').remove();
    var token = $('[name=csrf_token]');
    if(token.length == 0){ return createAlert(form, 'Red', 'ERROR: no token') }
    if(form.find('[name=csrf_token]').length == 0){ form.prepend(token.clone()) }

    var url = form.attr('data-url');
    if(valEmpty(url)){ return createAlert(form, 'Red', 'ERROR: form has no data-url') }

    var button = form.find('.buttonSubmit');
    if(button.length == 0){ return createAlert(form, 'Red', 'ERROR: no submit button or too many in form') }

    form.hide().parent().append(HTML_loader());
    var module = $('#main_table').attr('data-module');
    if(form.attr('data-module') != undefined){ module = form.attr('data-module') }

    if(typeof module == 'undefined'){ return createAlert(form, 'Red', 'ERROR: no main_table + data-module') }

    if(form.find('.formField[data-type="DATETIME"]').length > 0){
        form.find('.formField[data-type="DATETIME"] input[type=text]').each(function(){
            if($(this).val() != ''){ $(this).val(inputToUTC($(this).val())) }
        });
    }
    
    if(form.find('input[type=file]').length != 0){
        var formData = new FormData(form[0]);
        return $.ajax({ 
            url: '/crm/php/main/module.php?' + url + '=1&module=' + module, 
            type: 'post', data: formData, contentType: false, processData: false,
            success: function(data){ submitForm_done(form, button, JSON.parse(data), callback, callbackError) }
        }).fail(function(data){ console.log(data) });
    }

    $.post('/crm/php/main/module.php?' + url + '=1&module=' + module, form.serialize(), function(data){
        submitForm_done(form, button, JSON.parse(data), callback, callbackError)
    }).fail(function(data){ console.log(data) });
}

function submitForm_done(form, button, data, callback, callbackError){
    form.show();
    remove_HTML_loader(form.parent());
    if(data.error){
        createAlert(form, 'Red', data.error);
        if(typeof callbackError === 'function'){ callbackError(data) }
        return;
    }
    form.find('input[type=file]').val('');
    var buttonOrgText = button.text();
    button.removeClass('buttonBlue').addClass('buttonGreen').text(slovar('Saved'));
    setTimeout(function(){ button.removeClass('buttonGreen').addClass('buttonBlue').text(buttonOrgText); },1000);
    createAlert(form, 'Green', data.message);
    if(typeof callback === 'function'){ callback(data) }
}