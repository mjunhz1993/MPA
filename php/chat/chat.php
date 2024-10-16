<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('chat/SQL'));
include(loadPHP('file/file'));
include(loadPHP('notifications/notifications'));

function save_clipboard_file($user_id, $path){
    $value = $_FILES['clipboard'];
    if($value['tmp_name'] == ''){ return ['error' => 'no_tmp_name']; }
    $oldName = $value['name'];
    $tmp_name = $value['tmp_name'];
    $size = $value['size'];
    $fileType = $value['type'];
    $fileinfo = pathinfo($oldName);
    $newName = 'clipboard_'. $user_id. '.'. $fileinfo['extension'];
    if($size >= intval($GLOBALS["config"]["max_file_size"])){ return ['error' => 'file_size_to_big']; }
    if(uploadImage($tmp_name, $path.$newName)){ return ['name' => $oldName]; }
    return ['error' => 'upload_error'];
}

function save_clipboard_url($user_id, $path){
    $value = $_POST['clipboard'];
    $fileinfo = pathinfo($value);
    $newName = 'clipboard_'. $user_id. '.'. $fileinfo['extension'];
    if(file_put_contents($path.$newName, file_get_contents($value))){ return ['name' => $fileinfo['basename']]; }
    return ['error' => 'upload_error'];
}

