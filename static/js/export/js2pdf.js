function open_Html2pdf(d){loadJS('export/slovar/'+slovar(), function(){
	if(valEmpty(d.title)){ d.title = 'CRM_pdf' }
	end_html2pdf();
	hideDropdownMenu();
	loadCSS('pdf');
	HTML_html2pdf(d);
	$('#html2pdfBox .buttonConvert').click(function(){ convert_Html2pdf($(this), d) });
	$('#html2pdfBoxR .buttonUpdate').click(function(){
		$('#presetsizes').val('');
		update_PdfSize()
	});
	$('#presetsizes').change(function(){ select_PdfSize($(this)) });
	$('#html2pdfBoxR .buttonSwitch').click(function(){ update_PdfSize($('#html2pdfBoxH').val(),$('#html2pdfBoxW').val()) });
	if(typeof d.open === 'function'){ d.open() }
})}

function HTML_html2pdf(d, html = ''){
	html = '<div id="html2pdfBox"><div id="html2pdfBoxL"></div><div id="html2pdfBoxR"></div><div id="html2pdfBoxRmini"></div></div>';
	$('#Main').append(html);
	html = '<div id="html2pdfBoxLogo"></div>';
	html += '<div>';
	html += '<button class="buttonSquare button100 buttonGreen buttonConvert">'+slovar('Export')+' (PDF)</button>';
	html += '<button class="buttonSquare button100 buttonRed">'+slovar('Close')+'</button><hr>';
	html += '<div ';
	if(valEmpty(d.customSize)){ html += 'style="display:none"' }
	html += '><h3>'+getSVG('move')+slovar('Size')+'</h3>';
	html += '<select id="presetsizes">';
	html += '<option value="">'+slovar('Custom')+'</option>';
	html += '<option value="595.28,841.89">A4</option>';
	html += '</select>';
	html += '<div class="html2pdfFlex customSizeInputs">';
	html += '<p>W:</p><input type="number" step="0.01" min="1" id="html2pdfBoxW">';
	html += '<p>H:</p><input type="number" step="0.01" min="1" id="html2pdfBoxH">';
	html += '</div>';
	html += '<div class="html2pdfFlex">';
	html += '<button class="buttonSquare button100 buttonBlue buttonUpdate">'+slovar('Refresh')+'</button>';
	html += '<button class="buttonSquare button100 buttonBlue buttonSwitch">'+slovar('Turn_90')+'</button>';
	html += '</div></div>';
	html += '<hr><button class="buttonSquare button100 buttonBlue" onclick="select_signaturePosition()">'+slovar('Sign_document')+'</button>';
	html += '</div>';
	$('#html2pdfBoxR').append(html);
	html = '<div><button class="buttonSquare buttonGreen buttonConvert">'+getSVG('download')+'</button><br>';
	html += '<button class="buttonSquare buttonRed">'+getSVG('x')+'</button><hr>';
	html += '<button class="buttonSquare buttonBlue" onclick="select_signaturePosition()">'+getSVG('edit')+'</button></div>';
	$('#html2pdfBoxRmini').append(html);
	$('#html2pdfBox .buttonRed').click(function(){ end_html2pdf(d) });
}

// ADD CONTENT

function create_PdfPaper(w = 595.28, h = 841.89, html = '', header = '', footer = ''){
	var paper = $('.html2pdfPaper');
	if(paper.length == 0){
		$('#html2pdfBoxW').val(w);
		$('#html2pdfBoxH').val(h);
	}
	w = 'width:'+w+'pt';
	h = 'height:'+h+'pt';
	if(paper.length != 0){
		var orgPaper = paper.first();
		w = orgPaper.attr('style');
		h = orgPaper.parent().attr('style');
		if(orgPaper.find('.html2pdfHeader').length != 0){ header = orgPaper.find('.html2pdfHeader') }
		if(orgPaper.find('.html2pdfFooter').length != 0){ footer = orgPaper.find('.html2pdfFooter') }
	}
	html += '<div class="html2pdfPaperCSS" style="' + h + '">';
	html += '<div id="html2pdf' + paper.length + '" class="html2pdfPaper" style="' + w + '"></div></div>';
	$('#html2pdfBoxL').append(html);
	var newPaper = $('.html2pdfPaper').last();
	if(!valEmpty(header)){ header.clone().prependTo(newPaper) }
	if(!valEmpty(footer)){ footer.clone().appendTo(newPaper) }
	return newPaper
}

