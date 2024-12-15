function exportTable(d = {}){
	if(valEmpty(d.id)){ return createAlertPOPUP(slovar('No_table_id')) }
	popup = createPOPUPbox();
	popupBox = popup.find('.popupBox');
	popupBox.html(HTML_loader())
	popup.fadeIn('fast');
	d.box = popupBox;
	loadCSS('exportTable');
	loadExportTable(d);
}

function loadExportTable(d){
	$.get('/crm/php/export/table.php', {
		exportTable: true,
		id:d.id
	}, function(data){
		data = JSON.parse(data);
		if(data.error){ 
			removePOPUPbox();
			return createAlertPOPUP(slovar(data.error));
		}
		console.log(data);
		addExportTableToBox(d, data);
	})
}

function addExportTableToBox(d, data){
	d.box.html(`
	<div id="exportTablePreview">
	<div class="top">
		<h2>`+slovar('Preview')+`</h2>
		<a onclick="removePOPUPbox()">`+getSVG('x')+`</a>
	</div>
	<div onclick="showDropdownMenu($(this), true)">
		<button class="button buttonBlue">`+slovar('Export')+`</button>
		<div class="DropdownMenuContent">
			<a onclick="exportTableTo('csv', '`+d.id+`')">CSV</a>
			<a onclick="exportTableTo('xlsx', '`+d.id+`')">XLSX</a>
		</div>
	</div>
	<div class="bottom">
	`+HTML_exportTable(data)+`
	</div>
	`);
	resetDropdownMenuConfig();
}

function HTML_exportTable(data, html = '', rowCount = 1){
	data.forEach((item) => {
		if(rowCount == 1){ html += HTML_exportTableTopRow(item) }
		html += HTML_exportTableRows(item);
		rowCount++;
	});
	return '<table class="table">'+html+'</table>';
}

function HTML_exportTableTopRow(item, html = ''){
	const keys = Object.keys(item);
	keys.forEach(key => { html += '<th>'+key+'</th>' });
	return '<tr>'+html+'</tr>'
}

function HTML_exportTableRows(item, html = ''){
	const values = Object.values(item);
	values.forEach((value) => { html += '<td>'+value+'</td>' });
	return '<tr>'+html+'</tr>'
}

function exportTableTo(type, id){
	window.open('/crm/php/export/'+type+'.php?id='+id, '_blank').focus();
}