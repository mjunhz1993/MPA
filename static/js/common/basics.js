function getMainBoxFreeHaight(){ return $(window).height() - $('#Main').height() - $('#TopNav').height() }
function smallDevice(){ return $(window).width() <= 800 }
function valEmpty(v){ return ['',null,undefined].includes(v) }

function Price(p, raw = false) {
    let e = Intl.NumberFormat('de-DE', { style: 'currency', currency: defaultCurrency, currencyDisplay: 'code' });
    return raw ? e.format(p) : `<span style="color:${p < 0 ? 'red' : 'green'}">${e.format(p)}</span>`;
}

function Percent(p, raw = false) {
    return raw ? `${p} %` : `<span style="color:${p < 0 ? 'red' : 'green'}">${p} %</span>`;
}
