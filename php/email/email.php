<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('email/SQL'));
include(loadPHP('email/email_functions'));
include(loadPHP('email/get_email'));

if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){
    $user_id = $_SESSION['user_id'];
    $user_email_table = 'mail_room_'. $user_id;
    if(isset($_GET['delete_email'])){ 
        echo json_encode(delete_email($mailSQL, $user_email_table, intval(SafeInput($SQL, $_POST['uid']))));
    }

}

if(isset($_SESSION['user_id'])){
    $user_id = $_SESSION['user_id'];
    $user_email_table = 'mail_room_'.$user_id;
    if(isset($_GET['mail_room']) && $_GET['mail_room'] != ''){ $user_email_table = 'mail_room_'.SafeInput($SQL, $_GET['mail_room']); }

    if(isset($_GET['check_if_email_room_exists'])){ echo json_encode(check_if_email_room_exists($SQL, $SQL_db, $user_id, $mailSQL, $user_email_table)); }
    if(isset($_GET['get_new_emails'])){ echo json_encode(get_new_emails($SQL, $mailSQL, $user_id)); }
    if(isset($_GET['get_emails'])){ echo json_encode(get_emails($mailSQL, $user_email_table)); }
    if(isset($_GET['get_email'])){ echo json_encode(get_email($mailSQL, $user_email_table)); }


    // ------------------------------- FOR TESTING !

    if(isset($_GET['get_new_email_test']) && isset($_GET['uid'])){
        $uid = intval(SafeInput($SQL, $_GET['uid']));
        $A = $SQL->query("SELECT email_accounts_email, email_accounts_password, email_accounts_imap, email_accounts_imap_port, email_accounts_imap_flag
        FROM email_accounts WHERE email_accounts_user = '$user_id' LIMIT 1");
        if($A->num_rows == 1){
            while ($B = $A->fetch_row()){
                $email = $B[0];
                $pass = $B[1];
                $imap = $B[2];
                $port = $B[3];
                $imap_flag = '/imap/ssl';
                if($B[4] != ''){ $imap_flag = $B[4]; }
            }
            $imap_conn = imap_open('{'. $imap. ':'. $port. $imap_flag. '}INBOX', $email, $pass);
            $mail = imap_fetch_overview($imap_conn, $uid, FT_UID);
            getEmailData($SQL, $imap_conn, $mail[0]->msgno);
            $htmlmsg = SafeInput($SQL, $htmlmsg, true);
            echo $mail_to;
            //$U = $mailSQL->query("UPDATE $user_email_table SET msg = '$plainmsg' WHERE uid='1' LIMIT 1");
            // foreach($attachments as $key => $value){ echo mb_decode_mimeheader($key); }
        }
    }

}
?>