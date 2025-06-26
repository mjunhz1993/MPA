function check_pushNotification(){
    if(Notification.permission === 'granted'){ return true }
    return false
}

function create_pushNotification(d){
    var ext = {};
    if(d.body){ ext.body = d.body }
    if(d.icon){ ext.icon = d.icon }
    if(d.tag){ ext.tag = d.tag }
    var notification = new Notification(d.subject, ext)
    notification.onclick = () => {
        notification.close();
        window.parent.focus();
        if(d.url){ return window.location.href = d.url }
        if(d.callback){ return d.callback() }
    }
}

function init_pushNotification(){
    if(check_pushNotification()){get_notifications('', function(el, data){
        for(var i=0; i<data.length; i++){ d = data[i];
            create_pushNotification({
                subject:slovar(d.subject),
                tag:d.subject,
                body:d.descText,
                icon:'https://'+window.location.hostname+'/crm/static/img/OKTAGON-IT.jpg',
                callback:function(){
                    get_notifications($('#TopNavBell'), (el, data)=>popup_notifications(el, data))
                }
            })
        }
    })}
}