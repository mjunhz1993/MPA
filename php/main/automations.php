<?php
function execute_automation_ADD_CHECK($SQL, $module){
    $A = $SQL->query("SELECT auto_command FROM module_automations WHERE module = '$module' AND action = 'ADD_CHECK' ORDER BY order_num ASC");
    if($A->num_rows == 0){ return ''; }
    while($B = $A->fetch_row()){
        $C = explode('|', $B[0]);
        include_once(loadPHP('downloads/'.$C[0]));
        return call_user_func($C[1], $SQL, $module);
    }
}

function execute_automation_ADD($SQL, $module, $id){
    $A = $SQL->query("SELECT auto_command FROM module_automations WHERE module = '$module' AND action = 'ADD' ORDER BY order_num ASC");
    if($A->num_rows == 0){ return ''; }
    while($B = $A->fetch_row()){
        $C = explode('|', $B[0]);
        include_once(loadPHP('downloads/'.$C[0]));
        call_user_func($C[1], $SQL, $module, $id);
    }
}

function execute_automation_EDIT_CHECK($SQL, $module, $id){
    $A = $SQL->query("SELECT auto_command FROM module_automations WHERE module = '$module' AND action = 'EDIT_CHECK' ORDER BY order_num ASC");
    if($A->num_rows == 0){ return ''; }
    while($B = $A->fetch_row()){
        $C = explode('|', $B[0]);
        include_once(loadPHP('downloads/'.$C[0]));
        return call_user_func($C[1], $SQL, $module, $id);
    }
}

function execute_automation_EDIT($SQL, $module, $id){
    $A = $SQL->query("SELECT auto_command FROM module_automations WHERE module = '$module' AND action = 'EDIT' ORDER BY order_num ASC");
    if($A->num_rows == 0){ return ''; }
    while($B = $A->fetch_row()){
        $C = explode('|', $B[0]);
        include_once(loadPHP('downloads/'.$C[0]));
        call_user_func($C[1], $SQL, $module, $id);
    }
}

function execute_automation_DELETE($SQL, $module, $id, $rowData){
    $A = $SQL->query("SELECT auto_command FROM module_automations WHERE module = '$module' AND action = 'DELETE' ORDER BY order_num ASC");
    if($A->num_rows == 0){ return ''; }
    while($B = $A->fetch_row()){
        $C = explode('|', $B[0]);
        include_once(loadPHP('downloads/'.$C[0]));
        call_user_func($C[1], $SQL, $module, $id, $rowData);
    }
}
?>