<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function search_external_table($SQL){
	$order = $_GET['order'] ?? $_GET['columns'][0].' DESC';
	$limit = $_GET['limit'] ?? 10;

	$WHERE = search_external_table_conditions();
	$prefix_where = add_external_where();
	if($prefix_where != ''){ $WHERE[] = $prefix_where; }
	$WHERE = implode(' AND ', $WHERE);
	if($WHERE != ''){ $WHERE = 'WHERE '. $WHERE; }

	$A = $SQL->query("
		SELECT ".implode(', ', $_GET['columns'])." 
		FROM {$_GET['module']}
		$WHERE
		ORDER BY $order
		LIMIT $limit
	");

	if(!$A){ return ['error' => $SQL->error]; }

	$data = [];
    while ($B = $A->fetch_row()){ $data[] = $B; }
    return $data;
}

function select_external_table_row($SQL){
	$WHERE[] = "{$_GET['columns'][0]} = {$_GET['value']} ";
	$prefix_where = add_external_where();
	if($prefix_where != ''){ $WHERE[] = $prefix_where; }
	$WHERE = implode(' AND ', $WHERE);
	if($WHERE != ''){ $WHERE = 'WHERE '. $WHERE; }

	$A = $SQL->query("
		SELECT ".implode(', ', $_GET['columns'])." 
		FROM {$_GET['module']}
		$WHERE
		LIMIT 1
	");

	if(!$A || $A->num_rows == 0){ return ['error' => $SQL->error]; }

	while ($B = $A->fetch_row()){ return implode(' - ', $B); }
}

function search_external_table_conditions(){

    $search_values = $_GET['search_values'] ?? [];
    $columns = $_GET['search_columns'] ?? ($_GET['columns'] ?? []);
    $types = $_GET['search_types'] ?? [];

    // Normalize to arrays
    $search_values = is_array($search_values) ? $search_values : [$search_values];
    $columns = is_array($columns) ? $columns : [$columns];
    $types = is_array($types) ? $types : [$types];

    $conditions = [];

    foreach ($columns as $i => $col) {

        $value = $search_values[$i] ?? '';
        $type  = $types[$i] ?? 'Contains';

        if ($value === '' || $value === null) {
            continue;
        }

        $value = addslashes($value);

        switch ($type) {
            case 'Begins_with':
                $conditions[] = "$col LIKE '{$value}%'";
                break;

            case 'Equals':
                $conditions[] = "$col = '{$value}'";
                break;

            case 'Contains':
            default:
                $conditions[] = "$col LIKE '%{$value}%'";
                break;
        }
    }

    return $conditions;
}

function add_external_where(){
	if(!isset($_GET['where'])){ return ''; }
	return "(".implode(' AND ', $_GET['where']).")";
}

if(isset($_SESSION['user_id'])){
    if(isset($_GET['search_external_table'])){ echo json_encode(search_external_table($SQL)); }
    if(isset($_GET['select_external_table_row'])){ echo json_encode(select_external_table_row($SQL)); }
}
?>