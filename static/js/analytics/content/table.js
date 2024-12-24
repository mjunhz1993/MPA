function HTML_ANAL_table(content, data){loadJS('export/table', function(){
	content.html(HTML_exportTable(data));
	debug_th_row(content);
	add_ANAL_table_orderBy(content);
})}

function debug_th_row(content){
	content.find('th').each(function(){
		$(this).data('col', $(this).text());
		$(this).text($(this).text().replaceAll('_',' '));
	})
}

function add_ANAL_table_orderBy(content) {
	const thisBox = content.closest(ANALobj.box)
	.data('orderDir', content.closest(ANALobj.box).data('orderDir') || 'ASC');
	content.find('th').click(function() {
		const orderDir = thisBox.data('orderDir');
		get_analytic_content($(this).closest(ANALobj.main), thisBox, { orderBy: $(this).data('col') + ' ' + orderDir });
		thisBox.data('orderDir', orderDir === 'ASC' ? 'DESC' : 'ASC');
	});
}