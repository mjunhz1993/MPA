function config_email_room(callback, callbackError){loadJS('email/send_email', function(){
    if_email_room_access(callback, callbackError)
})}

function generate_email_box(box){
    var html = '';
    html += '<div id="email_top_box"></div>';
    html += '<div id="email_bottom_box"><div class="email_inner_box">';
    html += '<div><button class="buttonSquare button100 buttonGreen" id="newEmailButton" onclick="get_new_emails($(this))">' + slovar('Get_new_mail') + '</button></div>';
    html += '<div><button class="buttonSquare button100 buttonBlack" id="oldEmailButton" onclick="get_old_emails($(this))">' + slovar('Get_old_mail') + '</button></div>';
    html += '</div><div class="email_inner_box"></div></div>';
    box.html(html);
    add_email_top_bar(box);
}

function add_email_top_bar(box){
    var topBox = box.find('#email_top_box');
    var html = '<div class="email_top_item">';
    html += '<div class="email_top_item_underline">';
    html += '<select id="email_dir" onchange="select_email_dir($(this))">';
    html += '<option value="0">' + slovar('Inbox') + '</option>';
    html += '<option value="1">' + slovar('Outbox') + '</option>';
    html += '</select>';
    html += '<input type="text" id="email_search" onkeyup="search_emails(event, $(this))" placeholder="' + slovar('Search') + '"></div>';
    html += '</div>';
    html += '<div class="email_top_item">';
    html += '<button class="buttonSquare button100 buttonGreen" onclick="open_send_email()">' + getSVG('edit') + ' ' + slovar('Create_new_mail') + '</button>';
    html += '</div>';
    topBox.html(html);
    resize_email_box();
    get_emails(box);
}

function resize_email_box(){
    var box = $('#email_bottom_box');
    box.css({
        'height': $(window).height() - $('#email_top_box').outerHeight() - $('#TopNav').outerHeight(),
    });
    var RLbox = box.find('.email_inner_box');
    if($(window).width() > 800){ RLbox.show(); }
}

function select_email_dir(el){ get_emails(el.closest('.email_main_box'), '', 'SEARCH'); }
function search_emails(e, el){if(e.which == 13){
    var box = el.closest('.email_main_box');
    get_emails(box, '', 'SEARCH');
}}


function get_new_emails(el){
    if(el.find('.loading20').length == 0){
        var buttonText = el.text();
        el.html('<span class="loading20"></span>');
        el.parent().find('.alert').remove();
        var box = el.closest('.email_main_box');
    	$.getJSON('/crm/php/email/email.php?get_new_emails=1', function(data){
            if(data.error){ createAlert(el.parent(), 'Red', data.error); }
            if(data.GO_AGAIN){ get_emails(box, buttonText, 'NEW', function(){ get_new_emails($('#newEmailButton')); }); }
            else{ get_emails(box, buttonText); }
        })
    }
}


function get_old_emails(el){
    if(el.find('.loading20').length == 0){
        var buttonText = el.text();
        el.html('<span class="loading20"></span>');
        var box = el.closest('.email_main_box');
        get_emails(box, buttonText, 'OLD');
    }
}


function get_emails(box, buttonText, type='NEW', callback){
    var emailDir = box.find('#email_dir').val();
    var searchInput = box.find('#email_search').val();
    var leftBox = box.find('.email_inner_box').first();
    if(type == 'NEW'){ var uid = leftBox.find('.email_item_box').first().attr('data-uid'); }
    else if(type == 'OLD'){ var uid = leftBox.find('.email_item_box').last().attr('data-uid'); }
    else if(type == 'SEARCH'){ leftBox.find('.email_item_box').remove(); }
    $.getJSON('/crm/php/email/email.php?get_emails=1', {uid:uid, type:type, dir:emailDir, search:searchInput}, function(data){
        if(data.error){}
        else{
            showEmails(box, type, data);
            leftBox.find('.loading20').parent().text(buttonText);
            if(typeof callback === 'function'){ callback(); }
        }
    })
}


