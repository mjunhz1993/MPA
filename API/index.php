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

function API_grabAuthorization($header){
    if(!isset($header['Authorization'])){ return false; }
    if(preg_match('/Basic\s+(.*)$/i', $header['Authorization'], $matches)){ return $matches[1]; }
    return false;
}

function API_authorization($SQL, $Authorization, $header){
    $A = $SQL->query("SELECT * FROM api WHERE ip = '".$header['ip']."' LIMIT 1");
    if(!$A){ return false; }
    while($B = $A->fetch_assoc()){
        if($Authorization == base64_encode($B['username'].':'.$B['password'])){ return $B; }
    }
    return false;
}

function API_rateLimit($SQL, $thisUser, $header){
    if(time() < $thisUser['currentrate'] + $thisUser['ratelimit']){ return false; }
    $SQL->query("UPDATE api SET currentrate = '".time()."' WHERE ip = '".$header['ip']."' LIMIT 1");
    return true;
}

function API_parsePostData(){
    $rawPostData = file_get_contents('php://input');
    if (!empty($rawPostData)) {
        $decodedData = json_decode($rawPostData, true);
        if (json_last_error() === JSON_ERROR_NONE) { $_POST = $decodedData; }
    }
}

function API_event($file){
    if(!isset($file)){ return false; }
    $file = $_SERVER['DOCUMENT_ROOT'].'/crm/php/downloads/api_'.$file.'.php';
    if(!file_exists($file)){ return false; }
    return include($file);
}

function API($SQL){
    if($_SERVER['REQUEST_METHOD'] !== 'POST'){ return API_err('Wrong request method | POST != '.$_SERVER['REQUEST_METHOD']); }
    if(!API_contentLength()){ return API_err('Payload size exceeds 10 MB limit'); }

    $header = getallheaders();
    $header['ip'] = safeInput($SQL, API_getClientIP());
    $Authorization = API_grabAuthorization($header);

    if(!isset($header['event'])){ return API_err('No event selected'); }
    if(!$Authorization){ return API_err('No Authorization data'); }

    $thisUser = API_authorization($SQL, $Authorization, $header);
    if(!$thisUser){ return API_err('Invalid Authorization for: '.$header['ip']); }

    if(!API_rateLimit($SQL, $thisUser, $header)){ return API_err('Rate limit exceeded'); }

    API_parsePostData();

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