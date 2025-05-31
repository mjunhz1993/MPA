var oktagonChatLoop = false;
var oktagonChatTimer = '';
function chat(callback){
	loadCSS('chat');
	loadJS('chat/slovar/'+slovar(), function(){
		loadJS('chat/conversation', function(){
			loadJS('chat/messages', function(){
				loadJS('chat/form', function(){
					loadJS('file/file', function(){
						if(typeof callback === 'function'){ callback() }
					})
				})
			})
		})
	})
}

function chat_box(id){
	GET_module({ module:'chat',
        done:function(moduleData){
        	if(!moduleData.can_view.includes(user_role_id)){ return alert(slovar('Access_denied')) }
			if($('#MainChatBox').length != 0){ return selectConversation(id) }
			var popup = createPOPUPbox();
			var popupBox = popup.find('.popupBox');
			popupBox.css('padding',0);
	    	HTML_chatBox(popupBox, moduleData);
	    	popup.fadeIn('fast', function(){ return selectConversation(id) });
        }
    })
}
function HTML_chatBox(box, moduleData, html = ''){
	html += '<div id="MainChatBox">';
	html += '<table id="chatInfo"><tr><td class="chatInfoLeft"></td><td class="chatInfoRight"></td></tr></table>';
	html += '<div id="chatBox"></div>';
    if(moduleData.can_edit.includes(user_role_id)){ html += '<form id="chatForm"></form>' }
    html += '</div>'
	box.html(html);
}

function chat_navigator(html = ''){loadJS('GET/chat', function(){
	hideDropdownMenu();
    if($('#conversationToolBox').length != 0){ return loadConversations() }
    var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
    html += '<div id="conversationToolBox">';
    html += '<input type="text" id="conversationSearch" placeholder="' + slovar('Search') + '" ';
    html += 'onkeyup="searchConversations(event)"><hr>';
    html += '<div class="conversationBox"></div><hr>';
    html += '<div style="display:flex">';
    html += '<button class="buttonSquare button100 buttonGreen" ';
    html += 'onclick="loadJS(\'chat/conversation_create\',function(){openAddConversation()})">'+slovar('Add_conversation')+'</button>';
    html += '<button class="buttonSquare button100 buttonGrey" onclick="removePOPUPbox()">'+slovar('Close')+'</button></div>';
    html += '</div>';
    popupBox.html(html);
    popup.fadeIn('fast', function(){ loadConversations() })
})}