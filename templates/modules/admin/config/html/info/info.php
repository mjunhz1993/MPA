<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>

<body>
    <script src="/crm/static/js/dev/slovar/<?php echo $_SESSION['user_language']; ?>.js?<?php echo $GLOBALS['APP_VERSION']; ?>"></script>
    <div id="Main">
        <h1><span data-slovar="APP_info"></span></h1>
        <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/modules/admin/config/html/nav.php'); ?>

        <form>

            <div class="box col80">
                <div class="boxInner">
                    <h2 data-slovar="General"></h2>

                    <div class="col col50">
                        <label data-slovar="APP_version"></label>
                        <input type="text" value="<?php echo $GLOBALS['APP_VERSION']; ?>" disabled>
                    </div><div class="col col50">
                        <label data-slovar="Private_IP_address"></label>
                        <input type="text" value="<?php echo $_SERVER['SERVER_ADDR']; ?>" disabled>
                    </div>

                    <div class="col col50">
                        <span class="button buttonBlue button100" onclick="update_app_version($(this))" data-slovar="Update_APP_version"></span>
                    </div><div class="col col50">
                        <span class="button buttonBlue button100" onclick="get_public_ip($(this))" data-slovar="Get_public_IP"></span>
                    </div>
                </div>
            </div>

            <div class="box col80">
                <div class="boxInner">
                    <h2 data-slovar="Disk_space"></h2>

                    <div class="col col50">
                        <label data-slovar="Max_disk_space"></label>
                        <input type="text" value="<?php echo number_format((((disk_total_space("/") * 0.001) * 0.001) * 0.001), 2, ',', ''). ' Gb'; ?>" disabled>
                    </div><div class="col col50">
                        <label data-slovar="Disk_free_space"></label>
                        <input type="text" value="<?php echo number_format((((disk_free_space("/") * 0.001) * 0.001) * 0.001), 2, ',', ''). ' Gb'; ?>" style="color:green" disabled>
                    </div><hr>

                    <span class="button button100 buttonBlue" onclick="showMoreSpaceInfo($(this))" data-slovar="Show_more"></span>
                </div>
            </div>

            <div class="box col80">
                <div class="boxInner">
                    <h2 data-slovar="Permissions"></h2>

                    <div class="col col100">
                        <?php $ALLOWED_FILE_SIZE = number_format(((intval($GLOBALS["config"]["max_file_size"]) * 0.001) * 0.001), 2, ',', ''). ' Mb'; ?>
                        <label data-slovar="Allowed_file_size"></label>
                        <input type="text" value="<?php echo $ALLOWED_FILE_SIZE; ?>" disabled>
                    </div>
                </div>
            </div>

            <?php if(function_exists('sys_getloadavg')): ?>
            <div class="box col80">
                <div class="boxInner">
                    <h2 data-slovar="CPU_usage"></h2>

                    <?php $CPU = sys_getloadavg(); ?>
                    <div class="col col40">
                        <label data-slovar="min1_ago"></label>
                        <input type="text" value="<?php echo $CPU[0]; ?>%" disabled>
                    </div><div class="col col30">
                        <label data-slovar="min5_ago"></label>
                        <input type="text" value="<?php echo $CPU[1]; ?>%" disabled>
                    </div><div class="col col30">
                        <label data-slovar="min15_ago"></label>
                        <input type="text" value="<?php echo $CPU[2]; ?>%" disabled>
                    </div>
                </div>
            </div>
            <?php endif; ?>

        </form>
    </div>
    
    <script> $('#configNav a:eq(0)').addClass('act'); loadJS('config/info'); </script>

    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>
</body>
</html>