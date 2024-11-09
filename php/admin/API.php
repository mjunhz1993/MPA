<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function test_API_table($SQL, $SQL_db){
    $A = $SQL->query("SELECT * FROM information_schema.tables WHERE table_schema = '$SQL_db' AND table_name = 'api' LIMIT 1");
    if($A->num_rows == 0){
        $A = $SQL->query("CREATE TABLE api
        (
            IP VARCHAR(255) PRIMARY KEY,
            username VARCHAR(255),
            password VARCHAR(255),
            ratelimit INT(100),
            currentrate INT(100)
        )
        CHARACTER SET utf8 COLLATE utf8_general_ci");
    }
    return [];
}

function load_API_rows($SQL, $data = array()){
    $st = 0;
    $A = $SQL->query("SELECT IP,username,password,ratelimit,currentrate FROM api");
    while ($B = $A->fetch_row()){
        $data[$st]['IP'] = $B[0];
        $data[$st]['username'] = $B[1];
        $data[$st]['password'] = $B[2];
        $data[$st]['ratelimit'] = $B[3];
        $data[$st]['currentrate'] = time() - ($B[4] + $B[3]) ;
        $st++;
    }
    return $data;
}

function add_API($SQL){
    $IP = SafeInput($SQL, $_POST['IP']);
    $username = SafeInput($SQL, $_POST['username']);
    $password = SafeInput($SQL, $_POST['password']);
    $ratelimit = SafeInput($SQL, $_POST['ratelimit']);
    $currentrate = time();
    $A = $SQL->query("INSERT INTO api (IP,username,password,ratelimit,currentrate) VALUES 
    ('$IP','$username','$password','$ratelimit','$currentrate')");
    if(!$A){ return ['error' => $SQL->error]; }
    return true;
}

function edit_API($SQL){
    $IP = SafeInput($SQL, $_POST['IP']);
    $username = SafeInput($SQL, $_POST['username']);
    $password = SafeInput($SQL, $_POST['password']);
    $ratelimit = SafeInput($SQL, $_POST['ratelimit']);
    $A = $SQL->query("UPDATE api SET username = '$username', password = '$password', ratelimit = '$ratelimit'
    WHERE IP = '$IP' LIMIT 1");
    if(!$A){ return ['error' => $SQL->error]; }
    return true;
}

function delete_API($SQL){
    $IP = SafeInput($SQL, $_POST['IP']);
    $A = $SQL->query("DELETE FROM api WHERE IP = '$IP' LIMIT 1");
    if(!$A){ return ['error' => $SQL->error]; }
    return true;
}

if(isset($_SESSION['user_id'])){
    if(isset($_GET['test_API_table'])){ echo json_encode(test_API_table($SQL, $SQL_db)); }
    if(isset($_GET['load_API_rows'])){ echo json_encode(load_API_rows($SQL)); }
    if(isset($_GET['add_API'])){ echo json_encode(add_API($SQL)); }
    if(isset($_GET['edit_API'])){ echo json_encode(edit_API($SQL)); }
    if(isset($_GET['delete_API'])){ echo json_encode(delete_API($SQL)); }
}
?>