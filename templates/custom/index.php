<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>
<body>
    <?php if(isset($_GET['run'])): ?>
    <div id="Main"><h1 class="h1_table"></h1></div>
    <script src="/crm/php/downloads/<?= $_GET['run'] ?>.js?<?= $GLOBALS['APP_VERSION']; ?>"></script>
    <?php endif; ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>
</body>
</html>