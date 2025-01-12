function fit_ContentIntoPdfPaper(){$('.html2pdfPaper').each(function(){
	var paper = $(this);
	if(if_PaperHeightFits(paper)){ return }
	var newPaper = select_nextPdfPaper(paper);
	if(!newPaper){ newPaper = create_PdfPaper() }
	if(!move_ContentToNewPaper(paper, newPaper)){ return }
	return fit_ContentIntoPdfPaper()
})}

function move_ContentToNewPaper(paper, newPaper){
	var child = select_PdfPaperChildren(paper).last();
	if(child.length == 0){ return false }

	if(child.is('table')){if(!if_ContentIsTable(paper, newPaper, child)){ return false }}
	else if(!if_ContentIsElement(paper, newPaper, child)){ return false }

	if(!if_PaperHeightFits(newPaper) && select_PdfPaperChildren(newPaper).length == 1){
		if(select_PdfPaperChildren(newPaper).last().is('table')){ return fit_ContentIntoPdfPaper() }
		return false
	}
	if(!if_PaperHeightFits(paper)){ return move_ContentToNewPaper(paper, newPaper) }
	return true
}

function if_ContentIsTable(paper, newPaper, child){
	if(child.outerHeight(true) - child.find('tbody').outerHeight(true) >= get_PdfPaperSpace(newPaper)){ return false }
	prependTableToPdfPaper(paper, newPaper, child);
	return true
}
function if_ContentIsElement(paper, newPaper, child){
	if(child.outerHeight(true) >= get_PdfPaperSpace(newPaper)){ return false }
	prependElementToPdfPaper(newPaper, child)
	return true
}

function prependElementToPdfPaper(paper, el){
	el.prependTo(paper);
	paper.find('.html2pdfHeader').prependTo(paper);
}
function prependTableToPdfPaper(paper, newPaper, table, createTable = true){
	if(createTable){
		var tableClone = table.clone();
		prependElementToPdfPaper(newPaper, tableClone);
	}
	var newTable = newPaper.find('table').not('.html2pdfHeader table').first().find('tbody');
	if(createTable){ newTable.empty() }
	if(table.find('tbody').find('tr').length == 0){ table.remove(); return }
	table.find('tbody').find('tr').last().prependTo(newTable);
	if(if_PaperHeightFits(paper)){ return }
	return prependTableToPdfPaper(paper, newPaper, table, false)
}

function select_nextPdfPaper(paper){
	var nextPaper = paper.parent().next().find('.html2pdfPaper');
	if(nextPaper.length == 0){ return false }
	return nextPaper
}

function select_PdfPaperChildren(paper){ return paper.children().not('.html2pdfHeader,.html2pdfFooter') }

function get_PdfPaperSpace(paper){
	return paper.outerHeight() - (paper.find('.html2pdfHeader').outerHeight(true) + paper.find('.html2pdfFooter').outerHeight(true))
}

function if_PaperHeightFits(paper, h = 0){
	paper.children().each(function(){h += $(this).outerHeight(true)});
	if(h > paper.outerHeight()){ return false }
	return true
}