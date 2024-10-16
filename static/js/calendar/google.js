function G_listUpcomingEvents(calendar){loadJS('API/google', function(){
G_connect(function(isSignedIn){
  if(!isSignedIn){ return }
  var mode = calendar.find('.calendarBoxMain').attr('data-mode');
  var time = G_getTime(calendar.find('.calendarBoxMain'), mode);
  if(!time){ return }
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (stringToDate(time[0], 'UTC')).toISOString(),
    'timeMax': (stringToDate(time[1], 'UTC')).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 100,
    'orderBy': 'startTime'
  }).then(function(response) {
    var events = response.result.items;
    if(events.length == 0){ return }
    for (i = 0; i < events.length; i++){
      var event = events[i];
      var id = 'google_' + i;
      var subject = event.summary;
      var start_date = event.start.dateTime;
      var url = event.htmlLink;
      if(!start_date){ start_date = getDate('Y-m-d H:i:s', stringToDate(event.start.date + ' 00:00:00')) }
      else{ start_date = getDate('Y-m-d H:i:s', new Date(start_date)) }
      var end_date = event.end.dateTime;
      if(!end_date){ end_date = getDate('Y-m-d H:i:s', stringToDate(event.end.date + ' 23:59:59')) }
      else{ end_date = getDate('Y-m-d H:i:s', new Date(end_date)) }
      manipulateDateBasedOnMode(calendar, mode, id, subject, '#2d70b6', start_date, end_date, 'GOOGLE');
      $('.calendarEvent[data-id="'+id+'"]').first().attr({
        'data-url':url,
        'data-start':start_date,
        'data-end':end_date
      });
    }
    displayEventsOnTopOfCalendar(calendar, mode);
  })
})})}

function G_getTime(cBox, mode){
  if(!['MONTH','WEEK'].includes(mode)){ return false }
  return [cBox.find('[data-date]').first().attr('data-date'), cBox.find('[data-date]').last().attr('data-date')]
}