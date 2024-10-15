<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('chat/SQL'));
include(loadPHP('notifications/notifications'));

function call_users($SQL, $extra = ''){
    $room = $_POST['room'];
    $users = $_POST['users'];
    if(count($users) == 0){ return ['error' => 'No_user_selected']; }
    $extra .= 'JSbutton|Answer|delete_notification($(this), function(){';
    $extra .= 'loadJS(\'chat/videocall\', function(){';
    $extra .= 'videocall('.$room.', false)';
    $extra .= '})})';
    for($i=0; $i<count($users); $i++){
        $u = SafeInput($SQL, $users[$i]);
        addToNotifications($SQL,'PHONE','Pickup_call_title','Pickup_call_desc','user',$u,$SQL->real_escape_string($extra));
    }
    return '';
}

if(isset($_SESSION['user_id'])){
    if(isset($_GET['call_users'])){ echo json_encode(call_users($SQL)); }
}
?>