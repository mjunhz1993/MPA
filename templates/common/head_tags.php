<?php
include($_SERVER['DOCUMENT_ROOT'].'/crm/php/SQL/SQL.php');
include($_SERVER['DOCUMENT_ROOT'].'/crm/php/SQL/check_user.php');
?>

<!DOCTYPE html>
<html lang="<?= slovar(); ?>">
<head>

<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta charset="UTF-8">

<link rel="shortcut icon" href="/crm/static/img/OKTAGON-IT.ico">
<link rel="manifest" href="/crm/static/PWA/manifest.json">

<link rel="stylesheet" href="/crm/static/css/variables.css?v=<?= $GLOBALS['APP_VERSION']; ?>">
<link rel="stylesheet" href="/crm/static/css/basics.css?v=<?= $GLOBALS['APP_VERSION']; ?>">
<link rel="stylesheet" href="/crm/static/css/main.css?v=<?= $GLOBALS['APP_VERSION']; ?>">
<link rel="stylesheet" href="/crm/static/css/table.css?v=<?= $GLOBALS['APP_VERSION']; ?>">
<link rel="stylesheet" href="/crm/static/css/buttons.css?v=<?= $GLOBALS['APP_VERSION']; ?>">
<link rel="stylesheet" href="/crm/static/css/animations.css?v=<?= $GLOBALS['APP_VERSION']; ?>">
<link rel="stylesheet" href="/crm/static/css/forms.css?v=<?= $GLOBALS['APP_VERSION']; ?>">

<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>

<?php if(isset($_SESSION['user_language'])): ?>
<script src="/crm/static/js/common/slovar/<?= $_SESSION['user_language']; ?>.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<?php elseif(isset($GLOBALS['config']['defaultLanguage'])): ?>
<script src="/crm/static/js/common/slovar/<?= $GLOBALS['config']['defaultLanguage']; ?>.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<?php else: ?>
<script src="/crm/static/js/common/slovar/en.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<?php endif; ?>

<script src="/crm/static/js/common/basics.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script src="/crm/static/js/common/trigger.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script src="/crm/static/js/common/cookie.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script src="/crm/static/js/common/converter.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script src="/crm/static/js/common/date.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script src="/crm/static/js/common/url.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script src="/crm/static/js/common/getSVG.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script src="/crm/static/js/common/getHTML.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script src="/crm/static/js/common/tooltip.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script src="/crm/static/js/common/dropdown-menu.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script src="/crm/static/js/common/alert.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script src="/crm/static/js/form/joinAdd.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script src="/crm/static/js/form/formFields.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>

<script type="text/javascript">
    let PWA;
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        PWA = event;
    });

    var APP_VERSION = "<?= $GLOBALS['APP_VERSION']; ?>";
    var defaultDateFormat = 'Y-m-d';
    if('<?= $GLOBALS["config"]["defaultDateFormat"]; ?>' != ''){ defaultDateFormat = '<?= $GLOBALS["config"]["defaultDateFormat"]; ?>'; }
    var defaultTimeFormat = 'H:i:s';
    if('<?= $GLOBALS["config"]["defaultTimeFormat"]; ?>' != ''){ defaultTimeFormat = '<?= $GLOBALS["config"]["defaultTimeFormat"]; ?>'; }
    var defaultCurrency = 'EUR';
    if('<?= $GLOBALS["config"]["currency"]; ?>' != ''){ defaultCurrency = '<?= $GLOBALS["config"]["currency"]; ?>'; }
    var usecaching = false;
    if('<?= $GLOBALS["config"]["usecaching"]; ?>' != ''){ usecaching = true; }
    var defaultPhoneZipCode = '|-129px';
    if('<?= $GLOBALS["config"]["phonezipcode"]; ?>' != ''){ defaultPhoneZipCode = '<?= $GLOBALS["config"]["phonezipcode"]; ?>'; }
    defaultPhoneZipCode = defaultPhoneZipCode.split('|');
</script>

<?php if(isset($_SESSION['user_id'])): ?>
<script src="/crm/static/js/notifications/notifications.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script src="/crm/static/js/GET/user.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
<script type="text/javascript">
    var user_id = "<?= $_SESSION['user_id']; ?>";
    var user_username = "<?= $_SESSION['user_username']; ?>";
    var user_role_id = "<?= $_SESSION['user_role_id']; ?>";
    var role_name = "<?= $_SESSION['role_name']; ?>";
    var user_color = "<?= $_SESSION['user_color']; ?>";
</script>
<?php endif; ?>

<title><?= $CRM_name; ?> MPA</title>

<script src="/crm/static/js/common/loader.js?v=<?= $GLOBALS['APP_VERSION']; ?>"></script>
</head>