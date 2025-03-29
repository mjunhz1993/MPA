<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function test_API_table($SQL, $SQL_db){
    $A = $SQL->query("SELECT * FROM information_schema.tables WHERE table_schema = '$SQL_db' AND table_name = 'api' LIMIT 1");
    if($A->num_rows == 0){
        $A = $SQL->query("CREATE TABLE api
        (
            IP VARCHAR(255) PRIMARY KEY,
            domainname VARCHAR(255),
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
    $A = $SQL->query("SELECT * FROM api");
    while ($B = $A->fetch_assoc()){
        $data[$st]['IP'] = $B['IP'];
        $data[$st]['domainname'] = $B['domainname'];
        $data[$st]['username'] = $B['username'];
        $data[$st]['password'] = $B['password'];
        $data[$st]['ratelimit'] = $B['ratelimit'];
        $data[$st]['currentrate'] = time() - ($B['currentrate'] + $B['ratelimit']) ;
        $st++;
    }
    return $data;
}

function add_API($SQL){
    $IP = SafeInput($SQL, $_POST['IP']);
    $domainname = SafeInput($SQL, $_POST['domainname']);
    $username = SafeInput($SQL, $_POST['username']);
    $password = SafeInput($SQL, $_POST['password']);
    $ratelimit = SafeInput($SQL, $_POST['ratelimit']);
    $currentrate = time();
    $A = $SQL->query("INSERT INTO api (IP,domainname,username,password,ratelimit,currentrate) VALUES 
    ('$IP','$domainname','$username','$password','$ratelimit','$currentrate')");
    if(!$A){ return ['error' => $SQL->error]; }
    return true;
}

function edit_API($SQL){
    $IP = SafeInput($SQL, $_POST['IP']);
    $domainname = SafeInput($SQL, $_POST['domainname']);
    $username = SafeInput($SQL, $_POST['username']);
    $password = SafeInput($SQL, $_POST['password']);
    $ratelimit = SafeInput($SQL, $_POST['ratelimit']);
    $A = $SQL->query("UPDATE api SET 
    domainname = '$domainname',
    username = '$username', password = '$password', ratelimit = '$ratelimit'
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