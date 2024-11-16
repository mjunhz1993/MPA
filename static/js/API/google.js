var googleObj = {
  files: [],
  client: ''
};
loadCSS('google');

function GOOGLE_connect(d){loadJS('https://accounts.google.com/gsi/client', function(){
  loadJS('https://apis.google.com/js/api.js', function(){ GOOGLE_globals(d) })
})}

function GOOGLE_globals(d){GET_globals({
  done:function(data){ GOOGLE_initClient(d, data) }
})}

function GOOGLE_initClient(d, data) {
  if(valEmpty(data.gcID)){ return callback(false, slovar('NO_gcID')) }
  if(valEmpty(data.gcAPI)){ return callback(false, slovar('NO_gcAPI')) }
  if(valEmpty(d)){ return }
  if(valEmpty(d.scope)){ return d.done() }

  if(googleObj.files.includes(d.scope) && typeof d.done === 'function'){ return d.done() }
  googleObj.files.push(d.scope);

  gapi.load('client', function(){
    gapi.client.init({
        apiKey: data.gcAPI,
        discoveryDocs: [d.docs],
    })
    .then(function(){
        console.log('GAPI client loaded.');
        GOOGLE_connected();
        d.done();
    })
    .catch(function(error){
        console.log('gapi', error);
        createAlertPOPUP(error);
    });
  });

  googleObj.client = google.accounts.oauth2.initTokenClient({
    client_id: data.gcID,
    scope: d.scope,
    callback: function (response){
      if (response.error) {
        console.log('google oauth2', response.error);
        return createAlertPOPUP(response.error);
      }
      localStorage.setItem('google_token', response.access_token);
      d.done();
    },
  });
}

function GOOGLE_connected(){
  if(localStorage.getItem("google_token")){
    $('.if-Google-Connected').show();
    $('.if-Google-disconnected').hide();
    gapi.client.setToken({ access_token: localStorage.getItem("google_token") });
    return true;
  }
  $('.if-Google-Connected').hide();
  $('.if-Google-disconnected').show();
  return false;
}