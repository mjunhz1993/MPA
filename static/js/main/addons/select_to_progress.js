function ADDON_select_to_progress(module, box, type, addon, i, html = ''){
	if(type != 'READ'){ return }
	var input = box.find('input[name="' + addon[1] + '"]');
	var el = input.closest('.formField');
	el.hide();
	var list = el.find('.selectMenu').attr('data-list').split('|');
	html += '<div style="display:flex; justify-content:space-between; padding:15px 5px; overflow:auto;">';
	for(var j=0; j<list.length; j++){
		var l = list[j].split(',');
		if(l[2] == ''){ l[2] = 'black'; }
		html += '<div class="progressBox" data-value="' + l[0] + '" data-color="' + l[2] + '" style="';
		html += 'flex-grow:1; border:2px solid ' + l[2] + '; align-self:middle; text-align:center;';
		html += 'border-radius:50px; padding:5px; white-space:nowrap;';
		html += '">' + slovar(l[1]) + '</div>';
		if(j + 1 == list.length){ continue }
		html += '<div style="flex-grow:1; align-self:center;"><hr style="padding:0; margin:0; border:1px solid ' + l[2] + ';"></div>';
	}
	html += '</div>';
	el.after(html);
	if(input.val() == ''){ return }
	el.next().find('.progressBox').each(function(){
		$(this).css({
			'background-color': $(this).attr('data-color'),
			'color': getContrastYIQ($(this).attr('data-color')),
			'box-shadow': '0 0 5px black'
		}).wrapInner('<span></span>').prepend(getSVG('check'));
		$(this).find('svg').css({
			'height': '18px',
			'width': '18px',
			'vertical-align': 'middle',
			'padding-right': '5px'
		});
		$(this).find('span').css({
			'vertical-align': 'middle'
		});
		if(input.val() == $(this).attr('data-value')){ return false }
		$(this).next().find('hr').css({
			'box-shadow': '0 0 5px black'
		});
	});
}