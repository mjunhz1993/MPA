function HTML_ANAL_bar(box, extraData, data){loadJS('chart/chart', function(){
	thisBox = box.closest(ANALobj.box);
	box.append('<div class="bar"></div>');
	bar = box.find('.bar');
	extra = ['modeIndex'];
	if(extraData.includes('price')){ extra.push('PRICE') }
	if(extraData.includes('percent')){ extra.push('PERCENT') }
	CHART_get(thisBox.data('type'), bar, 150, add_dataset_bar(data), extra);
})}

function add_dataset_bar(data){
	return {
		labels: grab_bar_data(data),
		datasets: loop_dataset_bar(data)
	}
}

function grab_bar_data(data, col = 0, arr = []){
	data.forEach((item) => {
		arr.push(item[Object.keys(item)[col]])
	})
	return arr
}

function loop_dataset_bar(data, loop = []){
	col = Object.keys(data[0]);
	col.shift();
	st = 1;
	colorPalette = generateColorPalette(data.length);
	col.forEach((item) => {
		loop.push({
			label: item,
			data: grab_bar_data(data, st),
			backgroundColor: colorPalette[st],
		})
		st++;
	})
	return loop
}