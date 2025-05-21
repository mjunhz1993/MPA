function open_readBoxMini(el, type = 'row', module, id, callback){loadJS('form/form', function(){
	loadCSS('read-box-mini');
	var box = HTML_readBoxMini(el, module, id);
	box.find('.dragTop svg').first().click(function(){ clickBack_readBoxMini($(this)) });
	box.find('.dragTop svg').last().click(function(){ close_readBoxMini(box) });
	loadJS('GET/module', function(){
		clickIn_readBoxMini(box, type, module, id, callback);
		setTimeout(function(){ animation_readBoxMini(el, box) }, 100);
	})
})}

function HTML_readBoxMini(el, module, id, html = ''){
	var rbm = 'readBoxMini'+$('.readBoxMini').length;
	html += '<div id="'+rbm+'" class="readBoxMini" style="display:none;">';
	html += '<div class="dragTop">'+getSVG('arrow')+'<div class="title"></div>'+getSVG('x')+'</div>';
	html += '<div class="readBoxMiniBox"></div></div>';
	$('#Main').append(html);
	rbm = $('#'+rbm);
	rbm.mousedown(function(){ focus_readBoxMini(rbm) });
	focus_readBoxMini(rbm);
	el = el.closest('tr').find('.primary');
	if(el.length != 0){ rbm.find('.dragTop .title').text(el.first().text()) }
	return rbm;
}

function getData_readBoxMini(box, back){
	box.css('max-width','');
	var backButton = box.find('.dragTop svg').first();
	if(back.length == 1){ backButton.attr('class','act') }else{ backButton.removeAttr('class') }
	var last = back[back.length - 1];
	box.find('.readBoxMiniBox').html(HTML_loader());
	if(last[0] == 'row'){ return getData_readBoxMini_ROW(box, last[1], last[2], last[3]) }
	if(last[0] == 'table'){ return getData_readBoxMini_TABLE(box, last[1][1], last[1][2], last[2], last[3]) }
	if(last[0] == 'custom'){ return getData_readBoxMini_CUSTOM(box, last[1], last[3]) }
}

function getData_readBoxMini_ROW(box, module, id, callback){
	GET_column({
        module:module,
        showAll:true,
        done: function(col){
            GET_row({
            	readonly:true,
                module:module,
                id:id,
                done: function(row){ insertData_readBoxMini_ROW(box, module, id, col, row, callback) }
            })
        }
    })
}
function insertData_readBoxMini_ROW(box, module, id, col, row, callback, html = ''){
	var thisCategory = '';
	var thisTitle = [];
	html += '<div class="readBoxMiniTableBox">';
	html += '<table class="readBoxMiniTable">';
	for(var i=0; i<col.length; i++){
        var c = col[i];
        if(['ID','PASSWORD','JOIN_ADD_SELECT','BUTTON'].includes(c.type)){ continue }
        if(c.list == 'PRIMARY'){ thisTitle.push(row[c.column]) }
        if(thisCategory != c.category){
        	html += insertCategory_readBoxMini(c.category);
        	thisCategory = c.category;
        }
        html += '<tr><th>'+slovar(c.name)+'</th>';
		html += '<td>'+insertRow_readBoxMini(box, c, row)+'</td></tr>';
	}
	html += '</table></div><div class="readBoxTools">';
	html += '<a class="buttonSquare buttonBlue" ';
	html += 'href="/crm/templates/modules/main/main?module='+module+'#'+id+'-READ-">'+getSVG('list')+' '+slovar('View')+'</a>';
	html += '<button class="buttonSquare buttonBlue" ';
	html += 'onclick="edit_readBoxMini($(this), \''+module+'\','+id+')">'+getSVG('edit')+' '+slovar('Edit_row')+'</button>';
	html += '</div>';
	if(thisTitle.length > 0){ box.find('.dragTop .title').html(thisTitle.join(', ')) }
	box.find('.readBoxMiniBox').html(html);
	readBoxMini_joinadds(box.find('.placeholder'), row, [module]);
	if(typeof callback === 'function'){ callback() }
}
function insertCategory_readBoxMini(c){ return '<tr><th colspan="2">'+slovar(c)+'</th></tr>' }
function insertRow_readBoxMini(box, col, row, html = ''){
	var data = row[col.column];
	 if(col.type == 'JOIN_GET'){
    	return '<a class="link" onclick="clickJOIN_GET_readBoxMini($(this), \''+col.list+'\', '+row[col.module+'_id']+')">'+slovar('Show_more')+'</a>'
    }
    if(valEmpty(data)){ return '-' }
    if(col.type == 'JOIN_ADD'){
    	var list = col.list.split(',');
    	html += '<a ';
    	if(valEmpty(data)){ html += 'style="display:none" ' }
    	html += 'onclick="clickJOIN_ADD_readBoxMini($(this),\''+list[1]+'\','+data+')" data-list="'+col.list+'" class="link placeholder"></a>';
    	return html
    }
	if(col.type == 'DATETIME'){ return displayLocalDate(data) }
    if(col.type == 'SELECT'){
        var list = col.list.split('|');
        for(var l=0; l<list.length; l++){if(list[l].split(',')[0] == data){ return slovar(list[l].split(',')[1]) }}
    }
	if(col.type == 'PRICE'){ return Price(data) }
	if(col.type == 'PERCENT'){ return Percent(data) }
    if(col.type == 'CHECKBOX'){if(data==0){ return slovar('No') } return slovar('Yes') }
    if(col.type == 'VARCHAR'){
    	if(col.list == 'URL'){ return urlifyMessage(data) }
    	if(col.list == 'EMAIL'){ return '<a class="link" onclick="moveToCorner_readBoxMini($(this));clickMailToLink(\''+data+'\')">'+data+'</a>' }
    	if(col.list == 'COLOR'){ return '<div style="display:inline-block;padding:5px;border-radius:50%;background-color:'+data+'"></div>' }
	    if(col.list && col.list.includes('MULTISELECT')){
	        var valueSplit = data.split('|'); data = [];
	        for(var i=0; i<valueSplit.length; i++){
	            var v = valueSplit[i].split(';');
	            if(valEmpty(v[0])){ continue }
	            data.push(v[1]);
	        }
	        return data.join(', ')
	    }
    }
    if(['TEXTAREA','FILE'].includes(col.type)){
    	html += '<a class="link" onclick="';
    	html += 'clickRow_readBoxMini(\''+col.type+'\',$(this),\''+col.module+'\',\''+col.column+'\',\''+row[col.module+'_id']+'\')';
    	html += '">'+slovar('Show_more')+'</a>';
    	return html
    }
    return data;
}

