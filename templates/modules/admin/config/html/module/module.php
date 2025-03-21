<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>

<body>
    <script src="/crm/static/js/dev/slovar/<?= $_SESSION['user_language']; ?>.js?<?= $GLOBALS['APP_VERSION']; ?>"></script>
    <?php if($_SESSION['user_id'] == 1): ?>
    
    <input type="hidden" name="csrf_token" id="csrf_token" value="<?= $_SESSION['token']; ?>">

    <div id="Main">
        <h1 data-slovar="Modules"></h1>
        <div>
            <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/nav.php'); ?>
            <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/module/table.php'); ?>
        </div>
        <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/module/add.php'); ?>
        <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/module/edit.php'); ?>
        <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/module/delete.php'); ?>
    </div>
    
    <script src="/crm/static/js/dev/module.js?<?= $GLOBALS['APP_VERSION']; ?>"></script>
    <script src="/crm/static/js/dev/column.js?<?= $GLOBALS['APP_VERSION']; ?>"></script>
    
    <?php else: ?>
    <div id="Main"><?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/nav.php'); ?>></div>
    <?php endif; ?>
    
    <script> $('#configNav a:eq(4)').addClass('act'); </script>
    
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>
</body>
</html>