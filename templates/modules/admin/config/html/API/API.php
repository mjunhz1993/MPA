<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>

<body>
    <script src="/crm/static/js/dev/slovar/<?= $_SESSION['user_language']; ?>.js?<?= $GLOBALS['APP_VERSION']; ?>"></script>

    <?php if($_SESSION['user_id'] == 1): ?>
    <div id="Main">
        <h1 data-slovar="API"></h1>
        <div>
            <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/nav.php'); ?>
        </div>
    </div>
    
    <script>
        loadJS('dev/API');
        $('#configNav a:eq(10)').addClass('act');
    </script>
    <?php endif; ?>
    
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>
</body>
</html>