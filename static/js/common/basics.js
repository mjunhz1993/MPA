function getMainBoxFreeHaight(){ return $(window).height() - $('#Main').height() - $('#TopNav').height() }
function smallDevice(){ return $(window).width() <= 800 }
function valEmpty(v){ return ['',null,undefined].includes(v) }
function colChild(v,i){ return `${v}:nth-child(${i})` }

function Price(p, raw = false) {
    let e = Intl.NumberFormat('de-DE', { style: 'currency', currency: defaultCurrency, currencyDisplay: 'code' });
    return raw ? e.format(p) : `<span style="color:${p < 0 ? 'red' : 'green'}">${e.format(p)}</span>`;
}

function Percent(p, raw = false) {
    return raw ? `${p} %` : `<span style="color:${p < 0 ? 'red' : 'green'}">${p} %</span>`;
}

const APP = {
    customDir: `${window.location.origin}/crm/php/downloads`,
    uploadDir: `${window.location.origin}/crm/static/uploads`,
};