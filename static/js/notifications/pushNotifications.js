function check_pushNotification(){
    if(Notification.permission === 'granted'){ return true }
    return false
}

function request_pushNotification(d){
    Notification.requestPermission().then(function(permission) {
        if(d.onGranted && permission === 'granted'){ return d.onGranted() }
        if(d.onError){ return d.onError() }
    })
}

function create_pushNotification(d){
    var ext = {};
    if(d.body){ ext.body = d.body }
    if(d.icon){ ext.icon = d.icon }
    if(d.tag){ ext.tag = d.tag }
    var notification = new Notification(d.title, ext)
    notification.onclick = () => {
        notification.close();
        window.parent.focus();
        if(d.url){ return window.location.href = d.url }
        if(d.callback){ return d.callback() }
    }
}