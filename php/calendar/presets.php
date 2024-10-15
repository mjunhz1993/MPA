<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function check_for_presets_table($SQL, $SQL_db){
	$A = $SQL->query("SELECT * FROM information_schema.tables WHERE table_schema = '$SQL_db' AND table_name = 'module_calendar' LIMIT 1");
    if($A->num_rows == 0){
        $A = $SQL->multi_query("
        CREATE TABLE module_calendar
        (
            module VARCHAR(100), UNIQUE(module),
        	FOREIGN KEY (module) REFERENCES module(module) ON DELETE CASCADE,
            data TEXT
        )
        CHARACTER SET utf8 COLLATE utf8_general_ci;
        ");
    }
    if(!$A){ return false; }
    return true;
}

function get_presets($SQL, $SQL_db){
	$module = SafeInput($SQL, $_GET['module']);
	if(!check_for_presets_table($SQL, $SQL_db)){ return ['error' => $SQL->error]; }

	$A = $SQL->query("SELECT * FROM module_calendar WHERE module = '$module' LIMIT 1");
	if($A->num_rows == 0){ return false; }
	while($B = $A->fetch_assoc()){
		$B['data'] = json_decode($B['data']);
		return $B;
	}
}

function update_presets($SQL){
	$module = SafeInput($SQL, $_POST['module']);
	$data = json_encode([
		'subject_custom' => SafeInput($SQL, $_POST['subject_custom']),
		'LEFT_JOIN' => SafeInput($SQL, $_POST['LEFT_JOIN']),
		'LEFT_JOIN_COL' => SafeInput($SQL, $_POST['LEFT_JOIN_COL']),
		'startCol' => SafeInput($SQL, $_POST['startCol']),
		'endCol' => SafeInput($SQL, $_POST['endCol']),
		'assignedCol' => SafeInput($SQL, $_POST['assignedCol']),
		'shareCol' => SafeInput($SQL, $_POST['shareCol']),
		'colorCol' => SafeInput($SQL, $_POST['colorCol'])
	]);

	$A = $SQL->query("
		INSERT INTO module_calendar 
		(module, data)
		VALUES 
		('$module', '$data') 
		ON DUPLICATE KEY UPDATE 
		module = '$module', data = '$data'
	");

	if(!$A){ return ['error' => $SQL->error]; }
    return true;
}

if(isset($_SESSION['user_id'])){
	if(isset($_GET['get_presets'])){ echo json_encode(get_presets($SQL, $SQL_db)); }
	if(isset($_GET['update_presets'])){ echo json_encode(update_presets($SQL)); }
}
?>