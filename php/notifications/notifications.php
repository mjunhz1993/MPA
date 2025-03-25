<?php
function checkForNotificationEvent($SQL, $inputs, $module, $notification_config, $row){
    if($notification_config != ''){
        $notification_config = explode('|', $notification_config);
        $get_mention_columns_arr = explode(',', $notification_config[0]);

        // REPLACE TAGS IN DESCRIPTION
        $desc = $notification_config[2];
        if(strpos($desc, '{') !== false && strpos($desc, '}') !== false){
            $desc_exp = explode('{', $desc);
            for($i=0; $i<count($desc_exp); $i++){
                $tag = explode('}', $desc_exp[$i])[0];
                if($inputs[$tag] != ''){ $desc = str_replace('{'.$tag.'}', $inputs[$tag], $desc); }
                else if($_SESSION[$tag]){ $desc = str_replace('{'.$tag.'}', $_SESSION[$tag], $desc); }
            }
        }

        for($i=0; $i<count($get_mention_columns_arr); $i++){
            $get_mention_columns = $get_mention_columns_arr[$i];
            $notifications_user = $inputs[$get_mention_columns];
            if($notifications_user == ''){ continue; }
            // CHECK IF COLUMN REFERS TO USER OR ROLE
            $A = $SQL->query("SELECT list FROM module_columns WHERE column_id = '$get_mention_columns' LIMIT 1");
            while ($B = $A->fetch_row()){ $list = explode(',', $B[0]); }
            addToNotifications($SQL, $module, $notification_config[1], $desc, $list[1], $notifications_user, 'LOOK|'.$row);
        }

    }
}

function addToNotifications($SQL, $type, $title, $desc, $userType, $userID, $list = ''){
    $user_id = $_SESSION['user_id'] ?? 0;
    if($title == ''){ return false; }
    date_default_timezone_set("UTC");
    $time = date('Y-m-d H:i:s', time());

    removeOldNotifications($SQL);

    if($userType == 'user' && ($userID != $user_id || $userID == '1')){
        insertNotification($SQL, $userID, $type, $list, $title, $desc, $time);
    }
    else if($userType == 'role'){
        $A = $SQL->query("SELECT user_id FROM user WHERE user_role_id = '$userID' AND user_id != '$user_id'");
        while ($B = $A->fetch_row()){ insertNotification($SQL, $B[0], $type, $list, $title, $desc, $time); }
    }
}

function insertNotification($SQL, $user, $type, $list, $title, $desc, $time){
    if(checkOldNotification($SQL, $user, $type, $list)){
        return updateOldNotification($SQL, $user, $type, $list, $title, $desc, $time);
    }
    $SQL->query("INSERT INTO notifications 
    (notifications_user,notifications_title,notifications_desc,notifications_time,notifications_type,notifications_list) VALUES 
    ('$user', '$title','$desc','$time','$type','$list')");
}
function checkOldNotification($SQL, $user, $type, $list){
    if($SQL->query("SELECT * FROM notifications 
    WHERE notifications_user = '$user' AND notifications_type = '$type' AND notifications_list = '$list'
    LIMIT 1")->num_rows == 1){ return true; }
    return false;
}
function updateOldNotification($SQL, $user, $type, $list, $title, $desc, $time){
    $SQL->query("UPDATE notifications SET
    notifications_title = '$title', notifications_desc = '$desc', notifications_time = '$time'
    WHERE notifications_user = '$user' AND notifications_type = '$type' AND notifications_list = '$list'
    LIMIT 1");
}

function removeOldNotifications($SQL){
    $t = date('Y-m-d H:i:s', strtotime('-1 week'));
    $SQL->query("DELETE FROM notifications WHERE notifications_time < '$t'");
}
?>