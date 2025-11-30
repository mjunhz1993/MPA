<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function check_for_AI_table($SQL, $db){
    $A = $SQL->query("SELECT * FROM information_schema.tables WHERE table_schema = '$db' AND table_name = 'ai' LIMIT 1");
    if($A->num_rows == 0){
        $A = $SQL->multi_query("
        CREATE TABLE ai
        (
            id INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            share TEXT,
            instructions TEXT,
            answer_parse  TEXT
        )
        CHARACTER SET utf8 COLLATE utf8_general_ci;
        ");
    }
    if(!$A){ return ['error' => $SQL->error]; }
    return true;
}

function load_AI_models($SQL, $WHERE = ''){
    if(isset($_GET['id'])){ $WHERE = "WHERE id = {$_GET['id']} LIMIT 1"; }
    $A = $SQL->query("SELECT * FROM ai $WHERE");
    if($A->num_rows == 0){ return []; }
    while ($B = $A->fetch_assoc()){
        $B['share'] = explode(',', $B['share']);
        $arr[] = $B;
    }
    return $arr;
}

function save_AI_model($SQL) {
    $name = $SQL->real_escape_string($_POST['name']);
    $instructions = $SQL->real_escape_string($_POST['instructions']);
    $share = implode(',', array_map([$SQL, 'real_escape_string'], (array)$_POST['share']));

    if (isset($_POST['id']) && is_numeric($_POST['id'])) {
        $id = (int)$_POST['id'];
        $query = "UPDATE ai 
                  SET name = '$name', share = '$share', instructions = '$instructions'
                  WHERE id = $id LIMIT 1";
    } else {
        $query = "INSERT INTO ai (name, share, instructions) 
                  VALUES ('$name', '$share', '$instructions')";
    }

    return $SQL->query($query) ?: false;
}

function delete_AI_model($SQL){
    return $SQL->query("DELETE FROM ai WHERE id = {$_GET['delete_AI_model']} LIMIT 1");
}

if(isset($_SESSION['user_id'])){
    if(isset($_GET['check_for_AI_table'])){ echo json_encode(check_for_AI_table($SQL, $INIconf['SQL']['database'])); }
    if(isset($_GET['load_AI_models'])){ echo json_encode(load_AI_models($SQL)); }
    if(isset($_GET['save_AI_model'])){ echo json_encode(save_AI_model($SQL)); }
    if(isset($_GET['delete_AI_model'])){ echo json_encode(delete_AI_model($SQL)); }
}
?>