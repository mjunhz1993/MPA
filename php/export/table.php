<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('export/extra'));

function exportTable($SQL){
	if(isset($_POST['stringQuery']) && $_POST['stringQuery'] != ''){ $query = $_POST['stringQuery']; }
	else{ $query = get_table_query($SQL); }
	if(!$query){ return ['error' => 'No_query_found']; }

	$query = check_table_limit($query);

	$A = $SQL->prepare($query);

	if(!$A){ return ['error' => $SQL->error]; }

	bind_param_to_table($A);

	$A->execute();
	$result = $A->get_result();
	if ($result->num_rows == 0) { return []; }

	$st = 0;
	$arr = [];
    while ($row = $result->fetch_assoc()){
    	foreach($row as $r=>$v){ $arr[$st][$r] = $v; }
    	$st++;
    }
    return $arr;
}

function check_table_limit($query, $limit = 10) {
    $pattern = '/LIMIT\s+(\d+)(\s*,\s*\d+)?/i';
    if (preg_match($pattern, $query, $matches)) {
        $current_limit = (int) $matches[1];
        if ($current_limit < 10) {
            return $query;
        } else {
            $query = preg_replace($pattern, 'LIMIT ' . $limit, $query);
        }
    } else {
        $query = rtrim($query, ';') . ' LIMIT ' . $limit;
    }
    return $query;
}

if(isset($_SESSION['user_id'])){
	if(isset($_POST['exportTable'])){ echo json_encode(exportTable($SQL)); }
}
?>