<?php
$companyLogo = isset($GLOBALS['config']['company_logo']) 
? '/crm/php/user_data/'.preg_replace('/\.(\w+)$/', '_small.$1', $GLOBALS['config']['company_logo']) 
: '/crm/templates/svg/logotop.svg';
$avatar = $_SESSION['user_avatar'];
$hideName = ($avatar && $avatar != '0') ? 'hideOnMobile' : '';
$avatar = ($avatar && $avatar != '0') ? preg_replace('/\.(\w+)$/', '_small.$1', $avatar) : '';
?>

<div id="TopNav">
    <div>
        <?php include($_SERVER['DOCUMENT_ROOT'].'/crm/templates/svg/menu.svg'); ?>
        </button>
        <div class="hideOnMobile" id="TopNavCompanyLogo" style="background-image: url('<?= $companyLogo; ?>');"></div>
    </div>
    <div id="TopNavRight">
        <?php if(isset($GLOBALS['config']['AI'])): ?>
        <a class="ai_icon" onclick="loadJS('AI/AI-big', ()=>AI_window())" data-tooltip="Oktagon AI"></a>
        <?php endif; ?>
        <div id="TopNavBell" onClick="get_notifications($(this), (el, data)=>display_notifications(el, data))" data-svg="bell"><span>0</span></div>
        <div id="TopNavUser" onClick="showDropdownMenu($(this))">
            <span class="<?= $hideName; ?>"><?= $_SESSION['user_username']; ?></span>
            <?php if($avatar != ''): ?>
            <div class="avatarSmall" style="background-image: url(/crm/static/uploads/user/<?= $avatar; ?>);"></div>
            <?php endif; ?>

            <div class="DropdownMenuContent">
                <a onclick="loadJS('chat/chat', ()=>chat(()=>chat_navigator()))" data-svg="chat">
                    <span data-slovar="Chat"></span>
                </a>
                <a data-svg="settings" onclick="loadJS('user/user_config', ()=>openUserConfig())">
                    <span data-slovar="Configurations"></span>
                </a>
                <hr>
                <a class="red" href="/crm/php/auth/auth?logout=1">
                    <?php include($_SERVER['DOCUMENT_ROOT'].'/crm/templates/svg/logout.svg'); ?>
                    <span data-slovar="Sign_out"></span>
                </a>
            </div>

        </div>
    </div>
</div>