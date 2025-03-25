<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){
    
    $user_id = $_SESSION['user_id'];
    
    if(isset($_GET['select_filter']) && isset($_GET['module'])){
        $data = array();
        $module = SafeInput($SQL, $_GET['module']);
        $filter_id = SafeInput($SQL, $_POST['filter_id']);
        if(isset($_POST['assignuser']) && is_array($_POST['assignuser'])){for($i=0; $i<count($_POST['assignuser']); $i++){
            $assignuser = SafeInput($SQL, $_POST['assignuser'][$i]);
            if($filter_id != 0){
                $A = $SQL->query("SELECT * FROM filter_users WHERE module = '$module' AND user_id = '$assignuser' LIMIT 1");
                if($A->num_rows == 1){
                    $A = $SQL->query("UPDATE filter_users SET filter_id = '$filter_id' WHERE module = '$module' AND user_id = '$assignuser' LIMIT 1");
                    if(!$A){ $data['error'] = SQLerror($SQL); }
                }
                else{
                    $A = $SQL->query("INSERT INTO filter_users (filter_id,module,user_id) VALUES ('$filter_id','$module','$assignuser')");
                    if(!$A){ $data['error'] = SQLerror($SQL); }
                }
            }
            else{ $A = $SQL->query("DELETE FROM filter_users WHERE module = '$module' AND user_id = '$assignuser' LIMIT 1"); }
        }}
        echo json_encode($data);
    }
    
    
    if(isset($_GET['delete_filter']) && isset($_GET['module'])){
        $data = array();
        $module = SafeInput($SQL, $_GET['module']);
        $filter_id = SafeInput($SQL, $_POST['filter_id']);
        if($filter_id != 0){
            $A = $SQL->query("DELETE FROM filter WHERE id = '$filter_id' AND module = '$module' LIMIT 1");
            if(!$A){ $data['error'] = SQLerror($SQL); }
        }
        else{ $data['error'] = slovar('Delete_filter_error'); }
        echo json_encode($data);
    }
    
    if(isset($_GET['create_filter']) && isset($_GET['module'])){
        $data = array();
        $module = SafeInput($SQL, $_GET['module']);
        $public = 0;
        if(isset($_POST['public'])){ $public = 1; }
        $name = SafeInput($SQL, $_POST['name']);
        $order_by = $_POST['order_by'];
        $order_by_direction = $_POST['order_by_direction'];
        $filter_column = $_POST['filter_column'];
        $share = $_POST['share'] ?? '';
        if(is_array($share)){ $share = implode('|',$share); }
        
        if($name != ''){
            if($filter_column[0] != ''){
                $temp = array();
                for($i=0; $i<count($order_by); $i++){if($order_by[$i]!=''){ array_push($temp, $order_by[$i].'|'.$order_by_direction[$i]); }}
                $order_by = SafeInput($SQL, implode(',', $temp));
                for($i=0; $i<count($filter_column); $i++){if($filter_column[$i]==''){ unset($filter_column[$i]); }}
                $filter_column = SafeInput($SQL, implode(',', $filter_column));
                $A = $SQL->query("INSERT INTO filter (module,name,order_by,column_id,public,user_id,share)
                VALUES ('$module','$name','$order_by','$filter_column','$public','$user_id','$share')");
                if(!$A){ $data['error'] = SQLerror($SQL); }
                else{
                    $filter_id = $SQL->insert_id;
                    $filter_group_num = $_POST['filter_group_num'] ?? '';
                    $filter_type = $_POST['filter_type'] ?? '';
                    $filter_column_id = $_POST['filter_column_id'] ?? '';
                    $filter_condition_type = $_POST['filter_condition_type'] ?? '';
                    $filter_value = $_POST['filter_value'] ?? '';
                    $group_num = 1;
                    if(is_array($filter_group_num)){for($i=0; $i<count($filter_group_num); $i++){
                        $type = SafeInput($SQL, $filter_type[$i]);
                        $column_id = SafeInput($SQL, $filter_column_id[$i]);
                        $condition_type = SafeInput($SQL, $filter_condition_type[$i]);
                        $value = SafeInput($SQL, $filter_value[$i]);
                        $A = $SQL->query("INSERT INTO filter_conditions 
                        (filter_id,group_num,type,column_id,condition_type,value) VALUES
                        ('$filter_id','$group_num','$type','$column_id','$condition_type','$value')");
                        if(isset($filter_group_num[$i+1]) && $filter_group_num[$i] != $filter_group_num[$i+1]){ $group_num++; }
                    }}
                    // IZBERI NOVO KREIRAN FILTER
                    $A = $SQL->query("SELECT * FROM filter_users WHERE module = '$module' AND user_id = '$user_id' LIMIT 1");
                    if($A->num_rows == 1){
                        $A = $SQL->query("UPDATE filter_users SET filter_id = '$filter_id' WHERE module = '$module' AND user_id = '$user_id' LIMIT 1");
                    }
                    else{
                        $A = $SQL->query("INSERT INTO filter_users (filter_id,module,user_id) VALUES ('$filter_id','$module','$user_id')");
                    }
                }
            }
            else{ $data['error'] = slovar('Filter_columns_error'); }
        }
        else{ $data['error'] = slovar('Filter_name_error'); }
        
        echo json_encode($data);
    }
    
    if(isset($_GET['edit_filter']) && isset($_GET['id'])){
        $data = array();
        $id = SafeInput($SQL, $_GET['id']);
        $public = 0;
        if(isset($_POST['public'])){ $public = 1; }
        $name = SafeInput($SQL, $_POST['name']);
        $order_by = $_POST['order_by'];
        $order_by_direction = $_POST['order_by_direction'];
        $filter_column = $_POST['filter_column'];
        $share = $_POST['share'] ?? '';
        if(is_array($share)){ $share = implode('|',$share); }
        
        if($name != ''){
            if($filter_column[0] != ''){
                $temp = array();
                for($i=0; $i<count($order_by); $i++){if($order_by[$i]!=''){ array_push($temp, $order_by[$i].'|'.$order_by_direction[$i]); }}
                $order_by = SafeInput($SQL, implode(',', $temp));
                for($i=0; $i<count($filter_column); $i++){if($filter_column[$i]==''){ unset($filter_column[$i]); }}
                $filter_column = SafeInput($SQL, implode(',', $filter_column));
                $A = $SQL->query("UPDATE filter 
                SET name = '$name', order_by = '$order_by', column_id = '$filter_column', public = '$public', share = '$share'
                WHERE id = '$id' LIMIT 1");
                if(!$A){ $data['error'] = SQLerror($SQL); }
                else{
                    $A = $SQL->query("DELETE FROM filter_conditions WHERE filter_id = '$id'");
                    $A = $SQL->query("SELECT module FROM filter WHERE id = '$id' LIMIT 1");
                    while ($B = $A->fetch_row()){ $module = $B[0]; }
                    $filter_id = $id;
                    $filter_group_num = $_POST['filter_group_num'] ?? '';
                    $filter_type = $_POST['filter_type'] ?? '';
                    $filter_column_id = $_POST['filter_column_id'] ?? '';
                    $filter_condition_type = $_POST['filter_condition_type'] ?? '';
                    $filter_value = $_POST['filter_value'] ?? '';
                    $group_num = 1;
                    if(is_array($filter_group_num)){for($i=0; $i<count($filter_group_num); $i++){
                        $type = SafeInput($SQL, $filter_type[$i]);
                        $column_id = SafeInput($SQL, $filter_column_id[$i]);
                        $condition_type = SafeInput($SQL, $filter_condition_type[$i]);
                        $value = SafeInput($SQL, $filter_value[$i]);
                        $A = $SQL->query("INSERT INTO filter_conditions 
                        (filter_id,group_num,type,column_id,condition_type,value) VALUES
                        ('$filter_id','$group_num','$type','$column_id','$condition_type','$value')");
                        if(isset($filter_group_num[$i+1]) && $filter_group_num[$i] != $filter_group_num[$i+1]){ $group_num++; }
                    }}
                    // IZBERI NOVO KREIRAN FILTER
                    $A = $SQL->query("SELECT * FROM filter_users WHERE module = '$module' AND user_id = '$user_id' LIMIT 1");
                    if($A->num_rows == 1){
                        $A = $SQL->query("UPDATE filter_users SET filter_id = '$filter_id' WHERE module = '$module' AND user_id = '$user_id' LIMIT 1");
                    }
                    else{
                        $A = $SQL->query("INSERT INTO filter_users (filter_id,module,user_id) VALUES ('$filter_id','$module','$user_id')");
                    }
                }
            }
            else{ $data['error'] = slovar('Filter_columns_error'); }
        }
        else{ $data['error'] = slovar('Filter_name_error'); }
        
        echo json_encode($data);
    }

}

if(isset($_SESSION['user_id'])){

    $user_id = $_SESSION['user_id'];

    if(isset($_GET['get_filters']) && isset($_GET['module'])){
        $data = array();
        $module = SafeInput($SQL, $_GET['module']);
        $selected_filter = 0;
        $A = $SQL->query("SELECT filter_id FROM filter_users WHERE module='$module' AND user_id = $user_id LIMIT 1");
        while ($B = $A->fetch_row()){ $selected_filter = $B[0]; }
        $st = 0;
        $A = $SQL->query("SELECT id, name, user_id, public, share FROM filter WHERE module='$module'");
        while ($B = $A->fetch_row()){
            $data[$st]['id'] = $B[0];
            $data[$st]['using'] = 0;
            if($selected_filter == $B[0]){ $data[$st]['using'] = 1; }
            $data[$st]['name'] = $B[1];
            $data[$st]['user_id'] = $B[2];
            $data[$st]['public'] = $B[3];
            $data[$st]['share'] = explode('|',$B[4]);
            $st++;
        }
        echo json_encode($data);
    }

    if(isset($_GET['get_filter'])){
        $data = array();
        $id = SafeInput($SQL, $_GET['id']);

        $A = $SQL->query("SELECT name,order_by,column_id,public,share FROM filter WHERE id='$id' LIMIT 1");
        while ($B = $A->fetch_row()){
            $data['name'] = $B[0];
            $data['order_by'] = explode(',',$B[1]);
            $data['column_order'] = explode(',',$B[2]);
            $data['public'] = $B[3];
            $data['share'] = explode('|',$B[4]);
        }
        $st = 0;
        $A = $SQL->query("SELECT group_num,type,column_id,condition_type,value FROM filter_conditions WHERE filter_id='$id' ORDER BY group_num");
        while ($B = $A->fetch_row()){
            $data['group_num'][$st] = $B[0];
            $data['type'][$st] = $B[1];
            $data['column_id'][$st] = $B[2];
            $data['condition_type'][$st] = $B[3];
            $data['value'][$st] = $B[4];
            $st++;
        }

        echo json_encode($data);
    }

    if(isset($_GET['get_filter_assigns'])){
        $data = array();
        $WHERE = '';
        if(isset($_GET['filter_id'])){ $WHERE = "filter_id = '".SafeInput($SQL, $_GET['filter_id'])."'"; }
        if(isset($_GET['filter_module'])){ $WHERE = "module = '".SafeInput($SQL, $_GET['filter_module'])."'"; }
        $st = 0;
        $A = $SQL->query("SELECT user_id FROM filter_users WHERE $WHERE");
        while ($B = $A->fetch_row()){
            $data[$st] = $B[0];
            $st++;
        }
        echo json_encode($data);
    }

}
?>