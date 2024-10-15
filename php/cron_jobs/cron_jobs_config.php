<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function test_cron_jobs_table($SQL, $SQL_db){
    $A = $SQL->query("SELECT * FROM information_schema.tables WHERE table_schema = '$SQL_db' AND table_name = 'cron_jobs' LIMIT 1");
    if($A->num_rows == 0){
        $A = $SQL->query("CREATE TABLE cron_jobs
        (
            name VARCHAR(255) PRIMARY KEY,
            extra TEXT,
            url TEXT,
            wait_for INT(100),
            tstamp INT(100), INDEX(tstamp)
        )
        CHARACTER SET utf8 COLLATE utf8_general_ci");
    }
    return [];
}

function add_cron_job($SQL){
    date_default_timezone_set("UTC");
    $name = SafeInput($SQL, $_POST['name']);
    $url = 'downloads/'.pathinfo($_POST['url'],PATHINFO_FILENAME);
    $extra = SafeInput($SQL, $_POST['extra']);
    $wait_for = SafeInput($SQL, $_POST['wait_for']);
    $tstamp = time() + $wait_for;
    $A = $SQL->query("INSERT INTO cron_jobs (name,extra,url,wait_for,tstamp) VALUES ('$name','$extra','$url','$wait_for','$tstamp')");
    if(!$A){ return ['error' => $SQL->error]; }
    return true;
}

function update_cron_job($SQL){
    date_default_timezone_set("UTC");
    $name = SafeInput($SQL, $_POST['name']);
    $extra = SafeInput($SQL, $_POST['extra']);
    $wait_for = SafeInput($SQL, $_POST['wait_for']);
    $tstamp = time() + $wait_for;
    $A = $SQL->query("UPDATE cron_jobs SET extra = '$extra', wait_for = '$wait_for', tstamp = '$tstamp' WHERE name = '$name' LIMIT 1");
    if(!$A){ return ['error' => $SQL->error]; }
    return true;
}

function delete_cron_job($SQL){
    $name = SafeInput($SQL, $_POST['name']);
    $A = $SQL->query("DELETE FROM cron_jobs WHERE name = '$name' LIMIT 1");
    if(!$A){ return ['error' => $SQL->error]; }
    return true;
}

function get_cron_jobs($SQL, $data = array()){
    $st = 0;
    $A = $SQL->query("SELECT name,extra,url,wait_for,tstamp FROM cron_jobs ORDER BY tstamp ASC");
    while ($B = $A->fetch_row()){
        $data[$st]['name'] = $B[0];
        $data[$st]['extra'] = $B[1];
        $data[$st]['url'] = $B[2];
        $data[$st]['wait_for'] = $B[3];
        $data[$st]['tstamp'] = date('Y-m-d H:i:s', $B[4]);
        $st++;
    }
    return $data;
}

if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){
    if(isset($_GET['add_cron_job'])){ echo json_encode(add_cron_job($SQL)); }
    if(isset($_GET['update_cron_job'])){ echo json_encode(update_cron_job($SQL)); }
    if(isset($_GET['delete_cron_job'])){ echo json_encode(delete_cron_job($SQL)); }
}
if(isset($_SESSION['user_id'])){
	if(isset($_GET['test_cron_jobs_table'])){ test_cron_jobs_table($SQL, $SQL_db); }
	if(isset($_GET['get_cron_jobs'])){ echo json_encode(get_cron_jobs($SQL)); }
}
?>