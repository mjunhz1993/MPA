<?php
function check_if_email_room_exists($SQL, $db, $user_id, $mailSQL, $user_email_table){
    $A = $SQL->query("SELECT email_accounts_body FROM email_accounts WHERE email_accounts_user = '$user_id' LIMIT 1");
    if($A->num_rows == 0){ return ['error' => slovar('Access_denied')]; }
    while ($B = $A->fetch_row()){ $data['body'] = $B[0]; }

    $path = $_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/';
    if(!is_dir($path)){ mkdir($path); }
    $path .= 'mail_rooms/';
    if(!is_dir($path)){ mkdir($path); }
    $path .= 'mail_room_'. $user_id. '/';
    if(!is_dir($path)){ mkdir($path); }

    $A = $mailSQL->query("SELECT * FROM information_schema.tables WHERE table_schema = '".$GLOBALS['MAIL']['DB']."' AND table_name = '$user_email_table' LIMIT 1");
    if($A->num_rows != 0){ return $data; }
    
    $mailSQL->query("CREATE TABLE $user_email_table
    (
        email VARCHAR(120), FOREIGN KEY (email) REFERENCES $db.email_accounts(email_accounts_email),
        uid INT(255), INDEX(uid),
        udate INT(255),
        mail_from VARCHAR(255), INDEX(mail_from),
        mail_to TEXT,
        subject TEXT, FULLTEXT(subject),
        msg TEXT,
        attachments TEXT,
        new INT(1) DEFAULT 1
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");

    return $data;
}

function get_emails($mailSQL, $user_email_table){
    $uid = intval(SafeInput($mailSQL, $_GET['uid'] ?? 0));
    $type = SafeInput($mailSQL, $_GET['type']);
    $dir = intval(SafeInput($mailSQL, $_GET['dir']));
    $search = SafeInput($mailSQL, $_GET['search']);
    $LIMIT = "LIMIT 10";
    $st = 0;

    $WHERE = '';
    if($type == 'NEW'){if($uid != 0){ $WHERE = "WHERE uid > '$uid' "; $LIMIT = ""; }}
    else if($type == 'OLD'){ $WHERE = "WHERE uid < '$uid' "; }
    else{
        if($search != ''){ $WHERE = "WHERE (subject LIKE '%$search%' OR mail_from LIKE '%$search%') "; }
    }

    if($WHERE == ''){ $WHERE = "WHERE "; }else{ $WHERE .= "AND "; }
    if($dir == 0){ $WHERE .= "mail_from != '0' "; }
    else{ $WHERE .= "mail_from = '0' "; }

    $A = $mailSQL->query("SELECT uid,udate,mail_from,mail_to,subject,attachments,new,email FROM $user_email_table $WHERE ORDER BY uid DESC $LIMIT");
    $data = array();
    while ($B = $A->fetch_row()){
        $data[$st]['uid'] = $B[0];
        $data[$st]['udate'] = date('Y-m-d H:i:s', $B[1]);
        if($B[2] != '0'){ $data[$st]['mail_from'] = $B[2]; }else{ $data[$st]['mail_from'] = $B[7]; }
        $data[$st]['mail_to'] = $B[3];
        $data[$st]['subject'] = $B[4];
        $data[$st]['attachments'] = $B[5];
        $data[$st]['new'] = $B[6];
        $st++;
    }
    return $data;
}

function get_email($mailSQL, $user_email_table){
    $uid = intval(SafeInput($mailSQL, $_GET['uid'] ?? ''));
    $A = $mailSQL->query("SELECT udate,mail_from,mail_to,subject,msg,attachments,new,email FROM $user_email_table WHERE uid='$uid' LIMIT 1");
    $data = array();
    if($A->num_rows == 0){ return ['error' => slovar('Access_denied')]; }
    while ($B = $A->fetch_row()){
        $data['uid'] = $uid;
        $data['udate'] = date('Y-m-d H:i:s', $B[0]);
        if($B[1] != '0'){ $data['mail_from'] = $B[1]; }else{ $data['mail_from'] = $B[7]; }
        $data['mail_to'] = $B[2];
        $data['subject'] = $B[3];
        $data['msg'] = $B[4];
        $data['attachments'] = $B[5];
        if($B[6] == 1){ $mailSQL->query("UPDATE $user_email_table SET new=0 WHERE uid='$uid' LIMIT 1"); }
    }
    return $data;
}

function delete_email($mailSQL, $user_email_table, $uid){
	$A = $mailSQL->query("SELECT attachments FROM $user_email_table WHERE uid = '$uid' LIMIT 1");
    while ($B = $A->fetch_row()){
        $path = $_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/mail_rooms/'.$user_email_table.'/';
        $attachments = explode('|', $B[0]);
        for($i=0; $i<count($attachments); $i++){
            $att = explode(',', $attachments[$i]);
            if($att[0] != ''){ unlink($path. $att[0]); }
        }
        if($mailSQL->query("DELETE FROM $user_email_table WHERE uid = '$uid' LIMIT 1")){ return true; }
    }
    return false;
}
?>