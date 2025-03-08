loadCSS('DURS');

function ADDON_FURS(module, box, type, addon, i, html = ''){
    if(!['ADD','EDIT'].includes(type)){ return }
	var copy = addon[3];
    var clickEvent = 'openCopyFromDURS($(this))';
    var label = addon[2];
    var group = addon[1];
    html += '<b class="button buttonBlue" data-copy="'+copy+'" onclick="'+clickEvent+'">'+slovar(label)+'</b>';
    if(box.find('legend[data-group="'+group+'"]').parent().find('.addonButtonBox').length == 0){
        box.find('legend[data-group="'+group+'"]').after('<div class="addonButtonBox" data-group="'+group+'"></div>');
    }
    box.find('.addonButtonBox[data-group="'+group+'"]').append(html);
}

function openCopyFromDURS(el){
    var popup = createPOPUPbox();
    var popupBox = popup.find('.popupBox');
    popupBox.css('padding',0);
    popupBox.html(DURS_form_HTML());
    popupBox.find('input[type=text]').keyup(function(e){if(e.keyCode == 13){ DURS_search(popup, el) }});
    popupBox.find('.buttonBlue').click(function(){ searchFURS(popup, el) });
    popup.fadeIn('fast', function(){ popupBox.find('input[type=text]').focus() });
}

function DURS_form_HTML(){
    return `
    <div id="DURS">
        <div class="DURS"></div>
        <div class="DURSbottom">
            <input type="text" placeholder="${slovar('Search')}"  style="width:100%;box-sizing:border-box;padding:5px;">
            <hr>
            <button class="button buttonBlue">${slovar('Search')}</button>
            <button class="button buttonGrey" onclick="removePOPUPbox()">${slovar('Cancel')}</button>
        </div>
    </div>
    `
}

function DURS_search(popup, el, html = ''){
    var popupBox = popup.find('.popupBox');
    var box = popupBox.find('#DURS');
    var table = popupBox.find('.DURS');
    var buttons = popupBox.find('.DURSbottom');
    var value = popup.find('input[type=text]').val();
    if(valEmpty(value)){ return }
    table.html(HTML_loader());
    buttons.hide();
    $.getJSON('/crm/php/API/DURS.php', {
        DURS:true,
        search:value
    }, function(data){
        if(data){for(var i=0; i<data.length; i++){ html += DURSToTable(data[i]) }}
        table.html(html);
        table.find('.DURSbox').click(function(){ copyFromDURS($(this), el) });
        remove_HTML_loader(popupBox);
        buttons.show();
    })
}
function DURSToTable(comp){
    return `
    <div class="DURSbox">
        <b data-col="naziv">${comp.ime}</b>
        <br>
        <span data-col="ulica">${comp.ulica}</span>
        <br>
        <span data-col="posta">${comp.posta}</span>
        <span data-col="mesto">${comp.mesto}</span>
        <hr>
        <span>${slovar('Tax_number')}: <b data-col="davcna">${comp.davcna}</b></span>
        <br>
        <span>${slovar('Registration_number')}: <b data-col="maticna">${comp.maticna}</b></span>
        <br>
        <span>${slovar('Taxpayer')}: <b data-col="placnik">${comp.zavezanec}</b></span>
    </div>
    `
}

function copyFromDURS(row, el) {
    var box = el.closest('form');
    el.attr('data-copy').split(',').forEach((val, i, arr) => {
        if (i % 2 === 0) {
            box.find(`[name="${arr[i + 1]}"]`)
            .val(row.find(`[data-col="${val}"]`).text());
        }
    });
    refreshFormData(box);
    removePOPUPbox();
}