function add_HeaderToPdfPaper(content){
	var paper = $('.html2pdfPaper');
	if(paper.length == 0){ paper = create_PdfPaper() }
	if(paper.find('.html2pdfHeader').length == 0){ paper.prepend('<div class="html2pdfHeader"></div>') }
	paper.find('.html2pdfHeader').html(content);
}
function add_FooterToPdfPaper(content){
	var paper = $('.html2pdfPaper');
	if(paper.length == 0){ paper = create_PdfPaper() }
	if(paper.find('.html2pdfFooter').length == 0){ paper.append('<div class="html2pdfFooter"></div>') }
	paper.find('.html2pdfFooter').html(content);
}

function add_ContentToPdfPaper(content){
	var paper = $('.html2pdfPaper').last();
	if(paper.length == 0){ paper = create_PdfPaper() }
	var thisClass = 'htmlElementForPdf';
	content.addClass(thisClass);
	content.each(function(){
		contentClone = $(this).clone();
		paper.append(contentClone);
	});
	paper.find('[onclick]').removeAttr("onclick");
	paper.find('[href]').removeAttr("href");
	paper.find('[type=checkbox]').each(function(){
		var label = $(this).next('label');
		if($(this).prop('checked')){ return label.replaceWith(label.text()) }
		label.remove();
	});
	content.removeClass(thisClass);
	if(paper.find('.' + thisClass).length == 0){ return html2pdf_ERROR('html element height to big') }
}

function fit_PdfContent(){loadJS('export/js2pdf/fit', function(){fit_ContentIntoPdfPaper()})}

// SIGNATURE

function select_signaturePosition(){
	unbind_signatureEvents();
	if($('#html2pdfBoxL').find('#signatureArea').length != 0){ return $('#signatureArea,#signatureInstructions').remove() }
	$('#html2pdfBoxL').append('<div id="signatureInstructions">' + slovar('Signature_instructions') + '</div>');
	$('#html2pdfBoxL').find('.html2pdfPaper').first().append('<canvas id="signatureArea"></canvas>');

	$('#signatureInstructions').css('left', ($('#html2pdfBoxL').width() / 2) - ($('#signatureInstructions').width() / 2));

	$('.html2pdfPaperCSS').mousemove(function(m){
		var paper = $(this);
		var signatureArea = $('#html2pdfBoxL').find('#signatureArea');
		if(paper.find('#signatureArea').length == 0){ signatureArea.appendTo(paper.find('.html2pdfPaper')) }
		signatureArea.css({
			'top':m.pageY - this.offsetTop - (signatureArea.height() / 2) + $('#html2pdfBoxL').scrollTop(),
			'left':m.pageX - this.offsetLeft - (signatureArea.width() / 2) + $('#html2pdfBoxL').scrollLeft()
		})
	});

	$('.html2pdfPaperCSS').click(function(m){
		var signatureArea = $('#html2pdfBoxL').find('#signatureArea');
		var x = m.pageX - this.offsetLeft - (signatureArea.width() / 2) + $('#html2pdfBoxL').scrollLeft();
		var y = m.pageY - this.offsetTop - (signatureArea.height() / 2) + $('#html2pdfBoxL').scrollTop();
		stick_signature(x, y)
	})
}

function stick_signature(x,y){
	unbind_signatureEvents();
	$('#signatureInstructions').remove();
	var signatureArea = $('#signatureArea');
	signatureArea.css({'top':y,'left':x})
	loadJS('export/signature', function(){
		if(smallDevice()){ return popup_signatureInput() }
		var sketchpad = new Sketchpad({
			element: '#signatureArea',
			width: 300,
			height: 150,
			penSize: 2
		});
	});
}

function popup_signatureInput(){
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	popupBox.html('<canvas id="signatureAreaTemp"></canvas><button class="button buttonGreen">' + slovar('Confirm') + '</button>');
	popup.fadeIn('fast');
	var sketchpadTemp = new Sketchpad({
		element: '#signatureAreaTemp',
		width: 300,
		height: 150,
		penSize: 2
	});
	popup.find('button').click(function(){
		var settings = sketchpadTemp.toObject();
		settings.element = '#signatureArea';
		settings.readOnly = true;
		var sketchpad = new Sketchpad(settings);
		removePOPUPbox();
	});
}

