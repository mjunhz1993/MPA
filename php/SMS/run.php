<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('SMS/SMS'));

if(isset($_SESSION['user_id'])){
	if(isset($_POST['phones']) && isset($_POST['message'])){
		echo json_encode(SMS((object)[
			'phones' => $_POST['phones'], 
			'message' => $_POST['message']
		]));
	}
}
?>