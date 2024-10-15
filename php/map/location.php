<?php
function find_location($data){
	if(is_array($data)){ $data = implode(', ', $data); }
	if(count($data) == 0){ return ['error' => 'No_location']; }
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, "https://nominatim.openstreetmap.org/search?format=json&q=".urlencode($data));
    curl_setopt( $ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
	curl_setopt($ch, CURLOPT_REFERER, 'https://'.$_SERVER['SERVER_NAME']);
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
}
?>