<div class="box col80"><div class="boxInner">
    <h2 data-slovar="phpMyAdmin"></h2>
    <button id="phpmyadmin_b" class="button button100" 
    onclick="toggle_phpmyadmin($(this))" data-svg="security" data-slovar="Secure"></button>
</div></div>

<form method="post" class="editForm">
<input type="hidden" name="csrf_token" id="csrf_token" value="<?php echo $_SESSION['token']; ?>">

<div class="box col80"><div class="boxInner">
    <h2 data-slovar="Default_values"></h2>
    
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
        <input type="text" name="currency" id="currency" value="<?php echo $GLOBALS["config"]["currency"]; ?>">
    </div><div class="col col50">
        <label for="phonezipcode" data-slovar="Phone_zip_code"></label>
        <div onclick="loadJS('form/countries', function(el){ get_countries(el, 'CONFIG'); }, $(this))">
            <input type="text" name="phonezipcode" id="phonezipcode" value="<?php echo $GLOBALS["config"]["phonezipcode"]; ?>">
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
        <input type="text" name="max_file_size" id="max_file_size" value="<?php echo $GLOBALS["config"]["max_file_size"]; ?>">
    </div>
</div></div>

<div class="box col80"><div class="boxInner">
    <h2 data-slovar="Email"></h2>

    <div class="col col100">
        <label for="crm_email" data-slovar="Email"></label>
        <?php $A = $SQL->query("SELECT email_accounts_user, email_accounts_email FROM email_accounts"); ?>
        <select name="crm_email" id="crm_email">
            <option></option>
            <?php while ($B = $A->fetch_row()): ?>
            <option <?php if($GLOBALS["config"]["crm_email"] == $B[0]){echo 'selected';} ?> value="<?php echo $B[0]; ?>"><?php echo $B[1]; ?></option>
            <?php endwhile; ?>
        </select>
    </div>
    
    <div class="col col100">
        <label for="SENDGRID">SENDGRID ID</label>
        <input type="text" name="SENDGRID" id="SENDGRID" value="<?php echo $GLOBALS["config"]["SENDGRID"] ?? ''; ?>">
    </div>

    <span class="button button100 buttonBlue" onclick="testEmail($(this))">Test MPA E-mail</span>
</div></div>

<div class="box col80"><div class="boxInner">
    <h2 data-slovar="SMS"></h2>
    
    <div class="col col100">
        <label for="twilioID">twilio SID</label>
        <input type="text" name="twilioID" id="twilioID" value="<?php echo $GLOBALS["config"]["twilioID"] ?? ''; ?>">
    </div>
    <div class="col col100">
        <label for="twilioToken">twilio Token</label>
        <input type="text" name="twilioToken" id="twilioToken" value="<?php echo $GLOBALS["config"]["twilioToken"] ?? ''; ?>">
    </div>
    <div class="col col100">
        <label for="twilioPhone">twilio Phone number</label>
        <input type="text" name="twilioPhone" id="twilioPhone" value="<?php echo $GLOBALS["config"]["twilioPhone"] ?? ''; ?>">
    </div>
</div></div>

<div class="box col80"><div class="boxInner">
    <h2>Video Call</h2>
    
    <div class="col col100">
        <label for="jitsipuk">JITSI Public key</label>
        <input type="text" name="jitsipuk" id="jitsipuk" value="<?php echo $GLOBALS["config"]["jitsipuk"] ?? ''; ?>">
    </div>
    <div class="col col100">
        <label for="jitsiprk">JITSI Private key</label>
        <input type="text" name="jitsiprk" id="jitsiprk" value="<?php echo $GLOBALS["config"]["jitsiprk"] ?? ''; ?>">
    </div>
    <div class="col col100">
        <label for="jitsiid">JITSI app ID</label>
        <input type="text" name="jitsiid" id="jitsiid" value="<?php echo $GLOBALS["config"]["jitsiid"] ?? ''; ?>">
    </div>
</div></div>

<div class="box col80"><div class="boxInner">
    <h2>STRIPE Pay</h2>
    
    <div class="col col100">
        <label for="stripePK">STRIPE Publish key</label>
        <input type="text" name="stripePK" id="stripePK" value="<?php echo $GLOBALS["config"]["stripePK"] ?? ''; ?>">
    </div>
    <div class="col col100">
        <label for="stripeSK">STRIPE Secret key</label>
        <input type="text" name="stripeSK" id="stripeSK" value="<?php echo $GLOBALS["config"]["stripeSK"] ?? ''; ?>">
    </div>
</div></div>

<div class="box col80"><div class="boxInner">
    <h2>Google</h2>
    
    <div class="col col100">
        <label for="stripePK">Gemini</label>
        <input type="text" name="AI" id="AI" value="<?php echo $GLOBALS["config"]["AI"] ?? ''; ?>">
    </div>
    <div class="col col100">
        <label for="stripeSK">Koledar ID</label>
        <input type="text" name="gcID" id="gcID" value="<?php echo $GLOBALS["config"]["gcID"] ?? ''; ?>">
    </div>
    <div class="col col100">
        <label for="stripeSK">Koledar API</label>
        <input type="text" name="gcAPI" id="gcAPI" value="<?php echo $GLOBALS["config"]["gcAPI"] ?? ''; ?>">
    </div>
</div></div>

<div class="box col80"><div class="boxInner">
    <h2 data-slovar="Company"></h2>

    <div class="fileArea">
        <?php if(isset($GLOBALS['config']['company_logo'])): ?>
        <?php $company_logo = '/crm/php/user_data/'. $GLOBALS['config']['company_logo']; ?>
        <div class="file"><div class="img" style="background-image:url('<?php echo $company_logo; ?>')"></div><div class="fileDesc">Logo</div></div>
        <script>
            $('.fileArea .file').append(getSVG('x'));
            $('.fileArea .file svg').click(function(){ deleteCompanyLogo(); });
        </script>
        <?php endif; ?>
    </div>
    <input type="hidden" name="company_logo_hidden" value="<?php echo $GLOBALS["config"]["company_logo"] ?? ''; ?>">
    <div class="col col100 formField">
        <div class="fileArea"></div>
        <label for="company_logo" class="button button100 buttonBlue" data-slovar="Change_company_logo"></label>
        <input type="file" name="company_logo[]" id="company_logo" data-list="IMG,1" onchange="selectFile($(this), this)" data-required="false">
    </div>
</div></div>

<div class="box col80"><div class="boxInner">
    <h2 data-slovar="Advanced"></h2>

    <div class="col col100">
        <label for="usecaching" data-slovar="Use_caching"></label>
        <select name="usecaching" id="usecaching">
            <option <?php if($GLOBALS["config"]["usecaching"] == true){echo 'selected';} ?> value="true" data-slovar="Yes"></option>
            <option <?php if($GLOBALS["config"]["usecaching"] == false){echo 'selected';} ?> value="false" data-slovar="No"></option>
        </select>
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
            open_send_email({done:function(form){ change_sender_to_crm(form) }})
        });
    }
</script>
<?php endif; ?>