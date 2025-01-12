<?php
function get_table_query($SQL){
	$query = $_SERVER['DOCUMENT_ROOT'].'/crm/php/downloads/'.SafeInput($SQL, $_POST['id']).'.sql';
	if(!file_exists($query)){ return false; }
	return file_get_contents($query);
}

function bind_param_to_table($A){
	if(
		!isset($_POST['param']) ||
		!is_array($_POST['param']) ||
		count($_POST['param']) == 0
	){ 
		return;
	}

	$types = '';
	$values = [];
	foreach ($_POST['param'] as $param) {
	    $types .= $param['type'];
	    $values[] = &$param['value'];
	}
	call_user_func_array([$A, 'bind_param'], array_merge([$types], $values));
}
?>