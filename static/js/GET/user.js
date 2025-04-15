function GET_myself(d){
    $.getJSON('/crm/php/main/GET_user?myself=1', function(data){
        if(data.error){ return console.log(data) }
        if(typeof d.done === 'function'){ d.done(data) }
    })
}

function GET_users(d){
    $.getJSON('/crm/php/main/GET_user?get_all_users=1', function(data){
        if(data.error){ return console.log(data) }
        if(typeof d.done === 'function'){ d.done(data) }
    })
}

function GET_roles(d){
    $.getJSON('/crm/php/main/GET_user?get_all_roles=1', function(data){
        if(data.error){ return console.log(data) }
        if(typeof d.done === 'function'){ d.done(data) }
    })
}