<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function generate_jwt($SQL){
    $user_id = $_SESSION['user_id'];
    $A = $SQL->query("SELECT user_username, user_email FROM user WHERE user_id = '$user_id' LIMIT 1");
    if(!$A){ return ['error' => $SQL->error]; }
    while ($B = $A->fetch_assoc()){ $user = $B; }

    function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    $header = json_encode([
        'kid' => $GLOBALS["config"]["API"]["jitsipuk"],
        'typ' => 'JWT',
        'alg' => 'RS256'
    ]);
    $payload = json_encode([
        "aud" => "jitsi",
        "iss" => 'chat',
        "exp" => time() + 7200,
        "nbf" => time() - 10,
        "sub" => $GLOBALS["config"]["API"]["jitsiid"],
        "context" => [
            "features" => [
                "livestreaming" => true,
                "outbound-call" => true,
                "sip-outbound-call" => false,
                "transcription" => true,
                "recording" => true
            ],
            "user" => [
                "hidden-from-recorder" => false,
                "moderator" => safeInput($SQL, $_GET['moderator']),
                "name" => $user['user_username'],
                "id" => $user_id,
                "avatar" => "",
                "email" => $user['user_email']
            ]
        ],
        "room" => "*"
    ]);

    $secretFile = $_SERVER['DOCUMENT_ROOT'].'/crm/static/uploads/'.$GLOBALS["config"]["API"]["jitsiprk"];
    $privateKey = file_get_contents($secretFile);

    $headerEncoded = base64UrlEncode($header);
    $payloadEncoded = base64UrlEncode($payload);
    $signatureBase = $headerEncoded.'.'.$payloadEncoded;

    openssl_sign($signatureBase, $signature, $privateKey, OPENSSL_ALGO_SHA256);
    $signatureEncoded = base64UrlEncode($signature);

    return $signatureBase.'.'.$signatureEncoded;
}

if(isset($_SESSION['user_id'])){
    if(isset($_GET['generate_jwt'])){ echo json_encode(generate_jwt($SQL)); }
}
?>