function add_conversation($SQL, $chatSQL, $user_id){
    $subject = SafeInput($SQL, $_POST['subject']);
    if($subject == ''){ return ['error' => slovar('Subject_empty')]; }
    if($_POST['user'][0] == ''){ return ['error' => slovar('No_user_selected')]; }

    $module = '';
    if(isset($_POST['module'])){ $module = SafeInput($SQL, $_POST['module']); }
    $row = 0;
    if(isset($_POST['row'])){ $row = SafeInput($SQL, $_POST['row']); }
    date_default_timezone_set("UTC");
    $conversation_time = date('Y-m-d H:i:s', time());

    $A = $SQL->query("INSERT INTO conversation (subject,module,`row`,conversation_time,admin) 
    VALUES ('$subject','$module','$row','$conversation_time','$user_id')");
    if(!$A){ return ['error' => SQLerror($SQL)]; }

    $conversation_id = $SQL->insert_id;
    $A = $SQL->query("INSERT INTO conversation_user (conversation_id,conversation_user) VALUES ('$conversation_id','$user_id')");
    if(!$A){ return ['error' => SQLerror($SQL)]; }

    for($i=0; $i<count($_POST['user']); $i++){
        $conversation_user = SafeInput($SQL, $_POST['user'][$i]);
        if($conversation_user == ''){ continue; }

        $A = $SQL->query("INSERT INTO conversation_user (conversation_id,conversation_user) VALUES ('$conversation_id','$conversation_user')");
        if(!$A){ return ['error' => SQLerror($SQL)]; }

        if($module != '' && $row != 0){
            $module_id = $module.'_id';
            $A = $SQL->query("UPDATE $module SET chat = '$conversation_id' WHERE $module_id = '$row' LIMIT 1");
        }
    }

    $table_name = 'chat_room_'. $conversation_id;
    $A = $chatSQL->query("CREATE TABLE $table_name
    (
        message_time DATETIME, INDEX(message_time),
        message_user INT(100) UNSIGNED,
        message TEXT,
        attachment TEXT
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    // CREATE DIR
    createFileUploadDIR();
    createFileUploadDIR('chat_rooms');
    createFileUploadDIR('chat_rooms/chat_room_'. $conversation_id);
    return $conversation_id;
}

function post_message($SQL, $chatSQL, $user_id){
    $id = SafeInput($SQL, $_GET['id']);
    $time = time();
    $message = SafeInput($SQL, $_POST['message']);
    date_default_timezone_set("UTC");
    $message_time = date('Y-m-d H:i:s', $time);
    $path = $_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/chat_rooms/chat_room_'. $id. '/';
    $attachment = post_message_files($user_id, $path, $time);

    $A = $chatSQL->query("INSERT INTO chat_room_$id (message_time,message_user,message,attachment) 
    VALUES ('$message_time','$user_id','$message','$attachment')");
    if(!$A){ return ['error' => SQLerror($SQL)]; }

    $A = $SQL->query("UPDATE conversation SET conversation_time = '$message_time' WHERE id = '$id' LIMIT 1");
    $A = $SQL->query("SELECT conversation_user FROM conversation_user WHERE conversation_id = '$id' AND conversation_user != '$user_id'");
    while ($B = $A->fetch_row()){ addToNotifications($SQL, 'CHAT', 'Chat_message', $message, 'user', $B[0], 'LOOK|'.$id); }
    return true;
}
function post_message_files($user_id, $path, $time, $attachment = array()){
    if($_FILES){foreach($_FILES as $column => $value){
        for($i=0; $i<count($value['tmp_name']); $i++){
            if($value['tmp_name'][$i] == ''){ continue; }
            $oldName = $value['name'][$i];
            $tmp_name = $value['tmp_name'][$i];
            $fileType = $value['type'][$i];
            $fileinfo = pathinfo($oldName);
            $time++;
            $newName = $time. '.'. $fileinfo['extension'];
            if(move_uploaded_file($tmp_name, $path. $newName)){ array_push($attachment, $newName. ','. $oldName); }
        }
    }}
    if(isset($_POST['clipboard'])){
        $oldName = $_POST['clipboard'];
        $fileinfo = pathinfo($oldName);
        $newName = $time. '.'. $fileinfo['extension'];
        $tmp_name = 'clipboard_'. $user_id. '.'. $fileinfo['extension'];
        if(rename($path.$tmp_name, $path.$newName)){ array_push($attachment, $newName. ','. $oldName); }
    }
    return implode('|', $attachment);
}


if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){
    
    $user_id = $_SESSION['user_id'];

    if(isset($_GET['add_conversation'])){ echo json_encode(add_conversation($SQL, $chatSQL, $user_id)); }

    if(isset($_GET['change_conversation_subject'])){
        $data = array();
        $id = SafeInput($SQL, $_POST['id']);
        $subject = SafeInput($SQL, $_POST['subject']);
        $A = $SQL->query("UPDATE conversation SET subject='$subject' WHERE id = '$id' LIMIT 1");
        if(!$A){ $data['error'] = SQLerror($SQL); }
        echo json_encode($data);
    }

    if(isset($_GET['delete_conversation'])){
        $data = array();
        $id = SafeInput($SQL, $_POST['id']);
        $admin = array();

        $A = $SQL->query("SELECT admin,module,`row` FROM conversation WHERE id = '$id'");
        while ($B = $A->fetch_row()){
            $admin = explode(',', $B[0]);
            $module = $B[1];
            $row = $B[2];
        }

        if(in_array($user_id, $admin)){
            $A = $SQL->query("DELETE FROM conversation WHERE id = '$id' LIMIT 1");
            $A = $chatSQL->query("DROP TABLE chat_room_$id");
            if($module != '' && $row != 0){
                $module_id = $module.'_id';
                $A = $SQL->query("UPDATE $module SET chat='0' WHERE $module_id='$row' LIMIT 1");
            }
            // REMOVE DIR
            deleteFileUploadDIR('chat_rooms/chat_room_'. $id);
        }
        else{ $data['error'] = 1; }

        echo json_encode($data);
    }

    if(isset($_GET['save_clipboard']) && isset($_GET['id'])){
        $data = array();
        $path = $_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/chat_rooms/chat_room_'. SafeInput($SQL, $_GET['id']). '/';
        $rfs = glob($path. 'clipboard_'. $user_id. '*');
        foreach($rfs as $rf){ unlink($rf); }
        if(isset($_FILES['clipboard'])){ $data = save_clipboard_file($user_id, $path); }
        else if(isset($_POST['clipboard'])){ $data = save_clipboard_url($user_id, $path); }
        echo json_encode($data);
    }

    if(isset($_GET['post_message']) && isset($_GET['id'])){ echo json_encode(post_message($SQL, $chatSQL, $user_id)); }

}

// ---------------- GET

if(isset($_SESSION['user_id'])){

    $user_id = $_SESSION['user_id'];

    if(isset($_GET['get_all_conversations'])){
        $data = array();
        $st = 0;
        $subject = '';
        if(isset($_GET['subject'])){ $subject = "AND subject LIKE '%".SafeInput($SQL, $_GET['subject'])."%'"; }
        $limit = 5;
        if(isset($_GET['limit'])){ $limit = SafeInput($SQL, $_GET['limit']); }

        $A = $SQL->query("SELECT conversation_id, subject, conversation_time FROM conversation_user
        LEFT JOIN conversation ON id = conversation_id
        WHERE conversation_user = '$user_id' $subject ORDER BY conversation_time DESC LIMIT $limit");
        while ($B = $A->fetch_row()){
            $data[$st]['id'] = $B[0];
            $data[$st]['subject'] = $B[1];
            $data[$st]['time'] = $B[2];
            $st++;
        }

        echo json_encode($data);
    }

    if(isset($_GET['find_conversation'])){
        $module = SafeInput($SQL, $_GET['module']);
        $row = SafeInput($SQL, $_GET['row']);
        $A = $SQL->query("SELECT id FROM conversation WHERE module = '$module' AND `row` = '$row' LIMIT 1");
        if($A->num_rows == 1){while ($B = $A->fetch_row()){ echo json_encode($B[0]); }}
        else{ echo json_encode(false); }
    }

    if(isset($_GET['load_conversation'])){
        $data = array();
        $id = SafeInput($SQL, $_GET['id']);

        $A = $SQL->query("SELECT id,subject,module,`row`,conversation_time,admin FROM conversation WHERE id = '$id' LIMIT 1");
        while ($B = $A->fetch_row()){
            $data['id'] = $B[0];
            $data['subject'] = $B[1];
            $data['module'] = $B[2];
            $data['row'] = $B[3];
            $data['conversation_time'] = $B[4];
            $data['admin'] = $B[5];
        }

        if($data['module'] != ''){
            $module = $data['module'];
            $module_id = $module. '_id';
            $A = $SQL->query("SELECT name FROM module WHERE module = '$module' LIMIT 1");
            while ($B = $A->fetch_row()){ $data['module_name'] = $B[0]; }
        }

        if(isset($data['module_name']) && $data['row'] != 0){
            $row = $data['row'];
            $data['row_data'] = '';
            $arr = array();
            $A = $SQL->query("SELECT column_id FROM module_columns WHERE module = '$module' AND type = 'VARCHAR' AND list = 'PRIMARY' AND mandatory = 1");
            while ($B = $A->fetch_row()){ array_push($arr, $B[0]); }
            $count = count($arr);
            if($count != 0){
                $arr = implode(',', $arr);
                $A = $SQL->query("SELECT $arr FROM $module WHERE $module_id = '$row' LIMIT 1");
                $arr = array();
                while ($B = $A->fetch_row()){
                    for($i=0; $i<$count; $i++){ array_push($arr, $B[$i]); }
                }
                $data['row_data'] = implode(', ', $arr);
            }
        }

        $check_user_access = 0;
        $arr = array(); $i = 0;
        $A = $SQL->query("SELECT user_id, user_username FROM conversation_user
        LEFT JOIN user ON user_id = conversation_user
        WHERE conversation_id = '$id'");
        while ($B = $A->fetch_row()){
            if($user_id == $B[0]){ $check_user_access++; }
            $arr[$i]['user_id'] = $B[0];
            $arr[$i]['username'] = $B[1];
            $i++;
        }
        $data['all_users'] = $arr;
        if($check_user_access == 0){ unset($data['id']); }

        echo json_encode($data);
    }

    if(isset($_GET['load_old_messages'])){
        $data = array();
        $id = SafeInput($SQL, $_GET['id']);
        $time = SafeInput($SQL, $_GET['time']);
        $st = 0;

        $A = $chatSQL->query("SELECT s.message_time,s.message_user,s.user_username,s.user_avatar,s.message,s.attachment FROM
        (
            SELECT message_time,message_user,user_username,user_avatar,message,attachment 
            FROM ".$GLOBALS['CHAT']['DB'].".chat_room_$id
            LEFT JOIN $SQL_db.user ON user_id = message_user
            WHERE message_time < '$time' ORDER BY message_time DESC LIMIT 20
        ) AS s
        ORDER BY s.message_time ASC");
        while ($B = $A->fetch_row()){
            $data[$st]['time'] = $B[0];
            $data[$st]['user'] = $B[1];
            $data[$st]['username'] = $B[2];
            $data[$st]['avatar'] = $B[3];
            $data[$st]['message'] = $B[4];
            $data[$st]['attachment'] = $B[5];
            $st++;
        }

        echo json_encode($data);
    }

    if(isset($_GET['load_new_messages'])){
        $data = array();
        $id = SafeInput($SQL, $_GET['id']);
        $time = SafeInput($SQL, $_GET['time']);
        $st = 0;

        $A = $chatSQL->query("
        SELECT message_time,message_user,user_username,user_avatar,message,attachment 
        FROM ".$GLOBALS['CHAT']['DB'].".chat_room_$id
        LEFT JOIN $SQL_db.user ON user_id = message_user
        WHERE message_time > '$time' 
        ORDER BY message_time ASC");
        if($A){while ($B = $A->fetch_row()){
            $data[$st]['time'] = $B[0];
            $data[$st]['user'] = $B[1];
            $data[$st]['username'] = $B[2];
            $data[$st]['avatar'] = $B[3];
            $data[$st]['message'] = $B[4];
            $data[$st]['attachment'] = $B[5];
            $st++;
        }}

        echo json_encode($data);
    }

    if(isset($_GET['check_voicecall_sql'])){
        $A = $SQL->query("SELECT * FROM information_schema.tables WHERE table_schema = '$SQL_db' AND table_name = 'conversation_voicecall' LIMIT 1");
        if($A->num_rows == 0){
            $A = $SQL->query("CREATE TABLE conversation_voicecall
            (
                conversation_id INT(100) UNSIGNED, INDEX(conversation_id), 
                FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE,
                phone INT(100)
            )
            CHARACTER SET utf8 COLLATE utf8_general_ci");
        }
        echo json_encode(array());
    }

}
?>