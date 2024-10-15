<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>
<body>
    <?php
    include(loadPHP('auth/slovar'));
    include('templates/modules/admin/auth/css.php');
    ?>
    <table class="loginTable">
        <tr>
            <td class="loginTdLeft">
                <h2><?php echo slovar('Welcome_to'), ' ', $CRM_name; ?> MPA</h2>
                <div><?php echo slovar('Welcome_to_desc'), ' ', $GLOBALS['APP_VERSION']; ?></div>
            </td>
            <td class="loginTdRight">
                <div class="loginlogo" style="background-image:url('<?php echo $CRM_logo; ?>');"></div>
                <div class="loginbox" style="display: none; height: 300px;">
                    <div class="loginboxinner" style="display: none;">
                        <h2><?php echo slovar('Log_in'); ?></h2>
                        <div class="AJAXlogin">
                            <form>
                                <input name="token" type="hidden" value="<?php echo $token; ?>" />
                                <input name="username" type="text" 
                                value="<?php echo $_COOKIE['login_username'] ?? ''; ?>" 
                                placeholder="<?php echo slovar('Username'); ?>" required>
                                <br>
                                <input name="password" type="password" placeholder="<?php echo slovar('Password'); ?>" required>
                                <br>
                                <div class="result"></div>
                                <input type="submit" value="<?php echo slovar('Log_in'); ?>">
                            </form>
                            <div class="OktagonVerifyIcon">
                                <b><?php echo slovarLocal('Protected_by'); ?></b>
                                <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/svg/OktagonVerify.svg'); ?>
                                <b style="font-style:italic"><?php echo $CRM_name; ?> verify</b>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    </table>
    <div id="Main" style="margin:0"></div>
    <script src="/crm/static/js/auth/auth.js?<?php echo $GLOBALS['APP_VERSION']; ?>"></script>
    </body>
</html>