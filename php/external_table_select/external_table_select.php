<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function search_external_table($SQL){
	$A = $SQL->query("
		SELECT ".implode(', ', $_GET['columns'])." 
		FROM {$_GET['module']}
		WHERE ".implode(" OR ", search_external_table_conditions())."
		".add_external_where()."
		LIMIT 10
	");

	if(!$A){ return ['error' => $SQL->error]; }

	$data = [];
    while ($B = $A->fetch_row()){ $data[] = $B; }
    return $data;
}

function search_external_table_conditions(){
	$search_escaped = addslashes($_GET['search'] ?? '');
	$columns = $_GET['search_columns'] ?? $_GET['columns'];
	$types = $_GET['search_types'] ?? [];

	return array_map(function($col, $type) use ($search_escaped) {
		switch ($type) {
			case 'Begins_with':
				return "$col LIKE '{$search_escaped}%'";
			case 'Equals':
				return "$col = '{$search_escaped}'";
			case 'Contains':
			default:
				return "$col LIKE '%{$search_escaped}%'";
		}
	}, $columns, $types);
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