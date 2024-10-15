<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>

<body>
    <?php if($_SESSION['user_id'] == 1): ?>

    <?php
    if(isset($_POST['change_htaccess'])){
        $myfile = fopen($_SERVER['DOCUMENT_ROOT'].'/crm/.htaccess', "w");
        fwrite($myfile, $_POST['htaccess_data']);
        fclose($myfile);
    }
    ?>

    <div id="Main">
        <h1 data-slovar="Internal_crm_files"></h1>
        <div>
            <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/nav.php'); ?>
            <div class="box col80">
                <div class="boxInner">
                    <h2>Dnevnik napak</h2>
                    <textarea style="box-sizing:border-box; width:100%; height:60vh;" readonly><?php
                    $file = $_SERVER['DOCUMENT_ROOT']. '/crm/PHP_errors.log';
                    if(file_exists($file) && isset($_POST['remove_error_log'])){ unlink($file); }
                    if(file_exists($file)){
                        $handle = fopen($file,'r') or die("Unable to open file!");
                        echo fread($handle,filesize($file));
                        fclose($handle);
                    }
                    else{ echo 'Prazno'; }
                    ?></textarea>

                    <form method="post"><button name="remove_error_log" class="button buttonBlack">Počisti datoteko</button></form>
                    <hr/>

                    <h2>.htaccess</h2>
                    <form method="post">
                    <textarea name="htaccess_data" style="box-sizing:border-box; width:100%; height:60vh;"><?php
                    $file = $_SERVER['DOCUMENT_ROOT'].'/crm/.htaccess';
                    if(file_exists($file)){
                        $handle = fopen($file,'r') or die("Unable to open file!");
                        echo fread($handle,filesize($file));
                        fclose($handle);
                    }
                    else{ echo 'Prazno'; }
                    ?></textarea>
                    <button name="change_htaccess" class="button buttonBlack">Shrani</button></form>
                </div>
            </div>
        </div>
    </div>
    
    <?php else: ?>
    <div id="Main"><?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/nav.php'); ?></div>
    <?php endif; ?>
    
    <script> $('#configNav a:eq(6)').addClass('act'); </script>
    
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>
</body>
</html>