function showEmails(box, type, data){
    if(data){
        var html = '';
        var emailArea = box.find('.email_inner_box').first();
        for(var i=0; i<data.length; i++){
            var email = data[i];
            var uid = email.uid;
            var udate = email.udate;
            var from = email.mail_from;
            var subject = email.subject;
            var time = displayLocalDate(email.udate);
            var attachments = [];
            if(email.attachments){ attachments = email.attachments.split('|'); }

            html += '<div class="email_item_box" data-uid="'+uid+'" data-udate="'+udate+'">';
            html += '<div class="email_item">';
            html += '<div class="email_item_sender">'+from+'</div>';
            html += '<div class="email_item_subject">'+subject+'</div>';
            html += '<div class="email_item_time">'+time;
            if(email.new == 1){ html += ' <span class="email_item_new">'+slovar('New')+'</span>'; }
            html += '</div>';
            if(attachments[0] != ''){ html += '<div><b>'+attachments.length+'</b> '+slovar('Attachments')+'</div>'; }
            html += '</div>';
            html += '<div class="email_item" onclick="delete_email($(this), '+uid+', '+udate+')" data-tooltip="'+slovar('Delete')+'">';
            html += getSVG('delete')+ '</div>';
            html += '</div>';

        }
        if(type == 'NEW' || type == 'SEARCH'){ emailArea.find('#newEmailButton').parent().after(html); }
        else if(type == 'OLD'){ emailArea.find('#oldEmailButton').parent().before(html); }

        emailArea.find('.email_item_box .email_item').unbind('click').click(function(){
            openEmail($(this), {
                uid: $(this).parent().data('uid'),
                udate: $(this).parent().data('udate'),
                responseBar: true,
                close: true
            });
        });
        tooltips();
    }
}

function openEmail(box, d = []){loadJS('email/slovar/' + slovar(), function(){
    if(box.closest('.email_main_box').length == 0){ return createAlertPOPUP(slovar('No_main_box')) }
    box = box.closest('.email_main_box');
    if(box.find('.email_inner_box').length == 0){
        box.html('<div class="email_inner_box"></div><div class="email_inner_box"></div>')
    }
    var leftBox = box.find('.email_inner_box').first();
    var rightBox = box.find('.email_inner_box').last();

    rightBox.find('.emailHeader, .emailFrame').remove();
    leftBox.find('.email_item').removeClass('act');
    leftBox.find('.email_item_box[data-uid=' + d.uid + '] .email_item').first().addClass('act').find('.email_item_new').remove();

    $.getJSON('/crm/php/email/email.php?get_email=1', {
        uid:d.uid,
        udate:d.udate,
        mail_room:d.mail_room
    }, function(data){
        if(data.error){ createAlert(rightBox, 'Red', data.error); }
        else{if(data){
            // CREATE HEADER
            var html = '';
            html += '<div class="emailHeader" data-uid="'+data.uid+'" data-udate="'+data.udate+'">';
            html += '<div class="ehflex">';
            html += '<h2>' + data.subject + '</h2>';
            if(d.close){ html += '<div class="ehClose">' + getSVG('x')+ '</div>' }
            html += '</div>';
            html += '<div class="ehDate">' + displayLocalDate(data.udate) + '</div>';
            html += '<div class="ehflex">';
            html += '<div class="ehFrom">' + slovar('From');
            html += ': <a onclick="click_on_email(\''+data.mail_from+'\')" data-tooltip="' + slovar('Create_new_mail') + '">' + data.mail_from + '</a></div>';
            html += '<div class="ehTo">' + slovar('For')+ ': ';
            if(data.mail_to){ data.mail_to = data.mail_to.split(',') }else{ data.mail_to = [] }
            var mTo = [];
            for(var i=0; i<data.mail_to.length; i++){
                mTo.push('<a onclick="click_on_email(\''+data.mail_to[i]+'\')" data-tooltip="' + slovar('Create_new_mail') + '">' + data.mail_to[i] + '</a>');
            }
            html += mTo.join(', ');
            html += '</div>';
            html += '</div>';
            if(data.attachments && data.attachments != ''){
                html += '<div class="ehHorizontal">';
                data.attachments = data.attachments.split('|');
                for(var i=0; i<data.attachments.length; i++){
                    var mAtt = data.attachments[i].split(',');
                    html += '<div class="ehAttachment" ';
                    html += 'onclick="loadJS(\'file/file\', function(){';
                    html += 'clickOnFile(\'mail_rooms/mail_room_' + user_id + '\', \'\', \'' + mAtt[0] + '\', \'' + mAtt[1] + '\'); })">' + mAtt[1];
                    html += ' (' + ((mAtt[2] * 0.001) * 0.001).toFixed(2) + ' Mb)</div>'
                }
                html += '</div>';
            }
            html += '</div>';
            rightBox.html(html);
            rightBox.find('.ehClose svg').unbind().attr('data-tooltip', slovar('Close')).click(function(){ closeEmail($(this)); });
            tooltips();

            // CREATE E-MAIL MAIN BODY
            var iframe = $('<iframe>', {
            class: 'emailFrame',
            frameborder: '0'
            }).appendTo(rightBox);
            // $('<iframe class="emailFrame"/>').appendTo(rightBox).contents().find('body').append(data.msg);

            var iframeDoc = iframe[0].contentWindow.document;
            iframeDoc.open();
            iframeDoc.write('<!DOCTYPE html><html lang="sl"><head><title>E-mail Content</title></head><body>'+data.msg+'</body></html>');
            iframeDoc.close();

            $(iframe).on('load', function() {
                var iframeContents = $(iframe).contents();
                iframeContents.find('a').attr('target', '_blank');
                loadJS('common/url', function(){
                    if(!isValidHttpUrl(iframeContents.find('img').attr('src'))){ iframeContents.find('img').remove(); }
                });
            });

            if(smallDevice()){
                leftBox.fadeOut('fast', function(){
                    rightBox.fadeIn('fast', function(){
                        rightBox.find('.emailFrame').height(box.height() - rightBox.find('.emailHeader').outerHeight() - 10)
                    });
                });
            }
            else{ rightBox.find('.emailFrame').height(box.height() - rightBox.find('.emailHeader').outerHeight() - 10) }

            if(!d.responseBar){ return }
            html = '<div id="email_response_bar">';
            html += '<button class="button buttonBlue">' + slovar('forward') + '</button>';
            html += '<button class="button buttonGreen">' + slovar('Answer') + '</button>';
            html += '</div>';
            rightBox.append(html);

            rightBox.find('#email_response_bar .buttonBlue').click(function(){
                open_send_email({
                    subject:'FW:'+data.subject,
                    body:iframeDoc.body.innerHTML,
                    attachments:data.attachments
                })
            });

            rightBox.find('#email_response_bar .buttonGreen').click(function(){
                open_send_email({
                    for:data.mail_from,
                    subject:'RE:'+data.subject,
                    body:iframeDoc.body.innerHTML
                })
            });
        }}
    })
})}

