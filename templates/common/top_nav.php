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
        <?php if(isset($GLOBALS['config']['API']['geminiAPI'])): ?>
        <a class="ai_icon" onclick="loadJS('AI/AI-big', ()=>AI_window())" data-tooltip="Oktagon AI"></a>
        <?php endif; ?>
        <div id="TopNavBell" onClick="get_notifications($(this), (el, data)=>popup_notifications(el, data))" data-svg="bell" data-num="10">
            <span>0</span>
        </div>
        <div id="TopNavUser" onClick="showDropdownMenu($(this))">
            <span class="<?= $hideName; ?>"><?= $_SESSION['user_username']; ?></span>
            <?php if($avatar != ''): ?>
            <div class="avatarSmall" style="background-image: url(/crm/static/uploads/user/<?= $avatar; ?>);"></div>
            <?php endif; ?>

            <div class="DropdownMenuContent">
                <a data-svg="chat" onclick="loadJS('chat/chat', ()=>chat(()=>chat_navigator()))">
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