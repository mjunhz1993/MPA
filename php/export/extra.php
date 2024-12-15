<?php
function get_table_query($SQL){
	$query = $_SERVER['DOCUMENT_ROOT'].'/crm/php/downloads/'.SafeInput($SQL, $_GET['id']).'.sql';
	if(!file_exists($query)){ return false; }
	return file_get_contents($query);
}

function bind_param_to_table($A){
	if(
		!isset($_GET['param']) ||
		!is_array($_GET['param']) ||
		count($_GET['param']) == 0
	){ 
		return;
	}

	$types = '';
	$values = [];
	foreach ($d as $param) {
	    $types .= $param['type'];
	    $values[] = &$param['value'];
	}
	call_user_func_array([$A, 'bind_param'], array_merge([$types], $values));
}
?>