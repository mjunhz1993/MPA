<?php
function generate_analytic_columns($SQL, $col = []){
	$data = $_POST['data'];
	if(!isset($data['aSelect']) || !is_array($data['aSelect'])){ return ['error' => 'No_columns']; }
	$data = $data['aSelect'];
	foreach($data as $d){
		$d = config_custom_analytic_column($d);
		$A = $SQL->query("SELECT * FROM module_columns WHERE column_id = '".$d['column']."' LIMIT 1");
		if($A->num_rows != 0){while($B = $A->fetch_assoc()){
			$d = check_special_column_type($d);
			$d['type'] = $B['type'];
			if(!isset($d['name']) || $d['name'] == ''){ $d['name'] = $B['name']; }
			$d = array_merge($B, $d);
		}}
		array_push($col, $d);
	}
	return $col;
}

function config_custom_analytic_column($d){
	$d['column'] = $d['code'];
	$d['name'] = trim(explode(' AS ', $d['column'])[1] ?? $d['column']);
	if(str_contains($d['column'], ' AS ')){ $d['column'] = trim(explode(' AS ', $d['column'])[0]); }
	if(str_contains($d['column'], '(')){ $d['column'] = trim(explode('(', $d['column'])[1]); }
	if(str_contains($d['column'], ')')){ $d['column'] = trim(explode(')', $d['column'])[0]); }

	$d['module'] = null;
	if(str_contains($d['column'], '.')){
		$ex = explode('.', $d['column']);
		$d['module'] = trim($ex[0]);
		$d['column'] = trim($ex[1]);
	}

	return $d;
}

function check_special_column_type($d){
	if($d['type'] != 'column'){
		$m0 = $d['module'];
		if(isset($d['label']) && $d['label'] != ''){ $m0 = $d['label']; }
		$d['column'] = $d['type'].'('.$m0.'.'.$d['column'].')';
		$d['module'] = '';
	}
	return $d;
}
?>