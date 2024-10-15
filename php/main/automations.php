<?php
function execute_automation_ADD_CHECK($SQL, $module, $col, $col_value){
    $user_id = $_SESSION['user_id'];
    $AUTO = $SQL->query("SELECT auto_command FROM module_automations WHERE module = '$module' AND action = 'ADD_CHECK' ORDER BY order_num ASC");
    if($AUTO->num_rows != 0){while($BAUTO = $AUTO->fetch_row()){ return eval($BAUTO[0]); }}
    return '';
}

function execute_automation_ADD($SQL, $module, $data, $newRowID){
    $user_id = $_SESSION['user_id'];
    $AUTO = $SQL->query("SELECT auto_command FROM module_automations WHERE module = '$module' AND action = 'ADD' ORDER BY order_num ASC");
    if($AUTO->num_rows != 0){while($BAUTO = $AUTO->fetch_row()){ eval($BAUTO[0]); }}
}

function execute_automation_EDIT_CHECK($SQL, $module){
    $user_id = $_SESSION['user_id'];
    $AUTO = $SQL->query("SELECT auto_command FROM module_automations WHERE module = '$module' AND action = 'EDIT_CHECK' ORDER BY order_num ASC");
    if($AUTO->num_rows != 0){while($BAUTO = $AUTO->fetch_row()){ return eval($BAUTO[0]); }}
    return '';
}

function execute_automation_EDIT($SQL, $module, $EditedRowID, $EditedRowData){
    $user_id = $_SESSION['user_id'];
    $AUTO = $SQL->query("SELECT auto_command FROM module_automations WHERE module = '$module' AND action = 'EDIT' ORDER BY order_num ASC");
    if($AUTO->num_rows != 0){while($BAUTO = $AUTO->fetch_row()){ eval($BAUTO[0]); }}
}

function execute_automation_DELETE($SQL, $module, $DeletedRowID, $DeletedRowData){
    $user_id = $_SESSION['user_id'];
    $AUTO = $SQL->query("SELECT auto_command FROM module_automations WHERE module = '$module' AND action = 'DELETE' ORDER BY order_num ASC");
    if($AUTO->num_rows != 0){while($BAUTO = $AUTO->fetch_row()){ eval($BAUTO[0]); }}
}
?>