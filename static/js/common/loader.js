$.cachedScript = (url, options = {}) =>
    $.ajax({ ...options, dataType: "script", cache: usecaching, url });

const loadedJS = loadedCSS = new Set();

function loadJS(js, callback, el = '') {
    let url = `/crm/static/js/${js}.js?v=${APP_VERSION}`;
    if(js.startsWith('https://') || js.startsWith('http://')){ url = `${js}?v=${APP_VERSION}` }

    if(!loadedJS.has(url)){
        $.cachedScript(url).done(function(script, textStatus){
            loadedJS.add(url);
            if(typeof callback === 'function'){ callback(el) }
        }).fail(function(jqxhr, settings, exception){ console.error(exception + ' - ' + url) });
    }
    else if(typeof callback === 'function'){ callback(el) }
}

function loadCSS(css) {
    let url = `/crm/static/css/${css}.css?v=${APP_VERSION}`;
    if(css.startsWith('https://') || css.startsWith('http://')){ url = `${css}?v=${APP_VERSION}` }

    if(!loadedCSS.has(url)){
        $('head').append(`<link rel="stylesheet" type="text/css" href="${url}">`);
        loadedCSS.add(url);
    }
}

function loadURL(url, callback, data = ''){
    var param = '';
    if(data != ''){ param = '?' + new URLSearchParams(data).toString() }
    window.history.replaceState(null, '', '/crm/templates/' + url + '.php' + param);
    if(typeof callback === 'function'){ callback(data); }
}