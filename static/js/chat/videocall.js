function videocall(room, moderator = true){
    GET_globals({
        done:function(g){ videocall_config(room, moderator, g.jitsiid) }
    })
}

function videocall_config(room, moderator, jID){loadJS('https://8x8.vc/'+jID+'/external_api.js', function(){
    $.getJSON('/crm/php/chat/jwt', {
        generate_jwt: true,
        moderator: moderator
    }, function(jwt){
        if(jwt.error){ return }
        jitsi_load(room, jID, jwt);
    })
})}

function jitsi_load(room, jID, jwt){
    var popup = createPOPUPbox();
    var popupBox = popup.find('.popupBox');
    popupBox.css({'width':'100%', 'height':'100%'});

    popup.fadeIn('fast', function(){
        jitsi_start({
            room: room,
            jID: jID,
            jwt: jwt,
            el: popupBox.attr('id'),
        })
    })
}

function jitsi_start(d){
    const domain = "8x8.vc";
    const options = {
        roomName: d.jID+"/"+d.room,
        width: "100%",
        height: "100%",
        jwt: d.jwt,
        parentNode: document.getElementById(d.el),
        lang: 'en',
        configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            toolbarButtons: ['hangup', 'microphone', 'camera','desktop']
        },
        interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            DEFAULT_REMOTE_DISPLAY_NAME: 'Oktagon user',
        },
    };
    
    const api = new JitsiMeetExternalAPI(domain, options);
    
    // Event listeners for Jitsi Meet API events
    api.addEventListener("participantJoined", () => {
        console.log("A participant has joined the meeting");
    });

    api.addEventListener("videoConferenceJoined", () => {
        console.log("Video conference has started");
    });

    api.addEventListener("participantLeft", () => {
        console.log("A participant has left the meeting");
    });

    api.addEventListener("readyToClose", () => {
        removePOPUPbox();
    });
}