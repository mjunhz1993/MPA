<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>

<body>
    <input type="hidden" name="csrf_token" id="csrf_token" value="<?php echo $_SESSION['token']; ?>">

    <div id="Main">
        <h1 data-slovar="Module_access"></h1>
        <div>
            <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/nav.php'); ?>
            <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/module_access/table.php'); ?>
        </div>
    </div>
    
    <script src="/crm/static/js/config/module_access.js?<?php echo $GLOBALS['APP_VERSION']; ?>"></script>
    
    <script> $('#configNav a:eq(1)').addClass('act'); </script>

    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>
</body>
</html>