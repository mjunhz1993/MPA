function createFormField(data, formType = 'ADD', html = ''){
    if(!data.editable){if(formType != 'READ'){ return '' }}
    if(valEmpty(data.preselected_option)){ data.preselected_option = '' }
    if(data.preselected_option != ''){ data.preselected_option = checkPreselectedOption(data) }
    
    data = generateFormFieldID(formType, data);
    
    if(valEmpty(data.width)){ data.width = 100 }
    html += '<div class="formField col col'+data.width+'" data-group="'+data.category+'" ';
    html += 'data-type="'+data.type+'" ';
    html += 'data-view="'+data.can_view+'" ';
    if(['AVATAR','CHECKBOX'].includes(data.type)){ html += 'style="text-align: center;" ' }
    html += '>';
    if(formType == 'EDIT'){ html += '<input type="hidden" name="'+data.column+'_old" class="ignoreinput">' }
    html += createFormFieldInput(data, formType);
    html += '</div>';
    return html;
}

function generateFormFieldID(formType, data){
    data.id = 'ffa';
    if(formType == 'EDIT'){ data.id = 'ffe' }
    if(formType == 'READ'){ data.id = 'ffr' }
    if($('.popup').length > 0){ data.id = 'ffaq'+$('.popup').length }

    if(valEmpty(data.order_num)){ data.order_num = $('.formField').length }
    data.id += data.order_num;

    if($(`#${data.id}`).length == 1){ data.id += '_'+randNumber() }

    return data;
}

