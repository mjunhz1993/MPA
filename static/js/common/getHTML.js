function HTML_h1_table(data, html = ''){
    html += '<table class="h1_table"><tr><td>';
    html += '<h1><span>'+slovar(data)+'</span></h1></td><td></td></tr></table>';
    return html
}

function HTML_tableTop(data) {
    return `<table class="tableTop"><tr>
        <td>
            ${data.left?.title ? `<h2>${data.left.title}</h2>` : ''}
            ${data.left?.button === 'add' ? `
                <button class="button buttonGreen" onClick="loadJS('main/add-box', () => openAddBox())">
                    ${getSVG('plus_circle')}<span class="SVGdesc">${slovar('Add_new')}</span>
                </button>` : ''}
        </td>
        ${data.center ? '<td class="center"></td>' : ''}
        <td>
            ${data.right?.table === 'Options_table' ? `
                <div class="button buttonBlue options_table" onclick="showDropdownMenu($(this), true)">
                    ${getSVG('settings')}<span class="SVGdesc">${slovar('Show_more_options')}</span>
                    <div class="DropdownMenuContent"></div>
                </div>` : ''}
        </td>
    </tr></table>`;
}

function HTML_verticalToggleButtons(data, html = ''){
    html += '<div class="verticalToggleButtons">';
    for(var i = 0; i < data.a.length; i++){
        html += '<a ';
        if(typeof data.a[i].href !== "undefined"){ html += 'href="' + data.a[i].href + '" ' }
        if(typeof data.a[i].class !== "undefined"){ html += 'class="' + data.a[i].class + '" ' }
        if(typeof data.a[i].blank !== "undefined"){ html += 'target="_blank" ' }
        if(typeof data.a[i].onclick !== "undefined"){ html += 'onclick="' + data.a[i].onclick + '"' }
        html += '>';
        if(typeof data.a[i].name !== "undefined"){ html += data.a[i].name }
        html += '</a>';
    }
    html += '</div>';
    return html;
}

function HTML_loader(text = '', extra = {}) {
    let html = '<span class="loading20"></span>' + (!valEmpty(text) ? `<span class="loadingText">${text}</span>` : '');
    if (extra.popup) createPOPUPbox().find('.popupBox').html(html).end().fadeIn('fast');
    return html;
}
function remove_HTML_loader(box){ box.find('.loading20,.loadingText').remove() }