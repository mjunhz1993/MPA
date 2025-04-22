function if_email_room_access(callback, callbackError){
    $.getJSON('/crm/php/email/email.php?check_if_email_room_exists=1', function(data){
        if(!data.error){if(typeof callback === 'function'){ callback(data) }}
        else{if(typeof callbackError === 'function'){ callbackError(data.error) }}
    })
}

function open_send_email(d = {}, html = ''){loadJS('email/slovar/' + slovar(), function(){
    loadJS('file/file', function(){
        var popup = createPOPUPbox();
        popup.find('.popupBox').html('<form></form>');
        var form = popup.find('form');
        if(valEmpty(d.for)){ d.for = '' }
        if(valEmpty(d.subject)){ d.subject = '' }



        html += '<h2>'+slovar('New_mail')+'</h2>';
        html += '<label>'+slovar('Recipient')+'</label>';

        html += '<table id="recipient_table" style="width:100%;"><tr>';
        html += '<td><input type="email" name="addAddress[]" value="'+d.for+'" required></td>';
        html += '<td><select name="addAddressType[]">';
        html += '<option value="0"></option>';
        html += '<option value="CC">CC</option>';
        html += '<option value="BCC">BCC</option>';
        html += '</select></td>';
        html += '<td><div style="display:none" class="buttonSquare buttonRed" onclick="remove_recipient($(this))">'+getSVG('x')+'</div></td>';
        html += '</tr></table>';

        html += '<span onclick="add_recipient($(this))" class="button buttonBlue">'+slovar('Add_recipient')+'</span><br><br>';

        html += '<label for="email_subject">'+slovar('Subject')+'</label>';
        html += '<input type="text" name="subject" value="'+d.subject+'" id="email_subject" required>';
        html += '<label for="email_body">'+slovar('Body')+'</label>';
        html += '<br>';
        html += '<textarea name="body" id="email_body" data-type="email"></textarea>';

        html += '<div class="forwardFileArea">';
        if(!valEmpty(d.attachments)){
            var fs = d.attachments.split('|');
            for(var i=0; i<fs.length; i++){
                var f = fs[i].split(',');
                html += '<div class="file"><div class="img"></div>';
                html += '<div class="fileDesc">'+f[1]+' ['+((f[2] * 0.001) * 0.001).toFixed(2)+' Mb]</div>';
                html += '<input type="hidden" name="forwardFile[]" value="'+f[0]+'">';
                html += '<input type="hidden" name="forwardFileName[]" value="'+f[1]+'">';
                html += '</div>'
            }
        }
        html += '</div>';

        html += '<div class="col col100 formField fileFormField">';
        html += '<div class="fileArea"></div>';
        html += '<label for="addAttachment" class="button button100 buttonBlue">'+slovar('Add_attachment')+'</label>';
        html += '<input type="file" name="addAttachment[]" id="addAttachment" data-list="ALL,5" ';
        html += 'onchange="selectFile($(this), this)" data-required="false">';
        html += '</div>';

        html += '<hr><div style="position:sticky;bottom:0px;background-color:white;"><button class="button buttonGreen">'+slovar('Send')+'</button>';
        html += '<span class="button buttonGrey" onclick="removePOPUPbox()">'+slovar('Cancel')+'</span></div>';
        form.html(html);

        form.on('submit', function(e){
            e.preventDefault();
            send_email(form, d.onSend);
        });

        popup.fadeIn('fast', function(){
            loadJS('form/cleditor', function(){
                checkForTextAreaInputs(form, function(){
                    add_AI_button_for_email(form);
                    add_emailBodyContent(form, d.body);
                });
                if(typeof d.done === 'function'){ d.done(form) }
            });
        });
    })
})}

function add_recipient(el, mail = '', type = ''){
    if(!el.is('form')){ el = el.closest('form') }
    el = el.find('#recipient_table');
    if(type == 'SECRET'){ return add_secretRecipient(el,mail) }
    el.find('tr').last().after(el.find('tr').last().clone());
    el.find('tr').last().find('input').val(mail);
    el.find('tr').last().find('select').val(type);
    el.find('tr').last().find('div').show();
}
function add_secretRecipient(el, mail, html = ''){
    html += '<input type="hidden" name="addAddress[]" value="'+mail+'">';
    html += '<input type="hidden" name="addAddressType[]" value="BCC">';
    el.after(html);
}
function remove_recipient(el){el.closest('tr').remove()}

