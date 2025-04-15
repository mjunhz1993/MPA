function showUserConfig_localStorage(box, html = ''){
	var c = getAllLocalStorage();
	html += '<table class="table"><thead><tr>';
	html += '<th></th>';
	html += '<th>'+slovar('Name')+'</th>';
	html += '</tr></thead><tbody>';
	for(var i=0; i<c.length; i++){
		html += '<tr>';
		html += '<td>';
		html += '<b class="linksvg" data-tooltip="' + slovar('Delete') + '" ';
		html += 'onclick="showUserConfig_localStorageDelete(\'' + c[i][0] + '\');">' + getSVG('delete') + '</b>'
		html += '</td>';
		html += '<td><a onclick="consoleLog_LS(\''+c[i][0]+'\')">' + c[i][0] + '</a></td>';
		html += '</tr>';
	}
	html += '</tbody></table>';
	box.html(html);
	tooltips();
}

function consoleLog_LS(c){
	console.log(getLocalStorage(c))
}

function showUserConfig_localStorageDelete(c){
	POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
		deleteLocalStorage(c);
		showUserConfig_localStorage($('#userconfigbox'));
	});
}