<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
if(isset($GLOBALS["config"]["API"]["twilioID"]) && isset($GLOBALS["config"]["API"]["twilioToken"]) && isset($GLOBALS["config"]["API"]["twilioPhone"])):

$twilioID = $GLOBALS["config"]["API"]["twilioID"];
$twilioToken = $GLOBALS["config"]["API"]["twilioToken"];
$twilioPhone = $GLOBALS["config"]["API"]["twilioPhone"];

if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){
    
    if(isset($_GET['send_SMS'])){
        $url = "https://api.twilio.com/2010-04-01/Accounts/$twilioID/Messages";
        $data = array (
            'From' => $twilioPhone,
            'To' => SafeInput($SQL, $_POST['to']),
            'Body' => SafeInput($SQL, $_POST['text']),
        );
        $post = http_build_query($data);
        $x = curl_init($url);
        curl_setopt($x, CURLOPT_POST, true);
        curl_setopt($x, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($x, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($x, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($x, CURLOPT_USERPWD, "$twilioID:$twilioToken");
        curl_setopt($x, CURLOPT_POSTFIELDS, $post);
        $y = curl_exec($x);
        curl_close($x);
        echo json_encode(simplexml_load_string($y));
    }

}

endif;
?>