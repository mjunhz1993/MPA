<?php
function sendNotification($SQL, $d){
    if(!is_object($d)){ return error_log('sendNotification: no object found'); }
    foreach (['subject'] as $prop) {
        if(!property_exists($d, $prop)){ return error_log("sendNotification: Missing property: $prop"); }
    }

    $myID = $_SESSION['user_id'] ?? 0;
    if(!property_exists($d, 'to')){ $d->to = $myID; }
    if(!property_exists($d, 'nType')){ $d->nType = 'BLUE'; }
    if(!property_exists($d, 'desc')){ $d->desc = $d->subject; }
    if(!property_exists($d, 'group')){ $d->group = 'user'; }
    if(!property_exists($d, 'buttons')){ $d->buttons = 'DEFAULT'; }

    $d->buttons = $SQL->real_escape_string(json_encode($d->buttons));
    date_default_timezone_set("UTC");
    $d->time = date('Y-m-d H:i:s', time());

    removeOldNotifications($SQL);

    if($d->group == 'user'){ return insertNotification($SQL, $d); }
    $A = $SQL->query("SELECT user_id FROM user WHERE user_role_id = $d->to AND user_id != $myID");
    while ($B = $A->fetch_row()){
        $d->to = $B[0];
        insertNotification($SQL, $d);
    }
}

function insertNotification($SQL, $d){
    if(checkOldNotification($SQL, $d)){ return updateOldNotification($SQL, $d); }
    $SQL->query("INSERT INTO notifications 
    (notifications_user,notifications_title,notifications_desc,notifications_time,notifications_type,notifications_list) VALUES 
    ('$d->to', '$d->subject','$d->desc','$d->time','$d->nType','$d->buttons')");
}
function checkOldNotification($SQL, $d){
    if($SQL->query("SELECT * FROM notifications 
    WHERE notifications_user = '$d->to' AND notifications_type = '$d->nType' AND notifications_list = '$d->buttons'
    LIMIT 1")->num_rows == 1){ return true; }
    return false;
}
function updateOldNotification($SQL, $d){
    $SQL->query("UPDATE notifications SET
    notifications_title = '$d->subject', notifications_desc = '$d->desc', notifications_time = '$d->time'
    WHERE notifications_user = '$d->to' AND notifications_type = '$d->nType' AND notifications_list = '$d->buttons'
    LIMIT 1");
}

function removeOldNotifications($SQL){
    $t = date('Y-m-d H:i:s', strtotime('-1 week'));
    $SQL->query("DELETE FROM notifications WHERE notifications_time < '$t'");
}
?>