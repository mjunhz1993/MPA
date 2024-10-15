<?php
function analytics_connect($SQL, $SQL_db){
	$A = $SQL->query("SELECT * FROM information_schema.tables WHERE table_schema = '$SQL_db' AND table_name = 'analytics' LIMIT 1");
    if($A->num_rows == 0){
        $A = $SQL->multi_query("
        CREATE TABLE analytics
        (
            id INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            added INT(100),
            name VARCHAR(255),
            category VARCHAR(255),
            share TEXT,
            active TINYINT DEFAULT 1
        )
        CHARACTER SET utf8 COLLATE utf8_general_ci;

        CREATE TABLE analytics_tables
        (
            id INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            pid INT(100) UNSIGNED,
            FOREIGN KEY (pid) REFERENCES analytics(id) ON DELETE CASCADE,
            name VARCHAR(255),
            order_num INT(100),
            active TINYINT DEFAULT 1,
            width INT(11) DEFAULT 100,
            category VARCHAR(255),
            type VARCHAR(100)
        )
        CHARACTER SET utf8 COLLATE utf8_general_ci;

        CREATE TABLE analytics_content
        (
            pid INT(100) UNSIGNED PRIMARY KEY,
            FOREIGN KEY (pid) REFERENCES analytics_tables(id) ON DELETE CASCADE,
            aSelect JSON,
            aFrom JSON,
            aJoin TEXT,
            aWhere TEXT,
            aHaving TEXT,
            aGroup TEXT,
            aOrder TEXT
        )
        CHARACTER SET utf8 COLLATE utf8_general_ci;
        ");
    }
    if(!$A){ return ['error' => $SQL->error]; }
    $A = $SQL->query("SELECT can_view FROM module WHERE module = 'analytics' LIMIT 1");
    if($A->num_rows == 0){ return ['error' => 'Access_denied']; }
    while ($B = $A->fetch_row()){if(!in_array($_SESSION['user_role_id'], explode(',',$B[0]))){ return ['error' => 'Access_denied'];; }}
    return true;
}

function analytics_create($SQL){
    $share = '|'.SafeInput($SQL, implode('|', $_POST['share'] ?? [])).'|';
    if(isset($_POST['id'])){
        $id = SafeInput($SQL, $_POST['id']);
        if(!analytic_access($SQL, $id, 'can_edit')){ return ['error' => 'Access_denied']; }
        $A = $SQL->query("UPDATE analytics SET
        name = '".SafeInput($SQL, $_POST['name'])."',
        category = '".SafeInput($SQL, $_POST['category'])."',
        share = '$share'
        WHERE id = $id LIMIT 1");
    }
    else{
        if(!analytic_access($SQL, null, 'can_add')){ return ['error' => 'Access_denied']; }
        $A = $SQL->query("INSERT INTO analytics (added,name,category,share) VALUES (
        '".$_SESSION['user_id']."',
        '".SafeInput($SQL, $_POST['name'])."',
        '".SafeInput($SQL, $_POST['category'])."',
        '$share'
        )");
        $id = $SQL->insert_id;
    }
    if(!$A){ return ['error' => $SQL->error]; }
    return ['id' => $id];
}

function analytics_get($SQL, $user, $arr = []){
    $WHERE = '';
    if($_POST['id']){ $WHERE = ' AND id = '.SafeInput($SQL, $_POST['id']); }
	$A = $SQL->query("SELECT * FROM analytics
	WHERE (added = '$user' OR share LIKE '%|$user|%') AND active = 1 $WHERE
	ORDER BY category,name");
	while ($B = $A->fetch_assoc()){
        $B['share'] = explode('|', trim($B['share'], '|'));
        array_push($arr, $B);
    }
	return $arr;
}

function analytic_tables_create($SQL){
    $order_num = 0;
    $A = $SQL->query("SELECT order_num FROM analytics_tables WHERE pid = ".SafeInput($SQL, $_POST['pid'])." LIMIT 1");
    if($A || $A->num_rows != 0){while($B = $A->fetch_row()){ $order_num = $B[0]+1; }}

    if(isset($_POST['id'])){
        if(!analytic_access($SQL, SafeInput($SQL, $_POST['pid']), 'can_edit')){ return ['error' => 'Access_denied']; }
        $A = $SQL->query("UPDATE analytics_tables SET
        name = '".SafeInput($SQL, $_POST['name'])."',
        width = '".SafeInput($SQL, $_POST['width'])."',
        category = '".SafeInput($SQL, $_POST['category'])."',
        type = '".SafeInput($SQL, $_POST['type'])."'
        WHERE id = ".SafeInput($SQL, $_POST['id'])." LIMIT 1");
    }
    else{
        if(!analytic_access($SQL, SafeInput($SQL, $_POST['pid']), 'can_add')){ return ['error' => 'Access_denied']; }
        $A = $SQL->query("INSERT INTO analytics_tables (pid,name,order_num,width,category,type) VALUES (
        '".SafeInput($SQL, $_POST['pid'])."',
        '".SafeInput($SQL, $_POST['name'])."',
        '$order_num',
        '".SafeInput($SQL, $_POST['width'])."',
        '".SafeInput($SQL, $_POST['category'])."',
        '".SafeInput($SQL, $_POST['type'])."'
        )");
    }

    if(!$A){ return ['error' => $SQL->error]; }
    return true;
}

function analytic_tables_get($SQL, $arr = []){
    $WHERE = '';
    if($_POST['id']){ $WHERE = ' AND id = '.SafeInput($SQL, $_POST['id']); }
	$A = $SQL->query("SELECT * FROM analytics_tables 
    WHERE pid = ".SafeInput($SQL, $_POST['pid'])." AND active = 1 $WHERE
	ORDER BY order_num");
    if(!$A){ return ['error' => $SQL->error]; }
	while ($B = $A->fetch_assoc()){ array_push($arr, $B); }
	return $arr;
}

function analytic_content_get($SQL){
    $A = $SQL->query("SELECT * FROM analytics_content WHERE pid = ".SafeInput($SQL, $_POST['pid'])." LIMIT 1");
    if(!$A || $A->num_rows == 0){ return ['error' => 'No_data']; }
    while ($B = $A->fetch_assoc()){
        $B['aSelect'] = json_decode($B['aSelect']);
        $B['aFrom'] = json_decode($B['aFrom']);
        $B['aJoin'] = json_decode($B['aJoin']);
        $B['aWhere'] = json_decode($B['aWhere']);
        $B['aHaving'] = json_decode($B['aHaving']);
        $B['aGroup'] = json_decode($B['aGroup']);
        $B['aOrder'] = json_decode($B['aOrder']);
        return $B;
    }
}

function analytic_content_create($SQL){
    $pid = SafeInput($SQL, $_POST['pid']);
    $A = $SQL->query("SELECT pid FROM analytics_tables WHERE id = $pid LIMIT 1");
    while ($B = $A->fetch_row()){
        if(!analytic_access($SQL, $B[0], 'can_edit')){ return ['error' => 'Access_denied']; }
    }

    $A = $SQL->query("SELECT * FROM analytics_content WHERE pid = $pid LIMIT 1");
    if($A->num_rows == 0){
        $A = $SQL->prepare("INSERT INTO analytics_content (aSelect,aFrom,aJoin,aWhere,aHaving,aGroup,aOrder,pid) 
        VALUES (?,?,?,?,?,?,?,?)");
    }
    else{
        $A = $SQL->prepare("UPDATE analytics_content SET 
        aSelect=?,aFrom=?,aJoin=?,aWhere=?,aHaving=?,aGroup=?,aOrder=?
        WHERE pid=?");
    }
    $A->bind_param('sssssssi', 
        json_encode($_POST['aSelect'] ?? ''),
        json_encode($_POST['aFrom'] ?? ''),
        json_encode($_POST['aJoin'] ?? ''),
        json_encode($_POST['aWhere'] ?? ''),
        json_encode($_POST['aHaving'] ?? ''),
        json_encode($_POST['aGroup'] ?? ''),
        json_encode($_POST['aOrder'] ?? ''),
        $pid
    );
    if($A->execute() === TRUE){ return true; }
    else{ return ['error' => $SQL->error]; }
}

function analytics_delete($SQL){
    if(!analytic_access($SQL, SafeInput($SQL, $_POST['pid']), 'can_delete')){ return ['error' => 'Access_denied']; }
    $FROM = 'analytics'.SafeInput($SQL, $_POST['type'] ?? '');
    $A = $SQL->query("DELETE FROM $FROM WHERE id = ".SafeInput($SQL, $_POST['id'])." LIMIT 1");
    if(!$A){ return ['error' => $SQL->error]; }
    return true;
}

function analytic_access($SQL, $id, $access = 'can_view'){
    $A = $SQL->query("SELECT * FROM analytics WHERE id = $id AND added = ".$_SESSION['user_id']." LIMIT 1");
    if($A->num_rows == 0 && $id !== null){ return false; }
    $A = $SQL->query("SELECT $access FROM module WHERE module = 'analytics' LIMIT 1");
    while ($B = $A->fetch_row()){
        if(!in_array($_SESSION['user_role_id'], explode(',',$B[0]))){ return false; }
    }
    return true;
}
?>