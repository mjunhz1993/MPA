<?php
function generate_analytic_sum($SQL, $Q = []){
	$data = $_POST['data'];
	$col = generate_analytic_columns($SQL)[0];

	$aSelect = $data['aSelect'][1];
	array_push($Q, "SELECT ".$data['aSelect'][1]['code']);
	array_push($Q, "FROM ".$data['aFrom']['module']);

	if(isset($data['aWhere']) && is_array($data['aWhere'])){
		array_push($Q, 'WHERE');
		array_push($Q, generate_analytic_query_where($data['aWhere']));
	}

	array_push($Q, 'LIMIT 100');

	$Q = implode(' ', $Q);
	// return $Q;

	$A = $SQL->query($Q);
	if(!$A || $A->num_rows == 0){ return ['error' => 'No_rows']; }
	while($B = $A->fetch_row()){ $col['value'] = $B[0]; return $col; }
}

function generate_analytic_pie($SQL, $Q = []){
	$data = $_POST['data'];
	$col = generate_analytic_columns($SQL);

	array_push($Q, "SELECT");
	if(isset($data['aSelect']) && is_array($data['aSelect'])){
		array_push($Q, generate_analytic_query_select($data['aSelect']));
	}

	array_push($Q, "FROM ".$data['aFrom']['module']);

	if(isset($data['aWhere']) && is_array($data['aWhere'])){
		array_push($Q, 'WHERE');
		array_push($Q, generate_analytic_query_where($data['aWhere']));
	}

	array_push($Q, 'GROUP BY');
	if(isset($data['aGroup']) && is_array($data['aGroup'])){
		array_push($Q, generate_analytic_query_group($data['aGroup']));
	}

	$Q = implode(' ', $Q);
	// return $Q;

	$A = $SQL->query($Q);
	if(!$A || $A->num_rows == 0){ return ['error' => 'No_rows']; }
	return [$col, $A->fetch_all()];
}

function generate_analytic_date($SQL, $Q = []){
	$data = $_POST['data'];
	$col = generate_analytic_columns($SQL);

	array_push($Q, "SELECT");

	$dateType = 'DATE';
	$dateCol = $dateType.'('.$data['aSelect'][1]['code'].')';
	$startDate = getFirstDayOfMonth($_POST['year'], $_POST['month']);
	$endDate = getLastDayOfMonth($_POST['year'], $_POST['month']);

	array_push($Q, $dateCol.', ');

	if(isset($data['aSelect']) && is_array($data['aSelect'])){
		unset($data['aSelect'][1]);
		array_push($Q, generate_analytic_query_select($data['aSelect']));
	}

	array_push($Q, "FROM ".$data['aFrom']['module']);

	array_push($Q, 'WHERE');
	array_push($Q, $dateCol." BETWEEN '$startDate' AND '$endDate'");

	if(isset($data['aWhere']) && is_array($data['aWhere'])){
		array_push($Q, 'AND');
		array_push($Q, generate_analytic_query_where($data['aWhere']));
	}

	array_push($Q, 'GROUP BY '.$dateCol);
	array_push($Q, 'ORDER BY '.$dateCol);

	$Q = implode(' ', $Q);
	// return $Q;

	$A = $SQL->query($Q);
	if(!$A || $A->num_rows == 0){ return ['error' => 'No_rows']; }
	return [$col, $A->fetch_all()];
}

// COMMON

function getFirstDayOfMonth($year, $month){
    $firstDayTimestamp = strtotime("first day of $year-$month");
    $firstDay = date('Y-m-d', $firstDayTimestamp);   
    return $firstDay;
}
function getLastDayOfMonth($year, $month){
    $lastDayTimestamp = strtotime("last day of $year-$month");
    $lastDay = date('Y-m-d', $lastDayTimestamp);
    return $lastDay;
}
?>