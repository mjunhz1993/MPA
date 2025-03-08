function openAddConversation(module = '', row = ''){loadJS('chat/chat', function(){
    hideDropdownMenu();
    find_conversation(module, row, function(){
        var popup = createPOPUPbox();
        var popupBox = popup.find('.popupBox');

        var html = '<h2>' + slovar('Add_conversation') + '</h2>';
        html += '<form><div class="button buttonGrey" onclick="removePOPUPbox()">'+slovar('Cancel')+'</div></form>';
        popupBox.html(html);
        var form = popupBox.find('form');

        GET_module({
            module:'chat',
            done:function(moduleData){
                popup.fadeIn('fast');
                if(!moduleData.can_add.includes(user_role_id)){ return form.prepend('<p class="alert alertRed">' + slovar('Access_denied') + '</p>') }
                displayAddConversation(form, module, row, html = '');
            }
        })
    })
})}

function find_conversation(module, row, callback){
    if(valEmpty(module) || valEmpty(row)){ return callback() }
    $.getJSON('/crm/php/chat/chat.php?find_conversation=1', {module:module,row:row}, function(data){
        if(!data){ return callback() }
        return chat(function(){ chat_box(data) })
    })
}

function displayAddConversation(form, module, row, html = ''){
    GET_users({done:function(data){
        if(!valEmpty(module) && !valEmpty(row)){
            html += '<input type="hidden" name="module" value="' + module + '">';
            html += '<input type="hidden" name="row" value="' + row + '">';
        }
        html += '<label for="conv_subject">' + slovar('Subject') + '</label>';
        html += '<input type="text" name="subject" id="conv_subject" required>';
        html += '<div style="display:flex;background-color:gainsboro;margin:5px 0;padding:0 5px;gap:5px;">';
        for(var i=0; i<data.length; i++){
            user = data[i];
            if(user.user_id == user_id){ continue }
            html += checkboxInput({
                id:'assignuser'+user.user_id,
                name:'user[]',
                value:user.user_id,
                label:user.user_username
            })
        }
        html += '</div><hr><button class="button buttonGreen">' + slovar('Add_new') + '</button>';
        form.prepend(html);
        form.prepend($('input[name=csrf_token]').clone());
        form.on('submit', function(e){
            e.preventDefault();
            addConversation(form);
        });
    }})
}

function addConversation(form){
    $.post('/crm/php/chat/chat.php?add_conversation=1', form.serialize(), function(data){
        data = JSON.parse(data);
        if(data.error){ return createAlert(form, 'Red', data.error) }
        removePOPUPbox(function(){chat(function(){
            if($('#conversationToolBox').length != 0){ return removePOPUPbox(function(){ chat_box(data) }) }
            chat_box(data)
        })})
    })
}