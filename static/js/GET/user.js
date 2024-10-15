function GET_myself(d){
    $.get('/crm/php/main/GET_user.php?myself=1', function(data){
        data = JSON.parse(data);
        if(data.error){ return console.log(data) }
        if(typeof d.done === 'function'){ d.done(data) }
    }).fail(function(){console.log('ERROR: backend napaka')});
}