<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>

<body>
    <script src="/crm/static/js/dev/slovar/<?php echo $_SESSION['user_language']; ?>.js?<?php echo $GLOBALS['APP_VERSION']; ?>"></script>
    <div id="Main">
        <h1><span data-slovar="Configurations"></span></h1>
        <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/nav.php'); ?>
        <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/config/edit.php'); ?>
    </div>
    
    <script src="/crm/static/js/config/config.js?<?php echo $GLOBALS['APP_VERSION']; ?>"></script>
    <script src="/crm/static/js/file/file.js?<?php echo $GLOBALS['APP_VERSION']; ?>"></script>
    
    <script> $('#configNav a:eq(3)').addClass('act'); </script>

    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>
</body>
</html>