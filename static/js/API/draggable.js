function draggable(d){
	var handle = d.box.find(d.handle);
	if(smallDevice()){
		d.box.css('touch-action','none');
		handle.on('touchstart',function(e){ draggable_start(d,e.originalEvent.touches[0].clientX,e.originalEvent.touches[0].clientY) });
		handle.on('touchmove',function(e){ draggable_move(d,e.originalEvent.touches[0].clientX,e.originalEvent.touches[0].clientY) });
		handle.on('touchend',function(){ draggable_end(d) });
	}
	else{
		handle.css('user-select','none');
		handle.on('mousedown',function(e){ draggable_start(d,e.clientX,e.clientY) });
		d.box.on('mousemove',function(e){ draggable_move(d,e.clientX,e.clientY) });
		d.box.on('mouseleave', function(e){ draggable_leave(d,e.clientX,e.clientY) });
	}
}
function draggable_start(d, x, y){
	d.box.data('dragstart', [x,y]);
	d.box.find(d.handle).addClass('grabbing');
	if(d.start){ d.start(d) }
	$(document).one('mouseup',function(e){ draggable_end(d) });
}
function draggable_move(d, x, y){
	if(valEmpty(d.box.data('dragstart'))){ return }
	start = d.box.data('dragstart');
	start = [start[0] -x, start[1] - y];
	d.box.data('dragstart', [x,y]);
	var left = d.box.position().left - start[0];
	if(left < 0){ left = 0 }
	if(left + d.box.outerWidth() > $(window).width()){ left = $(window).width() - d.box.outerWidth() }
	var top = d.box.position().top - start[1];
	if(top < 0){ top = 0 }
	if(top + d.box.outerHeight() > $(window).height()){ top = $(window).height() - d.box.outerHeight() }
	d.box.css({'left':left,'top':top});
	if(d.move){ d.move(d, x, y) }
}
function draggable_leave(d, x, y){
	if(valEmpty(d.box.data('dragstart'))){ return }
	var left = x - d.box.outerWidth() / 2;
	if(left < 0){ left = 0 }
	if(left + d.box.outerWidth() > $(window).width()){ left = $(window).width() - d.box.outerWidth() }
	var top = y - d.box.outerHeight() / 2;
	if(top < 0){ top = 0 }
	if(top + d.box.outerHeight() > $(window).height()){ top = $(window).height() - d.box.outerHeight() }
	d.box.css({'left':left,'top':top});
}
function draggable_end(d){
	d.box.find(d.handle).removeClass('grabbing');
	d.box.removeData('dragstart');
	if(d.end){ d.end(d) }
}