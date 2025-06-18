<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('main/filter'));
include(loadPHP('map/location'));

function get_markers($SQL){
    $module = $_GET['module'];
    $titleCol = $_GET['titleCol'] ?? '""';
    $latCol = $_GET['latCol'];
    $lngCol = $_GET['lngCol'];
    $iconCol = $_GET['iconCol'] ?? '""';
    $colorCol = $_GET['colorCol'] ?? 0;
    $groupCol = $_GET['groupCol'] ?? '""';
    $id = $module.'_id';
    $latMin = $_GET['latMin'];
    $latMax = $_GET['latMax'];
    $lngMin = $_GET['lngMin'];
    $lngMax = $_GET['lngMax'];

    $JOIN = $_GET['join'] ?? '';
    if(is_array($JOIN)){ $JOIN = implode(' ', $JOIN); }

    $filter = $_GET['filter'] ?? '';
    if(is_array($filter)){ $filter = implode(' AND ', $filter); }
    if($filter != ''){ $filter = 'AND '.$filter; }

    $A = $SQL->query("
    SELECT $id, $latCol, $lngCol, $iconCol, $colorCol, $titleCol, $groupCol
    FROM $module
    $JOIN
    WHERE 
        $latCol BETWEEN $latMin AND $latMax AND 
        $lngCol BETWEEN $lngMin AND $lngMax
        $filter
    LIMIT 100");
    if(!$A || $A->num_rows == 0){ return false; }
    $data = array();
    while ($B = $A->fetch_row()){
        array_push($data, [
            'id'=>$B[0],
            'latlng'=>['lat'=>$B[1],'lng'=>$B[2]],
            'icon'=>$B[3],
            'color'=>$B[4],
            'title'=>$B[5],
            'group'=>$B[6]
        ]);
    }
    return $data;
}

if(isset($_SESSION['user_id'])){
    if(isset($_GET['get_markers'])){ echo json_encode(get_markers($SQL)); }
    if(isset($_GET['find_location'])){ echo (find_location($_GET['find_location'])); }
}
?>