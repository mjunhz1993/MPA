function HTML_h1_table(data, html = ''){
    html += '<table class="h1_table"><tr><td>';
    html += '<h1><span>'+slovar(data)+'</span></h1></td><td></td></tr></table>';
    return html
}

function HTML_tableTop(data, html = ''){
    html += '<table class="tableTop"><tr><td>';
    if(data.left){
        if(data.left.title){ html += '<h2>' + data.left.title + '</h2>'; }
        if(data.left.button == 'add'){
            html += '<button class="button buttonGreen" onClick="loadJS(\'main/add-box\', function(){openAddBox()})">';
            html += getSVG('plus-circle') + '<span class="SVGdesc">' + slovar('Add_new') + '</span></button>';
        }
        if(data.left.table == 'counter'){
            html += slovar('Showing') + ' <span class="tableRowCount"></span> ' + slovar('Entries');
        }

    }
    html += '</td>';
    if(data.center){ html += '<td class="center"></td>'; }
    html += '<td>';
    if(data.right){
        if(data.right.table == 'Options_table'){
            html += '<div class="button buttonBlue options_table" onclick="showDropdownMenu($(this), true)">';
            html += getSVG('settings') + '<span class="SVGdesc">' + slovar('Show_more_options') + '</span>';
            html += '<div class="DropdownMenuContent"></div></div>';
        }
        if(data.right.table == 'load_more'){
            html += '<button class="button buttonBlue tableLoadMoreButton">';
            html += getSVG('show-more') + '<span class="SVGdesc">' + slovar('Show_more') + '</span></button>';
        }

    }
    html += '</td></tr></table>';
    return html;
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

function HTML_loader(text = '', html = ''){
    html = '<span class="loading20"></span>';
    if(!valEmpty(text)){ html += '<span class="loadingText">'+text+'</span>' }
    return html; 
}
function remove_HTML_loader(box){ box.find('.loading20,.loadingText').remove() }