function HTML_ANAL_table(content, extra, data){loadJS('export/table', function(){
	content.html(`
		<div class="horizontalTable" style="max-height:50vh">
			${HTML_exportTable(data)}
		</div>
	`);
	debug_ANAL_table(content, extra);
	add_events_to_table(content);
})}

function debug_ANAL_table(content, extra){
	content.find('.headRow th').each(function(){
		if(!extra.includes('sort')){ $(this).addClass('no-sort') }
		$(this).data('col', $(this).text()).addClass('asc');
		$(this).text($(this).text().replaceAll('_',' '));
	});

	if(extra.includes('limit')){content.prepend(`
		<div class="top">
			<div>
				${slovar('Showing')}
				<input class="limit" type="number" min="1" max="100" value="100">
				${slovar('Entries')}
			</div>
		</div>
	`)}

	if(extra.includes('filter')){
		let filRow = '';
		content.find('.headRow th').each(function(){
			filRow += `<td class="no-sort"><input type="text"></td>`;
		})
		content.find('.headRow').after(`<tr class="headRow tableFilterRow">${filRow}</tr>`);
	}
	
	if(extra.includes('offset')){content.append(`
		<button 
		class="button button100 buttonBlue loadMore"
		data-offset="${parseInt(content.find('tbody tr').length)}"
		>${slovar('Show_more')}</button>
	`)}

	let laoder = extra.find(item => item.startsWith('load[') && item.endsWith(']'));
	if(laoder){
	    let word = laoder.match(/^load\[(.*?)\]$/)[1].split(',');
	    loadJS(`${window.location.origin}/crm/php/downloads/${word[0]}.js`, function(el){ eval(`${word[1]}(el)`) }, content);
	}

}

function add_events_to_table(content) {
	const thisBox = content.closest(ANALobj.box);

	thisBox.find('.limit').on('keyup', function(e){
		if(e.keyCode === 13){
			if($(this).val() <= 0){ $(this).val(1) }
			if($(this).val() >= 100){ $(this).val(100) }
			remove_rows_table_analytic(content);
		}
	});

	content.find('th:not(.no-sort)').click(function(){
		content.find('th').removeClass('act');
		$(this).toggleClass('asc desc').addClass('act');
		remove_rows_table_analytic(content);
	});

	content.find('.tableFilterRow input').on('keyup', function(e){
		if(e.keyCode === 13){ remove_rows_table_analytic(content) }
	});

	content.find('.loadMore').click(function(){
		if($(this).data('offset') == parseInt(content.find('tbody tr').length)){ return $(this).hide() }
		$(this).data('offset', parseInt(content.find('tbody tr').length));
		load_new_table_analytic(thisBox);
	});
}

// EXTRA

function remove_rows_table_analytic(content){
	content.find('.loadMore').data('offset', 0).show();
	content.find('tr').not('.headRow').remove();
	load_new_table_analytic(content.parent());
}

function load_new_table_analytic(thisBox){setTimeout(function(){
	let orderBy
	const tr = thisBox.find('.headRow th.act');

	if(tr.length == 1){
		const orderCol = tr.data('col');
		const orderDir = tr.hasClass('asc') ? 'ASC' : 'DESC';
		orderBy = orderCol+' '+orderDir;
	}

	analytic_content_data({
		pid: thisBox.data('id'),
		data: {
			filter: get_filter_values_table_analytic(thisBox),
			orderBy: orderBy || undefined,
			offset: thisBox.find('.loadMore').data('offset') || 0,
			limit: thisBox.find('.limit').val() || undefined
		},
		done: function(thisData){ append_new_rows(thisBox, HTML_exportTable(thisData)) }
	});
}, 100)}

function get_filter_values_table_analytic(thisBox, arr = []){
	thisBox.find('.tableFilterRow input, .tableFilterRow select').each(function(){
		if(valEmpty($(this).val())){ return }
		var where = $(this).data('where');
	    if(typeof where !== 'string'){ return }
		arr.push(where.replace('{value}', $(this).val()));
	})
	return arr;
}

function append_new_rows(thisBox, data){
	thisBox.append(`<div class="tempTable">${data}</div>`);
	thisBox.find('.tempTable tr').not('.headRow')
	.appendTo(thisBox.find('table').first());
	thisBox.find('.tempTable').remove();
}