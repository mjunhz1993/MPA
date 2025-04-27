<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/connect.php');

function API_XML_init(){
    $doc = new DOMDocument('1.0', 'UTF-8');
    $doc->formatOutput = true;
    $response = $doc->createElement('response');
    $doc->appendChild($response);
    return ['doc' => $doc, 'response' => $response];
}

function API_getClientAcceptType() {
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    if(strpos($accept, 'application/xml') !== false){
        header('Content-Type: application/xml');
        return 'XML';
    }
    header('Content-Type: application/json');
    return 'JSON';
}

function API_contentLength(){ // 10MB
    if (isset($_SERVER['CONTENT_LENGTH']) && $_SERVER['CONTENT_LENGTH'] > (10 * 1024 * 1024)){ return false; }
    return true;
}

function API_getClientIP($SQL, $ip = 'UNKNOWN') {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return safeInput($SQL, $ip);
}

function API_grabAuthorization($header){
    if(!isset($header['Authorization'])){ return false; }
    if(preg_match('/Basic\s+(.*)$/i', $header['Authorization'], $matches)){ return $matches[1]; }
    return false;
}

function API_authorization($SQL, $Authorization, $header){
    $A = $SQL->query("SELECT * FROM api WHERE ip = '{$header['ip']}' LIMIT 1");
    if(!$A){ return false; }
    while($B = $A->fetch_assoc()){
        if($Authorization == base64_encode($B['username'].':'.$B['password'])){ return $B; }
    }
    return false;
}

function API_rateLimit($SQL, $thisUser, $header){
    if(time() < $thisUser['currentrate'] + $thisUser['ratelimit']){ return false; }
    $SQL->query("UPDATE api SET currentrate = '".time()."' WHERE ip = '{$header['ip']}' LIMIT 1");
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
    $file = $_SERVER['DOCUMENT_ROOT']."/crm/php/downloads/api_$file.php";
    if(!file_exists($file)){ return false; }
    return include($file);
}

function API_function_exists(){
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    $funName = 'API_run_JSON';
    if(strpos($accept, 'application/xml') !== false){ $funName = 'API_run_XML'; }
    if(!function_exists($funName)){ return false; }
    return true;
}

function API_init($SQL){
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    if(strpos($accept, 'application/xml') !== false){
        return API_run_XML($SQL, API_XML_init());
    }
    else{
        return json_encode(API_run_JSON($SQL));
    }
}

function API_err($str) {
    http_response_code(405);
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    if(strpos($accept, 'application/xml') !== false){
        $xml = API_XML_init();
        $xml['response']->appendChild($xml['doc']->createElement('error', $str));
        return $xml['doc']->saveXML();
    } else {
        return json_encode(["error" => $str]);
    }
}

function API($SQL){
    $AcceptType = API_getClientAcceptType();
    if($_SERVER['REQUEST_METHOD'] !== 'POST'){ return API_err('Wrong request method | POST != '.$_SERVER['REQUEST_METHOD']); }
    if(!API_contentLength()){ return API_err('Payload size exceeds 10 MB limit'); }

    $header = getallheaders();
    $header['ip'] = API_getClientIP($SQL);

    if(!isset($header['event'])){ return API_err('No event selected'); }

    $Authorization = API_grabAuthorization($header);
    if(!$Authorization){ return API_err('No Authorization data'); }
    $thisUser = API_authorization($SQL, $Authorization, $header);
    if(!$thisUser){ return API_err('Invalid Authorization for: '.$header['ip']); }

    if(!API_rateLimit($SQL, $thisUser, $header)){ return API_err('Rate limit exceeded'); }

    API_parsePostData();

    if(!API_event($header['event'])){ return API_err('Event does not exist'); }
    if(!API_function_exists()){ return API_err("No $AcceptType run function"); }

    return API_init($SQL);
}

echo API($SQL);
?>