function openPipeline(box){loadJS('API/draggable',function(){
	loadCSS('pipeline');
	module = box.attr('data-module');
	box = box.find('.horizontalTable');

	$.get('/crm/php/presets/presets.php', {
		get_presets:true,
		module:module,
		type:'pipeline'
	}, function(data){
		data = JSON.parse(data);
		if(!data){ return createAlertPOPUP(slovar('Empty')) }
		data = data.data;
		if(valEmpty(data.status)){ return createAlertPOPUP(slovar('Empty')) }
		data.module = module;
		box.empty();
		pipeline_loadStatusRow(box, data);
	})
})}

function pipeline_loadStatusRow(box, data){
	GET_column({
		module:data.module,
		column:data.status,
		done:function(c){
			data.statusRow = c[0].list.split('|').map(item => item.split(','));
			if(!valEmpty(data.statusOptions)){
				data.statusRow = data.statusRow.filter(item => data.statusOptions.split('|').includes(item[0]));
			}
			pipeline_displayStatusRow(box, data);
		}
	})
}

function pipeline_displayStatusRow(box, data, html = ''){
	html += '<table class="pipeline"><thead><tr>'
	data.statusRow.forEach(row => {
		if(valEmpty(row[2])){ row[2] = '#ffffff' }
		html += `
		<th style="background-color:`+row[2]+`; color:`+row[2]+`;" >
			<span style="color:`+getContrastYIQ(row[2])+`;">`+row[1]+`</span>
		</th>`;
	})
	html += '</tr></thead><tbody><tr>';
	data.statusRow.forEach(row => {
		html += '<td data-status="'+row[0]+'"></td>';
	})
	html += '</tr></tbody></table>';
	box.html(html);

	pipeline_loadAllColumns(box, data)
}

function pipeline_loadAllColumns(box, data, thisCol = false){
	if(!thisCol){
		box.find('.pipeline tbody td').append(HTML_loader());
		thisCol = box.find('.pipeline tbody td').first()
	}
	pipeline_loadColumn(box, data, thisCol, true, function(){
		nextCol = thisCol.next('td');
		if(nextCol.length == 0){ return }
		pipeline_loadAllColumns(box, data, nextCol);
	})
}

function pipeline_loadColumn(box, data, thisCol, emptyCol = true, callback = false){
	if(emptyCol){ thisCol.empty() }
	$.get('/crm/php/presets/pipeline.php', {
		get_pipeline: true,
		data: data,
		statusValue: thisCol.data('status')
	}, function(rows){
		rows = JSON.parse(rows);
		remove_HTML_loader(thisCol);
		setTimeout(function(){ if(callback){callback()} }, 100)
		if(rows.error || rows.length == 0){ return }
		pipeline_displayRow(box, thisCol, data, rows.rows);
		if(rows.loadMore){ pipeline_HTMLloadMore(box, data, thisCol) }
		tooltips();
	})
}

function pipeline_displayRow(box, thisCol, data, rows){
	rows.forEach(row => {
		thisCol.append(pipeline_HTMLrow(data, row));
		pipeline_dragEvent(box, thisCol, data)
	})
}

function pipeline_dragEvent(box, thisCol, data){
	thisEl = thisCol.find('.pipelineBox').last();
	draggable({
		box:thisEl,
		handle: '.drag',
		start: function(d){
			d.box.css({
				'width':d.box.width(),
				'position':'fixed'
			})
		},
		move: function(d, x){
			newPosition = false;
			box.find('.pipeline tbody td').each(function(){
				if($(this).offset().left < x){ newPosition = $(this) }
			})
			if(!newPosition){ return }
			if(d.box.parent().data('status') == newPosition.data('status')){ return }
			newPosition.parent().find('td').not(newPosition).removeClass('moveTo');
			newPosition.addClass('moveTo');
			d.box.prependTo(newPosition);
		},
		end: function(d){
			d.box.css({
				'width':'',
				'position':'',
				'top':'',
				'left':''
			});
			d.box.closest('tr').find('td').removeClass('moveTo');
			pipeline_changeStatus(box, d.box, data);
		}
	})
}

function pipeline_changeStatus(box, el, data){
    $.post('/crm/php/main/edit_in_table.php?change_status_pipeline=1&module='+data.module, {
    	id: el.data('id'),
    	column: data.status,
    	table_value: el.parent().data('status')
    }, function(thisData){
    	thisData = JSON.parse(thisData);
    	console.log(thisData);
    	if(thisData.error){ return pipeline_moveBack(box, el) }
    	el.data('status', el.parent().data('status'))
    	// pipeline_loadColumn(box, data, el.closest('td'));
    })
}

function pipeline_moveBack(box, el){
	el.prependTo(box.find(`tbody td[data-status="${el.data('status')}"]`))
}

function pipeline_HTMLrow(data, r){
	return `
	<div class="pipelineBox" data-id="${r.id}" data-status="${r.status}">
		<div class="top">
			<div class="title">${r.subject}</div>
			<div class="drag"></div>
		</div>
		`+pipeline_HTMLextraText(r)+`
		<div class="middle">
			<div class="users">${pipeline_HTMLusers(r.assigned)}</div>
			<div class="date">
				`+getSVG('clock')+`
				`+getDate(defaultDateFormat, stringToDate(r.date, 'UTC'))+`
			</div>
		</div>
		<div class="bottom">
			<div class="price">${pipeline_HTMLprice(r)}</div>
			<div class="buttons">
				<button 
				data-tooltip="${slovar('View')}"
				class="view"
				onclick="loadJS('main/read-box-mini', function(el){ open_readBoxMini(el,'row','${data.module}',${r.id})},$(this))"
				>${getSVG('list')}</button>
			</div>
		</div>
	</div>
	`
}
function pipeline_HTMLextraText(r){
	if(valEmpty(r.extraText)){ return '' }
	return `<div class="extraText">`+r.extraText+`</div>`
}
function pipeline_HTMLusers(users, html = ''){
	users.forEach(u => {
		html += `
		<span
		onclick="loadJS('main/read-box-mini', function(el){ open_readBoxMini(el,'row','user',`+u[0]+`)},$(this))"
		data-tooltip="`+u[1]+`">
		`+u[1][0]+`</span>`;
	});
	return html;
}
function pipeline_HTMLprice(r){
	if(valEmpty(r.price)){ return '' }
	return `<span>`+r.price+' '+defaultCurrency+`</span>`
}

function pipeline_HTMLloadMore(box, data, thisCol){
	thisCol.append(`<button class="button button100 buttonBlue buttonLoadMore">${slovar('Show_more')}</button>`);
	thisCol.find('.buttonLoadMore').click(function(){
		$(this).remove();
		data.OFFSET = thisCol.find('.pipelineBox').length;
		pipeline_loadColumn(box, data, thisCol, false);
	});
}

addTrigger({
    id: 'submitEditBox',
    trigger: function(){ openPipeline($('#main_table')) }
});