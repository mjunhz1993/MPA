<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>

<body>
    <?php if($_SESSION['user_id'] == 1): ?>
    
    <input type="hidden" name="csrf_token" id="csrf_token" value="<?= $_SESSION['token']; ?>">

    <div id="Main">
        <h1 data-slovar="Custom_module"></h1>
        <div>
            <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/nav.php'); ?>
            <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/custom_files/table.php'); ?>
        </div>
    </div>

    <script src="/crm/static/js/dev/custom_files.js?<?= $GLOBALS['APP_VERSION']; ?>"></script>
    <script>
        getCustomFiles($('#FileTable'));
    </script>
    
    <?php else: ?>
    <div id="Main"><?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/nav.php'); ?>></div>
    <?php endif; ?>
    
    <script> $('#configNav a:eq(5)').addClass('act'); </script>
    
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>
</body>
</html>