function getCurrentDate(timeZone = 'local'){
    const today = new Date();
    const isLocal = timeZone === 'local';

    const pad = (num) => String(num).padStart(2, '0');
    
    const dd = pad(isLocal ? today.getDate() : today.getUTCDate());
    const mm = pad(isLocal ? today.getMonth() + 1 : today.getUTCMonth() + 1);
    const yyyy = isLocal ? today.getFullYear() : today.getUTCFullYear();
    const hh = pad(isLocal ? today.getHours() : today.getUTCHours());
    const ii = pad(isLocal ? today.getMinutes() : today.getUTCMinutes());

    return `${yyyy}-${mm}-${dd} ${hh}:${ii}:00`;
}

function getDate(format, time, timeZone = 'local'){
    let d;
    
    if(time instanceof Date){ d = time }
    else{ d = time.includes('-') ? new Date(time) : new Date(`2020-01-01T${time}`) }

    if(isNaN(d)) return 'Invalid Date';

    const getFormattedDate = (dateObj, useUTC = false) => {
        const pad = (num) => String(num).padStart(2, '0');
        return {
            year: useUTC ? dateObj.getUTCFullYear() : dateObj.getFullYear(),
            month: pad(useUTC ? dateObj.getUTCMonth() + 1 : dateObj.getMonth() + 1),
            day: pad(useUTC ? dateObj.getUTCDate() : dateObj.getDate()),
            hour: pad(useUTC ? dateObj.getUTCHours() : dateObj.getHours()),
            minute: pad(useUTC ? dateObj.getUTCMinutes() : dateObj.getMinutes()),
            second: pad(useUTC ? dateObj.getUTCSeconds() : dateObj.getSeconds()),
        };
    };

    const { year, month, day, hour, minute, second } = getFormattedDate(d, timeZone === 'UTC');
    
    let dateParts = [];
    if (format.includes('Y-m-d')) dateParts.push(`${year}-${month}-${day}`);
    if (format.includes('d.m.Y')) dateParts.push(`${day}.${month}.${year}`);
    if (format.includes('H:i:s')) dateParts.push(`${hour}:${minute}:${second}`);
    else if (format.includes('H:i')) dateParts.push(`${hour}:${minute}`);

    return dateParts.join(' ');
}


function stringToDate(str, timeZone = 'local'){
    if (!str) return;

    if (!str.includes(':')) str += ' 00:00:00';  
    if (!str.includes('-')) str = '2020-01-01 ' + str;  

    const [datePart, timePart] = str.split(' ');
    const [yyyy, mm = 1, dd = 1] = datePart.split('-').map(Number);
    const [hh = 0, ii = 0, ss = 0] = timePart.split(':').map(Number);

    return timeZone === 'local' 
        ? new Date(yyyy, mm - 1, dd, hh, ii, ss) 
        : new Date(Date.UTC(yyyy, mm - 1, dd, hh, ii, ss));
}

function isDate(v) {
  const d = new Date(v);
  return !isNaN(d.getTime()) && v.includes('-');
}
function displayLocalDate(v){ return getDate(defaultDateFormat+' '+defaultTimeFormat, stringToDate(v, 'UTC')) }
function UTCtoInput(v){ return getDate('Y-m-d H:i:s', stringToDate(v, 'UTC')) }
function inputToUTC(v){ return getDate('Y-m-d H:i:s', stringToDate(v), 'UTC') }