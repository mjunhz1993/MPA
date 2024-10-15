<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('main/filter'));

function get_events($SQL){
    $data = array();
    $user_id = $_SESSION['user_id'];
    $user_role_id = $_SESSION['user_role_id'];
    $module = SafeInput($SQL, $_GET['module']);
    $startCol = SafeInput($SQL, $_GET['startCol']);
    if(!isset($_GET['endCol']) || $_GET['endCol'] == ''){ $_GET['endCol'] = $startCol; }
    $endCol = SafeInput($SQL, $_GET['endCol']);

    list($startDate, $endDate) = get_event_daterange($SQL);
    
    $F = getFilterData($SQL, $module, $user_id);
    $selected_conditions = $F[3];
    if(count($selected_conditions) != 0){ $FILTERS = '('. implode(' AND ', $selected_conditions). ')'; }
    if(!isset($FILTERS)){ $FILTERS = get_event_filter($SQL, $module, $user_id, $user_role_id); }
    
    list($SELECT, $LEFT_JOIN) = get_event_SELECT($SQL, $module, $startCol, $endCol);

    $LIMIT = '';
    if(isset($_GET['limit'])){ $LIMIT = 'LIMIT '.SafeInput($SQL,$_GET['limit']); }
    
    $st = 0;

    $A = $SQL->query("SELECT $SELECT FROM $module $LEFT_JOIN
    WHERE 
    (
        $module.$startCol BETWEEN '$startDate' AND '$endDate' OR
        '$startDate' BETWEEN $module.$startCol AND $module.$endCol
    ) AND ($FILTERS)
    ORDER BY $module.$startCol $LIMIT");
    if(!$A){ return ['error' => $SQL->error]; }
    while ($B = $A->fetch_row()){
        $data[$st]['id'] = $B[0];
        $data[$st]['subject'] = $B[1];
        $data[$st]['start_date'] = $B[2];
        $data[$st]['end_date'] = $B[3];
        $data[$st]['color'] = $B[4];
        $st++;
    }
    return $data;
}

function get_event_SELECT($SQL, $module, $startCol, $endCol, $arr = []){
    list($displayed_subject, $LEFT_JOIN) = get_event_subject($SQL, $module);

    if(isset($_GET['colorCol']) && $_GET['colorCol'] != ''){ $color = SafeInput($SQL, $module.'.'.$_GET['colorCol']); }
    else{ $color = "'#565656'"; }

    return [
        implode(',', array(
            $module.'.'.$module.'_id',
            $displayed_subject,
            $module.'.'.$startCol,
            $module.'.'.$endCol,
            $color
        )),
        $LEFT_JOIN
    ];
}

function get_event_daterange($SQL){
    if(isset($_GET['startDate'])){ $startDate = strtotime(SafeInput($SQL, $_GET['startDate'])); }
    if(isset($_GET['endDate'])){ $endDate = strtotime(SafeInput($SQL, $_GET['endDate'])); }
    date_default_timezone_set("UTC");
    if(!isset($startDate)){ $startDate = time(); }
    if(!isset($endDate)){ $endDate = strtotime(' + 1 months'); }
    return [date('Y-m-d H:i:s', $startDate), date('Y-m-d H:i:s', $endDate)];
}

function get_event_filter($SQL, $module, $user_id, $user_role_id){
    if(!isset($_GET['assignedCol']) || $_GET['assignedCol'] == ''){ $_GET['assignedCol'] = 'added'; }
    if(!isset($_GET['shareCol']) || $_GET['shareCol'] == ''){ $_GET['shareCol'] = 'added'; }
    $assigned = $module.'.'.SafeInput($SQL, $_GET['assignedCol']);
    $share = $module.'.'.SafeInput($SQL, $_GET['shareCol']);

    $default = "($module.added = '$user_id' OR $assigned = '$user_id' OR $share LIKE '%|$user_id;%')";
    if(!isset($_COOKIE['calendarFilter'])){ return $default; }
    $users = explode(',',$_COOKIE['calendarFilter']);
    if(count($users) == 0){ return $default; }
    $A = $SQL->query("SELECT role_event_view_access FROM role WHERE role_id = '$user_role_id' LIMIT 1");
    if($A->num_rows == 0){ return $default; }
    while ($B = $A->fetch_row()){
        if($B[0] =! 1){ return $default; }
        $users = implode("','", $users);
        return "($module.added IN ('".$users."') OR $assigned IN ('".$users."'))";
    }
}

function get_event_subject($SQL, $module){
    $A = $SQL->query("SELECT data FROM module_calendar WHERE module = '$module' LIMIT 1");
    if(!$A || $A->num_rows == 0){ return get_default_event_subject($SQL, $module); }
    while ($B = $A->fetch_row()){
        $data = json_decode($B[0]);
        if($data->subject_custom == ''){ return get_default_event_subject($SQL, $module); }
        $displayed_subject = $module.'.'.$data->subject_custom;
        $LEFT_JOIN = '';
        if(
            $data->LEFT_JOIN != '' &&
            $data->LEFT_JOIN_COL != ''
        ){
            $displayed_subject = $data->LEFT_JOIN.'.'.$data->subject_custom;
            $LEFT_JOIN = "LEFT JOIN ".$data->LEFT_JOIN." ON ".$data->LEFT_JOIN."_id = ".$data->LEFT_JOIN_COL;
        }
        return [$displayed_subject,$LEFT_JOIN];
    }
}

function get_default_event_subject($SQL, $module){
    $A = $SQL->query("SELECT column_id FROM module_columns WHERE module = '$module' AND list = 'PRIMARY' LIMIT 1");
    if($A->num_rows == 0){ return false; }
    while ($B = $A->fetch_row()){ return [$module.'.'.$B[0],'']; }
}
    
if(isset($_SESSION['user_id'])){
    if(isset($_GET['get_events'])){ echo json_encode(get_events($SQL)); }
}
?>