<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

$GLOBALS['AI']['talk'] = [
    "system_instruction" => ["parts" => array()],
    "contents" => array()
];

function loadIn_AI_models($SQL, $WHERE = ''){
    if(isset($_GET['id'])){ $WHERE = "AND id = {$_GET['id']} LIMIT 1"; }
    $A = $SQL->query("SELECT * FROM ai WHERE FIND_IN_SET('{$_SESSION['user_id']}', share) > 0 $WHERE");
    if(!$A || $A->num_rows == 0){ return []; }
    while ($B = $A->fetch_assoc()){ $arr[] = $B; }
    return $arr;
}

function wakeUp_AI(){
    if(!isset($GLOBALS["config"]['AI'])){ return false; }
	$ch = curl_init();
    $api = $GLOBALS["config"]['AI'];
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=".$api);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    $GLOBALS['AI']['curl'] = $ch;
    return true;
}

function generate_instruction($text){
    array_push($GLOBALS['AI']['talk']['system_instruction']['parts'], [
        "text" => $text
    ]);
}

function generate_talk_history(){
    if(!isset($_POST['history']) || !is_array($_POST['history'])){ return; }
    foreach($_POST['history'] as $v){ generate_talk($v['text'], $v['role']); }
}

function generate_talk($text, $role = 'user'){
	if($role != 'model'){ $role = 'user'; }
	array_push($GLOBALS['AI']['talk']['contents'], [
        "role" => $role,
        "parts" => [["text" => $text]]
    ]);
}

function ask_AI(){
	curl_setopt($GLOBALS['AI']['curl'], CURLOPT_POSTFIELDS, json_encode($GLOBALS['AI']['talk']));
	$response = curl_exec($GLOBALS['AI']['curl']);
	if(curl_errno($GLOBALS['AI']['curl'])){
        $error_msg = 'AI error: ' . curl_error($GLOBALS['AI']['curl']);
        curl_close($GLOBALS['AI']['curl']);
        return false;
    }
    return $response;
}

function AI_err($str = 'error'){ return json_encode(['error' => $str]); }

function run_AI(){
    if(!isset($_POST['ask']) || $_POST['ask'] == ''){ return AI_err('Empty_message'); }
	if(!wakeUp_AI()){ return AI_err('Oktagon_AI_not_available'); }

    if(isset($_POST['instruction']) && $_POST['instruction'] != ''){ generate_instruction($_POST['instruction']); }
    else{ generate_instruction('Your name is Oktagon AI'); }

    generate_talk_history();

    generate_talk($_POST['ask']);

    return ask_AI();
}

if(isset($_SESSION['user_id'])){
    if(isset($_GET['loadIn_AI_models'])){ echo json_encode(loadIn_AI_models($SQL)); }
	if(isset($_POST['AI'])){ echo (run_AI()); }
}
?>