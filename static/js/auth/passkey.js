function if_passkey_enabled(){
    if(!window.PublicKeyCredential){ return false }
    return true
}

function generate_challenge(callback){
    $.get('/crm/php/auth/passkey.php', {generate_challenge:true}, function(challenge){ callback(challenge) })
}

function get_user_passkey(callback){
    $.get('/crm/php/auth/auth.php', {get_user_passkey:true}, function(passkey){ callback(passkey) })
}

function arrayBufferToHex(arrayBuffer) {
    return Array.from(new Uint8Array(arrayBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function hexToArrayBuffer(hexString) {
    const strippedString = hexString.replace(/\s/g, '');
    const byteLength = strippedString.length / 2;
    const arrayBuffer = new ArrayBuffer(byteLength);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteLength; i++) {
        const hexByte = strippedString.substr(i * 2, 2);
        uint8Array[i] = parseInt(hexByte, 16);
    }
    
    return arrayBuffer;
}

function passkey_login_publicKey(passkey, challenge){
    return {
        rpId: window.location.hostname,
        challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
        timeout: 300000,  // 5 minutes
        allowCredentials: [{ type: "public-key", id: hexToArrayBuffer(passkey) }],
        userVerification: 'required'
    }
}

function login_passkey(box){
    if(!if_passkey_enabled()){ return login_passkey_err(box, slovar('Not_supported')) }
    get_user_passkey(function(passkey){ console.log(passkey);
        generate_challenge(function(challenge){ console.log(challenge);
            navigator.credentials.get({ "publicKey": passkey_login_publicKey(passkey, challenge) })
            .then(function(assertion){
                if(passkey != arrayBufferToHex(assertion.rawId)){ return login_passkey_err(box, slovar('Wrong_passkey')) }
                $.post('/crm/php/auth/auth.php?compare_passkey=1', {
                    token:box.find('[name=token]').val(),
                    passkey:arrayBufferToHex(assertion.rawId)
                }, function(data){ data = JSON.parse(data);
                    if(data.error){ return login_passkey_err(box, slovar(data.error)) }
                    return window.location.href = "templates/home.php"
                })
            }).catch(function(err){ return login_passkey_err(box, err) });
        })
    })
}
function login_passkey_err(box, msg){
    remove_HTML_loader(box);
    box.find('form').show();
    box.find('.result').text(msg);
}

function passkey_register_publicKey(challenge){
    return {
        challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
        rp: {
            name: "Oktagon-it",
            id: window.location.hostname
        },
        user: {
            id: Uint8Array.from(user_id, c=>c.charCodeAt(0)),
            name: user_username,
            displayName: user_username,
        },
        pubKeyCredParams: [
            {type: "public-key", alg: -7 /* "ES256" as registered in the IANA COSE Algorithms registry */},
            {type: "public-key", alg: -257 /* Value registered by this specification for "RS256" */}
        ],
        authenticatorSelection: {userVerification: "preferred"},
        timeout: 300000,  // 5 minutes
        extensions: {"appidExclude": window.location.protocol+'//'+window.location.hostname}
    }
}

function register_passkey(d){
    if(!if_passkey_enabled()){ return d.error(slovar('Not_supported')) }
    generate_challenge(function(challenge){
        publicKey = passkey_register_publicKey(challenge);
        navigator.credentials.create({ publicKey })
        .then(function (newCredentialInfo) {
            $.get('/crm/php/auth/user_config.php', {
                save_passkey:arrayBufferToHex(newCredentialInfo.rawId)
            }, function(){ return d.done() })
        }).catch(function(err){ return d.error(err) });
    })
}