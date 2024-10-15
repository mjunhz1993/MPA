function getCurrentDate(timeZone = 'local'){
    var today = new Date();
    if(timeZone == 'local'){
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        var hh = String(today.getHours()).padStart(2, '0');
        var ii = String(today.getMinutes()).padStart(2, '0');
    }
    else{
        var dd = String(today.getUTCDate()).padStart(2, '0');
        var mm = String(today.getUTCMonth() + 1).padStart(2, '0');
        var yyyy = today.getUTCFullYear();
        var hh = String(today.getUTCHours()).padStart(2, '0');
        var ii = String(today.getUTCMinutes()).padStart(2, '0');
    }
    return yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + ii + ':00';
}

function getDate(format, time, timeZone = 'local'){
    if(time instanceof Date){ var d = time; }
    else{
        if(time.includes('-')){ var d = new Date(time); }
        else{ var d = new Date('01-01-2020 '+time); } // IF ONLY TIME - ADD RANDOM DATE
    }
    var date = [], year, month, day, hour, minute, second;
    
    if(timeZone == 'UTC'){
        year = d.getUTCFullYear();
        month = String(d.getUTCMonth() + 1).padStart(2, '0');
        day = String(d.getUTCDate()).padStart(2, '0');
        hour = String(d.getUTCHours()).padStart(2, '0');
        minute = String(d.getUTCMinutes()).padStart(2, '0');
        second = String(d.getUTCSeconds()).padStart(2, '0');
    }
    else{
        year = d.getFullYear();
        month = String(d.getMonth() + 1).padStart(2, '0');
        day = String(d.getDate()).padStart(2, '0');
        hour = String(d.getHours()).padStart(2, '0');
        minute = String(d.getMinutes()).padStart(2, '0');
        second = String(d.getSeconds()).padStart(2, '0');
    }

    if(format.includes('Y-m-d')){ date.push(year+'-'+month+'-'+day) }
    if(format.includes('d.m.Y')){ date.push(day+'.'+month+'.'+year) }
    if(format.includes('H:i:s')){ date.push(hour+':'+minute+':'+second) }
    else if(format.includes('H:i')){ date.push(hour+':'+minute) }
    
    return date.join(' ');
}

function stringToDate(str, timeZone = 'local'){
    if(['',null,undefined].includes(str)){ return }
    if(!str.includes(':')){ str = str+' 00:00:00' }
    else if(!str.includes('-')){ str = '2020-01-01 '+str }
    str = str.split(' ');
    var yyyy = str[0].split('-')[0];
    var mm = String(parseInt(str[0].split('-')[1]) - 1).padStart(2, '0');
    var dd = String(str[0].split('-')[2]).padStart(2, '0');
    var hh = String(str[1].split(':')[0]).padStart(2, '0');
    var ii = String(str[1].split(':')[1]).padStart(2, '0');
    var ss = String(str[1].split(':')[2]).padStart(2, '0');
    if(timeZone == 'local'){ return new Date(yyyy, mm, dd, hh, ii, ss) }
    else{ return new Date(Date.UTC(yyyy, mm, dd, hh, ii, ss)) }
}

function UTCtoInput(v){ return getDate('Y-m-d H:i:s', stringToDate(v, 'UTC')) }
function inputToUTC(v){ return getDate('Y-m-d H:i:s', stringToDate(v), 'UTC') }