function signature(d = []){
	loadCSS('signature');

	d.box = createPOPUPbox();
	d.box
	.attr('id', 'signature')
	.find('.popupBox').html(signature_HTML(d));

	d.box.find('.buttonBlack').click(function(){ signature_reset(d) })
	d.box.find('.buttonBlue').click(function(){ doneSignature(d) })

	d.box.fadeIn('fast', function(){ signature_activate(d) })
}

function signature_HTML(d){
	return `
		<div>
			${d.title ? `<h2>${d.title}</h2>` : ''}
			<canvas id="signatureCanvas"></canvas>
		</div>
		<button class="button buttonBlack">${slovar('Reset')}</button>
		<div class="bottom">
			<button class="button buttonBlue">${slovar('Save_changes')}</button>
			<button class="button buttonGrey" onclick="removePOPUPbox()">${slovar('Cancel')}</button>
		</div>
	`
}

function signature_activate(d){
	loadJS('API/Sketchpad', function(){
		var sketchpad = new Sketchpad({
			element: '#signatureCanvas',
			width: 300,
			height: 150,
			penSize: 2
		});
	});
}

function signature_reset(d){
	d.box.find('canvas').replaceWith('<canvas id="signatureCanvas"></canvas>');
	signature_activate(d);
}

// SAVE

function doneSignature(d){
	d.box.find('.buttonBlue').remove();
	var canvas = d.box.find('#signatureCanvas')[0];
	d.base64 = canvas.toDataURL('image/png');
	d.save(d);
}

function saveSignature(d){
	$.ajax({
	    url: '/crm/php/file/signature',
	    type: 'POST',
	    data: {
	    	dir: d.dir,
	    	image: d.base64
	    },
	    success: function(r){
	    	delete d.base64;
	        d.image = JSON.parse(r);
	        removePOPUPbox();
	        if(typeof d.after === 'function'){ return d.after(d) }
	    }
	});
}