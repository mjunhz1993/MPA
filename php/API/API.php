<?php
function SEND(object $obj = null){
	$obj->url = $obj->url ?? 'https://app.oktagon-it.si/crm/API/';
	$obj->data = $obj->data ?? [];
	$ch = curl_init();

	if (!empty($obj->post)) {
		// POST request
		curl_setopt($ch, CURLOPT_URL, $obj->url);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($obj->data));
	} else {
		// GET request
		$query = http_build_query($obj->data);
		$urlWithQuery = $obj->url . (strpos($obj->url, '?') === false ? '?' : '&') . $query;
		curl_setopt($ch, CURLOPT_URL, $urlWithQuery);
	}

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, SEND_header($obj));

	$response = curl_exec($ch);

	if (curl_errno($ch)) {
	    $error = curl_error($ch);
	    curl_close($ch);
	    return ['error' => $error];
	}

	curl_close($ch);
	return ['data' => json_decode($response)];
}

function SEND_header($obj){
	$headers[] = "Accept: application/json";

	if(isset($obj->username) && isset($obj->password)){
		$headers[] = "Authorization: Basic " . base64_encode($obj->username . ':' . $obj->password);
	}

	if(isset($obj->event)){
		$headers[] = "event: " . $obj->event;
	}

	return $headers;
}
?>