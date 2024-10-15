function createAlert(box, color, text, more = []){
    if(valEmpty(text)){ return }
    if(text.constructor === Array){ more = text; text = more.shift(); }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    var alert = '<div class="alert alert'+color+'">'+svg+' '+text;
    if(more.length != 0){ alert += '<ul class="alertMore"><li>'+more.join('</li><li>')+'</li></ul>' }
    alert += '</div>';
    box.find('.alert' + color).remove();
    box.append(alert);
}

function createAlertPOPUP(text, html = ''){
    var popup = createPOPUPbox();
    var popupBox = popup.find('.popupBox');
    html += '<div></div>';
    html += '<button class="button buttonGrey" onclick="removePOPUPbox()">'+slovar('Got_it')+'</button>';
    popupBox.html(html);
    createAlert(popupBox.find('div'), 'Red', text);
    popup.fadeIn('fast');
}

function createPOPUPbox(num = ''){
    if($('#popup').length == 1){ num = $('.popup').length }
    $('#Main').append('<div class="popup" id="popup'+num+'" style="display:none"><div class="popupBox" id="popupBox'+num+'"></div></div>');
    return $('.popup').last();
}

function removePOPUPbox(callback){$('.popup').last().fadeOut('fast', function(){
    $(this).remove();
    hideTooltip();
    if(typeof callback === 'function'){ callback() }
})}

function POPUPconfirm(title, desc, conf, html = ''){
    var popup = createPOPUPbox();
    var popupBox = popup.find('.popupBox');
    html += '<b class="popupTitle">'+title+'</b><p>'+desc+'</p>';
    html += '<button class="button buttonGrey" onclick="removePOPUPbox()">'+slovar('Cancel')+'</button>';
    html += '<button class="button buttonBlue">'+slovar('Confirm')+'</button>';
    popupBox.html(html);
    popup.fadeIn('fast', function(){
        popup.find('.buttonBlue').focus();
        popup.find('.buttonBlue').click(function(){
            removePOPUPbox(function(){if(typeof conf === 'function'){ conf() }});
        })
    });
}