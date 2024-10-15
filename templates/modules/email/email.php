<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>
<body>
    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['token']; ?>">
    <div id="Main"><div class="email_main_box"></div></div>

    <script src="/crm/static/js/email/email.js?<?php echo $GLOBALS['APP_VERSION']; ?>"></script>
    <script>
        $(document).ready(function(){
            $(window).resize(function(){ resize_email_box(); });

            var box = $('.email_main_box');
            config_email_room(function(){
                generate_email_box(box);
            }, function(){
                $('#Main').text('');
                createAlert($('#Main'), 'Red', slovar('Access_denied'));
            });

        });
    </script>
    
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>

</body>
</html>