<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('API/API'));

function send_ticket($SQL, $INIconf){
	$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
	$host = $_SERVER['HTTP_HOST'];
	$_POST['url'] = $protocol.'://'.$host.'/';

	$A = $SQL->query("SELECT user_email FROM user WHERE user_id = {$_SESSION['user_id']} LIMIT 1");
    while ($B = $A->fetch_row()){ $_POST['email'] = $B[0]; }

	$data = SEND((object)[
		'event' => 'ticket',
		'username' => $INIconf['API']['username'],
		'password' => $INIconf['API']['password'],
		'data' => $_POST,
		'post' => true
	]);

	if(isset($data['error'])){ return $data['error']; }
	return $data['data'];
}

if(isset($_SESSION['user_id'])){
	if(isset($_POST['send_ticket'])){ echo json_encode(send_ticket($SQL, $INIconf)); }
}
?>