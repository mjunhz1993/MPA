<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function create_config_file($SQL){
    $data = array();
    $time = time();
    $filename = $_SERVER['DOCUMENT_ROOT']. '/crm/php/user_data/config_file.php';
    $dirname = dirname($filename);
    if($_SESSION['user_id'] != 1){ return ['error' => 'Access_denied']; }

    // CREATE DIRECTORY IF NOT EXIST
    if(!is_dir($dirname)){ mkdir($dirname); }
    // CREATE USER CONFIG FILE
    $newFile = fopen($filename, "w");
    // DATA
    $t = '<?php $GLOBALS["config"] = [';
    $t .= '"defaultDateFormat" => "'. SafeInput($SQL, $_POST['defaultDateFormat']). '", ';
    $t .= '"defaultTimeFormat" => "'. SafeInput($SQL, $_POST['defaultTimeFormat']). '", ';
    $t .= '"currency" => "'. SafeInput($SQL, $_POST['currency']). '", ';
    $t .= '"phonezipcode" => "'. SafeInput($SQL, $_POST['phonezipcode']). '", ';
    $t .= '"defaultLanguage" => "'. SafeInput($SQL, $_POST['defaultLanguage']). '", ';
    $t .= '"max_file_size" => "'. SafeInput($SQL, $_POST['max_file_size']). '", ';
    $t .= '"crm_email" => "'. SafeInput($SQL, $_POST['crm_email']). '", ';

    if($_POST['usecaching'] == 'false'){ $_POST['usecaching'] = false; }
    else{ $_POST['usecaching'] = true; }
    $t .= '"usecaching" => "'. $_POST['usecaching']. '", ';

    $new_company_logo = 0;
    $path = $_SERVER['DOCUMENT_ROOT']. '/crm/php/user_data/';
    foreach($_FILES as $column => $value){
        for($i=0; $i<count($value['tmp_name']); $i++){
            if($value['tmp_name'][$i] != ''){
                $fileinfo = pathinfo($value['name'][$i]);

                if($column == 'company_logo'){
                    $new_company_logo++;
                    $newName = 'company_logo_'. $time. '.'. $fileinfo['extension'];
                    $newNameSmall = 'company_logo_'. $time. '_small.'. $fileinfo['extension'];
                    // REMOVE OLD LOGO
                    if($_POST['company_logo_hidden'] != ''){ remove_company_logo($path, $_POST['company_logo_hidden']); }
                    // ADD LOGO
                    move_uploaded_file($value['tmp_name'][$i], $path. $newName);
                    $im = new Imagick($path. $newName);
                    $im->scaleImage(100, 0);
                    $im->setImageFilename($path. $newNameSmall);
                    $im->writeImage();
                    $t .= '"company_logo" => "'. $newName. '", ';
                }

            }
        }
    }
    if($new_company_logo == 0 && $_POST['company_logo_hidden'] != ''){
        if(isset($_POST['REMOVE_COMPANY_LOGO'])){ remove_company_logo($path, $_POST['company_logo_hidden']); }
        else{ $t .= '"company_logo" => "'. SafeInput($SQL, $_POST['company_logo_hidden']). '", '; }
    }

    $t .= ']; ?>';
    // WRITE DATA INTO FILE + CLOSE
    fwrite($newFile, $t);
    fclose($newFile);
    $data['message'] = slovar('Successfully_edited');
    
    return $data;
}

function remove_company_logo($path, $oldLogo){
    $oldSmallLogo = explode('.', $oldLogo);
    unlink($path. $oldLogo);
    unlink($path. $oldSmallLogo[0]. '_small.'. $oldSmallLogo[1]);
}

if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){
    if(isset($_GET['create_config_file'])){ echo json_encode(create_config_file($SQL)); }
}
?>