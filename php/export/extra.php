<?php
function get_table_query($SQL){
	$query = $_SERVER['DOCUMENT_ROOT'].'/crm/php/downloads/'.SafeInput($SQL, $_POST['id']).'.sql';
	if(!file_exists($query)){ return false; }
	return file_get_contents($query);
}

function queryIsSafe($string) {
    $pattern = '/\b(DELETE|UPDATE|INSERT|DROP|CREATE|ALTER|TRUNCATE|REPLACE|GRANT|REVOKE|SET|USE|LOCK|UNLOCK|CALL)\b/i';
    if(preg_match($pattern, $string)){ return false; }
    $selectPattern = '/\bSELECT\b/i';
    if(preg_match($selectPattern, $string)){ return true; }
    return false;
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