function createFormFieldInput(data, formType = 'ADD', html = ''){
    var label = '';
    if(!valEmpty(data.name)){
        label = '<label for="' + data.id + '" ';
        if(data.type == 'CHECKBOX'){ label += 'class="chekboxLabel"' }
        label += '>'+slovar(data.name)+'</label>';
    }

    // BASIC
    if(data.type == 'VARCHAR'){
        html += label;
        if(data.mandatory){ html += '<span style="color: red;">*</span>' }
        if(data.list == 'PHONE'){
            html += '<div class="inputWithFlags">';
            html += '<div class="flag" data-phone="'+defaultPhoneZipCode[0]+'" style="background-position-y:'+defaultPhoneZipCode[1]+'" ';
            html += 'data-tooltip="' + slovar('Select') + '" ';
            html += 'onclick="loadJS(\'form/countries\',function(el){get_countries(el,\'PHONE\')},$(this))"></div>';
        }
        else if(data.list == 'COLOR'){ html += '<div id="CP'+data.order_num+'" class="colorpicker"></div>' }
        html += '<input type="';
        if(data.list == 'URL'){ html += 'url' }
        else if(data.list == 'EMAIL'){ html += 'email' }
        else{ html += 'text' }
        html += '" name="' + data.column + '" id="' + data.id + '" data-list="' + data.list + '" ';
        if(data.list == 'PHONE'){
            html += 'placeholder="' + defaultPhoneZipCode[0] + '"';
            html += 'onfocus="loadJS(\'form/countries\', function(el){ addPhoneZipCode(el) }, $(this))" ';
            html += 'onkeyup="loadJS(\'form/countries\', function(el){ testPhoneNumber(el) }, $(this))" ';
            html += 'onfocusout="loadJS(\'form/countries\', function(el){ testPhoneNumber(el) }, $(this))" ';
        }
        else if(data.list == 'URL'){ html += 'onfocusout="testHttpStart($(this))" ' }
        html += 'maxlength="' + data.length + '"';
        if(data.preselected_option[0] != null){ html += 'value="' + data.preselected_option[0] + '" ' }
        if(data.mandatory){ html += 'required' }
        html += '>';
        if(data.list == 'PHONE'){ html += '</div>' }
        return html
    }

    if(data.type == 'INT'){
        html += label;
        if(data.mandatory){ html += '<span style="color: red;">*</span>'; }
        html += '<input type="number" name="' + data.column + '" id="' + data.id + '" ';
        html += 'min="-' + '9'.repeat(data.length) + '" max="' + '9'.repeat(data.length) + '" ';
        if(data.preselected_option[0] != null){ html += 'value="' + data.preselected_option[0] + '" '; }
        if(data.mandatory){ html += 'required'; }
        html += '>';
        return html
    }
    
    if(data.type == 'TEXTAREA'){
        html += label;
        if(data.mandatory){ html += '<span style="color: red;">*</span>'; }
        html += '<textarea name="' + data.column + '" id="' + data.id + '" ';
        if(data.mandatory){ html += 'required'; }
        html += '>';
        if(data.preselected_option[0] != null){ html += data.preselected_option[0]; }
        html += '</textarea>';
        return html
    }

    if(data.type == 'CHECKBOX'){
        html += '<input type="checkbox" name="' + data.column + '" id="' + data.id + '" ';
        if(data.preselected_option[0] == 1){ html += 'checked'; }
        html += '>';
        html += label;
        return html
    }
    
    // GET TODAY DATE
    if(['TIME','DATE','DATETIME'].includes(data.type)){
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        var hh = String(today.getHours()).padStart(2, '0');
        var ii = String(today.getMinutes()).padStart(2, '0');
    }

    if(data.type == 'DATE'){
        html += label;
        if(data.mandatory){ html += '<span style="color: red;">*</span>'; }
        html += '<input type="text" name="' + data.column + '" id="' + data.id + '" class="datepickerinput" ';
        if(data.list){ html += 'data-list="' + data.list + '" '; }
        if(!valEmpty(data.preselected_option[0])){ [yyyy,mm,dd] = data.preselected_option[0].split('-') }
        html += 'value="' + yyyy + '-' + mm + '-' + dd + '" ';
        if(data.mandatory){ html += 'required'; }
        html += '>';
        return html
    }

    if(data.type == 'TIME'){
        html += label;
        if(data.mandatory){ html += '<span style="color: red;">*</span>'; }
        html += '<input type="text" name="' + data.column + '" id="' + data.id + '" class="timepickerinput" ';
        if(data.list){ html += 'data-list="' + data.list + '" '; }
        if(!valEmpty(data.preselected_option[0])){ [hh,ii] = data.preselected_option[0].split(':') }
        html += 'value="'+hh+':'+ii+':00" ';
        if(data.mandatory){ html += 'required'; }
        html += '>';
        return html
    }

    if(data.type == 'DATETIME'){
        html += label;
        if(data.mandatory){ html += '<span style="color: red;">*</span>'; }
        html += '<input type="text" name="' + data.column + '" id="' + data.id + '" ';
        html += 'class="datetimepickerinput hiddenInput" ';
        html += 'onfocus="createDatePickerInput($(this).parent())" ';
        if(data.list){ html += 'data-list="' + data.list + '" '; }
        html += 'value="' + yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + ii + ':00" ';
        if(data.mandatory){ html += 'required'; }
        html += '>';
        return html
    }

    // DECIMAL
    if(['DECIMAL','PRICE','PERCENT'].includes(data.type))
    {
        html += label;
        if(data.mandatory){ html += '<span style="color: red;">*</span>'; }
        if(data.list != 0){ var decimal = '0.'; }
        for(var d=1; d<data.list; d++){ decimal += '0'; }
        decimal += '1';
        html += '<div class="inputWithUnit">';
        html += '<input type="number" name="' + data.column + '" id="' + data.id + '" ';
        html += 'step="' + decimal + '" ';
        if(data.preselected_option[0] != null){ html += 'value="' + data.preselected_option[0] + '" '; }
        if(data.mandatory){ html += 'required'; }
        html += '>';
        if(['PRICE','PERCENT'].includes(data.type))
        {
            html += '<div class="unit">';
            if(data.type == 'PRICE'){ html += defaultCurrency; }
            else if(data.type == 'PERCENT'){ html += '%'; }
            html += '</div>';
        }
        html += '</div>';
        return html
    }

    // SELECT
    if(data.type == 'SELECT'){
        html += label;
        if(data.mandatory){ html += '<span style="color: red;">*</span>'; }
        html += '<div class="inputPlaceholder selectMenu" ';
        if(data.callback){ html += 'data-callback="'+data.callback+'"' }
        html += 'data-list="'+data.list+'" ';
        html += 'onclick="loadJS(\'form/selectMenu\', function(el){ openSelectMenu(el); }, $(this))" ';
        html += '><input type="text" id="'+data.id+'" name="'+data.column+'" class="hiddenInput" ';
        if(data.preselected_option[0] != null){ html += 'value="'+data.preselected_option[0]+'" '; }
        if(data.mandatory){ html += 'required'; }
        html += ' onfocus="loadJS(\'form/selectMenu\', function(el){ openSelectMenu(el); }, $(this).parent())"><div>';
        if(data.preselected_option[0] != null){
            var listSplit = data.list.split('|');
            for(var i=0; i<listSplit.length; i++){
                var l = listSplit[i].split(',');
                if(l[0] == data.preselected_option[0]){ html += slovar(l[1]) }
            }
        }
        else{ html += slovar('Select') }
        html += '</div></div>';
        return html
    }

    // ADVANCED
    if(data.type == 'JOIN_ADD'){
        html += label;
        if(data.mandatory){ html += '<span style="color: red;">*</span>' }
        html += '<input type="text" name="' + data.column + '" id="' + data.id + '" ';
        html += 'data-list="' + data.list + '" class="hiddenInput" ';
        if(!valEmpty(data.preselected_option[0])){ html += 'value="' + data.preselected_option[0] + '" ' }
        html += 'onfocus="focusJOIN_ADDInput($(this).next())" ';
        if(data.mandatory){ html += 'required' }
        html += '><div class="inputPlaceholder JOIN_ADD_placeholder" data-list="' + data.list + '"';
        if(data.callback){ html += 'data-callback="'+data.callback+'"' }
        html += ' onclick="focusJOIN_ADDInput($(this))">';
        if(!valEmpty(data.preselected_option[1])){ html += data.preselected_option[1] }
        else{ html += slovar('Search') }
        html += '</div>';
        return html
    }

    // SPECIAL
    if(data.type == 'PASSWORD'){
        html += label;
        html += '<span style="color: red;">*</span>';
        html += '<input type="password" name="' + data.column + '" id="' + data.id + '" ';
        if(formType == 'ADD'){ html += 'required' }
        html += '>';
        return html
    }

    // FILE
    if(data.type == 'FILE'){
        loadJS('file/file');
        html += label;
        if(data.mandatory){ html += '<span style="color: red;">*</span>' }
        html += '<div class="fileArea visible"></div>';
        html += '<label class="buttonSquare button100 buttonBlue" for="' + data.id + '" style="margin:0 0 5px 0;">';
        html += getSVG('upload') + ' ' + slovar('Upload') + '</label>';
        html += '<input type="file" name="' + data.column + '[]" id="' + data.id + '" '
        html += 'data-list="' + data.list + '" ';
        html += 'onchange="selectFile($(this), this)" ';
        if(data.mandatory){ html += 'data-required="true" required' }else{ html += 'data-required="false"' }
        html += 'multiple>';
        return html
    }

    // BUTTON
    if(data.type == 'BUTTON'){ return '<div data-button="'+data.column+'"></div>' }

    return html;
}

