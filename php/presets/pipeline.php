<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('main/module_functions'));

function get_pipeline_sum($SQL){
	$module = getModuleData($SQL, SafeInput($SQL, $_GET['data']['module']));
	$F = getFilterData($SQL, $module['module'], $_SESSION['user_id']);
	$assigned = $module['module'].'.'.SafeInput($SQL, $_GET['data']['assigned']);

	if(count($F[3]) != 0){ $WHERE[] = '('. implode(' AND ', $F[3]). ')'; }
    $WHERE[] = $module['module'].'.'.SafeInput($SQL, $_GET['data']['status'])." = '".SafeInput($SQL, $_GET['statusValue'])."'";
    if(!in_array($_SESSION['user_role_id'], $module['can_view'])){
    	$WHERE[] = $module['module'].'.added = '.$_SESSION['user_role_id'];
    }
    $WHERE = implode(' AND ', $WHERE);

    $SELECT[] = "COUNT(*) AS countItems";

    if($_GET['data']['price'] != ''){
		$SELECT[] = 'SUM('.SafeInput($SQL, $_GET['data']['price']).') AS price';
	}

    $A = $SQL->query("
		SELECT ".implode(',', $SELECT)."
		FROM ".$module['module']."
		WHERE $WHERE
	");

	if($A->num_rows == 0){ return []; }
	while($B = $A->fetch_assoc()){ return $B; }
}

function get_pipeline($SQL){
	$module = getModuleData($SQL, SafeInput($SQL, $_GET['data']['module']));
	$F = getFilterData($SQL, $module['module'], $_SESSION['user_id']);
	$assigned = $module['module'].'.'.SafeInput($SQL, $_GET['data']['assigned']);

    if(count($F[3]) != 0){ $WHERE[] = '('. implode(' AND ', $F[3]). ')'; }
    $WHERE[] = $module['module'].'.'.SafeInput($SQL, $_GET['data']['status'])." = '".SafeInput($SQL, $_GET['statusValue'])."'";
    if(!in_array($_SESSION['user_role_id'], $module['can_view'])){
    	$WHERE[] = $module['module'].'.added = '.$_SESSION['user_role_id'];
    }
    $WHERE = implode(' AND ', $WHERE);

	$SELECT[] = $module['module'].'.'.$module['module'].'_id AS id';
	$SELECT[] = $module['module'].'.'.SafeInput($SQL, $_GET['data']['status']).' AS status';
	$SELECT[] = $module['module'].'.'.SafeInput($SQL, $_GET['data']['subject']).' AS subject';
	$SELECT[] = $assigned.' AS assigned';
	$SELECT[] = 'user_username AS assignedName';
	$SELECT[] = $module['module'].'.'.SafeInput($SQL, $_GET['data']['date']).' AS date';

	if($_GET['data']['text'] != ''){
		$SELECT[] = $module['module'].'.'.SafeInput($SQL, $_GET['data']['text']).' AS extraText';
	}
	if($_GET['data']['price'] != ''){
		$SELECT[] = $module['module'].'.'.SafeInput($SQL, $_GET['data']['price']).' AS price';
	}
	if($_GET['data']['share'] != ''){
		$SELECT[] = $module['module'].'.'.SafeInput($SQL, $_GET['data']['share']).' AS share';
	}

	$LIMIT = 10;
	$OFFSET = $_GET['data']['OFFSET'] ?? 0;

	$A = $SQL->query("
		SELECT ".implode(',', $SELECT)." 
		FROM ".$module['module']."
		LEFT JOIN user ON user_id = $assigned
		WHERE $WHERE
		LIMIT $LIMIT OFFSET $OFFSET
	");

	if($A->num_rows == 0){ return []; }

	$arr['loadMore'] = ($A->num_rows == $LIMIT);

	while($B = $A->fetch_assoc()){
		$B = pipeline_decode($SQL, $B);
		$arr['rows'][] = $B;
	}
	return $arr;
}

function pipeline_decode($SQL, $B, $assigned = []){
	if($B['assigned'] != ''){ array_push($assigned, [$B['assigned'], $B['assignedName']]); }

	if($B['share']){
		foreach(explode('|', trim($B['share'], '|')) as $share){ $IDs[] = explode(';', $share)[0]; }
		$A = $SQL->query("SELECT user_id, user_username FROM user WHERE user_id IN ('".implode("','", $IDs)."')");
		while($S = $A->fetch_assoc()){ array_push($assigned, [$S['user_id'], $S['user_username']]); }
	}

	unset($B['assignedName']);
	unset($B['share']);
	$B['assigned'] = $assigned;
	return $B;
}

if(isset($_SESSION['user_id'])){
	if(isset($_GET['get_pipeline_sum'])){ echo json_encode(get_pipeline_sum($SQL)); }
	if(isset($_GET['get_pipeline'])){ echo json_encode(get_pipeline($SQL)); }
}
?>