<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/main/module.php');

    function change_checkbox_in_table($SQL){
        $module = SafeInput($SQL, $_GET['module']);
        $id = SafeInput($SQL, $_POST['id']);
        $column = SafeInput($SQL, $_POST['column']);
        $status = SafeInput($SQL, $_POST['table_value']);
        if(!check_if_edited_column_editable($SQL, $module, $column)){ return ['error' => slovar('Access_denied')]; }
        get_other_columns_data($SQL, $module, $id);
        $_POST[$column] = '1';
        if($status != 'true'){ unset($_POST[$column]); }
        return edit_row($SQL, $_SESSION['user_id'], $_SESSION['user_role_id']);
    }

    function change_selectmenu_in_table($SQL){
        $module = SafeInput($SQL, $_GET['module']);
        $id = SafeInput($SQL, $_POST['id']);
        $column = SafeInput($SQL, $_POST['column']);
        $status = SafeInput($SQL, $_POST['table_value']);
        if(!check_if_edited_column_editable($SQL, $module, $column)){ return ['error' => slovar('Access_denied')]; }
        get_other_columns_data($SQL, $module, $id);
        if($_POST[$column] == $status){ return ''; }
        $_POST[$column] = $status;
        return edit_row($SQL, $_SESSION['user_id'], $_SESSION['user_role_id']);
    }

    function change_status_pipeline($SQL){
        $module = SafeInput($SQL, $_GET['module']);
        $id = SafeInput($SQL, $_POST['id']);
        $column = SafeInput($SQL, $_POST['column']);
        $status = SafeInput($SQL, $_POST['table_value']);
        if(!check_if_edited_column_editable($SQL, $module, $column)){ return ['error' => slovar('Access_denied')]; }
        get_other_columns_data($SQL, $module, $id);
        $_POST[$column] = $status;
        return edit_row($SQL, $_SESSION['user_id'], $_SESSION['user_role_id']);
    }

    function check_if_edited_column_editable($SQL, $module, $column){
        $A = $SQL->query("SELECT * FROM module_columns WHERE column_id = '$column' AND editable = 1 LIMIT 1");
        if($A->num_rows == 0){ return false; }
        $A = $SQL->query("SELECT addon FROM module_addons WHERE module = '$module' AND addon LIKE 'hide_inputs|%'");
        while($B = $A->fetch_row()){if(in_array($column, explode(',',explode('|', $B[0])[2]))){ return false; }}
        return true;
    }
    function get_other_columns_data($SQL, $module, $id){
        $A = $SQL->query("SELECT * FROM $module WHERE ".$module."_id = '$id' LIMIT 1");
        foreach($A->fetch_all(MYSQLI_ASSOC)[0] as $key => $value){ $_POST[$key] = $value; $_POST[$key.'_old'] = $value; }
        $A = $SQL->query("SELECT column_id, type FROM module_columns WHERE module = '$module'
        AND type = 'CHECKBOX'");
        while ($B = $A->fetch_row()){
            if($_POST[$B[0]] == '1'){ continue; }
            unset($_POST[$B[0]]);
        }
    }

if(isset($_SESSION['user_id'])){
    if(isset($_GET['change_checkbox_in_table'])){ echo json_encode(change_checkbox_in_table($SQL)); }
    if(isset($_GET['change_selectmenu_in_table'])){ echo json_encode(change_selectmenu_in_table($SQL)); }
    if(isset($_GET['change_status_pipeline'])){ echo json_encode(change_status_pipeline($SQL)); }
}
?>