<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('email/send_email'));
include(loadPHP('auth/slovar'));

function create_default_email_body(){
    $rand = create_rand_string();
    $_SESSION['default_rand_code'] = $rand;
    $t = slovarLocal('email_confirm_body_0');
    $t .= '<br><b style="display:block;padding:10px 0px;font-size:20px;">'.$rand.'</b>';
    return $t;
}

function create_rand_string($length = 5, $randomString = ''){
	$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$charactersLength = strlen($characters);
	for ($i = 0; $i < $length; $i++){
	    $randomString .= $characters[rand(0, $charactersLength - 1)];
	}
	return $randomString;
}

function send_login_rand_email($SQL){
    if(!isset($_SESSION['unknown_client'])){ return false; }
    $username = SafeInput($SQL, $_SESSION['user_username']);

    $A = $SQL->query("SELECT user_email FROM user WHERE user_username = '$username' LIMIT 1");
    if($A->num_rows == 0){ return false; }
    while($B = $A->fetch_row()){ $addAddress = $B[0]; }

	$user_id = $GLOBALS["config"]["crm_email"];
    $smtp = connect_to_smtp($SQL, $user_id);
    if(!$smtp->connected){ return false; }

    $data['addAddress'] = array($addAddress);
    $data['addAddressType'] = array('');
    $data['subject'] = slovarLocal('email_confirm_subject');
    $data['body'] = create_default_email_body();

    $mailData = debugSendEmailData($data);
    if($mailData->err){ return false; }
    
    $PHPMailerStatus = runPHPMailer($SQL, $smtp, $mailData);
    if($PHPMailerStatus == 'OK'){ return true; }
    else{ return false; }
}

echo json_encode(send_login_rand_email($SQL));
?>