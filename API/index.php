<?php
header('Content-Type: application/json');
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/connect.php');

function grabToken($header){
    if(!isset($header['Authorization'])){ return false; }
    if(preg_match('/Basic\s+(.*)$/i', $header['Authorization'], $matches)) { return $matches[1]; }
    return false;
}
function validToken($SQL, $token, $header){
    $A = $SQL->query("SELECT username,password FROM api WHERE ip = '".$header['ip']."' LIMIT 1");
    if(!$A){ return false; }
    while($B = $A->fetch_row()){
        if($token == base64_encode($B[0].':'.$B[1])){ return true; }
    }
    return false;
}

function rateLimit($SQL, $token, $header){
    $A = $SQL->query("SELECT ratelimit,currentrate FROM api WHERE ip = '".$header['ip']."' LIMIT 1");
    if(!$A){ return false; }
    while($B = $A->fetch_row()){
        if(time() < $B[0] + $B[1]){ return false; }
        $SQL->query("UPDATE api SET currentrate = '".time()."' WHERE ip = '".$header['ip']."' LIMIT 1");
        return true;
    }
    return false;
}

function api_event($file){
    if(!isset($file)){ return false; }
    $file = $_SERVER['DOCUMENT_ROOT'].'/crm/php/downloads/api_'.$file.'.php';
    if(!file_exists($file)){ return false; }
    return include($file);
}

function api($SQL){
    if($_SERVER['REQUEST_METHOD'] !== 'POST'){ return api_err('No_POST_request'); }
    $header = getallheaders();
    $header['ip'] = safeInput($SQL, $_SERVER['REMOTE_ADDR']);
    $token = grabToken($header);
    if(!$token){ return api_err('No_token'); }
    if(!validToken($SQL, $token, $header)){ return api_err('Wrong_token_for: '.$header['ip']); }
    if(!rateLimit($SQL, $token, $header)){ return api_err('Rate_limit_exceeded'); }
    if(!isset($header['X-event'])){ return api_err('No_event_selected'); }
    if(!$_POST){ return api_err('No_POST_data'); }
    if(!api_event($header['X-event'])){ return api_err('Event_does_not_exist'); }
    if(!function_exists('api_run')){ return api_err('No_run_function'); }
    return api_run($SQL);
}

function api_err($str){
    http_response_code(405);
    return ["error" => $str];
}

echo json_encode(api($SQL));
?>