function checkPreselectedOption(data){
    var v = data.preselected_option;
    if(v[0] == '{' && v[v.length - 1] == '}'){
        v = v.slice(1,-1).split(',');

        if(data.type == 'VARCHAR'){
            if(v[0] == 'USER' && v[1] == 'user_color'){ return [user_color] }
        }

        if(data.type == 'JOIN_ADD'){
            if(v[0] == 'USER'){ return [user_id,user_username] }
            if(v[0] == 'ROLE'){ return [user_role_id,role_name] }
            if(v[0] == 'PARENT'){
                var parent = $('#main_table').attr('data-module');
                var id = getRowFromURL().id;
                var placeholder = $('#EditBox [data-list=PRIMARY]').first();
                if(data.list.split(',')[1] == parent && id != '' && placeholder.length > 0){ return [id, placeholder.val()] }
                else{ return '' }
            }
        }

    }
    if(Array.isArray(v)){ return v }
    return [v]
} 

function checkboxInput(d, html = ''){
    if(valEmpty(d.class)){ d.class = '' }
    html += '<div class="checkboxBox '+d.class+'">'
    html += '<input type="checkbox" id="'+d.id+'" name="'+d.name+'" ';
    if(!valEmpty(d.value)){ html += 'value="'+d.value+'" ' }
    if(!valEmpty(d.onchange)){ html += 'onchange="'+d.onchange+'" ' }
    if(d.checked === true){ html += 'checked ' }
    if(d.disabled === true){ html += 'disabled ' }
    html += '>';
    html += '<label class="chekboxLabel" for="'+d.id+'">'+d.label+'</label>';
    html += '</div>'
    return html;
}

function buttonInput(module, id, list, html = ''){
    list = list.split('|');
    html += '<a class="button button100 buttonBlue" ';
    html += 'onclick="clickCustomButton(\''+list[0]+'\',\''+module+'\','+id+',$(this),function(row,el){'+list[1]+'(row,el)})';
    html += '">'+list[2]+'</a>';
    return html;
}
function clickCustomButton(url, module, id, el, callback){GET_module({
    module:module,
    done:function(moduleData){GET_row({
        module:module,
        id:id,
        readonly:true,
        done:function(row){
            if(!moduleData.can_edit.includes(user_role_id) && row.added != user_id){
                return createAlertPOPUP(slovar('Access_denied'));
            }
            loadJS(APP.customDir+'/'+url+'.js', function(){ callback(row,el) })
        }
    })}
})}

function focusInput(formField){
    $([document.documentElement, document.body]).animate({ scrollTop: formField.offset().top - 300 }, 100);
    setTimeout(function(){ 
        var input = formField.find('input:visible').first();
        if(input.length == 1){ return input.focus() }
        if(formField.data('type') == 'JOIN_ADD'){ return focusJOIN_ADDInput(formField.find('.JOIN_ADD_placeholder')) }
        if(formField.data('type') == 'SELECT'){ return loadJS('form/selectMenu', function(el){ openSelectMenu(el) }, formField.find('.selectMenu')) }
        if(['DATE','TIME','DATETIME'].includes(formField.data('type'))){ return createDatePickerInput(formField) }
    }, 150);
}

function testHttpStart(el){if(el.val() && !el.val().match(/^http([s]?):\/\/.*/)){ el.val('http://' + el.val()); }}