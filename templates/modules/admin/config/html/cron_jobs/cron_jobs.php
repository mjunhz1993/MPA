<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>

<body>
    <script src="/crm/static/js/dev/slovar/<?= $_SESSION['user_language']; ?>.js?<?= $GLOBALS['APP_VERSION']; ?>"></script>
    <?php if($_SESSION['user_id'] == 1): ?>
    
    <input type="hidden" name="csrf_token" id="csrf_token" value="<?= $_SESSION['token']; ?>">

    <div id="Main">
        <h1 data-slovar="Cron_jobs"></h1>
        <div>
            <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/nav.php'); ?>
        </div>
    </div>
    
    <script>
        loadJS('dev/cron_jobs');
        $('#configNav a:eq(7)').addClass('act');
    </script>
    
    <?php else: ?>
    <div id="Main"><?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/nav.php'); ?>></div>
    <?php endif; ?>
    
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>
</body>
</html>