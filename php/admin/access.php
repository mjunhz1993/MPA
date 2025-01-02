<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){
    
    
    if(isset($_GET['edit_access'])){
        $data = array();
        
        if($_SESSION['user_id'] == 1){
            
            $can_view = isset($_POST['view']) && is_array($_POST['view']) && $_POST['view'] ? SafeInput($SQL, implode(',', $_POST['view'])) : '';
            $can_add = isset($_POST['add']) && is_array($_POST['add']) && $_POST['add'] ? SafeInput($SQL, implode(',', $_POST['add'])) : '';
            $can_edit = isset($_POST['edit']) && is_array($_POST['edit']) && $_POST['edit'] ? SafeInput($SQL, implode(',', $_POST['edit'])) : '';
            $can_delete = isset($_POST['delete']) && is_array($_POST['delete']) && $_POST['delete'] ? SafeInput($SQL, implode(',', $_POST['delete'])) : '';

            if(isset($_POST['module'])){
                $module = SafeInput($SQL, $_POST['module']);
                $A = $SQL->query("UPDATE module SET 
                can_view = '$can_view', can_add = '$can_add', can_edit = '$can_edit', can_delete = '$can_delete' 
                WHERE module = '$module' LIMIT 1");
                if(!$A){ $data['error'] = SQLerror($SQL); }
                else{
                    if(isset($_GET['set_columns'])){
                        $A = $SQL->query("UPDATE module_columns SET can_view = '$can_view', can_edit = '$can_edit' WHERE module = '$module'");
                        if(!$A){ $data['error'] = SQLerror($SQL); }
                    }
                }
            }
            else if(isset($_POST['column'])){
                $column = SafeInput($SQL, $_POST['column']);
                $A = $SQL->query("UPDATE module_columns SET can_view = '$can_view', can_edit = '$can_edit' WHERE column_id = '$column' LIMIT 1");
                if(!$A){ $data['error'] = SQLerror($SQL); }
            }
        
        }
        else{ $data['error'] = slovar('Access_denied'); }
        
        echo json_encode($data);
    }
        
}
?>