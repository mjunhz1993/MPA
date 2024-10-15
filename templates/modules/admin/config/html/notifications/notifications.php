<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>

<body>
    <script src="/crm/static/js/dev/slovar/<?php echo $_SESSION['user_language']; ?>.js?<?php echo $GLOBALS['APP_VERSION']; ?>"></script>
    <?php if($_SESSION['user_id'] == 1): ?>
    
    <input type="hidden" name="csrf_token" id="csrf_token" value="<?php echo $_SESSION['token']; ?>">

    <div id="Main">
        <h1 data-slovar="Notifications"></h1>
        <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/nav.php'); ?>
    </div>
    <script src="/crm/static/js/dev/notifications.js?<?php echo $GLOBALS['APP_VERSION']; ?>"></script>
    
    <script> $('#configNav a:eq(2)').addClass('act'); </script>
    
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>
    <?php endif; ?>
</body>
</html>