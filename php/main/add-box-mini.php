<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('form/add-box-mini'));

if(isset($_SESSION['user_id'])){
	if(isset($_GET['addBoxMini_joinData'])){ echo json_encode(addBoxMini_joinData($SQL)); }
}
?>