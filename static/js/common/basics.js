function getMainBoxFreeHaight(){ return $(window).height() - $('#Main').height() - $('#TopNav').height() }
function smallDevice(){if($(window).width() <= 800){return true}return false}
function valEmpty(v){if(['',null,undefined].includes(v)){return true}return false}

function Price(p, raw = false, html = ''){
    let e = Intl.NumberFormat('de-DE', {style:'currency', currency:defaultCurrency, currencyDisplay:'code'});
    if(raw){ return e.format(p) }
    html += '<span style="color:';
	if(p < 0){ html += 'red' }else{ html += 'green' }
	html += '">'+e.format(p)+'</span>';
    return html;
}
function Percent(p, raw = false, html = ''){
	if(raw){ return p+' %' }
    html += '<span style="color:';
	if(p < 0){ html += 'red' }else{ html += 'green' }
	html += '">'+p+' %</span>';
    return html;
}