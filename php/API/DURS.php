<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('API/API'));

function DURS($INIconf){
	$data = SEND((object)[
		'event' => 'durs',
		'username' => $INIconf['API']['username'],
		'password' => $INIconf['API']['password'],
		'data' => ['s' => $_GET['search']],
		'post' => true
	]);

	if(isset($data['error'])){ return $data['error']; }
	return $data['data'];
}

if(isset($_SESSION['user_id'])){
	if(isset($_GET['DURS'], $_GET['search'])){ echo json_encode(DURS($INIconf)); }
}
?>