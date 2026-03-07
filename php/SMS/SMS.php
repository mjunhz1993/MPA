<?php
if(isset($GLOBALS["config"]["API"]["textbeePhone"]) && isset($GLOBALS["config"]["API"]["textbeeAPI"])):

function SMS($obj)
{
    $device_id = $GLOBALS["config"]["API"]["textbeePhone"];
    $api_key   = $GLOBALS["config"]["API"]["textbeeAPI"];
    $url = "https://api.textbee.dev/api/v1/gateway/devices/".$device_id."/send-sms";

    if(empty($obj->message) || empty($obj->phones)) return ['error' => 'No API key or Phone ID'];

    $phones = is_array($obj->phones) ? $obj->phones : [$obj->phones];

    $message = trim($obj->message);
    $message = mb_substr($message, 0, 1000);

    $data = [
        "recipients" => $phones,
        "message" => $message
    ];

    $headers = [
        "x-api-key: ".$api_key,
        "Content-Type: application/json"
    ];

    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $response = curl_exec($ch);

    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        return ["error" => $error];
    }

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        "success" => ($httpCode >= 200 && $httpCode < 300),
        "http_code" => $httpCode,
        "response" => $response
    ];
}

endif;
?>