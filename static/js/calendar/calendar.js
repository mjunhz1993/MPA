function setupCalendar(box, d = {}){
    box.empty().addClass('calendarBox');
    loadCSS('calendar');
    loadJS('calendar/slovar/' + slovar(), function(){
    loadJS('calendar/extras', function(){
    loadJS('GET/calendar', function(){
    loadJS('form/form', function(){
    loadJS('GET/module', function(){ loadInCalendarData(box, d) })
    })})})})
}

function loadInCalendarData(box, obj){
    var today = new Date();
    box.append('<div class="calendarBoxMenu"></div><div class="box col100 calendarBoxMain"></div>');
    var boxMenu = box.find('.calendarBoxMenu');
    var boxMain = box.find('.calendarBoxMain');
    var html = '';

    GET_module({
        module:'calendar',
        done: function(data){
            boxMain.attr({
                'data-view':data.can_view,
                'data-edit':data.can_edit,
                'data-delete':data.can_delete,
                'data-mode':'MONTH',
                'data-year':today.getFullYear(),
                'data-month':today.getMonth() + 1,
                'data-day':today.getDate(),
                'data-module':obj.module,
                'data-start':obj.start,
                'data-end':obj.end,
                'data-color':obj.color,
                'data-assigned':obj.assigned,
                'data-share':obj.share,
            });
            // CREATE MENU
            if(valEmpty(box.attr('data-viewaccess'))){
                loadJS('GET/user', function(){
                    GET_myself({
                        done:function(d){
                            box.attr('data-viewaccess', d.role_event_view_access);
                            box.attr('data-filteraccess', d.role_module_filter_access);
                            html = createCalendarTopMenuHTML(boxMain, today, box.attr('data-viewaccess'), obj);
                            boxMenu.html(html);
                            createCalendar(box);
                        }
                    })
                })
            }
            else{
                html = createCalendarTopMenuHTML(boxMain, today, box.attr('data-viewaccess'), obj);
                boxMenu.html(html);
                createCalendar(box);
            }
        }
    })
}

function createCalendarTopMenuHTML(boxMain, today, role_event_view_access, obj){
    var html = '<div class="calendarBoxMenuInner">';
    html += '<div class="calendarBoxMenuTab">';
    if(obj.noAddButton != true){
        html += '<b class="addEvent" ';
        html += 'onclick="loadJS(\'main/add-box\', function(){ openAddBoxQuick(\''+boxMain.attr('data-module')+'\'); })">';
        html += getSVG('plus_circle') + '<span>' + slovar('Add_new') + '</span></b>';
    }
    html += '</div>';
    html += '<div class="calendarBoxMenuTab">';
    html += '<b onclick="CEchangeYear($(this), -1)">' + slovar('Year') + ' -</b>';
    html += '<span class="calendarYear">' + boxMain.attr('data-year') + '</span>';
    html += '<b onclick="CEchangeYear($(this), 1)">' + slovar('Year') + ' +</b>';
    html += '</div>';
    html += '<div class="calendarBoxMenuTab changeModeBox">';
    html += '<b data-mode="YEAR" onclick="changeMode($(this))">' + slovar('Year') +'</b>';
    html += '<b data-mode="MONTH" onclick="changeMode($(this))" class="act">' + slovar('Month') +'</b>';
    html += '<b data-mode="WEEK" onclick="changeMode($(this))">' + slovar('Week') +'</b>';
    html += '<b data-mode="DAY" onclick="changeMode($(this))">' + slovar('Day') +'</b>';
    html += '</div>';
    html += '<div class="calendarBoxMenuTab todayCalendar">';
    html += '<b data-year="' + today.getFullYear() + '" data-month="' + (today.getMonth() + 1) + '" ';
    html += 'data-day="' + today.getDate() + '" data-h="' + today.getHours() + '" onclick="resetToToday($(this))">' + getSVG('calendar');
    html += ' <span class="hideOnMobile">' + slovar('Show_today') + '</span></b>';
    html += '</div>';
    if(role_event_view_access == 1){
        html += '<div class="calendarBoxMenuTab">';
        html += '<b onclick="loadJS(\'calendar/filter\', function(el){ loadAddFilter(el); }, $(this))">';
        html += getSVG('filter') + ' <span class="hideOnMobile">' + slovar('Filter') + '</span></b>';
        html += '</div>';
    }
    html += '</div>';
    return html;
}

