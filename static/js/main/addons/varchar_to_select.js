function ADDON_varchar_to_select(module, box, type, addon, i){
	if(!['ADD','EDIT'].includes(type)){ return }
	RUN_varchar_to_select({
		box: box,
		name: addon[1],
		options: addon[2].split(',')
	});
}

function RUN_varchar_to_select(d){
	d.el = d.box.find('[name="'+d.name+'"]');
	d.v = d.el.val();
	d.required = d.el.attr('required') ?? '';
    
    d.el.replaceWith(`
    <select name="${d.name}" ${d.required}>
        ${d.options.map(opt => `<option>${opt}</option>`).join('')}
    </select>
    `);
    
    d.box.find('[name="'+d.name+'"]').val(d.v);
}