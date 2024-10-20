<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function update_app_version(){
    $file = $_SERVER['DOCUMENT_ROOT'].'/crm/php/user_data/';
    if(!file_exists($file)){ return ['error' => 'No_map']; }
    $file = $file.'app_version.php';
    $newFile = fopen($file, "w");
    fwrite($newFile, '<?php $GLOBALS[\'APP_VERSION\'] = '.time().'; ?>');
    return fclose($newFile);
}

function more_space_info($SQL){
    $data = array();
    $files = disk_total_space("/") - disk_free_space("/");
    $i = 0;
    $A = $SQL->query("SELECT table_schema, sum((data_length+index_length)/1024/1024), sum(data_length+index_length) from information_schema.tables GROUP BY 1");
    while ($B = $A->fetch_row()){
        $files -= $B[2];
        $data[$i]['name'] = 'SQL <b>'.$B[0].'</b>';
        $data[$i]['space'] = number_format($B[1],2,',','').' Mb';
        $i++;
    }
    $data[$i]['name'] = 'Files';
    $files = ((($files * 0.001) * 0.001) * 0.001);
    $data[$i]['space'] = number_format($files,2,',','').' Gb';
    return $data;
}

function get_public_ip(){ return file_get_contents("http://ipecho.net/plain"); }

if(isset($_SESSION['user_id'])){
    if(isset($_GET['update_app_version'])){ echo json_encode(update_app_version()); }
    if(isset($_GET['more_space_info'])){ echo json_encode(more_space_info($SQL)); }
    if(isset($_GET['get_public_ip'])){ echo json_encode(get_public_ip()); }
}
?>