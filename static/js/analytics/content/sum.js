function HTML_ANAL_sum(box, data){
	box.find('.analSum').remove();
	box.append(`<div class="analSum">${data[0][Object.keys(data[0])[0]]}</div>`);
}