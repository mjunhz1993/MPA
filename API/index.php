<?php
header('Content-Type: application/json');
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/connect.php');

function API_contentLength(){ // 10MB
    if (isset($_SERVER['CONTENT_LENGTH']) && $_SERVER['CONTENT_LENGTH'] > (10 * 1024 * 1024)){ return false; }
    return true;
}

function API_getClientIP($ip = 'UNKNOWN') {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

function API_grabToken($header){
    if(!isset($header['Authorization'])){ return false; }
    if(preg_match('/Basic\s+(.*)$/i', $header['Authorization'], $matches)){ return $matches[1]; }
    return false;
}

function API_validToken($SQL, $token, $header){
    $A = $SQL->query("SELECT username,password FROM api WHERE ip = '".$header['ip']."' LIMIT 1");
    if(!$A){ return false; }
    while($B = $A->fetch_row()){
        if($token == base64_encode($B[0].':'.$B[1])){ return true; }
    }
    return false;
}

function API_rateLimit($SQL, $token, $header){
    $A = $SQL->query("SELECT ratelimit,currentrate FROM api WHERE ip = '".$header['ip']."' LIMIT 1");
    if(!$A){ return false; }
    while($B = $A->fetch_row()){
        if(time() < $B[0] + $B[1]){ return false; }
        $SQL->query("UPDATE api SET currentrate = '".time()."' WHERE ip = '".$header['ip']."' LIMIT 1");
        return true;
    }
    return false;
}

function API_isJson(){
    if(json_last_error() == JSON_ERROR_NONE){ return true; }
    return false;
}

function API_event($file){
    if(!isset($file)){ return false; }
    $file = $_SERVER['DOCUMENT_ROOT'].'/crm/php/downloads/api_'.$file.'.php';
    if(!file_exists($file)){ return false; }
    return include($file);
}

function API($SQL){
    if($_SERVER['REQUEST_METHOD'] !== 'POST'){ return API_err('No POST request'); }
    if(!API_contentLength()){ return API_err('Payload size exceeds 10 MB limit'); }

    $header = getallheaders();
    $header['ip'] = safeInput($SQL, API_getClientIP());
    $token = API_grabToken($header);
    if(!$token){ return API_err('No token'); }
    if(!isset($header['event'])){ return API_err('No event selected'); }

    if(!API_validToken($SQL, $token, $header)){ return API_err('Invalid token for: '.$header['ip']); }
    if(!API_rateLimit($SQL, $token, $header)){ return API_err('Rate limit exceeded'); }
    if(!$_POST){ return API_err('No POST data'); }
    $_POST = json_decode($_POST);
    if(!API_isJson()){ return API_err('POST data is not JSON'); }
    if(!API_event($header['event'])){ return API_err('Event does not exist'); }
    if(!function_exists('API_run')){ return API_err('No run function'); }
    return API_run($SQL);
}

function API_err($str){
    http_response_code(405);
    return ["error" => $str];
}

echo json_encode(API($SQL));
?>