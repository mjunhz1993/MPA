<?php
function generate_analytic_rows($SQL, $Q = []){
	$data = $_POST['data'];
	// return $data;

	array_push($Q, 'SELECT');
	if(isset($data['aSelect']) && is_array($data['aSelect'])){
		array_push($Q, generate_analytic_query_select($data['aSelect']));
	}

	array_push($Q, 'FROM');
	if(isset($data['aFrom']) && is_array($data['aFrom'])){
		array_push($Q, generate_analytic_query_from($data['aFrom']));
	}

	if(isset($data['aJoin']) && is_array($data['aJoin'])){
		array_push($Q, generate_analytic_query_join($data['aJoin']));
	}

	if(isset($data['aWhere']) && is_array($data['aWhere'])){
		array_push($Q, 'WHERE');
		array_push($Q, generate_analytic_query_where($data['aWhere']));
	}

	if(isset($_POST['filter']) && is_array($_POST['filter'])){
		if(!in_array('WHERE', $Q)){ array_push($Q, 'WHERE'); }
		else{ array_push($Q, 'AND'); }
		array_push($Q, generate_analytic_query_where($_POST['filter']));
	}

	if(isset($data['aHaving']) && is_array($data['aHaving'])){
		array_push($Q, 'HAVING');
		array_push($Q, generate_analytic_query_having($data['aHaving']));
	}

	if(isset($data['aGroup']) && is_array($data['aGroup'])){
		array_push($Q, 'GROUP BY');
		array_push($Q, generate_analytic_query_group($data['aGroup']));
	}

	if(isset($_POST['sort']) && isset($_POST['sort'][0]) && $_POST['sort'][0] != null){
		array_push($Q, 'ORDER BY');
		array_push($Q, $_POST['sort'][0].' '.$_POST['sort'][1]);
	}
	else if(isset($data['aOrder']) && is_array($data['aOrder'])){
		array_push($Q, 'ORDER BY');
		array_push($Q, generate_analytic_query_order($data['aOrder']));
	}

	array_push($Q, 'LIMIT');
	if(isset($_POST['limit']) && $_POST['limit'] != ''){ array_push($Q, $_POST['limit']); }
	else{ array_push($Q, '100'); }

	$Q = implode(' ', $Q); // return $Q;
	$rows = [];
	$A = $SQL->query($Q);
	if(!$A || $A->num_rows == 0){ return ['error' => 'No_rows']; }
	while($B = $A->fetch_row()){ array_push($rows, $B); }

	return $rows;
}

function generate_analytic_query_select($data, $arr = []){foreach($data as $d){
		if($d['type'] == 'custom'){
			$code = explode(' AS ', $d['code']);
			if(isset($code[1]) && $code[1] != ''){ $d['code'] = $code[0]." AS '".$code[1]."'"; }
			array_push($arr, $d['code']);
		}
} return implode(',', $arr); }

function generate_analytic_query_from($data){
	$FROM = $data['module'];
	if(isset($data['label']) && $data['label'] != ''){ $FROM .= ' AS '.$data['label']; }
	return $FROM;
}

function generate_analytic_query_join($data, $arr = []){foreach($data as $d){
	if($d['type'] == 'custom'){
		array_push($arr, $d['code']);
	}
} return implode(' ', $arr); }

function generate_analytic_query_where($data, $arr = []){foreach($data as $d){
	if($d['type'] == 'custom'){
		array_push($arr, $d['code']);
	}
} return implode(' AND ', $arr); }

function generate_analytic_query_having($data, $arr = []){foreach($data as $d){
	if($d['type'] == 'custom'){
		array_push($arr, $d['code']);
	}
} return implode(' AND ', $arr); }

function generate_analytic_query_group($data, $arr = []){foreach($data as $d){
	if($d['type'] == 'custom'){
		array_push($arr, $d['code']);
	}
} return implode(' , ', $arr); }

function generate_analytic_query_order($data, $arr = []){foreach($data as $d){
	if($d['type'] == 'custom'){
		array_push($arr, $d['code']);
	}
} return implode(' , ', $arr); }
?>