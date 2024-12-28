function HTML_ANAL_table(content, extra, data){loadJS('export/table', function(){
	content.html(HTML_exportTable(data));
	debug_ANAL_table(content, extra);
	add_events_to_table(content);
})}

function debug_ANAL_table(content, extra){
	content.find('th').each(function(){
		$(this).data('col', $(this).text()).addClass('asc');
		$(this).text($(this).text().replaceAll('_',' '));
	});

	
	if(extra.includes('Show_more')){content.append(`
		<button 
		class="button button100 buttonBlue loadMore"
		data-offset="0"
		>${slovar('Show_more')}</button>
	`)}
}

function add_events_to_table(content) {
	const thisBox = content.closest(ANALobj.box);

	content.find('th').click(function(){
		content.find('.loadMore').data('offset', 0).show();
		content.find('th').removeClass('act');
		$(this).toggleClass('asc desc').addClass('act');
		content.find('tr').not(':first-child').remove();
		load_new_table_analytic(thisBox);
	});

	content.find('.loadMore').click(function(){
		if($(this).data('offset') == parseInt(content.find('tr').length) - 1){ return $(this).hide() }
		$(this).data('offset', parseInt(content.find('tr').length) - 1);
		load_new_table_analytic(thisBox);
	});
}

// EXTRA

function load_new_table_analytic(thisBox){setTimeout(function(){
	let orderBy
	const tr = thisBox.find('th.act');
	if(tr.length == 1){
		const orderCol = tr.data('col');
		const orderDir = tr.hasClass('asc') ? 'ASC' : 'DESC';
		orderBy = orderCol+' '+orderDir;
	}

	analytic_content_data({
		pid: thisBox.data('id'),
		data: {
			orderBy: orderBy || undefined,
			offset: thisBox.find('.loadMore').data('offset') || 0
		},
		done: function(thisData){ append_new_rows(thisBox, HTML_exportTable(thisData)) }
	});
}, 100)}

function append_new_rows(thisBox, data){
	thisBox.append(`<div class="tempTable">${data}</div>`);
	thisBox.find('.tempTable tr').not(':first-child')
	.appendTo(thisBox.find('table').first());
	thisBox.find('.tempTable').remove();
}