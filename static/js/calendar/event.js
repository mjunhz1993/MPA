function clickOnEvent(box, el){
    var id = el.attr('data-id');
    box.find('.calendarEventOnTop.act').removeClass('act');
    box.find('.calendarEventOnTop[data-id="' + id + '"]').addClass('act');
    loadEventData(box, el, id, el.attr('data-type'));
}

function loadEventData(box, el, id, type){loadJS('main/read-box-mini', function(){
    if(type == 'GOOGLE'){ return G_displayEventData(box, el, id) }
    boxMain = box.find('.calendarBoxMain');
    open_readBoxMini(el, 'row', boxMain.attr('data-module'), id)
})}

function G_displayEventData(box, el, id){
    open_readBoxMini(el, 'custom', 'Google', id, function(p, t){
        var googleBox = $('.calendarEvent[data-id="'+id+'"]').first();
        html = '<table class="readBoxMiniTable">';
        html += '<tr><th>'+slovar('Subject')+'</th>';
        html += '<td>'+googleBox.text()+'</td></tr>';
        html += '<tr><th>'+slovar('Start_date')+'</th>';
        html += '<td>'+getDate(defaultDateFormat+' '+defaultTimeFormat, stringToDate(googleBox.attr('data-start')))+'</td></tr>';
        html += '<tr><th>'+slovar('End_date')+'</th>';
        html += '<td>'+getDate(defaultDateFormat+' '+defaultTimeFormat, stringToDate(googleBox.attr('data-end')))+'</td></tr>';
        html += '</table>';
        p.html(html);
        html = '<a class="buttonSquare buttonBlue" href="'+googleBox.attr('data-url')+'" ';
        html += 'target="_blank">'+slovar('View_event')+'</a>';
        t.html(html);
    })
}