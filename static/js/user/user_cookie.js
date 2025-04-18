function showUserConfig_cookie(box, html = ''){
	var c = getAllCookies();
	html += '<table class="table"><thead><tr>';
	html += '<th></th>';
	html += '<th>'+slovar('Name')+'</th>';
	html += '</tr></thead><tbody>';
	for(var i=0; i<c.length; i++){
		html += '<tr>';
		html += '<td>';
		html += '<b class="linksvg" data-tooltip="' + slovar('Delete') + '" ';
		html += 'onclick="showUserConfig_cookieDelete(\'' + c[i][0] + '\');">' + getSVG('delete') + '</b>'
		html += '</td>';
		html += '<td><a onclick="consoleLog_C(\''+c[i][0]+'\')">' + c[i][0] + '</a></td>';
		html += '</tr>';
	}
	html += '</tbody></table>';
	box.html(html);
	tooltips();
}

function consoleLog_C(c){
	console.log(getCookie(c))
}

function showUserConfig_cookieDelete(c){
	POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
		deleteCookie(c);
		showUserConfig_cookie($('#userconfigbox'));
	});
}