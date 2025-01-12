function exportTable(d = {}){
	if(valEmpty(d.id)){ return createAlertPOPUP(slovar('No_table_id')) }
	if(valEmpty(d.param)){ d.param = [] }
	popup = createPOPUPbox();
	popupBox = popup.find('.popupBox');
	popupBox.html(HTML_loader())
	popup.fadeIn('fast');
	d.box = popupBox;
	loadCSS('exportTable');
	loadExportTable(d);
}

function loadExportTable(d){
	$.post('/crm/php/export/table.php', {
		exportTable: true,
		id:d.id,
		param:d.param
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
	<div class="middle">
		<button class="button buttonBlue" data-type="csv">CSV</button>
		<button class="button buttonGreen" data-type="xlsx">XLSX</button>
	</div>
	<div class="bottom">
	`+HTML_exportTable(data)+`
	</div>
	`);

	d.box.find('.middle .button').click(function(){
		exportTableTo($(this).data('type'), d)
	})
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

function exportTableTo(type, d){
	const paramString = d.param
    .map((item, index) => 
        Object.keys(item)
        .map(key => `param[${index}][${key}]=${encodeURIComponent(item[key])}`)
        .join('&')
    )
    .join('&');

	window.open('/crm/php/export/'+type+'.php?id='+d.id+'&'+paramString, '_blank').focus();
}