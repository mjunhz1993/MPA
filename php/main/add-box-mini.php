<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function addBoxMini_joinData($SQL){
	$A = $SQL->query("
		SELECT * 
		FROM ".SafeInput($SQL, $_GET['module'])." 
		WHERE ".SafeInput($SQL, $_GET['filter'])." = '".SafeInput($SQL, $_GET['filter_value'])."'
	");
	if(!$A || $A->num_rows == 0){ return false; }
	while ($B = $A->fetch_assoc()){ $data[] = $B; }
	return $data;
}

if(isset($_SESSION['user_id'])){
	if(isset($_GET['addBoxMini_joinData'])){ echo json_encode(addBoxMini_joinData($SQL)); }
}
?>