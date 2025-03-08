function loadOldMessages(id, time, callback){
    if(valEmpty(id)){ return console.log('ERROR: no chat ID') }
    $('#chatBox .chatNoMessages').remove();
    $.getJSON('/crm/php/chat/chat.php?load_old_messages=1', {id: id, time: time}, function(data){
        if(data.length == 0){ noOldMessages() }
        else{ getMessages($('#chatBox'), data, id, 'OLD') }
        if(typeof callback === 'function'){ callback(); }
    })
}

function showMoreOldMessages(id, el){
    el.remove();
    loadOldMessages(id, $('.chatBox').first().find('.chatBoxTime').attr('data-time'), 'OLD');
}

function noOldMessages(){ $('#chatBox').prepend('<div class="chatNoMessages">' + slovar('No_messages') + '</div>') }

function loopLoadNewMessages(id){
    clearTimeout(oktagonChatTimer);
    if(!valEmpty(id) && oktagonChatLoop && !valEmpty($('#chatInfo').attr('data-id'))){
        return loadNewMessages(id, function(){oktagonChatTimer = setTimeout(function(){ loopLoadNewMessages(id) }, 5000)})
    }
    console.log('ERROR: no chat ID');
    oktagonChatLoop = false;
}

function loadNewMessages(id, callback){
    var box = $('#chatBox');
    if(valEmpty(id)){ return console.log('ERROR: no chat ID') }
    if(box.hasClass('loading')){ return console.log('ERROR: messages are already loading') }
    box.addClass('loading');
    var time = $('.chatBox').last().find('.chatBoxTime').attr('data-time');
    if(valEmpty(time)){ time = getDate('Y-m-d H:i:s', new Date(1999, 01, 01), 'UTC') }
    $.getJSON('/crm/php/chat/chat.php?load_new_messages=1', {id:id, time:time}, function(data){
        getMessages(box, data, id, 'NEW');
        if(typeof callback === 'function'){ callback() }
    })
}

function getMessages(box, data, id, type, html = ''){
    if(valEmpty(data)){ return }
    var chatBox = box.find('.chatBox');
    var currentUserMSG = 0;
    if(chatBox.length != 0){ currentUserMSG = chatBox.last().attr('data-user') }
    for(var m = 0; m < data.length; m++){
        var msg = data[m];
        msg.localTime = getDate(defaultDateFormat + ' ' + defaultTimeFormat, stringToDate(msg.time, 'UTC'));
        msg.avatar = getMessages_avatar(msg);
        msg.attachment = getMessages_attachment(msg, id);
        if(user_id == msg.user){ html += createMyMessage(msg, currentUserMSG) }
        else{ html += createOtherMessage(msg, currentUserMSG) }
        currentUserMSG = msg.user;
    }
    if(type == 'NEW'){ box.append(html) }
    else if(type == 'OLD'){
        if(chatBox.length == 0){ type = 'NEW' }
        box.prepend('<div class="button buttonBlue" onclick="showMoreOldMessages(\''+id+'\', $(this))">'+slovar('Show_more')+'</div>'+html);
    }
    showMessages(box, type);
}

function getMessages_avatar(msg){
    if(valEmpty(msg.avatar)){ return '' }
    msg.avatar = msg.avatar.split('.');
    msg.avatar = 'background-image: url(/crm/static/uploads/user/' + msg.avatar[0] + '_small.' + msg.avatar.pop();
    return msg.avatar;
}

function getMessages_attachment(msg, id, html = ''){
    if(valEmpty(msg.attachment)){ return false }
    var atts = msg.attachment.split('|');
    html += '<div class="fileArea">';
    for(var i=0; i<atts.length; i++){
        var att = atts[i].split(',');
        var aType = att[0].split('.').pop().toUpperCase();
        var attBG = '';
        if(aType == 'JPG' || aType == 'JPEG' || aType == 'PNG' || aType == 'GIF'){
            attBG = "background-image:url('/crm/static/uploads/chat_rooms/chat_room_" + id + "/" + att[0] + "');";
        }
        html += '<div class="file"><div class="img" style="' + attBG + '" ';
        html += 'onclick="clickOnFile(\'chat_rooms/chat_room_' + id + '\', \'\', \'' + att[0] + '\', \'' + att[1] + '\')">';
        html += '</div><div class="fileDesc">' + att[1] + '</div></div>';
    }
    html += '</div>';
    return html;
}

function createMyMessage(msg, currentID, html = ''){
    if(currentID != msg.user){ html += '<hr>' }
    html += '<div class="chatBox me new" data-user="'+msg.user+'" style="display: none;">';
    html += '<div class="chatBoxMessage"><div class="chatBoxMessageInner">';
    if(currentID != msg.user){ html += '<b>'+msg.username+'</b>' }
    if(msg.message != ''){ html += '<p>'+urlifyMessage(msg.message)+'</p>' }
    html += '</div>';
    if(msg.attachment){ html += msg.attachment }
    html += '</div>';
    html += '<div class="chatBoxAvatar">';
    if(!valEmpty(msg.avatar) && currentID != msg.user){ html += '<div class="avatarSmall" style="'+msg.avatar+'"></div>'; }
    html += '<p class="chatBoxTime" data-time="'+msg.time+'">'+msg.localTime+'</p>';
    html += '</div></div>';
    return html;
}
function createOtherMessage(msg, currentID, html = ''){
    if(currentID != msg.user){ html += '<hr>' }
    html += '<div class="chatBox you new" data-user="'+msg.user+'" style="display: none;">';
    html += '<div class="chatBoxAvatar">';
    if(!valEmpty(msg.avatar) && currentID != msg.user){ html += '<div class="avatarSmall" style="'+msg.avatar+'"></div>' }
    html += '<p class="chatBoxTime" data-time="'+msg.time+'">'+msg.localTime+'</p>';
    html += '</div>';
    html += '<div class="chatBoxMessage"><div class="chatBoxMessageInner">';
    if(currentID != msg.user){ html += '<b>'+msg.username+'</b>' }
    if(msg.message != ''){ html += '<p>'+urlifyMessage(msg.message)+'</p>'; }
    html += '</div>';
    if(msg.attachment){ html += msg.attachment }
    html += '</div></div>';
    return html;
}

function showMessages(box, type){
    var cb = box.find('.chatBox.new');
    if(cb.length == 0){ return box.removeClass('loading') }
    cb.fadeIn(100, function(){ cb.removeClass('new') });
    setTimeout(function(){ box.removeClass('loading') }, 501);
    if(type == 'NEW'){
        setTimeout(function(){ $('#MainChatBox').animate({ scrollTop: $('#MainChatBox').prop('scrollHeight') }, 500) }, 101);
    }
}