function getData_readBoxMini_TABLE(box, module, col, row, callback){
	box.css('max-width','50vw');
	GET_module({
		module:module,
		done:function(m){
			APP.lastVisit = {
				module:module,
				column:col,
				row:row,
				label: box.find('.title').text()
			};
			box.find('.readBoxMiniBox').html(`
				<div class="tableBox" data-button="add" data-module="${module}" data-simplify="1" data-filter="${col}" data-filtervalue="${row}">
					<div class="horizontalTable" style="max-height:40vh"></div>
				</div>
			`);
			return loadJS('table/table', function(){ tableLoadColumns(box.find('.tableBox')) });
		}
    })
}

function getData_readBoxMini_CUSTOM(box, module, callback){
	box.find('.dragTop .title').html(module);
	if(box.find('.readBoxTools').length == 0){ box.append('<div class="readBoxTools"/>') }
	callback(box.find('.readBoxMiniBox'), box.find('.readBoxTools'));
}

function moveToCorner_readBoxMini(el){ el.closest('.readBoxMini').animate({left:0,top:0}) }
function clickRow_readBoxMini(type, el, module, col, id){
	moveToCorner_readBoxMini(el);
	if(type == 'TEXTAREA'){ return loadJS('form/cleditor', function(){ tableClickOnShowMoreButtonTextarea(module, col, id) }) }
	if(type == 'FILE'){ return tableClickOnShowMoreButtonFile(el, module, col, id) }
}
function clickJOIN_ADD_readBoxMini(el, module, id){
	clickIn_readBoxMini(el.closest('.readBoxMini'), 'row', module, id)
}
function clickJOIN_GET_readBoxMini(el, list, id){
	clickIn_readBoxMini(el.closest('.readBoxMini'), 'table', list, id)
}

function clickIn_readBoxMini(box, type, module, id, callback){
	if(module.includes(',')){ module = module.split(',') }
	add_readBoxMiniBackData(box, type, module, id, callback);
	getData_readBoxMini(box, grab_readBoxMiniBackData(box));
}
function clickBack_readBoxMini(el){
	var box = el.closest('.readBoxMini');
	if(grab_readBoxMiniBackData(box).length <= 1){ return }
	remove_readBoxMiniBackData(box);
	getData_readBoxMini(box, grab_readBoxMiniBackData(box));
}

function grab_readBoxMiniBackData(box){
	var back = box.data('back');
	if(valEmpty(back)){ return [] }
	return back;
}
function add_readBoxMiniBackData(box, type, module, id, callback){
	var back = grab_readBoxMiniBackData(box);
	back.push([type,module,id,callback]);
	box.data('back',back);
}
function remove_readBoxMiniBackData(box){
	var back = grab_readBoxMiniBackData(box);
	back.pop();
	box.data('back',back);
}

function edit_readBoxMini(el, module, id){
	close_readBoxMini(el.closest('.readBoxMini'));
	loadJS('main/edit-box',function(){ openEditBoxQuick(module, id) });
}

function readBoxMini_joinadds(placeholders, data, all_modules){
    placeholders.each(function(){
        var placeholder = $(this);
        var list = placeholder.attr('data-list').split(',');
        var module = list[1];
        if(all_modules.includes(module)){ module = module + (all_modules.length) }
        all_modules.push(module);
        var ref_module = module + '.' + list[1] + '_';
        var arr = [];
        for(const [key, col] of Object.entries(data)){
            if(key.includes(ref_module) && col != null){ arr.push(col) }
        }
        if(arr.length != 0){ placeholder.text(arr.join(', ')) }
        else{ placeholder.text(slovar('Search')) }
    });
}

function animation_readBoxMini(el, box){
	box.css({'top':'110%','left':'45%','transition':'0.2s'}).show();
	var top = el.offset().top - $(document).scrollTop();
	if(top + box.outerHeight() > $(window).height()){ top = $(window).height() - box.outerHeight() }
	var left = el.offset().left + 50;
	if(left + box.outerWidth() > $(window).width()){ left = $(window).width() - box.outerWidth() }
	box.css({'top':top,'left':left});
	setTimeout(function(){ box.css('transition','') },250);
	loadJS('API/draggable',function(){ dragable_readBoxMini(box) })
}

function dragable_readBoxMini(box){
	draggable({
		box:box,
		handle: '.dragTop',
		start: function(){ focus_readBoxMini(box) }
	})
}

function focus_readBoxMini(box){
	$('.readBoxMini').css('z-index','');
	box.css('z-index',999);
}
function close_readBoxMini(box){ box.remove() }