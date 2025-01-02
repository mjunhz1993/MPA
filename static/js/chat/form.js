function getChatForm(id){
    var form = $('#chatForm');
    if(form.find('textarea').length == 0){
        var html = '<div class="fileArea"></div>';
        html += '<input type="file" name="chatfile[]" id="chatFile" data-list="ALL,4" onchange="selectFile($(this), this)" multiple>';
        html += '<div id="chatFormInner">';
        html += '<textarea class="chatFormBox" name="message"></textarea>';
        html += '<label class="chatFormBox" for="chatFile">' + getSVG('attachment') + '</label>';
        html += '<button class="chatFormBox">' + slovar('Send') + '</button>';
        html += '</div>';
        form.html(html);
    }

    // CHATBOX TEXTAREA EVENTS
    form.find('textarea').unbind('keydown').keydown(function(e){
        if(e.keyCode == 13 && e.shiftKey){ return }
        if(e.keyCode == 13){ return postNewMessage(id) }
    });
    // CHATBOX BUTTON EVENT
    form.find('button').unbind('click').click(function(e){
        e.preventDefault();
        postNewMessage(id);
    });
}

function postNewMessage(id){
    // GET SELECTED CONVERSATION ID
    if(valEmpty(id)){ return console.log('ERROR: no chat ID') }
    if($('#chatBox').hasClass('loading')){ return console.log('ERROR: messages are already loading') }
    // GET FORM
    var form = $('#chatForm');
    if(form.hasClass('loading')){ return console.log('ERROR: chat form is already loading') }
    form.addClass('loading');
    var chatBox = form.find('textarea');
    var chatFile = form.find('input[type=file]');
    var clipboardFile = form.find('input[name=clipboard]');
    var chatButton = form.find('button');
    
    form.find('.alert').remove();
    var chatBoxVal = chatBox.val();
    var chatFileVal = chatFile.val();
    if(clipboardFile.length == 1){ clipboardFile = true; }else{ clipboardFile = false; }

    if(valEmpty(chatBoxVal.replace(/(\r\n|\n|\r)/gm, "")) && valEmpty(chatFileVal) && !clipboardFile){ return }
    
    chatBox.blur();
    chatButton.hide();
    form.find('input[name=csrf_token]').remove();
    form.prepend($('input[name=csrf_token]').first().clone());
    
    var formData = new FormData(form[0]);
    $.ajax({ 
        url: '/crm/php/chat/chat.php?post_message=1&id=' + id, 
        type: 'post', data: formData, contentType: false, processData: false,
        success: function(data){ data = JSON.parse(data);
            setTimeout(function(){ form.removeClass('loading') }, 600);
            chatBox.val('').focus();
            chatButton.show();
            if(form.find('.fileArea .file').length != 0){ removeFile(form.find('.fileArea svg')) }
            if(data.error){ return createAlert(form, 'Red', data.error) }
            loopLoadNewMessages(id);
        }
    })
}

function checkClipboard(e){
    var form = $('#chatForm');
    var fileArea = form.find('.fileArea');
    var fileInput = form.find('input[type=file]');
    if(document.querySelector('#chatForm textarea') === document.activeElement && fileArea.find('.file').length == 0){
        getClipboardData(e, fileArea, fileInput);
    }
}

function getClipboardData(e, fileArea, fileInput){
    var item = e.clipboardData.items[0];
    if(item.kind == 'file'){
        var blob = item.getAsFile();
        if(blob instanceof Blob){ renderClipboardData(blob, fileArea, fileInput) }
    }
    else if(item.kind == 'string' && item.type == 'text/html'){
        var doc = new DOMParser().parseFromString(e.clipboardData.getData('text/html'), "text/html");
        var url = doc.querySelector('img').src;
        saveClipboardData(url, url, url.split(/[#?]/)[0].split('.').pop().trim().toUpperCase(), fileArea, fileInput);
    }
}

function renderClipboardData(blob, fileArea, fileInput){
    var ext = blob.type.split('/')[1].toUpperCase();
    if(ext == ''){ return false }
    var reader = new FileReader();
    reader.onload = function(e){if(blob.type){ saveClipboardData(e.target.result, blob, ext, fileArea, fileInput) }};
    reader.readAsDataURL(blob);
}

function saveClipboardData(e, blob, ext, fileArea, fileInput){
    var id = $('#chatInfo').attr('data-id');
    var formData = new FormData();
    formData.append('csrf_token', $('input[name=csrf_token]').val());
    formData.append('clipboard', blob);
    $.ajax({ 
        url: '/crm/php/chat/chat.php?save_clipboard=1&id=' + id, 
        type: 'post', data: formData, contentType: false, processData: false,
        success: function(data){
            data = JSON.parse(data);
            if(data.error){ console.log(data.error); return false }
            else{ displayClipboardData(data, fileArea, fileInput, ext, e) }
        }
    }).fail(function(data){ console.log('ERROR: backend-error'); });
}

function displayClipboardData(data, fileArea, fileInput, ext, e){
    var html = '<div class="file newFile"><div class="img"></div><div class="fileDesc">' + data.name + '</div>' + getSVG('x');
    html += '<input type="hidden" name="clipboard" value="' + data.name + '"></div>';
    fileArea.append(html);
    var file = fileArea.find('.file').last();
    if(['JPG','JPEG','PNG','GIF'].includes(ext)){ file.find('.img').css('background-image', 'url("' + e + '")') }

    fileInput.after(fileInput.clone());
    file.find('svg').click(function(){ removeFile($(this)) });
}

$(document).ready(function(){document.onpaste = function(e){ checkClipboard(e) }});