function openEmailPOPUP(mail_room, uid, udate){
    var popup = createPOPUPbox();
    var popupBox = popup.find('.popupBox');
    popupBox.addClass('email_main_box').css({
        'padding':0,
        'width': '90vw',
        'height': '90vh',
    });
    popupBox.html('<div></div>');
    popup.fadeIn(function(){
        openEmail(popupBox.find('div'), {
            uid: uid,
            udate: udate,
            mail_room: mail_room,
            close: true,
        })
    });
}

function click_on_email(email){loadJS('email/send_email', function(){
    if_email_room_access(function(d){ open_send_email({for:email,body:d.body}) }, function(){ location.href = 'mailto:'+email })
})}

function closeEmail(el){
    hideTooltip();
    var box = el.closest('.email_main_box');
    var leftBox = box.find('.email_inner_box').first();
    var rightBox = box.find('.email_inner_box').last();
    leftBox.find('.email_item').removeClass('act');
    if(smallDevice()){ rightBox.fadeOut('fast',function(){ leftBox.fadeIn('fast'); }); }
    rightBox.empty();
    if(box.closest('.popup')){ removePOPUPbox() }
}


function delete_email(el, uid, udate){
    POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
        var box = el.closest('.email_item_box');
        $.post('/crm/php/email/email.php?delete_email=1', {
            uid:uid, 
            udate:udate, 
            csrf_token:$('input[name=csrf_token]').val()
        }, function(data){
            data = JSON.parse(data);
            if(!data.error){
                box.fadeOut('fast', function(){ box.remove(); });
                if(uid == $('.emailHeader').attr('data-uid')){ $('.emailHeader').closest('.email_inner_box').empty(); }
            }
        })
    });
}

loadCSS('email');