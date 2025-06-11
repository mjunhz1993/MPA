<?php
class imapObj{
    public $connected;
    public $account;
    public $current_udate;
    public $current_uid;
    public $conn;
}

function connect_to_imap($SQL, $user_id){
    date_default_timezone_set("UTC");
    $imap = new imapObj();
    $imap->connected = false;
    $A = $SQL->query("SELECT email_accounts_email, email_accounts_password, email_accounts_imap, email_accounts_imap_port, email_accounts_imap_flag,
    email_accounts_udate, email_accounts_uid
    FROM email_accounts WHERE email_accounts_user = '$user_id' LIMIT 1");
    if($A->num_rows == 1){
        while ($B = $A->fetch_row()){
            $imap->connected = true;
            $imap->account = $B[0];
            $imap->current_udate = $B[5];
            $imap->current_uid = $B[6];
            $flag = '/imap/ssl';
            if($B[4] != ''){ $flag = $B[4]; }
            $imap->conn = imap_open('{'. $B[2]. ':'. $B[3]. $flag. '}INBOX', $imap->account, $B[1]);
        }
    }
    return $imap;
}

function SearchForEmailsByDateTillToday($imap_conn, $udate){
    $since = date('d F Y', ($udate - 86400));
    $before = date('d F Y', (time() + 86400));
    return imap_search($imap_conn, 'SINCE "'. $since. '" BEFORE "'. $before. '"', SE_UID);
}

function SearchForEmailsByDate($imap_conn, $udate){
    return imap_search($imap_conn, 'ON "'. date('d F Y', $udate). '"', SE_UID);
}

function SearchForNewEmails($imap_conn){
    return imap_search($imap_conn, 'UNSEEN', SE_UID);
}

function GetEmailByUID($imap_conn, $uid){
    return imap_fetch_overview($imap_conn, $uid, FT_UID)[0];
}

function GetLastEmail($imap_conn){
    return imap_fetch_overview($imap_conn, imap_check($imap_conn)->Nmsgs)[0];
}

function saveEmailData($mailSQL, $user_email_table, $email, $uid){
    global $htmlmsg,$udate,$subject,$mail_from,$mail_to;
    // SAVE EMAIL
    $A = $mailSQL->query("INSERT INTO $user_email_table (email,uid,udate,mail_from,mail_to,subject,msg,attachments) 
    VALUES ('$email','$uid','$udate','$mail_from','$mail_to','$subject','$htmlmsg','')");
    if(!$A){
        // IF E-MAIL ERROR - TRY UTF-8 ENCODING
        $subject = utf8_encode($subject);
        $htmlmsg = utf8_encode($htmlmsg);
        $A = $mailSQL->query("INSERT INTO $user_email_table (email,uid,udate,mail_from,mail_to,subject,msg,attachments) 
        VALUES ('$email','$uid','$udate','$mail_from','$mail_to','$subject','$htmlmsg','')");
    }
    if(!$A){
        // IF E-MAIL ERROR - SQL ENCODE
        $htmlmsg = SafeInput($mailSQL, $htmlmsg);
        $A = $mailSQL->query("INSERT INTO $user_email_table (email,uid,udate,mail_from,mail_to,subject,msg,attachments) 
        VALUES ('$email','$uid','$udate','$mail_from','$mail_to','$subject','$htmlmsg','')");
    }
    if(!$A){ return false; }else{ return true; }
}

function updateLastEmailUID($SQL, $user_id, $uid){
    global $udate;
    $A = $SQL->query("UPDATE email_accounts SET email_accounts_udate = '$udate', email_accounts_uid = '$uid' WHERE email_accounts_user = '$user_id' LIMIT 1");
}

function debugEmailData($SQL,$mbox,$mid) {
    // input $mbox = IMAP stream, $mid = message id
    // output all the following:
    global $charset,$htmlmsg,$plainmsg,$attachments,$udate,$subject,$mail_from,$mail_to;
    $htmlmsg = $plainmsg = $charset = '';
    $attachments = array();

    // HEADER
    // $h = imap_header($mbox,$mid);
    $h = imap_headerinfo($mbox,$mid);
    $udate = $h->udate;
    $mail_from = $h->from[0]->mailbox. '@'. $h->from[0]->host;
    $mail_to = array();
    if(isset($h->to)){ for($i=0; $i<count($h->to); $i++){ array_push($mail_to, $h->to[$i]->mailbox. '@'. $h->to[$i]->host); } }
    if(isset($h->cc)){ for($i=0; $i<count($h->cc); $i++){ array_push($mail_to, $h->cc[$i]->mailbox. '@'. $h->cc[$i]->host); } }
    $mail_to = implode(',', $mail_to);
	$subject = SafeInput($SQL, mb_decode_mimeheader($h->subject));

    // BODY
    $s = imap_fetchstructure($mbox,$mid);
    if (!$s->parts)  // simple
        getpart($mbox,$mid,$s,0);  // pass 0 as part-number
    else {  // multipart: cycle through each part
        foreach ($s->parts as $partno0=>$p)
            getpart($mbox,$mid,$p,$partno0+1);
    }

    $htmlmsg = SafeInput($SQL, $htmlmsg, true);
    if($htmlmsg == ''){ $htmlmsg = SafeInput($SQL, $plainmsg); }
}

function getpart($mbox,$mid,$p,$partno) {
    // $partno = '1', '2', '2.1', '2.1.3', etc for multipart, 0 if simple
    global $htmlmsg,$plainmsg,$charset,$attachments;

    // DECODE DATA
    $data = ($partno)?
        imap_fetchbody($mbox,$mid,$partno):  // multipart
        imap_body($mbox,$mid);  // simple
    // Any part may be encoded, even plain text messages, so check everything.
    if($p->encoding==4){ $data = quoted_printable_decode($data); }
    else if ($p->encoding==3){ $data = base64_decode($data); }

    // PARAMETERS
    // get all parameters, like charset, filenames of attachments, etc.
    $params = array();
    if ($p->parameters)
        foreach ($p->parameters as $x)
            $params[strtolower($x->attribute)] = $x->value;
    if (isset($p->dparameters))
        foreach ($p->dparameters as $x)
            $params[strtolower($x->attribute)] = $x->value;

    // ATTACHMENT
    // Any part with a filename is an attachment,
    // so an attached text file (type 0) is not mistaken as the message.
    if (isset($params['filename']) || isset($params['name'])) {
        // filename may be given as 'Filename' or 'Name' or both
        $filename = $params['filename'] ?? $params['name'];
        // filename may be encoded, so see imap_mime_header_decode()
        $attachments[$filename] = $data;  // this is a problem if two files have same name
    }

    // TEXT
    if ($p->type==0 && $data) {
        $charset = $params['charset'];
        if(strtolower($charset) == 'iso-8859-2'){ $data = iconv('ISO-8859-2', 'UTF-8', $data); }
        if (strtolower($p->subtype) == 'plain'){ $plainmsg .= trim($data) ."\n\n"; }
        else{ $htmlmsg .= $data ."<br><br>"; }
    }

    // EMBEDDED MESSAGE
    // Many bounce notifications embed the original message as type 2,
    // but AOL uses type 1 (multipart), which is not handled here.
    // There are no PHP functions to parse embedded messages,
    // so this just appends the raw source to the main message.
    elseif ($p->type==2 && $data) {
        $plainmsg .= $data."\n\n";
    }

    // SUBPART RECURSION
    if (isset($p->parts)) {
        foreach($p->parts as $partno0=>$p2){ getpart($mbox,$mid,$p2,$partno.'.'.($partno0+1)); }
    }
}

function saveAttachments($mailSQL, $user_id, $mail){
    global $attachments;
    $path = $_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/mail_rooms/mail_room_'. $user_id. '/';
    $tstamp = time();
    $fileCount = 0;
    $SQLdata = array();

	foreach($attachments as $key => $value){
        $key = mb_decode_mimeheader($key);
        $fileinfo = pathinfo($key);
        $newFileName = $mail->uid. '_'. $tstamp. '.'. $fileinfo['extension'];
        $fp = fopen($path. $newFileName, "w");
        fwrite($fp,$value);
        fclose($fp);
        $key = str_replace(array(',','|',"'",'"'), '', $key);
        array_push($SQLdata, $newFileName.','.$key. ','. filesize($path. $newFileName));
        $tstamp++;
        $fileCount++;
    }
    if($fileCount != 0){
        $SQLdata = implode('|', $SQLdata);
        $A = $mailSQL->query("
            UPDATE mail_room_$user_id 
            SET attachments='$SQLdata' 
            WHERE uid = '$mail->uid' AND udate = '$mail->udate'
            LIMIT 1");
        return $SQLdata;
    }
    else{ return false; }
}

function flagEmailAsSeen($imap_conn, $uid){
    return imap_setflag_full($imap_conn, $uid, "\\Seen", ST_UID);
}

function get_new_emails($SQL, $mailSQL, $user_id){
    $user_email_table = 'mail_room_'. $user_id;
    global $charset,$htmlmsg,$plainmsg,$attachments,$udate,$subject,$mail_from,$mail_to;
    $data = array();
    $error_emails = 0;
    $imap = connect_to_imap($SQL, $user_id);
    if(!$imap->connected){ return ['error' => 'Connection_faled']; }

    if($imap->current_udate != 0 && $imap->current_uid != 0){
        $lastEmail_uid = 0;
        $max_emails_per_cycle = 4;
        $inbox = SearchForEmailsByDateTillToday($imap->conn, $imap->current_udate);
        foreach($inbox as $uid){
            if($uid <= $imap->current_uid){ continue; }
            if($max_emails_per_cycle == 0){ continue; }
            $lastEmail_uid = $uid;
            $max_emails_per_cycle--;
            $mail = GetEmailByUID($imap->conn, $uid);
            debugEmailData($SQL, $imap->conn, $mail->msgno);
            if(!saveEmailData($mailSQL, $user_email_table, $imap->account, $mail->uid)){ $error_emails++; }
            else{ saveAttachments($mailSQL, $user_id, $mail); }
        }
        if($lastEmail_uid != 0){ updateLastEmailUID($SQL, $user_id, $mail->uid); }
        if($max_emails_per_cycle == 0){ $data['GO_AGAIN'] = 1; }
    }
    else{
        $mail = GetLastEmail($imap->conn);
        debugEmailData($SQL, $imap->conn, $mail->msgno);
        if(!saveEmailData($mailSQL, $user_email_table, $imap->account, $mail->uid)){ $error_emails++; }
        else{
            saveAttachments($mailSQL, $user_id, $mail);
            updateLastEmailUID($SQL, $user_id, $mail->uid);
        }
    }

    if($error_emails != 0){ 
        $data['error'][0] = '('. $error_emails. ') '. slovar('Emails_not_downloaded');
        $data['error'][1] = $mailSQL->error;
    }
    return $data;
}

?>