jQuery.cachedScript = function(url, options){
    options = $.extend(options || {}, {dataType:"script", cache:usecaching, url:url});
    return jQuery.ajax( options );
};

function loadJS(js, callback, el = ''){
    var url = '/crm/static/js/' + js + '.js?v=' + APP_VERSION;
    if(js.substring(0,8) == 'https://'){ url = js }
    if(js.substring(0,7) == 'http://'){ url = js }
    if(!loadedJS.includes(url)){
        $.cachedScript(url).done(function(script, textStatus){
            loadedJS.push(url);
            if(typeof callback === 'function'){ callback(el) }
        }).fail(function(jqxhr, settings, exception){ console.log(exception + ' - ' + url) });
    }
    else{if(typeof callback === 'function'){ callback(el) }}
}

function loadCSS(css){
    var url = '/crm/static/css/' + css + '.css?v=' + APP_VERSION;
    if(css.substring(0,8) == 'https://'){ url = css }
    if(!loadedCSS.includes(url)){
        $('head').append('<link rel="stylesheet" type="text/css" href="' + url + '">');
        loadedCSS.push(url);
    }
}

function loadURL(url, callback, data = ''){
    var param = '';
    if(data != ''){ param = '?' + new URLSearchParams(data).toString() }
    window.history.replaceState(null, '', '/crm/templates/' + url + '.php' + param);
    if(typeof callback === 'function'){ callback(data); }
}

var loadedJS = loadedCSS = [];