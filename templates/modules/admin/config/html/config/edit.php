<style type="text/css">
    .toggleConfigMenu{display: none;}
    #configBox h2{cursor: pointer; transition:0.2s; padding: 10px !important; margin-bottom: 10px;}
    #configBox h2:hover, #configBox h2.act{background-color: var(--light-blue); color:white;}
</style>

<form method="post" class="editForm" id="configBox">
<input type="hidden" name="csrf_token" id="csrf_token" value="<?= $_SESSION['token']; ?>">

<div class="box col80"><div class="boxInner">
    <h2 data-slovar="Default_values" onclick="toggle_configMenu($(this))"></h2>
    
    <div class="toggleConfigMenu">
    <div class="col col50">
        <label for="defaultDateFormat" data-slovar="Date_format"></label>
        <select name="defaultDateFormat" id="defaultDateFormat">
            <option <?php if($GLOBALS["config"]["defaultDateFormat"] == 'Y-m-d'){echo 'selected';} ?>>Y-m-d</option>
            <option <?php if($GLOBALS["config"]["defaultDateFormat"] == 'd.m.Y'){echo 'selected';} ?>>d.m.Y</option>
        </select>
    </div><div class="col col50">
        <label for="defaultTimeFormat" data-slovar="Time_format"></label>
        <select name="defaultTimeFormat" id="defaultTimeFormat">
            <option <?php if($GLOBALS["config"]["defaultTimeFormat"] == 'H:i:s'){echo 'selected';} ?>>H:i:s</option>
            <option <?php if($GLOBALS["config"]["defaultTimeFormat"] == 'H:i'){echo 'selected';} ?>>H:i</option>
        </select>
    </div><div class="col col50">
        <label for="currency" data-slovar="Currency"></label>
        <input type="text" name="currency" id="currency" value="<?= $GLOBALS["config"]["currency"]; ?>">
    </div><div class="col col50">
        <label for="phonezipcode" data-slovar="Phone_zip_code"></label>
        <div onclick="loadJS('form/countries', function(el){ get_countries(el, 'CONFIG'); }, $(this))">
            <input type="text" name="phonezipcode" id="phonezipcode" value="<?= $GLOBALS["config"]["phonezipcode"]; ?>">
        </div>
    </div><div class="col col50">
        <label for="defaultLanguage" data-slovar="Default_app_language"></label>
        <select name="defaultLanguage" id="defaultLanguage">
            <option <?php if($GLOBALS["config"]["defaultLanguage"] == 'en'){echo 'selected';} ?> value="en" data-slovar="English"></option>
            <option <?php if($GLOBALS["config"]["defaultLanguage"] == 'sl'){echo 'selected';} ?> value="sl" data-slovar="Slovenian"></option>
        </select>
    </div><div class="col col50">
        <label for="max_file_size" data-slovar="max_file_size"></label>
        <b>10000000 = 10Mb</b>
        <input type="text" name="max_file_size" id="max_file_size" value="<?= $GLOBALS["config"]["max_file_size"]; ?>">
    </div>
    </div>
</div></div>

<div class="box col80"><div class="boxInner">
    <h2 data-slovar="Email" onclick="toggle_configMenu($(this))"></h2>

    <div class="toggleConfigMenu">
    <div class="col col100">
        <label for="crm_email" data-slovar="Email"></label>
        <?php $A = $SQL->query("SELECT email_accounts_user, email_accounts_email FROM email_accounts"); ?>
        <select name="crm_email" id="crm_email">
            <option></option>
            <?php while ($B = $A->fetch_row()): ?>
            <option <?php if($GLOBALS["config"]["crm_email"] == $B[0]){echo 'selected';} ?> value="<?= $B[0]; ?>"><?= $B[1]; ?></option>
            <?php endwhile; ?>
        </select>
    </div>

    <span class="button button100 buttonBlue" onclick="testEmail($(this))">Test MPA E-mail</span>
    </div>
</div></div>

<div class="box col80"><div class="boxInner">
    <h2 data-slovar="Company" onclick="toggle_configMenu($(this))"></h2>

    <div class="toggleConfigMenu">
    <div class="fileArea">
        <?php if(isset($GLOBALS['config']['company_logo'])): ?>
        <?php $company_logo = '/crm/php/user_data/'. $GLOBALS['config']['company_logo']; ?>
        <div class="file"><div class="img" style="background-image:url('<?= $company_logo; ?>')"></div><div class="fileDesc">Logo</div></div>
        <script>
            $('.fileArea .file').append(getSVG('x'));
            $('.fileArea .file svg').click(function(){ deleteCompanyLogo(); });
        </script>
        <?php endif; ?>
    </div>
    <input type="hidden" name="company_logo_hidden" value="<?= $GLOBALS["config"]["company_logo"] ?? ''; ?>">
    <div class="col col100 formField">
        <div class="fileArea"></div>
        <label for="company_logo" class="button button100 buttonBlue" data-slovar="Change_company_logo"></label>
        <input type="file" name="company_logo[]" id="company_logo" data-list="IMG,1" onchange="selectFile($(this), this)" data-required="false">
    </div>
    </div>
</div></div>

<div class="box col80"><div class="boxInner">
    <h2 data-slovar="Advanced" onclick="toggle_configMenu($(this))"></h2>

    <div class="toggleConfigMenu">
    <div class="col col100">
        <label for="usecaching" data-slovar="Use_caching"></label>
        <select name="usecaching" id="usecaching">
            <option <?php if($GLOBALS["config"]["usecaching"] == true){echo 'selected';} ?> value="true" data-slovar="Yes"></option>
            <option <?php if($GLOBALS["config"]["usecaching"] == false){echo 'selected';} ?> value="false" data-slovar="No"></option>
        </select>
    </div>
    </div>
</div></div>

<div class="box col80">
    <div class="boxInner"><button class="button button100 buttonGreen buttonSubmit" data-slovar="Save_changes"></button></div>
</div>

</form>

<?php if(isset($GLOBALS["config"]["crm_email"]) && $GLOBALS["config"]["crm_email"] != ''): ?>
<script>
    function testEmail(el){
        loadJS('email/send_email', function(){
            open_send_email({done:function(form){
                change_sender_to_crm(form);
            }})
        });
    }
</script>
<?php endif; ?>