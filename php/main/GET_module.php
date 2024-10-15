<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('main/module_functions'));
if(isset($_SESSION['user_id'])){
	if(isset($_GET['get_modules'])){ echo json_encode(getModuleData($SQL, SafeInput($SQL, $_GET['module'] ?? null))); }
}
?>