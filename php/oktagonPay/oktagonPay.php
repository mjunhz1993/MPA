<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function oktagon_pay_key(){
    if(!isset($GLOBALS['config']['stripeSK'])){ return false; }
    return $GLOBALS['config']['stripeSK'];
}

function oktagon_pay_intent($amount, $currency){
    $key = oktagon_pay_key();
    if(!$key){ return ['error' => 'Intent_key_error']; }
    $d = ['amount' => $amount, 'currency' => $currency];
    $ch = curl_init('https://api.stripe.com/v1/payment_intents');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($d));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $key,
        'Content-Type: application/x-www-form-urlencoded',
    ]);
    
    $response = json_decode(curl_exec($ch));
    if(curl_errno($ch) || curl_getinfo($ch, CURLINFO_HTTP_CODE) !== 200) { return ['error' => 'Intent_error']; }
    return $response;
}

if(isset($_GET['oktagon_pay_intent'])){ echo json_encode(oktagon_pay_intent($_POST['amount'], $_POST['currency'])); }
if(isset($_GET['oktagon_pay_key'])){ echo json_encode($GLOBALS['config']['stripePK']); }
?>