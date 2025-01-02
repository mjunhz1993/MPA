<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('main/module_functions'));

function sumData($SQL){
    $module = SafeInput($SQL, $_GET['module']);
    $column = SafeInput($SQL, $_GET['column']);
    $type = SafeInput($SQL, $_GET['type']);

    $filters = isset($_GET['filters']) && is_array($_GET['filters']) ? getTableFilterData($SQL, $_GET['filters'], $_GET['filter_values']) : [];
    $selected_conditions = getFilterData($SQL, $module, $_SESSION['user_id'])[3];

    $WHERE = [];
    if ($filters) $WHERE[] = '(' . implode(' AND ', $filters) . ')';
    if ($selected_conditions) $WHERE[] = '(' . implode(' OR ', $selected_conditions) . ')';
    $WHERE_SQL = $WHERE ? 'WHERE ' . implode(' AND ', $WHERE) : '';

    $A = $SQL->query(sumDataQuery($type, $column, $module, $WHERE_SQL));

    if($A->num_rows == 0) return [];
    while ($B = $A->fetch_assoc()){ $data[] = $B; }
    return $data;
}

function sumDataQuery($type, $column, $module, $WHERE_SQL){
	if($type == 'SELECT'){return "
		SELECT 
		    $column AS status, 
		    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM $module $WHERE_SQL), 2) AS percentage
		FROM 
		    $module
		    $WHERE_SQL
		GROUP BY 
		    $column;
	";}
	return "SELECT $type($column) AS sum FROM $module $WHERE_SQL LIMIT 1";
}

if(isset($_SESSION['user_id'])){
	if(isset($_GET['get_column_sum'])){ echo json_encode(sumData($SQL)); }
}
?>