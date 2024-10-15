<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>
<body>
    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['token']; ?>">
    <div id="Main"></div>
    <script src="/crm/static/js/home/home.js?<?php echo $GLOBALS['APP_VERSION']; ?>"></script>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>
</body>
</html>