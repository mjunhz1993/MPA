<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('chat/SQL'));
include(loadPHP('notifications/notifications'));

function call_users($SQL, $extra = ''){
    $room = $_POST['room'];
    $users = $_POST['users'];
    if(count($users) == 0){ return ['error' => 'No_user_selected']; }
    for($i=0; $i<count($users); $i++){
        $u = SafeInput($SQL, $users[$i]);
        sendNotification($SQL, (object)[
            'subject' => 'Pickup_call_title',
            'desc' => 'Pickup_call_desc',
            'to' => $u,
            'nType' => 'RED',
            'buttons' => [
                'Answer' => [
                    'color' => 'Green',
                    'onclick' => 'loadJS(\'chat/videocall\',()=>videocall('.$room.', false))'
                ],
                'Cancel' => ['color'=>'Grey']
            ]
        ]);
    }
    return '';
}

if(isset($_SESSION['user_id'])){
    if(isset($_GET['call_users'])){ echo json_encode(call_users($SQL)); }
}
?>