function unbind_signatureEvents(){ $('.html2pdfPaperCSS').unbind('click').unbind('mousemove') }

// PAPER SIZE

function select_PdfSize(select = $('#presetsizes')){
	var v = select.val();
	var thisEl = $('#html2pdfBoxR').find('.customSizeInputs, .buttonUpdate');
	if(v == ''){ return thisEl.show() }
	thisEl.hide();
	v = v.split(',');
	update_PdfSize(v[0],v[1]);
}

function update_PdfSize(w = $('#html2pdfBoxW').val(), h = $('#html2pdfBoxH').val()){
	$('#html2pdfBoxW').val(w);
	$('#html2pdfBoxH').val(h);
	var box = $('#html2pdfBox');
	box.find('.html2pdfPaperCSS').css('height',h+'pt');
	box.find('.html2pdfPaper').css('width',w+'pt');
}

function add_PdfSize(w, h, title, select = $('#presetsizes')){
	select.append('<option value="'+w+','+h+'">' + title + '</option>');
	select.val(w+','+h);
	select_PdfSize(select);
}

// EXPORT

function convert_Html2pdf(button, d){
	if(typeof d.beforeConvert === 'function'){d.beforeConvert(function(){ run_convert_Html2pdf(button, d) })}
	else{ run_convert_Html2pdf(button, d) }
}

function run_convert_Html2pdf(button, data){
	var rightBox = button.parent();
	rightBox.hide();
	rightBox.after(HTML_loader()+'<div id="html2pdfInfo"></div>');
	var info = $('#html2pdfInfo');
	var box = $('#html2pdfBox');
	checkPapersBeforeConverting(box.find('.html2pdfPaper'));
	loadJS('export/html2canvas', function(){ startConvertingPapers(box, rightBox, info, data) });
}

function checkPapersBeforeConverting(paper){
	paper.find('#signatureArea').css('border','0');
	paper.each(function(){if($(this).html() == ''){ $(this).remove() }})
}

function startConvertingPapers(box, rightBox, info, data){loadJS('export/canvas2pdf', function(){
	var paper = box.find('.html2pdfPaper');
	var w = box.find('#html2pdfBoxW').val();
	var h = box.find('#html2pdfBoxH').val();
	var O = 'P';
	if(w > h){ O = 'L' }else if(w == h){ O = 'S' }
	convertPaperToPdf(new jsPDF(O,'pt',[w,h]), data, rightBox, box, w, h, info);
})}

function convertPaperToPdf(pdf, data, rightBox, box, w, h, info, addPage = false){
	var papers = box.find('.html2pdfPaper');
	var paper = papers.not('.converted').first();
	paper.addClass('converted');
	if(paper.length == 0){ doneConvertingPapers(pdf, data, rightBox, box, info) }
	info.text('['+box.find('.converted').length+'/'+papers.length+'] '+slovar('Papers'));
	html2canvas(paper[0], {scale:3}).then(function(canvas){
		var imgData = canvas.toDataURL("image/jpeg");
		if(addPage){ pdf.addPage() }
		pdf.addImage(imgData, 'JPG', 0, 0, w, h);
		setTimeout(function(){ convertPaperToPdf(pdf, data, rightBox, box, w, h, info, true) }, 1000);
	});
}

function doneConvertingPapers(pdf, data, rightBox, box, info){
	info.remove();
	box.find('.converted').removeClass('converted');
	if(typeof data.done === 'function'){ return data.done(pdf.output('blob'), data.title) }
	pdf.save(data.title+".pdf");
	rightBox.show();
	remove_HTML_loader(rightBox.parent());
	$('#signatureArea').css('border','');
}

function saveConvertedPapers(pdf, title, callback){
	var formData = new FormData();
	formData.append('pdf', pdf);
	formData.append('title', title);
	formData.append('csrf_token', $('[name=csrf_token]').val());
	$.ajax('/crm/php/export/jspdf.php?jspdf=1',{
		method: 'POST',
		data: formData,
		processData: false,
		contentType: false,
		success: function(data){if(typeof callback === 'function'){ return callback(JSON.parse(data)) }},
		error: function(data){console.log(data)}
	})
}

// OTHER

function end_html2pdf(d = []){
	if(typeof d.beforeCancel === 'function'){ d.beforeCancel() }
	$('#html2pdfBox').remove();
	hideTooltip();
}
function html2pdf_ERROR(msg){ console.log(msg) }