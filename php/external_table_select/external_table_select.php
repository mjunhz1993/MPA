<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function search_external_table($SQL){

	$search_escaped = addslashes($_GET['search']);
	$conditions = array_map(function($col) use ($search_escaped) {
	    return "$col LIKE '%$search_escaped%'";
	}, $_GET['columns']);

	$A = $SQL->query("
		SELECT ".implode(', ', $_GET['columns'])." 
		FROM {$_GET['module']}
		WHERE ".implode(" OR ", $conditions)."
		".add_external_where()."
		LIMIT 10
	");

	if(!$A){ return ['error' => $SQL->error]; }

	$data = [];
    while ($B = $A->fetch_row()){ $data[] = $B; }
    return $data;
}

function select_external_table_value($SQL){

	$A = $SQL->query("
		SELECT ".implode(', ', $_GET['columns'])." 
		FROM {$_GET['module']}
		WHERE {$_GET['columns'][0]} = {$_GET['value']} 
		".add_external_where()."
		LIMIT 1
	");

	if(!$A || $A->num_rows == 0){ return ['error' => $SQL->error]; }

	while ($B = $A->fetch_row()){ return implode(' - ', $B); }
}

function add_external_where(){
	if(!isset($_GET['where'])){ return ''; }
	return "AND (".implode(' AND ', $_GET['where']).")";
}

if(isset($_SESSION['user_id'])){
    if(isset($_GET['search_external_table'])){ echo json_encode(search_external_table($SQL)); }
    if(isset($_GET['select_external_table_value'])){ echo json_encode(select_external_table_value($SQL)); }
}
?>