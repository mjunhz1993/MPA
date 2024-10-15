function displayWeek(beforeRows = 0){
    var html = '';
    html += '<tr>';
    for(var i=0; i<beforeRows; i++){ html += '<th></th>'; }
    html += '<th>' + getNameOfDay(1) + '</th>';
    html += '<th>' + getNameOfDay(2) + '</th>';
    html += '<th>' + getNameOfDay(3) + '</th>';
    html += '<th>' + getNameOfDay(4) + '</th>';
    html += '<th>' + getNameOfDay(5) + '</th>';
    html += '<th>' + getNameOfDay(6) + '</th>';
    html += '<th>' + getNameOfDay(7) + '</th>';
    html += '</tr>';
    return html;
}

function displayDaysInMonth(year, month, extra = []){
    month = month - 1;
    var numberOfDays = getNumberOfDaysInMonth(year, month);
    var start = getDayOfWeek(year, month, 1);
    var count = 1;
    var currentMonthDays = 1;
    var nextMonthDays = 1;
    var html = '';
    for(var i=1; i<=6; i++){
        html += '<tr>';
        for(var j=1; j<=7; j++){
            // DAYS OF BEFORE MONTH
            if(start > count){
                var thisYear = year;
                var thisMonth = month;
                if(thisMonth == 0){thisMonth = 12; thisYear--;}
                var thisDay = getNumberOfDaysInMonth(year, month - 1) - (start - 1 - count);
                html += '<td class="notActiveDay" data-date="' + thisYear + '-' + String(thisMonth).padStart(2, '0') + '-' + String(thisDay).padStart(2, '0') + '" ';
                if(extra.includes('mouseOverDayInMonth')){ html += 'onmouseover="mouseOverDayInMonth($(this))"'; }
                html += '>' + thisDay + '</td>';
            }
            // DAYS OF CURRENT MONTH
            if(start <= count && numberOfDays + start > count){
                html += '<td data-date="' + year + '-' + String((month + 1)).padStart(2, '0') + '-' + String(currentMonthDays).padStart(2, '0') + '" ';
                if(extra.includes('mouseOverDayInMonth')){ html += 'onmouseover="mouseOverDayInMonth($(this))"'; }
                html += '>' + currentMonthDays + '</td>';
                currentMonthDays++;
            }
            // DAYS OF NEXT MONTH
            if(numberOfDays + start <= count){
                var thisYear = year;
                var thisMonth = month + 2;
                if(thisMonth == 13){thisMonth = 1; thisYear++;}
                html += '<td class="notActiveDay" data-date="' + thisYear + '-' + String(thisMonth).padStart(2, '0') + '-' + String(nextMonthDays).padStart(2, '0') + '" ';
                if(extra.includes('mouseOverDayInMonth')){ html += 'onmouseover="mouseOverDayInMonth($(this))"'; }
                html += '>' + nextMonthDays + '</td>';
                nextMonthDays++;
            }
            count++;
        }
        html += '</tr>';
    }
    return html;
}

function getWeekOfMonth(year, month, day){
    var d = new Date(year, month, day);
    return Math.ceil((d.getDate() + getDayOfWeek(year, month, 1) - 1) / 7);
}

function getDayOfWeek(year, month, day){
    var d = new Date(year, month, day).getDay();
    if(d == 0){ d = 7; } // IF NEDELJA
    return d;
}

function getDayOfMonth(year, month, day){
    return new Date(year, month, day).getDate();
}

function getNumberOfDaysInMonth(year, month){
    return new Date(year, month + 1, 0).getDate();
}

function getNameOfMonth(month){
    var name = '';
    if(month == 1){ name = slovar('January'); }
    else if(month == 2){ name = slovar('February'); }
    else if(month == 3){ name = slovar('March'); }
    else if(month == 4){ name = slovar('April'); }
    else if(month == 5){ name = slovar('May'); }
    else if(month == 6){ name = slovar('June'); }
    else if(month == 7){ name = slovar('July'); }
    else if(month == 8){ name = slovar('August'); }
    else if(month == 9){ name = slovar('September'); }
    else if(month == 10){ name = slovar('October'); }
    else if(month == 11){ name = slovar('November'); }
    else if(month == 12){ name = slovar('December'); }
    return name;
}

function getNameOfDay(day){
    var name = '';
    if(day == 1){ name = slovar('Monday'); }
    else if(day == 2){ name = slovar('Tuesday'); }
    else if(day == 3){ name = slovar('Wednesday'); }
    else if(day == 4){ name = slovar('Thursday'); }
    else if(day == 5){ name = slovar('Friday'); }
    else if(day == 6){ name = slovar('Saturday'); }
    else if(day == 7){ name = slovar('Sunday'); }
    return name;
}

function changeYear(el, num, callback){
    var box = el.parent();
    box.find('.calendarYear').text(parseInt(box.find('.calendarYear').text()) + num);
    if(typeof callback === 'function'){ callback(); }
}