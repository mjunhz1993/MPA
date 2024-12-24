function HTML_ANAL_pie(content, data){loadJS('chart/chart', function(){
	thisBox = content.closest(ANALobj.box);
	content.append('<div class="pie"></div>');
	pie = content.find('.pie');
	extra = ['noX','noY','noGrid'];
	if(thisBox.data('extra') === 'price'){ extra.push('PRICE') }
	if(thisBox.data('extra') === 'percent'){ extra.push('PERCENT') }
	CHART_get(thisBox.data('type'), pie, 50, add_dataset_pie(data), extra);
})}

function add_dataset_pie(data){
	return {
		labels: grab_pie_data(data),
		datasets: [
			{
				label: 'Dataset',
				data: grab_pie_data(data, 1),
				backgroundColor: generateColorPalette(data.length),
			}
		]
	}
}

function grab_pie_data(data, col = 0, arr = []){
	data.forEach((item) => {
		arr.push(item[Object.keys(item)[col]])
	})
	return arr
}