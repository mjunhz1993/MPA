function searchConversations(e){if(e.keyCode == 13){ loadConversations() }}

function loadConversations(callback){
    if($('#conversationToolBox').length == 0){ return }
    GET_conversation({
        subject:$('#conversationSearch').val(),
        done:function(con){
            getConversations($('#conversationToolBox'), con);
            if(typeof callback === 'function'){ callback() }
        }
    })
}

function getConversations(box, data, html = ''){
    box.find('.conversationBoxItem').remove();
    if(valEmpty(data)){ return }
    for(var c = 0; c < data.length; c++){ html += getConversationsHTML(data[c]) }
    box.find('.conversationBox').html(html);
}

function getConversationsHTML(conv, html = ''){
    conv.class = 'conversationBoxItem';
    html += '<div class="'+conv.class+'" ';
    html += 'onclick="clickConversation('+conv.id+')"><div class="conversationBoxItemContent">'+getSVG('chat')+'</div>';
    html += '<div class="conversationBoxItemContent"><div class="conversationBoxItemName">'+conv.subject+'</div>';
    html += slovar('Last_update')+'<br>'+displayLocalDate(conv.time)+'</div></div>';
    return html;
}

function clickConversation(id){removePOPUPbox(function(){ chat_box(id) })}

function showConversation(id){
    $.getJSON('/crm/php/chat/chat.php?load_conversation=1&id=' + id, function(data){
        if(valEmpty(data.id)){ return clearConversationArea() }
        loadConversationHEAD(data, data.id);
        $('#chatForm').css('opacity', 1);
        $('#chatBox').text('');
        loadOldMessages(data.id, getDate('Y-m-d H:i:s', new Date(), 'UTC'), function(){
            if(!oktagonChatLoop){setTimeout(function(){ oktagonChatLoop = true; loopLoadNewMessages(data.id) }, 1000)}
        })
    })
}

function loadConversationHEAD(data, id){
    GET_globals({done:function(G){
        GET_module({ module:'chat',
            done:function(moduleData){
                createConversationHEAD(data, G, moduleData);
                getChatForm(id);
            }
        })
    }})
}

function createConversationHEAD(data, G, moduleData, html = ''){
    var box = $('#chatInfo');
    html += '<input type="text" value="'+data.subject+'" ';
    if(if_ConversationAdmin(data)){ html += 'onkeyup="changeConversationSubject(event,$(this))"' }
    else{ html += 'disabled' }
    html += '>';
    if(!valEmpty(data.module)){
        var href = 'module='+data.module;
        if(data.row != 0){ href += '#'+data.row+'-READ' }
        html += '<b>' + slovar('Category') + '</b> ';
        html += '<a href="/crm/templates/modules/main/main.php?'+href+'">';
        html += slovar(data.module_name);
        if(!valEmpty(data.row_data)){ html += ' (' + data.row_data + ')' }
        html += '</a><br/>';
    }
    html += '<b>' + slovar('Users') + '</b> ';
    var arr = [];
    for(var i=0; i<data.all_users.length; i++){ arr.push('<span data-userid="'+data.all_users[i].user_id+'">'+data.all_users[i].username+'</span>') }
    html += arr.join(', ', arr);
    box.find('.chatInfoLeft').html(html);
    html = '';

    if(!valEmpty(G.jitsiid) && if_ConversationAdmin(data)){
        html = '<span onclick="call_conversation($(this))" data-tooltip="'+slovar('Call')+'">'+getSVG('phone')+'</span>'
    }

    if(moduleData.can_delete.includes(user_role_id) && if_ConversationAdmin(data)){ 
        html += '<span onclick="deleteConversation($(this))" data-tooltip="'+slovar('Delete')+'">'+getSVG('delete')+'</span>'
    }
    html += '<span onclick="removePOPUPbox()" data-tooltip="'+slovar('Close')+'">'+getSVG('x')+'</span>';
    box.find('.chatInfoRight').html(html);
    tooltips();
    box.attr('data-id', data.id);
}

function changeConversationSubject(e, el){if(e.which == 13){
    var id = el.closest('#chatInfo').attr('data-id');
    $.post('/crm/php/chat/chat.php?change_conversation_subject=1', {
        csrf_token:$('[name=csrf_token]').val(),
        id:id,
        subject:el.val()
    }, function(data){ data = JSON.parse(data);
        if(data.error){ return console.log(data.error) }
        el.blur();
    })
}}

function call_conversation(el, users = []){
    var id = el.closest('#chatInfo').attr('data-id');
    el.closest('#chatInfo').find('[data-userid]').each(function(){
        if($(this).attr('data-userid') == user_id){ return }
        users.push($(this).attr('data-userid'))
    });

    $.post('/crm/php/chat/videocall.php?call_users=1', {
        room:id,
        users:users
    }, function(data){ data = JSON.parse(data);
        if(data.error){ return alert('Call_error') }
        loadJS('chat/videocall', function(){ videocall(id) })
    })
}

function deleteConversation(el){
    POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
        var id = el.closest('#chatInfo').attr('data-id');
        $.post('/crm/php/chat/chat.php?delete_conversation=1', {csrf_token:$('[name=csrf_token]').val(), id: id}, function(data){
            data = JSON.parse(data);
            if(data.error){ return console.log(data.error) }
            clearConversationArea()
        })
    })
}

function clearConversationArea(){ removePOPUPbox() }

function selectConversation(id){
    if(valEmpty(id)){ return }
    if($('#chatBox .loading20').length != 0){ return }
    $('#chatBox, #chatInfo .chatInfoLeft').html(HTML_loader());
    clearTimeout(oktagonChatTimer);
    oktagonChatLoop = false;
    setTimeout(function(){ showConversation(id) }, 1000);
}

function if_ConversationAdmin(data){
    if(data.admin.split(',').includes(user_id)){ return true }
    return false
}