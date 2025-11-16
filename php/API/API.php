<?php
function SEND(object $obj = null){
	$obj->url = $obj->url ?? 'https://app.oktagon-it.si/crm/API/';
	$obj->data = $obj->data ?? [];
	$ch = curl_init();

	if (empty($obj->sendType)) {
		return SEND_error($obj, 'No_send_type');
	}
	else if ($obj->sendType == 'POST') {
		curl_setopt($ch, CURLOPT_URL, $obj->url);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $obj->data);
	}
	else if($obj->sendType == 'GET') {
		$query = http_build_query($obj->data);
		$urlWithQuery = $obj->url . (strpos($obj->url, '?') === false ? '?' : '&') . $query;
		curl_setopt($ch, CURLOPT_URL, $urlWithQuery);
	}
	else {
		curl_setopt($ch, CURLOPT_URL, $obj->url);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $obj->sendType);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $obj->data);
	}

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, SEND_header($obj));

	curl_setopt($ch, CURLOPT_TIMEOUT, $obj->timeout ?? 30);

	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, $obj->verifyHost ?? 2);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $obj->verifyPeer ?? true);

	$response = curl_exec($ch);

	if (curl_errno($ch)) {
	    $error = curl_error($ch);
	    curl_close($ch);
	    return SEND_error($obj, $error);
	}

	curl_close($ch);

	if (is_callable($obj->done)){
        return ($obj->done)($response);
    }
}

function SEND_header($obj){
	$headers[] = "Accept: " . ($obj->accept ?? "application/json");

	if(isset($obj->contentType)){
		$headers[] = "Content-Type: " . $obj->contentType;
	}

	if(isset($obj->username) && isset($obj->password)){
		$headers[] = "Authorization: Basic " . base64_encode($obj->username . ':' . $obj->password);
	}

	if(isset($obj->event)){
		$headers[] = "event: " . $obj->event;
	}

	if(isset($obj->customHeaders)){
		$headers = array_merge($headers, $obj->customHeaders);
	}

	return $headers;
}

function SEND_error($obj, $msg){
	if (is_callable($obj->error)){
        ($obj->error)($msg);
    }
}
?>