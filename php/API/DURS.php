<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('API/API'));

function DURS($INIconf){
	return SEND((object)[
		'sendType' => 'POST',
		'event' => 'durs',
		'username' => $INIconf['API']['username'],
		'password' => $INIconf['API']['password'],
		'data' => ['s' => $_GET['search']],

		'error' => function($err){ return $err; },
		'done' => function($data){ return json_decode($data); }
	]);
}

if(isset($_SESSION['user_id'])){
	if(isset($_GET['DURS'], $_GET['search'])){ echo json_encode(DURS($INIconf)); }
}
?>