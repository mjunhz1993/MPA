<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>

<?php
$module = SafeInput($SQL, $_GET['module']);
$A = $SQL->query("SELECT name, can_add FROM module WHERE module='$module'");
if($A->num_rows == 1){while ($B = $A->fetch_row()){
    $moduleName = $B[0];
    $moduleCanAdd = explode(',', $B[1]);
}}
?>

<body>
    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['token']; ?>">

    <div id="Main">
        <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/main/html/table.php'); ?>
        <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/main/html/edit.php'); ?>
        <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/main/html/add.php'); ?>
    </div>

    <script type="text/javascript">
        $('#Main').prepend(HTML_h1_table("<?php echo $moduleName; ?>"))
        loadJS('table/table', function(){
            tableLoadColumns($('#main_table'), function(){
                var h = getRowFromURL();
                if(h.id != ''){ loadJS('main/edit-box', function(){ openEditBox(h.id, h.type, h.year) })}
                $(window).on('hashchange', function(){
                    loadJS('main/edit-box', function(){
                        h = getRowFromURL();
                        if(h.id != ''){ openEditBox(h.id, h.type, h.year) }
                        else{ closeEditBox() }
                    })
                });
            });
        })
    </script>

    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>

</body>
</html>