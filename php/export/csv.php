<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('export/extra'));

function izvoz($SQL){
    if(!isset($_GET['id']) || $_GET['id'] == ''){ return ['error' => 'No_ID']; }
    $_POST['id'] = $_GET['id'];
    
    $query = get_table_query($SQL);
    if(!$query){ return ['error' => 'No_query_found']; }

    $A = $SQL->prepare($query);

    if(!$A){ return ['error' => $SQL->error]; }

    bind_param_to_table($A);

    $A->execute();
    $result = $A->get_result();
    if ($result->num_rows == 0) { return ['error' => 'No_data']; }

    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="'.$_GET['id'].'.csv"');
    header('Pragma: no-cache');
    header('Expires: 0');
    $output = fopen('php://output', 'w');

    $st = 0;
    while ($row = $result->fetch_assoc()){
        if($st == 0){ addTopRow($output, $row); }
        $arr = [];
        foreach($row as $r=>$v){ array_push($arr, $v); }
        fputcsv($output, $arr);
        $st++;
    }

    fclose($output);
}

function addTopRow($output, $row, $arr = []){
    foreach($row as $r=>$v){ array_push($arr, $r); }
    fputcsv($output, $arr);
}

if(isset($_SESSION['user_id'])){ izvoz($SQL); }
else{ echo 'Prijavite se v Oktagon program.'; }
?>