function createCalendar(box){
    var boxMain = box.find('.calendarBoxMain');
    boxMain.hide();
    boxMain.parent().find('.calendarHoverTool').hide();
    var mode = boxMain.attr('data-mode');
    var year = boxMain.attr('data-year');
    var month = boxMain.attr('data-month');
    var day = boxMain.attr('data-day');
    var html = '';
    // CREATE HTML FOR CALENDAR
    if(mode == 'YEAR'){
        html += '<div class="calendarBoxMainMonths">';
        for(var i=1; i<=12; i++){
            html += '<div class="calendarBoxMainMonth" data-month="' + i + '">';
            html += '<div class="monthName" onclick="goToMonth($(this), ' + i + ')">' + getNameOfMonth(i) + '</div>';
            html += '<table>';
            html += '<thead>' + displayWeek() + '</thead><tbody>' + displayDaysInMonth(year, i) + '</tbody>';
            html += '</table></div>';
        }
        html += '</div>';
    }
    else if(mode == 'MONTH'){
        html += '<div class="monthPicker">';
        html += '<div onclick="changeMonth($(this), 1)">' + getNameOfMonth(1) + '</div>';
        html += '<div onclick="changeMonth($(this), 2)">' + getNameOfMonth(2) + '</div>';
        html += '<div onclick="changeMonth($(this), 3)">' + getNameOfMonth(3) + '</div>';
        html += '<div onclick="changeMonth($(this), 4)">' + getNameOfMonth(4) + '</div>';
        html += '<div onclick="changeMonth($(this), 5)">' + getNameOfMonth(5) + '</div>';
        html += '<div onclick="changeMonth($(this), 6)">' + getNameOfMonth(6) + '</div>';
        html += '<div onclick="changeMonth($(this), 7)">' + getNameOfMonth(7) + '</div>';
        html += '<div onclick="changeMonth($(this), 8)">' + getNameOfMonth(8) + '</div>';
        html += '<div onclick="changeMonth($(this), 9)">' + getNameOfMonth(9) + '</div>';
        html += '<div onclick="changeMonth($(this), 10)">' + getNameOfMonth(10) + '</div>';
        html += '<div onclick="changeMonth($(this), 11)">' + getNameOfMonth(11) + '</div>';
        html += '<div onclick="changeMonth($(this), 12)">' + getNameOfMonth(12) + '</div>';
        html += '</div>';
        html += '<div style="overflow-x: auto;">';
        html += '<table>';
        html += '<thead>' + displayWeek() + '</thead>';
        html += '<tbody>' + displayDaysInMonth(year, month, ['mouseOverDayInMonth']) + '</tbody>';
        html += '</table>';
        html += '</div>';
    }
    else if(mode == 'WEEK'){
        var todayDay = box.find('.todayCalendar b').attr('data-day');
        var todayH = box.find('.todayCalendar b').attr('data-h');
        html += '<div class="dayPicker">';
        html += '<div onclick="changeDay($(this), -7)">' + slovar('Week') + ' -</div>';
        html += '<div>' + getNameOfMonth(month) + ' (' + slovar('Week') + ' ' + getWeekOfMonth(year,(month - 1),day) + ')</div>';
        html += '<div onclick="changeDay($(this), 7)">' + slovar('Week') + ' +</div>';
        html += '</div>';
        html += '<div style="overflow-x: auto;">';
        html += '<table>';
        html += '<thead>' + displayWeek(1) + '</thead><tbody>';
        // GET DATA OF SELECTED DAY
        var dayOfWeek = getDayOfWeek(year,(month - 1),day);
        var dayOfMonth = getDayOfMonth(year,(month - 1),day);
        for(var i=0; i<=23; i++){
            html += '<tr ';
            if(i == todayH && todayDay == day){ html += 'class="todayDate"' }
            html += '><td>'+i+':00</td>';
            // DAYS OF BEFORE WEEK
            for(var j=dayOfWeek - 1; j>0; j--){
                var thisYear = year;
                var thisMonth = month;
                var thisDay = getDayOfMonth(year,(month - 1),(parseInt(day) - j));
                if(thisDay > dayOfMonth){ thisMonth--; }
                if(thisMonth == 0){ thisMonth = 12; thisYear--; }
                html += '<td data-date="' + thisYear + '-' + String(thisMonth).padStart(2, '0') + '-' + String(thisDay).padStart(2, '0') + '"></td>';
            }
            // DAYS OF CURRENT WEEK + NEXT WEEK
            for(var j=0; j<8-dayOfWeek; j++){
                var thisYear = year;
                var thisMonth = month;
                var thisDay = getDayOfMonth(year,(month - 1),(parseInt(day) + j));
                if(thisDay < dayOfMonth){ thisMonth++; }
                if(thisMonth == 13){ thisMonth = 1; thisYear++; }
                html += '<td data-date="' + thisYear + '-' + String(thisMonth).padStart(2, '0') + '-' + String(thisDay).padStart(2, '0') + '"></td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        html += '</div>';
    }
    else if(mode == 'DAY'){
        var todayDay = box.find('.todayCalendar b').attr('data-day');
        var todayH = box.find('.todayCalendar b').attr('data-h');
        html += '<div class="dayPicker">';
        html += '<div onclick="changeDay($(this), -1)">' + slovar('Day') + ' -</div>';
        html += '<div>' + getNameOfDay(getDayOfWeek(year,(month - 1),day)) + '</div>';
        html += '<div onclick="changeDay($(this), 1)">' + slovar('Day') + ' +</div>';
        html += '</div>';
        html += '<div style="overflow-x: auto;">';
        html += '<table>';
        for(var i=0; i<=23; i++){
            html += '<tr data-h="'+i+'" ';
            if(i == todayH && todayDay == day){ html += 'class="todayDate"' }
            html += '><td>'+i+':00</td><td></td></tr>';
        }
        html += '</table>';
        html += '</div>';
    }
    // ADD HTML TO CALENDAR
    boxMain.html(html);
    // DO EXTRA WORK AFTER HTML ADDED TO CALENDAR
    if(mode == 'YEAR'){
        boxMain.find('.calendarBoxMainMonth').each(function(){
            $(this).find('tbody tr').each(function(){
                if($(this).find('td:not(.notActiveDay)').length != 0){
                    var tempMonth = $(this).closest('.calendarBoxMainMonth').attr('data-month');
                    var tempDay = $(this).find('td:not(.notActiveDay)').first().text();
                    $(this).addClass('goToWeekTr').attr('onclick', 'goToWeek($(this),' + tempMonth + ',' + tempDay + ')');
                }
            });
        });
    }
    else if(mode == 'MONTH'){ boxMain.find('.monthPicker div:eq(' + (month - 1) + ')').addClass('act') }
    else if(mode == 'WEEK'){
        boxMain.find('th:not(:first)').each(function(){
            $(this).append(' (' + boxMain.find('tbody tr').first().find('td:eq(' + $(this).index() + ')').attr('data-date').split('-')[2] + ')');
        });
    }
    // SHOW TODAY
    var today = box.find('.todayCalendar b');
    var todayDate = today.attr('data-year') + '-' + today.attr('data-month').padStart(2, '0') + '-' + today.attr('data-day').padStart(2, '0');
    boxMain.find('[data-date="' + todayDate + '"]').addClass('todayDate');
    boxMain.fadeIn();
    // LOAD IN EVENTS
    loadEvents(box, mode, year, month, day);
}

function colorTodayDate(boxMain, todayDate){
    return boxMain.find('[data-date="' + todayDate + '"]').addClass('todayDate');
}

function goToWeek(el, month, day){
    var box = el.closest('.calendarBox');
    box.find('.calendarBoxMain').attr('data-month', month).attr('data-day', day);
    changeMode(box.find('.changeModeBox b:eq(2)'));
}

function goToMonth(el, month){
    var box = el.closest('.calendarBox');
    box.find('.calendarBoxMain').attr('data-month', month).attr('data-day', 1);
    changeMode(box.find('.changeModeBox b:eq(1)'));
}

function resetToToday(el){
    var box = el.closest('.calendarBox');
    var year = el.attr('data-year');
    var month = el.attr('data-month');
    var day = el.attr('data-day');
    box.find('.calendarYear').text(year);
    box.find('.calendarBoxMain').attr('data-year', year).attr('data-month', month).attr('data-day', day);
    createCalendar(box);
}

function changeMode(el){
    var mode = el.attr('data-mode');
    var box = el.closest('.calendarBox');
    var tab = el.closest('.changeModeBox');
    tab.find('b').removeClass('act');
    el.addClass('act');
    box.find('.calendarBoxMain').attr('data-mode', mode);
    createCalendar(box);
}

function CEchangeYear(el, num){changeYear(el, num, function(){
    var box = el.closest('.calendarBox');
    var year = parseInt(box.find('.calendarYear').text());
    box.find('.calendarBoxMain').attr('data-year', year).attr('data-day', 1);
    createCalendar(box);
})}

function changeMonth(el, month){
    var box = el.closest('.calendarBox');
    var year = box.find('.calendarBoxMain').attr('data-year');
    var monthPicker = box.find('.monthPicker');
    monthPicker.find('div').removeClass('act');
    el.addClass('act');
    box.find('.calendarBoxMain').attr('data-month', month).attr('data-day', 1);
    createCalendar(box);
}

function changeDay(el, CalcDays){
    var box = el.closest('.calendarBox');
    var boxMain = box.find('.calendarBoxMain');
    var year = parseInt(boxMain.attr('data-year'));
    var month = parseInt(boxMain.attr('data-month')) - 1;
    var day = parseInt(boxMain.attr('data-day'));
    var d = new Date(year, month, day);
    d.setDate(d.getDate() + CalcDays);
    boxMain.attr('data-year', d.getFullYear());
    box.find('.calendarYear').text(d.getFullYear());
    boxMain.attr('data-month', d.getMonth() + 1);
    boxMain.attr('data-day', d.getDate());
    createCalendar(box);
}

// ---------------------------- HOVER TOOLS

function mouseOverDayInMonth(el){
    boxMain = el.closest('.calendarBoxMain');
    if(boxMain.attr('data-mode') != 'MONTH'){ return }

    calendarBox = el.closest('.calendarBox');
    if(calendarBox.find('.calendarHoverTool').length == 0){
        calendarBox.append(`
            <div 
            class="calendarHoverTool hoverTool linksvg" 
            data-tooltip="`+slovar('Add_new')+`"
            >`+getSVG('plus_circle')+`</div>
        `);
        tooltips();
    }

    var button = calendarBox.find('.calendarHoverTool');
    var top = el.position().top + calendarBox.scrollTop();
    var left = el.position().left;

    button.css({ 'top': top, 'left': left }).fadeIn('fast');
    button.unbind('click').click(function(){
        loadJS('main/add-box', function(){
            openAddBoxQuick(boxMain.attr('data-module'), function(){
                setTimeout(function(){ 
                    $('.popup').last().find('[name='+boxMain.attr('data-start')+']').val(el.attr('data-date') + ' 00:00:00');
                    $('.popup').last().find('[name='+boxMain.attr('data-end')+']').val(el.attr('data-date') + ' 00:05:00');
                    resetDatePickerInputs($('.popup').last());
                }, 100);
            });
        });
    });
}

// ---------------------------- EVENTS

function loadEvents(box, mode, year, month, day){
    var startDate, endDate;
    var boxMain = box.find('.calendarBoxMain');
    
    // REMOVE OLD EVENTS ON TOP
    box.find('.calendarEventOnTop').remove();
    
    if(mode == 'YEAR'){
        startDate = year + '-01-01 00:00:00';
        endDate = year + '-12-31 23:59:59';
    }
    else if(mode == 'MONTH'){
        startDate = boxMain.find('tbody td').first().attr('data-date') + ' 00:00:00';
        endDate = boxMain.find('tbody td').last().attr('data-date') + ' 23:59:59';
    }
    else if(mode == 'WEEK'){
        startDate = boxMain.find('tbody tr').first().find('td:eq(1)').attr('data-date') + ' 00:00:00';
        endDate = boxMain.find('tbody tr').first().find('td:eq(7)').attr('data-date') + ' 23:59:59';
    }
    else if(mode == 'DAY'){
        startDate = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0') + ' 00:00:00';
        endDate = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0') + ' 23:59:59';
    }
    
    GET_event({
        module: boxMain.attr('data-module'),
        startCol: boxMain.attr('data-start'),
        endCol: boxMain.attr('data-end'),
        startDate: startDate,
        endDate: endDate,
        assignedCol: boxMain.attr('data-assigned'),
        shareCol: boxMain.attr('data-share'),
        colorCol: boxMain.attr('data-color'),
        done:function(data){
            displayEvents(box, mode, data);
            if(checkCookie('google_calendar')){
                setTimeout(function(){
                    loadJS('calendar/google', function(){ GOOGLE_listUpcomingEvents(box) })
                }, 1000);
            }
        }
    })
}

function displayEvents(box, mode, data){
    if(data.length == 0){ return }
    for(var i=0; i<data.length; i++){
        var id = data[i]['id'];
        var subject = data[i]['subject'];
        var color = data[i]['color'];

        // TURN UTC TO LOCAL TIMEZONE
        var start_date = UTCtoInput(data[i]['start_date']);
        var end_date = UTCtoInput(data[i]['end_date']);
        
        manipulateDateBasedOnMode(box, mode, id, subject, color, start_date, end_date);
    }
    displayEventsOnTopOfCalendar(box, mode);
}

function manipulateDateBasedOnMode(box, mode, id, subject, color, start_date, end_date, type = ''){
    // TURN STRING INTO JS DATE
    if(mode == 'YEAR' || mode == 'MONTH'){
        start_date = stringToDate(start_date.split(' ')[0] + ' 00:00:00');
        end_date = stringToDate(end_date.split(' ')[0] + ' 00:00:00');
    }
    else if(mode == 'WEEK' || mode == 'DAY'){
        var hhStart = start_date.split(' ')[1].split(':')[0];
        var hhEnd = end_date.split(' ')[1].split(':')[0];
        start_date = stringToDate(start_date.split(' ')[0] + ' ' + hhStart + ':00:00');
        end_date = stringToDate(end_date.split(' ')[0] + ' ' + hhEnd + ':00:00');
    }
    displayEventsOnCalendar(box, mode, id, subject, color, start_date, end_date, type);
}

function displayEventsOnCalendar(box, mode, id, subject, color, start_date, end_date, type = ''){
    // DISPLAY EVENT ON CALENDAR
    if(mode == 'YEAR'){
        box.find('.calendarBoxMain td').each(function(){
            var thisDate = stringToDate($(this).attr('data-date') + ' 00:00:00');
            if(thisDate.getTime() >= start_date.getTime() && thisDate.getTime() <= end_date.getTime()){
                if($(this).find('.calendarEvent').length == 1){ $(this).find('.calendarEvent').text(parseInt($(this).find('.calendarEvent').text()) + 1); }
                else{ $(this).append('<div class="calendarEvent">1</div>'); }
            }
        });
    }
    else if(mode == 'MONTH'){
        box.find('.calendarBoxMain td').each(function(){
            var thisDate = stringToDate($(this).attr('data-date') + ' 00:00:00');
            if(thisDate.getTime() >= start_date.getTime() && thisDate.getTime() <= end_date.getTime()){
                $(this).append('<div class="calendarEvent" data-type="'+type+'" data-id="'+id+'" data-color="'+color+'">'+subject+'</div>');
            }
        });
    }
    else if(mode == 'WEEK'){
        box.find('.calendarBoxMain tbody tr').each(function(){
            var thisTime = $(this).find('td').first().text();
            $(this).find('td:not(:first)').each(function(){
                var thisDate = stringToDate($(this).attr('data-date') + ' ' + thisTime + ':00');
                if(thisDate.getTime() >= start_date.getTime() && thisDate.getTime() <= end_date.getTime()){
                    if($(this).find('.calendarEventBox').length == 0){ $(this).append('<div class="calendarEventBox"></div>'); }
                    $(this).find('.calendarEventBox').append('<div class="calendarEvent" data-type="'+type+'" data-id="'+id+'" data-color="'+color+'">'+subject+'</div>');
                }
            });
        });
    }
    else if(mode == 'DAY'){
        box.find('.calendarBoxMain tbody tr').each(function(){
            var thisTime = $(this).find('td').first().text();
            var thisYear = box.find('.calendarBoxMain').attr('data-year');
            var thisMonth = box.find('.calendarBoxMain').attr('data-month');
            var thisDay = box.find('.calendarBoxMain').attr('data-day');
            var thisDate = stringToDate(thisYear + '-' + thisMonth + '-' + thisDay + ' ' + thisTime + ':00');
            if(thisDate.getTime() >= start_date.getTime() && thisDate.getTime() <= end_date.getTime()){
                if($(this).find('.calendarEventBox').length == 0){ $(this).find('td').last().append('<div class="calendarEventBox"></div>'); }
                $(this).find('.calendarEventBox').append('<div class="calendarEvent" data-type="'+type+'" data-id="'+id+'" data-color="'+color+'">'+subject+'</div>');
            }
        });
    }
}

function displayEventsOnTopOfCalendar(box, mode){
    if(box.find('.calendarEvent').length == 0){ return }
    box.find('.calendarEventOnTop').remove();
    box.find('.calendarEvent').show();
    if(mode == 'MONTH'){
        box.find('.calendarBoxMain tbody tr').each(function(){
            var arr = [];
            $(this).find('.calendarEvent').each(function(){
                var id = $(this).attr('data-id');
                var color = $(this).attr('data-color');
                var type = $(this).attr('data-type');
                $(this).css('visibility', 'hidden');
                if(!arr.includes(id)){
                    box.append('<div class="calendarEventOnTop" data-type="'+type+'" data-id="'+id+'"><span>' + $(this).text() + '</span></div>');
                    var event = box.find('.calendarEventOnTop[data-type="'+type+'"]').last();
                    event.css({
                        'background': color,
                        'top': $(this).position().top,
                        'left': $(this).position().left,
                        'width': $(this).width()
                    });
                    event.find('span').css('color', getContrastYIQ(color));
                    arr.push(id);
                }
                else{
                    var event = box.find('.calendarEventOnTop[data-id="'+id+'"]').last();
                    event.css({
                        'width': ($(this).position().left - event.position().left) + $(this).width()
                    });
                    if(event.position().top > $(this).position().top){ $(this).hide(); }
                }
            });
        });
    }
    else if(mode == 'WEEK' || mode == 'DAY'){
        for(var i=1; i<=7; i++){
            var arr = [];
            box.find('.calendarBoxMain tbody tr td:nth-child('+(i+1)+') .calendarEvent').each(function(){
                var id = $(this).attr('data-id');
                var color = $(this).attr('data-color');
                var type = $(this).attr('data-type');
                $(this).css('visibility', 'hidden');
                if(!arr.includes(id)){
                    box.append('<div class="calendarEventOnTop" data-type="'+type+'" data-id="'+id+'"><b>' + $(this).text() + '</b></div>');
                    var event = box.find('.calendarEventOnTop[data-type="'+type+'"]').last();
                    event.css({
                        'background': color,
                        'top': $(this).position().top,
                        'left': $(this).position().left,
                        'width': $(this).width()
                    });
                    event.find('b').css('color', getContrastYIQ(color));
                    arr.push(id);
                }
                else{
                    var event = box.find('.calendarEventOnTop[data-id="'+id+'"]').last();
                    event.css({
                        'height': ($(this).position().top - event.position().top) + $(this).height()
                    });
                    if(event.position().left > $(this).position().left){ $(this).appendTo($(this).parent()); }
                }
            });
        }
    }
    eventsOnTopFunctions($('.calendarEventOnTop'), box);
}

// EVENT MOUSE FUNCTIONS

function eventsOnTopFunctions(event, box){
    var leftButtonDown = false;
    var eventItem = {};
    eventItem.el = false;
    eventItem.moving = false;
    eventItem.date = 0;
    eventItem.X = 0;
    eventItem.Y = 0;
    var countMoves = 0;

    event.mousedown(function(e){
        stopMouseTextSelect(e);
        if(e.which === 1){
            if(
                box.find('.calendarBoxMain').attr('data-mode') == 'MONTH' &&
                box.find('.calendarBoxMain').attr('data-edit').split(',').includes(user_role_id) &&
                !$(this).attr('data-id').includes('google_')
            )
            { leftButtonDown = true }
            eventItem.el = $(this);
            eventItem.el.css('transition','0s');
            eventItem.date = box.find('.calendarEvent[data-id='+eventItem.el.attr('data-id')+']').first().parent().attr('data-date');
            eventItem.X = eventItem.el.offset().left;
            eventItem.Y = eventItem.el.offset().top;
        }
    });
    $(document).unbind('mouseup').unbind('mousemove');
    $(document).mouseup(function(e){if(e.which === 1 && eventItem.el){
        leftButtonDown = false; countMoves = 0;
        if(!eventItem.moving){
            loadJS('calendar/event', function(el){ clickOnEvent(box, el) }, eventItem.el);
            return eventItem.el = false;
        }
        eventItem.moving = false;
        eventItem.el.css('transition','');
        newDate = findCalendarDateOnMauseUp(box, eventItem.el);
        if(newDate && eventItem.date != newDate){ return saveNewStartDate(box, eventItem, newDate) }
        eventItem.el.offset({top:eventItem.Y, left:eventItem.X});
        eventItem.el = false;
    }});
    $(document).mousemove(function(e){
        if(!leftButtonDown){ return }
        if(countMoves < 5){ return countMoves++ }
        eventItem.moving = true;
        var left = e.pageX - 20;
        var top = e.pageY - eventItem.el.outerHeight() / 2;
        eventItem.el.offset({top:top, left:left});
    });
}

function findCalendarDateOnMauseUp(box, eventItem, thisDate = false){
    var days = box.find('[data-date]');
    var eventX = eventItem.offset().left + 20;
    var eventY = eventItem.offset().top + eventItem.outerHeight() / 2;
    days.each(function(){
        if(
            $(this).offset().left < eventX &&
            $(this).offset().left + $(this).outerWidth() > eventX &&
            $(this).offset().top < eventY &&
            $(this).offset().top + $(this).outerHeight() > eventY
        )
        { thisDate = $(this).attr('data-date'); return false; }
    });
    return thisDate;
}

function stopMouseTextSelect(e){
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
}

function saveNewStartDate(box, eventItem, date){
    boxMain = box.find('.calendarBoxMain');
    $.post('/crm/php/calendar/drag_event.php?change_start_date=1', {
        csrf_token:$('[name=csrf_token]').val(),
        module:boxMain.attr('data-module'),
        id:eventItem.el.attr('data-id'),
        startCol:boxMain.attr('data-start'),
        endCol:boxMain.attr('data-end'),
        date:inputToUTC(date),
    }, function(data){ data = JSON.parse(data);
        if(data.error){
            eventItem.el.offset({top:eventItem.Y, left:eventItem.X});
            eventItem.el = false;
            return createAlertPOPUP(data.error)
        }
        var td = box.find('td[data-date="'+date+'"]');
        var eventID = box.find('.calendarEvent[data-id='+eventItem.el.attr('data-id')+']');
        if(eventID.length == 1){
            eventID.appendTo(td);
            return displayEventsOnTopOfCalendar(box, 'MONTH');
        }
        eventID.each(function(){
            if(td.find('.calendarEvent').length == 0){ $(this).appendTo(td) }
            else{ td.find('.calendarEvent').first().before($(this)) }
            if(td.next('td').length == 1){ td = td.next(td) }
            else if(td.parent().next('tr').find('td').first().length == 1){ td = td.parent().next('tr').find('td').first() }
        });
        displayEventsOnTopOfCalendar(box, 'MONTH');
    });
}

// ---------------------------- OTHER

addTrigger({
    id: 'submitAddBox',
    trigger: function(){ createCalendar($('.calendarBox').first()) }
});
addTrigger({
    id: 'submitEditBox',
    trigger: function(){ createCalendar($('.calendarBox').first()) }
});
addTrigger({
    id: 'LeftNavToggle',
    trigger: function(){
        displayEventsOnTopOfCalendar($('.calendarBox'), $('.calendarBoxMain').attr('data-mode'))
    }
});