function add_AI_button_for_email(form, html = ''){
    html += '<div class="note-btn-group">';
    html += '<button onclick="open_email_AI($(this))" type="button" class="note-btn" data-tooltip="Oktagon AI">AI</button></div>'
    form.find('.note-toolbar').append(html);
    tooltips();
}
function open_email_AI(el){loadJS('AI/AI-mini', function(){
    AI_box(el, {
        type: 'ask',
        instruction: 'write a email depending on user input, without subject',
        placeholder: slovar('What_type_of_email_do_you_want'),
        button1: slovar('Create_template'),
        button2: slovar('Use_template'),
        done: function(data){
            var form = el.closest('form');
            form.find('#email_body').val(encodeAnswerWithDIV(data)+form.find('#email_body').val());
            refreshTextarea(form);
        }
    });
})}

function add_emailBodyContent(form, content){
    var textarea = form.find('#email_body');
    textarea.on('summernote.keydown', function(we, e){
      // if(e.keyCode != 13){ return }
        form.find('.note-editable').children('p').each(function(){
            var style = $(this).attr('style');
            if(style){ $(this).replaceWith('<div style="'+style+'">'+$(this).html()+'</div>') }
            else{ $(this).replaceWith('<div>'+$(this).html()+'</div>') }
        });
    });
    if(valEmpty(content)){ return }
    if(typeof(content) == 'object'){
        $('<iframe id="tempFrame"/>').appendTo(form).contents().find('body').append(content.html());
        $('#tempFrame').contents().find('style').remove();
        textarea.summernote('pasteHTML', $('#tempFrame').contents().find('body').html());
        return $('#tempFrame').remove();
    }
    if(typeof(content) == 'string'){ return textarea.summernote('pasteHTML', content) }
}

function add_custom_forwardFile(form, path, file, fileName, html = ''){
    if(!form.find('.forwardFileArea').hasClass('fileArea')){
        form.find('.forwardFileArea').addClass('fileArea');
    }
    if(form.find('[name=custom_file_path]').length == 0){
        form.find('.fileFormField').hide();
        html += '<input type="hidden" name="custom_file_path" value="' + path + '">';
    }
    html += '<input type="hidden" name="forwardFile[]" value="' + file + '">';
    html += '<input type="hidden" name="forwardFileName[]" value="' + fileName + '">';
    html += '<div class="file"><div class="img"></div>' + fileName + ' (' + file + ')</div>';
    form.find('.forwardFileArea').prepend(html);
}

function change_sender(form, user_id){
    if(form.find('[name=custom_email]').length != 0){ form.find('[name=custom_email]').remove() }
    form.prepend('<input type="hidden" name="custom_email" value="' + user_id + '">');
}
function change_sender_to_crm(form){
    if(form.find('[name=crm_email]').length != 0){ form.find('[name=crm_email]').remove() }
    form.prepend('<input type="hidden" name="crm_email" value="1">');
    form.append('<div class="crm_email">MPA email</div>');
}

function send_email(form, callback){
    form.find('.alert, input[name=csrf_token]').remove();
    form.hide();
    form.before(HTML_loader());
    form.prepend($('input[name=csrf_token]').clone());
    var formData = new FormData(form[0]);
    $.ajax({ 
        url: '/crm/php/email/send_email_exec.php?send_email=1', 
        type: 'post', data: formData, contentType: false, processData: false,
        success: function(data){
            data = JSON.parse(data);
            remove_HTML_loader(form.parent());
            if(data.error){
                form.show();
                console.log(data);
                return createAlertPOPUP('Error - check console for more information');
            }
            if(typeof callback === 'function'){ callback() }
            removePOPUPbox()
        }
    }).fail(function(data){
        createAlertPOPUP('Error - check console for more information');
        console.log(data);
    });
}

loadCSS('email');