<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('main/module_functions'));
if(isset($_SESSION['user_id'])){
	if(isset($_GET['get_row']) && isset($_GET['module'])){
		if(!isset($_GET['id'])){ $_GET['id'] = ''; }
		if($_GET['id'] != ''){ echo json_encode(getRow($SQL, $INIconf['SQL']['database'])); }
		else{ echo json_encode(getRows($SQL, $INIconf['SQL']['database'])); }
	}
}
?>