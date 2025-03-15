<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

include($_SERVER['DOCUMENT_ROOT'].'/crm/php/SQL/globals.php');
require $GLOBALS['MAP']['HOME'].'PHPMailer/src/Exception.php';
require $GLOBALS['MAP']['HOME'].'PHPMailer/src/PHPMailer.php';
require $GLOBALS['MAP']['HOME'].'PHPMailer/src/SMTP.php';

class smtpObj{
    public $acc;
    public $port;
    public $flag;
    public $username;
    public $from;
    public $reply;
    public $replyName;
    public $pass;
    public $path;
    public $saveEmail;
    public $connected;
}

function connect_to_smtp($SQL, $user_id){
    $smtp = new smtpObj();
    $smtp->connected = false;

    $A = $SQL->query("SELECT email_accounts_smtp, email_accounts_smtp_port, email_accounts_smtp_flag, 
    email_accounts_email, email_accounts_password, email_accounts_from, email_accounts_reply, email_accounts_replyname,
    email_accounts_save_send_email
    FROM email_accounts WHERE email_accounts_user = '$user_id' LIMIT 1");
    if($A->num_rows == 1){
        while ($B = $A->fetch_row()){
            $smtp->acc = $B[0];
            $smtp->port = $B[1];
            $smtp->flag = $B[2];
            $smtp->username = $B[3];
            $smtp->pass = $B[4];
            $smtp->from = $B[5];
            if($smtp->from == ''){ $smtp->from = $smtp->username; }
            $smtp->reply = $B[6];
            $smtp->replyName = $B[7];
            if($smtp->replyName == ''){ $smtp->replyName = $smtp->reply; }

            $path = $_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/';
            if(!is_dir($path)){ mkdir($path); }
            $path .= 'mail_rooms/';
            if(!is_dir($path)){ mkdir($path); }
            $path .= 'mail_room_'. $user_id. '/';
            if(!is_dir($path)){ mkdir($path); }
            $smtp->path = $path;
            
            $smtp->saveEmail = true;
            if($B[8] != 1){ $smtp->saveEmail = false; }
            $smtp->connected = true;
            removeOldAttachments($smtp->path, $user_id);
        }
    }

    return $smtp;
}

class emailSendObj{
    public $addAddress;
    public $addAddressType;
    public $forwardFile;
    public $forwardFileName;
    public $subject;
    public $body;
    public $err;
}

function debugSendEmailData($data){
    $mailData = new emailSendObj();
    $mailData->err = false;
    if(isset($data['addAddress'])){ $mailData->addAddress = $data['addAddress']; }else{ $mailData->err = true; }
    if(isset($data['addAddressType'])){ $mailData->addAddressType = $data['addAddressType']; }else{ $mailData->err = true; }

    $mailData->forwardFile = array();
    if(isset($data['forwardFile'])){ $mailData->forwardFile = $data['forwardFile']; }
    $mailData->forwardFileName = array();
    if(isset($data['forwardFileName'])){ $mailData->forwardFileName = $data['forwardFileName']; }

    if(isset($data['subject'])){ $mailData->subject = $data['subject']; }else{ $mailData->err = true; }
    if(isset($data['body'])){ $mailData->body = $data['body']; }else{ $mailData->err = true; }
    return $mailData;
}

function uploadNewAttachments($path){
    $attachmentErr = 0;
    $addAttachment = array();
    $addAttachmentName = array();
    if($_FILES){foreach($_FILES as $column => $value){
        if(!is_array($value['tmp_name'])){ continue; }
        for($i=0; $i<count($value['tmp_name']); $i++){
            if($value['tmp_name'][$i] == ''){ continue; }
            $oldName = $value['name'][$i];
            $tmp_name = $value['tmp_name'][$i];
            $fileinfo = pathinfo($oldName);
            $newName = 'temp_file_'. $i. '.'. $fileinfo['extension'];
            if(move_uploaded_file($tmp_name, $path. $newName)){
                array_push($addAttachment, $path. $newName);
                array_push($addAttachmentName, $oldName);
            }
            else{ $attachmentErr++; }
        }
    }}
    if($attachmentErr != 0){ return false; }
    return [true, $addAttachment, $addAttachmentName];
}

function removeOldAttachments($path, $user_id){
    $scan = scandir($path);
    for($i=0; $i<count($scan); $i++){
        if(strpos($scan[$i], 'temp_file_') !== false){ unlink($path. $scan[$i]); }
    }
}

function runPHPMailer($SQL, $smtp, $mailData, $addAttachment = array(), $addAttachmentName = array()){
    $mail = new PHPMailer(true);
    try{
        // $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        $mail->SMTPDebug = 0; 
        $mail->isSMTP();
        $mail->Host       = $smtp->acc;
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtp->username;
        $mail->Password   = $smtp->pass;
        $mail->CharSet    = 'UTF-8';
        
        // Enable implicit TLS encryption
        if($smtp->flag == 'STARTTLS'){ $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; }
        else{ $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; }    
        $mail->Port = $smtp->port;

        $mail->setFrom($smtp->username, $smtp->from);
        if($smtp->reply != ''){ $mail->AddReplyTo($smtp->reply, $smtp->replyName); }

        // Recipients
        for($i=0; $i<count($mailData->addAddress); $i++){
            $addAddress = SafeInput($SQL, $mailData->addAddress[$i]);
            if($addAddress != ''){
                $addAddressType = $mailData->addAddressType[$i];
                if($addAddressType == 'CC'){ $mail->addCC($addAddress); }
                else if($addAddressType == 'BCC'){ $mail->addBCC($addAddress); }
                else{ $mail->addAddress($addAddress); }
            }
        }

        // Attachments
        if(is_array($addAttachment)){for($i=0; $i<count($addAttachment); $i++){ $mail->addAttachment($addAttachment[$i], $addAttachmentName[$i]); }}
        for($i=0; $i<count($mailData->forwardFile); $i++){
            $docPath = $smtp->path;
            if(isset($_POST['custom_file_path'])){ $docPath = $_SERVER['DOCUMENT_ROOT'].$_POST['custom_file_path']; }
            $mail->addAttachment($docPath.$mailData->forwardFile[$i], $mailData->forwardFileName[$i]);
        }

        // Content
        $mail->isHTML(true);
        $subject = SafeInput($SQL, $mailData->subject);
        $mail->Subject = $subject;
        $mail->Body    = $mailData->body;
        $mail->AltBody = SafeInput($SQL, $mailData->body);

        $mail->send();
    }
    catch(Exception $e){ return ['error' => $mail->ErrorInfo]; }
    return 'OK';
}

function saveSendEmailToSQL($mailSQL, $user_id, $smtp, $mailData, $addAttachment, $addAttachmentName){
    if(!$smtp->saveEmail){ return; }
    // GET DATA FOR SQL
    date_default_timezone_set("UTC");
    $uid = time();
    $udate = $uid;
    $subject = SafeInput($mailSQL, $mailData->subject);
    $mail_to = SafeInput($mailSQL, implode(',', $mailData->addAddress));
    $htmlmsg = SafeInput($mailSQL, $mailData->body, true);

    // TAKE TEMP ATTACHMENTS AND PUT THEM INTO EMAIL SQL
    $attachments = array();
    $time = time();
    for($i=0; $i<count($addAttachment); $i++){
        $fileinfo = pathinfo($addAttachment[$i]);
        $newFileName = $uid.'_'.$time.'.'.$fileinfo['extension'];
        rename($addAttachment[$i], $smtp->path. $newFileName);
        array_push($attachments, $newFileName. ','. $addAttachmentName[$i]. ','. filesize($smtp->path. $newFileName));
        $time++;
    }
    if(isset($mailData->forwardFile)){
        $docPath = $smtp->path;
        if(isset($_POST['custom_file_path'])){ $docPath = $_SERVER['DOCUMENT_ROOT'].$_POST['custom_file_path']; }
        for($i=0; $i<count($mailData->forwardFile); $i++){
            $fileinfo = pathinfo($mailData->forwardFile[$i]);
            $newFileName = $uid.'_'.$time.'.'.$fileinfo['extension'];
            copy($docPath.$mailData->forwardFile[$i], $smtp->path.$newFileName);
            array_push($attachments, $newFileName. ','. $mailData->forwardFileName[$i]. ','. filesize($smtp->path. $newFileName));
        }
    }
    $attachments = implode('|', $attachments);

    $A = $mailSQL->query("INSERT INTO mail_room_$user_id (email,uid,udate,mail_from,mail_to,subject,msg,attachments,new) 
    VALUES ('$smtp->username','$uid','$udate','0','$mail_to','$subject','$htmlmsg','$attachments','0')");
}

function send_email($SQL, $mailSQL, $user_id){
    $smtp = connect_to_smtp($SQL, $user_id);
    if(!$smtp->connected){ return ['error' => slovar('Access_denied')]; }

    list($uploadAttachmentSuccess, $addAttachment, $addAttachmentName) = uploadNewAttachments($smtp->path);
    if(!$uploadAttachmentSuccess){ return ['error' => slovar('File_error')]; }

    $mailData = debugSendEmailData($_POST);
    if($mailData->err){ return ['error' => slovar('data_error')]; }
    
    $PHPMailerStatus = runPHPMailer($SQL, $smtp, $mailData, $addAttachment, $addAttachmentName);
    if($PHPMailerStatus == 'OK'){
        saveSendEmailToSQL($mailSQL, $user_id, $smtp, $mailData, $addAttachment, $addAttachmentName);
        return [];
    }
    else{ return ['error' => $PHPMailerStatus]; }
}

?>