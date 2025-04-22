<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
if(!isset($GLOBALS["config"]["SENDGRID"])){ exit(); }
include(loadPHP('file/file'));
include(loadPHP('main/filter'));
$SENDGRID = $GLOBALS["config"]["SENDGRID"];

function refresh_campaign_list_count($SQL, $id){
    $A = $SQL->query("
        UPDATE campaign_list SET campaign_list.subscribed = (
            SELECT COUNT(campaign_email.email) FROM campaign_email WHERE campaign_email.campaign_list = '$id'
        )
        WHERE campaign_list.id = '$id' LIMIT 1
    ");
}

function HTML_emailHead($titel){
    return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'.
    '<html xmlns="https://www.w3.org/1999/xhtml"><head><title>'.$titel.'</title>'.
    '<meta http–equiv="Content-Type" content="text/html; charset=UTF-8" /><meta http–equiv="X-UA-Compatible" content="IE=edge" />'.
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>'.
    '<body style="margin:0px; padding:0px;" bgcolor="#efefef">';
}

function create_batch_id(){
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, "https://api.sendgrid.com/v3/mail/batch");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Authorization: Bearer '. $GLOBALS["config"]["SENDGRID"]
    ));
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
}

function add_event($SQL){
    $data = array();
    $name = SafeInput($SQL, $_POST['name']);
    $campaign_list = SafeInput($SQL, $_POST['campaign_list']);
    $campaign_template = SafeInput($SQL, $_POST['campaign_template']);
    $batch_id = $_POST['batch_id'];
    $start_date = SafeInput($SQL, $_POST['start_date']);
    if($name == ''){ return ['error' => 'No_name']; }

    $A = $SQL->query("SELECT body FROM campaign_template WHERE id = $campaign_template LIMIT 1");
    while($B = $A->fetch_row()){ $body = mb_strlen($B[0], '8bit'); }
    if($body > 1024 * 1024 * 18){ return ['error' => 'Too_large_template']; }

    $A = $SQL->query("INSERT INTO campaign_event (name,campaign_list,campaign_template,batch_id,start_date)
    VALUES ('$name','$campaign_list','$campaign_template','$batch_id','$start_date')");
    if(!$A){ return ['error' => SQLerror($SQL)]; }
    return '';
}

if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){
    
    // EVENT

    if(isset($_GET['create_batch_id'])){ echo json_encode(create_batch_id()); }
    if(isset($_GET['add_event'])){ echo json_encode(add_event($SQL)); }

    if(isset($_GET['cancel_send'])){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.sendgrid.com/v3/user/scheduled_sends");
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Authorization: Bearer '. $SENDGRID,
            'Content-Type: application/json'
        ));
        $data = array(
            'batch_id' => $batch_id,
            'status' => 'cancel'
        );
        $data_string = json_encode($data);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
        $result = curl_exec($ch);
        curl_close($ch);
    }

    // E-MAIL LIST

    if(isset($_GET['add_email_list'])){
        $data = array();
        $id = SafeInput($SQL, $_POST['id']);
        $name = SafeInput($SQL, $_POST['name']);
        if($name != ''){
            if($id == ''){ $A = $SQL->query("INSERT INTO campaign_list (name) VALUES ('$name')"); }
            else{ $A = $SQL->query("UPDATE campaign_list SET name = '$name' WHERE id = '$id' LIMIT 1"); }
            if(!$A){ $data['error'] = SQLerror($SQL); }
        }
        echo json_encode($data);
    }

    if(isset($_GET['delete_email_list'])){
        $data = array();
        if($_POST['id'] != ''){
            $id = SafeInput($SQL, $_POST['id']);
            $A = $SQL->query("DELETE FROM campaign_list WHERE id = '$id' LIMIT 1");
            if(!$A){ $data['error'] = SQLerror($SQL); }
        }
        echo json_encode($data);
    }

    // E-MAIL

    if(isset($_GET['add_email'])){
        $data = array();
        $old_email = SafeInput($SQL, $_POST['old_email']);
        $campaign_list = SafeInput($SQL, $_POST['campaign_list']);
        $email = SafeInput($SQL, $_POST['email']);
        $name = SafeInput($SQL, $_POST['name']);
        if($name != '' && $email != ''){
            if($old_email == ''){
                $subscribed = 1;
                $A = $SQL->query("SELECT subscribed FROM campaign_email WHERE email = '$email' LIMIT 1");
                while ($B = $A->fetch_row()){ $subscribed = $B[0]; }
                $A = $SQL->query("INSERT INTO campaign_email (campaign_list,email,name,subscribed) VALUES ('$campaign_list','$email','$name','$subscribed')");
            }
            else{ $A = $SQL->query("UPDATE campaign_email SET email = '$email', name = '$name' WHERE campaign_list = '$campaign_list' AND email = '$old_email' LIMIT 1"); }
            if(!$A){ $data['error'] = SQLerror($SQL); }
            else{if($id == ''){ refresh_campaign_list_count($SQL, $campaign_list); }}
        }
        echo json_encode($data);
    }

    if(isset($_GET['import_emails'])){
        $data = array();
        $module = SafeInput($SQL, $_POST['module']);
        $type = SafeInput($SQL, $_POST['export_type']);
        $campaign_list = SafeInput($SQL, $_POST['export_list']);
        $email_column = $module.'.'.SafeInput($SQL, $_POST['export_email']);
        $name_column = $module.'.'.SafeInput($SQL, $_POST['export_name']);
        $WHERE = "WHERE ". $email_column. " != '' ";

        if($type == 1){
            $selectedID = explode(',', SafeInput($SQL, $_POST['selectedID']));
            $WHERE .= "AND ". $module. ".". $module. "_id IN ('". implode("','", $selectedID). "')";
        }
        else if($type == 2){
            $F = getFilterData($SQL, $module, $_SESSION['user_id']);
            if(count($F[3]) != 0){ $WHERE .= 'AND ('. implode(' OR ', $F[3]). ')'; }
        }

        $A = $SQL->query("
            INSERT IGNORE INTO campaign_email (email,campaign_list,name,subscribed)
            SELECT DISTINCT($email_column),'$campaign_list',$name_column,IFNULL(b.subscribed, 1) FROM $module
            LEFT JOIN campaign_email b ON $email_column = b.email
            $WHERE
        ");
        if(!$A){ $data['error'] = SQLerror($SQL); }
        else{ refresh_campaign_list_count($SQL, $campaign_list); }

        echo json_encode($data);
    }

    if(isset($_GET['delete_email'])){
        $data = array();
        $campaign_list = SafeInput($SQL, $_POST['campaign_list']);
        $email = SafeInput($SQL, $_POST['email']);
        if($campaign_list != '' && $email != ''){
            if($campaign_list != 0){ $A = $SQL->query("DELETE FROM campaign_email WHERE campaign_list = '$campaign_list' AND email = '$email' LIMIT 1"); }
            else{ $A = $SQL->query("UPDATE campaign_email SET subscribed = 1 WHERE email = '$email'"); }
            if(!$A){ $data['error'] = SQLerror($SQL); }
            else{if($campaign_list != 0){ refresh_campaign_list_count($SQL, $campaign_list); }}
        }
        echo json_encode($data);
    }

    // TEMPLATE

    if(isset($_GET['save_template'])){
        $data = array();
        $name = SafeInput($SQL, $_POST['name']);
        if($_POST['id'] != ''){
            $id = SafeInput($SQL, $_POST['id']);
            $A = $SQL->query("UPDATE campaign_template SET name = '$name' WHERE id = '$id' LIMIT 1");
            if(!$A){ $data['error'] = SQLerror($SQL); }
            else{ $data['id'] = $id; }
        }
        else{
            $A = $SQL->query("INSERT INTO campaign_template (name) VALUES ('$name')");
            if(!$A){ $data['error'] = SQLerror($SQL); }
            else{ $data['id'] = $SQL->insert_id; }
        }

        if(!isset($data['error'])){
            createFileUploadDIR('campaign/campaign'.$data['id']);
            createFileUploadDIR('campaign/campaign'.$data['id'].'_temp');
        }
        echo json_encode($data);
    }
    if(isset($_GET['save_template_img'])){
        $id = SafeInput($SQL, $_POST['id']);
        if(substr($_POST['img'], 0, 4) === 'data'){
            $name = time().'.jpg';
            $im = new Imagick();
            $im->readimageblob(base64_decode(explode(';base64,', $_POST['img'])[1]));
            if($im->getImageWidth() > $_POST['width']){ $im->scaleImage($_POST['width'], 0); }
            $im->setImageFilename($_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/campaign/campaign'.$id.'_temp/'.$name);
            $im->writeImage();
        }
        else{
            $fileinfo = pathinfo($_POST['img']);
            $name = time().'.'.$fileinfo['extension'];
            copy($_POST['img'], $_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/campaign/campaign'.$id.'_temp/'.$name);
        }
        $data['name'] = $name;
        echo json_encode($data);
    }
    if(isset($_GET['save_template_body'])){
        $data = array();
        $body = $SQL->real_escape_string($_POST['body']);
        $id = SafeInput($SQL, $_POST['id']);
        $A = $SQL->query("UPDATE campaign_template SET body = '$body' WHERE id = '$id' LIMIT 1");
        if(!$A){ $data['error'] = SQLerror($SQL); }
        else{
            deleteFileUploadDIR('campaign/campaign'.$id);
            $dirTemp = $_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/campaign/campaign'.$id.'_temp/';
            $dir = $_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/campaign/campaign'.$id.'/';
            rename($dirTemp, $dir);
        }
        echo json_encode($data);
    }
    if(isset($_GET['delete_template'])){
        $data = array();
        if($_POST['id'] != ''){
            $id = SafeInput($SQL, $_POST['id']);
            $A = $SQL->query("DELETE FROM campaign_template WHERE id = '$id' LIMIT 1");
            if(!$A){ $data['error'] = SQLerror($SQL); }
            else{ deleteFileUploadDIR('campaign/campaign'.$id); }
        }
        echo json_encode($data);
    }

}

// ---------------- GET

if(isset($_SESSION['user_id'])){

    // INSTAL

    if(isset($_GET['check_environment'])){
        $data = array();
        $A = $SQL->query("
            SELECT * FROM information_schema.tables 
            WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'campaign_event' LIMIT 1
        ");
        if($A->num_rows != 1){
            createFileUploadDIR('campaign');

            $A = $SQL->query("CREATE TABLE campaign_list
            (
                id INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                subscribed INT(100) DEFAULT 0
            )
            CHARACTER SET utf8 COLLATE utf8_general_ci");

            $A = $SQL->query("CREATE TABLE campaign_email
            (
                campaign_list INT(100) UNSIGNED,
                email VARCHAR(100),
                name VARCHAR(100),
                subscribed TINYINT DEFAULT 1,
                PRIMARY KEY (campaign_list, email),
                FOREIGN KEY (campaign_list) REFERENCES campaign_list(id) ON DELETE RESTRICT ON UPDATE CASCADE
            )
            CHARACTER SET utf8 COLLATE utf8_general_ci");

            $A = $SQL->query("CREATE TABLE campaign_template
            (
                id INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                body TEXT
            )
            CHARACTER SET utf8 COLLATE utf8_general_ci");

            $A = $SQL->query("CREATE TABLE campaign_event
            (
                id INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                campaign_list INT(100) UNSIGNED,
                FOREIGN KEY (campaign_list) REFERENCES campaign_list(id) ON DELETE RESTRICT ON UPDATE CASCADE,
                campaign_template INT(100) UNSIGNED,
                FOREIGN KEY (campaign_template) REFERENCES campaign_template(id) ON DELETE RESTRICT ON UPDATE CASCADE,
                name VARCHAR(100),
                batch_id TEXT,
                start_date DATETIME,
                list_offset INT(100) DEFAULT 0,
                finished TINYINT DEFAULT 0
            )
            CHARACTER SET utf8 COLLATE utf8_general_ci");

            $A = $SQL->query("CREATE TABLE campaign_stats
            (
                stat_date DATE PRIMARY KEY,
                requests INT(100),
                delivered INT(100),
                opens INT(100),
                unique_opens INT(100),
                processed INT(100),
                clicks INT(100),
                unique_clicks INT(100),
                bounces INT(100),
                invalid_emails INT(100),
                spam_reports INT(100),
                blocks INT(100)
            )
            CHARACTER SET utf8 COLLATE utf8_general_ci");
        }
    }

    // GET DATA

    if(isset($_GET['get_all_lists'])){
        $data = array(); $st = 0;
        $A = $SQL->query("SELECT id,name,subscribed FROM campaign_list");
        while ($B = $A->fetch_row()){
            $data[$st]['id'] = $B[0];
            $data[$st]['name'] = $B[1];
            $data[$st]['subscribed'] = $B[2];
            $st++;
        }
        echo json_encode($data);
    }

    if(isset($_GET['get_emails'])){
        $data = array();
        $campaign_list = SafeInput($SQL, $_GET['id']);
        if($campaign_list != 0){ $campaign_list = "campaign_list = '". $campaign_list. "'"; }
        else{ $campaign_list = "subscribed = 0"; }
        $search = SafeInput($SQL, $_GET['search']);
        $ORDER = SafeInput($SQL, $_GET['orderBy']);
        $DIRECTION = SafeInput($SQL, $_GET['orderDir']);
        $OFFSET = SafeInput($SQL, $_GET['offset']);
        $st = 0;
        $A = $SQL->query("SELECT campaign_list,email,name,subscribed FROM campaign_email
        WHERE $campaign_list AND email LIKE '%$search%'
        ORDER BY $ORDER $DIRECTION LIMIT 30 OFFSET $OFFSET");
        while ($B = $A->fetch_row()){
            $data[$st]['campaign_list'] = $B[0];
            $data[$st]['email'] = $B[1];
            $data[$st]['name'] = $B[2];
            $data[$st]['status'] = $B[3];
            $st++;
        }
        echo json_encode($data);
    }

    if(isset($_GET['get_all_templates'])){
        $data = array(); $st = 0;
        $A = $SQL->query("SELECT id,name FROM campaign_template");
        while ($B = $A->fetch_row()){
            $data[$st]['id'] = $B[0];
            $data[$st]['name'] = $B[1];
            $st++;
        }
        echo json_encode($data);
    }
    if(isset($_GET['get_template_body'])){
        $data = array(); $id = SafeInput($SQL, $_GET['id']);
        $A = $SQL->query("SELECT body FROM campaign_template WHERE id='$id' LIMIT 1");
        while ($B = $A->fetch_row()){ $data['body'] = $B[0]; }
        echo json_encode($data);
    }

    if(isset($_GET['get_all_events'])){
        $data = array();
        $year = SafeInput($SQL, $_GET['year']);
        $month = SafeInput($SQL, $_GET['month']);
        $st = 0;
        date_default_timezone_set("UTC");
        $t = date('Y-m-d H:i:s', time());
        // $A = $SQL->query("DELETE FROM campaign_event WHERE start_date < '$t'");
        $A = $SQL->query("SELECT a.id,b.name,c.name,a.name,a.batch_id,a.start_date,a.list_offset,a.finished
        FROM campaign_event a
        LEFT JOIN campaign_list b ON a.campaign_list = b.id
        LEFT JOIN campaign_template c ON a.campaign_template = c.id
        WHERE YEAR(start_date) = '$year' AND MONTH(start_date) = '$month'
        ORDER BY start_date DESC");
        while ($B = $A->fetch_row()){
            $data[$st]['id'] = $B[0];
            $data[$st]['campaign_list'] = $B[1];
            $data[$st]['campaign_template'] = $B[2];
            $data[$st]['name'] = $B[3];
            $data[$st]['batch_id'] = $B[4];
            $data[$st]['start_date'] = $B[5];
            $data[$st]['offset'] = $B[6];
            $data[$st]['finished'] = $B[7];
            $st++;
        }
        echo json_encode($data);
    }
}
?>