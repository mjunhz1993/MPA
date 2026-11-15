<?php
function sendNotification($SQL, $d){
    if(!is_object($d)){ return error_log('sendNotification: no object found'); }
    foreach (['subject'] as $prop) {
        if(!property_exists($d, $prop)){ return error_log("sendNotification: Missing property: $prop"); }
    }

    $myID = $_SESSION['user_id'] ?? 0;
    if(!property_exists($d, 'to')){ $d->to = $myID; }
    if(!property_exists($d, 'from')){ $d->from = NULL; }
    if(!property_exists($d, 'nType')){ $d->nType = 'BLUE'; }
    if(!property_exists($d, 'desc')){ $d->desc = $d->subject; }
    if(!property_exists($d, 'group')){ $d->group = 'user'; }
    if(!property_exists($d, 'buttons')){ $d->buttons = 'DEFAULT'; }

    $d->buttons = json_encode($d->buttons);
    date_default_timezone_set("UTC");
    $d->time = date('Y-m-d H:i:s', time());

    removeOldNotifications($SQL);

    if($d->group == 'user'){ return insertNotification($SQL, $d); }

    $A = sql_select($SQL, "
        SELECT user_id FROM user 
        WHERE 
            user_role_id = ? AND 
            user_id != ?
    ", [$d->to, $myID]);

    while($B = $A->fetch_row()){
        $d->to = $B[0];
        insertNotification($SQL, $d);
    }
}

function insertNotification($SQL, $d){
    if(checkOldNotification($SQL, $d)){ return updateOldNotification($SQL, $d); }

    return sql_insert($SQL, "
        INSERT INTO notifications (
            notifications_user,
            notifications_from,
            notifications_title,
            notifications_desc,
            notifications_time,
            notifications_type,
            notifications_list
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ", [
        $d->to,
        $d->from,
        $d->subject,
        $d->desc,
        $d->time,
        $d->nType,
        $d->buttons
    ]);
}

function checkOldNotification($SQL, $d){
    $A = sql_select($SQL, "
        SELECT 1
        FROM notifications
        WHERE
            notifications_user = ? AND
            notifications_from = ? AND
            notifications_type = ? AND
            notifications_list = ?
        LIMIT 1
    ", [
        $d->to,
        $d->from,
        $d->nType,
        $d->buttons
    ]);

    return $A->num_rows == 1;
}

function updateOldNotification($SQL, $d){
    return sql_update($SQL, "
        UPDATE notifications SET
            notifications_title = ?,
            notifications_desc = ?,
            notifications_time = ?
        WHERE 
            notifications_user = ? AND
            notifications_from = ? AND
            notifications_type = ? AND
            notifications_list = ?
        LIMIT 1
    ", [
        $d->subject,
        $d->desc,
        $d->time,
        $d->to,
        $d->from,
        $d->nType,
        $d->buttons
    ]);
}

function removeOldNotifications($SQL){
    $t = date('Y-m-d H:i:s', strtotime('-1 week'));
    return sql_delete($SQL, "DELETE FROM notifications WHERE notifications_time < ?", [$t]);
}
?>