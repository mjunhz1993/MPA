<div id="TopNav">
    <div>
        <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/svg/menu.svg'); ?>
        </button>
        <?php if(isset($GLOBALS['config']['company_logo'])): ?>
            <?php
            $companyLogo = explode('.', $GLOBALS['config']['company_logo']);
            $companyLogo = $companyLogo[0].'_small.'.$companyLogo[1];
            ?>
            <div class="hideOnMobile" id="TopNavCompanyLogo" style="background-image: url('/crm/php/user_data/<?php echo $companyLogo; ?>');"></div>
        <?php else: ?>
            <div class="hideOnMobile" id="TopNavCompanyLogo" style="background-image: url('/crm/templates/svg/logotop.svg');"></div>
        <?php endif; ?>
    </div>
    <div id="TopNavRight">
        <a class="ai_icon" onclick="loadJS('AI/AI-big', ()=>AI_window())" data-tooltip="Oktagon AI"></a>
        <div id="TopNavBell" onClick="get_notifications($(this), function(el, data){ display_notifications(el, data) })" data-svg="bell"><span>0</span></div>
        <div id="TopNavUser" onClick="showDropdownMenu($(this))">
            <?php
            $avatar = '';
            $homun = '';
            if($_SESSION['user_avatar'] != '' && $_SESSION['user_avatar'] != null && $_SESSION['user_avatar'] != 0){
                $avatar = explode('.', $_SESSION['user_avatar']);
                $avatar = $avatar[0].'_small.'.$avatar[1];
                $homun = 'hideOnMobile';
            }
            ?>
            <span class="<?php echo $homun; ?>"><?php echo $_SESSION['user_username']; ?></span>
            <?php if($avatar != ''): ?>
            <div class="avatarSmall" style="background-image: url(/crm/static/uploads/user/<?php echo $avatar; ?>);"></div>
            <?php endif; ?>

            <div class="DropdownMenuContent">
                <a onclick="loadJS('chat/chat', function(){chat(function(){chat_navigator()})})" data-svg="chat">
                    <span data-slovar="Chat"></span>
                </a>
                <a data-svg="settings" onclick="loadJS('user/user_config', function(){ openUserConfig(); })">
                    <span data-slovar="Configurations"></span>
                </a>
                <hr>
                <a class="red" href="/crm/php/auth/auth.php?logout=1">
                    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/svg/logout.svg'); ?>
                    <span data-slovar="Sign_out"></span>
                </a>
            </div>

        </div>
    </div>
</div>