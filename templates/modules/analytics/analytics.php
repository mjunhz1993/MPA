<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>
<body>
    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['token']; ?>">
    <div id="Main"></div>
    <script>
    loadJS('analytics/analytics', function(){
        analytics($('#Main'))
    })
    </script>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>
</body>
</html>