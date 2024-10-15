<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('main/filter'));
include(loadPHP('map/location'));

function get_markers($SQL){
    $module = safeInput($SQL, $_POST['module']);
    $latCol = safeInput($SQL, $_POST['latCol']);
    $lngCol = safeInput($SQL, $_POST['lngCol']);
    $id = $module.'_id';
    $latMin = safeInput($SQL, $_POST['latMin']);
    $latMax = safeInput($SQL, $_POST['latMax']);
    $lngMin = safeInput($SQL, $_POST['lngMin']);
    $lngMax = safeInput($SQL, $_POST['lngMax']);

    list($sf, $fob, $sCol, $sCon) = getFilterData($SQL, $module, $_SESSION['user_id']);
    if(count($sCon) != 0){ $sCon = 'AND '.implode(' AND ', $sCon); }
    else{ $sCon = ''; }

    $title = array();
    $A = $SQL->query("SELECT column_id FROM module_columns WHERE module = '$module' AND list = 'PRIMARY' ORDER BY order_num");
    if($A->num_rows != 0){while ($B = $A->fetch_row()){ array_push($title, $B[0]); }}
    if(count($title) != 0){ $title = ",CONCAT(".implode(",', ',",$title).")"; }
    else{ $title = ''; }

    $A = $SQL->query("SELECT $id,$latCol,$lngCol $title FROM $module 
    WHERE $latCol BETWEEN $latMin AND $latMax AND $lngCol BETWEEN $lngMin AND $lngMax
    $sCon
    LIMIT 100");
    if($A->num_rows == 0){ return ['error' => 'No_markers_found']; }
    $data = array();
    while ($B = $A->fetch_row()){
        array_push($data, [
            'id'=>$B[0],
            'latlng'=>['lat'=>$B[1],'lng'=>$B[2]],
            'title'=>$B[3]
        ]);
    }
    return $data;
}

if(isset($_SESSION['user_id'])){
    if(isset($_GET['get_markers'])){ echo json_encode(get_markers($SQL)); }
    if(isset($_POST['find_location'])){ echo (find_location($_POST['find_location'])); }
}
?>