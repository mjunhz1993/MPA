var dragFileTimer;
function dragingFileEvent(){
    $(document).on('dragover', function(e) {
        var dt = e.originalEvent.dataTransfer;
        if(dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('Files'))) {
            $("input[type=file]").each(function(){
                if($(this).val() != '' || $(this).prop('disabled')){ return }
                $(this).attr('data-content',slovar('Drag_and_drop')).show()
            });
            window.clearTimeout(dragFileTimer);
        }
    });
    $(document).on('dragleave drop', function(){ hideAllFileInputs() });
}
function hideAllFileInputs(){ dragFileTimer = window.setTimeout(function(){ $("input[type=file]").hide() }, 25) }
dragingFileEvent();

function checkFileInputLimit(fileInput, fileArea){ // REMOVE FUNCTIONS
    var fileLength = fileArea.find('.file').length;
    var maxLimit = 1;
    if(fileInput.attr('data-list') != undefined){ maxLimit = parseInt(fileInput.attr('data-list').split(',')[1]) }
    var button = fileInput.parent().find('.buttonSquare');
    if(maxLimit <= fileLength){ fileInput.prop('disabled', true); button.addClass('buttonGrey').removeClass('buttonBlue'); }
    else{ fileInput.prop('disabled', false); button.addClass('buttonBlue').removeClass('buttonGrey'); }
}

function fileLimit(fileInput, input, maxLimit = 1){
    if(fileInput.attr('data-list') != undefined){ maxLimit = parseInt(fileInput.attr('data-list').split(',')[1]) }
    if(maxLimit < input.files.length + fileInput.parent().find('.fileArea .file').length){ return false }
    return true
}

function selectFile(el, input){
    hideAllFileInputs();
    var inputType = el.attr('data-list').split(',')[0];
    var fileArea = el.parent().find('.fileArea');
    fileArea.parent().find('.alert').remove();

    if(!fileLimit(el, input)){
        el.val('');
        createAlert(fileArea.parent(), 'Red', slovar('File_limit_reached'));
        return;
    }

    Array.from(input.files).forEach(thisFile => {
        if(inputType == 'IMG' && !thisFile.type.startsWith('image/')){
            el.val('');
            createAlert(fileArea.parent(), 'Red', slovar('Wrong_file_type'));
            return;
        }
        if(IF_fileSizeToBig(thisFile)){
            el.val('');
            createAlert(fileArea.parent(), 'Red', slovar('Wrong_file_size'));
            return;
        }

        fileArea.append(HTML_fileBlock());
        var fileBlock = fileArea.find('.file').last();

        if(thisFile.type.startsWith('image/')){
            var reader = new FileReader();
            reader.onload = function(e){ fileBlock.find('.img').css('background-image', 'url("'+e.target.result+'")'); }
            reader.readAsDataURL(thisFile);
        }

        fileBlock.find('.fileDesc').text(thisFile.name+' ['+((thisFile.size * 0.001) * 0.001).toFixed(2)+' Mb]');

        fileBlock.fadeIn('fast', function(){
            fileBlock.find('svg').click(function(){ removeFile($(this)) });
            el.after(el.clone()).attr('id','');
            el.next().val('').prop('required', false);
        });
    });
}

function HTML_fileBlock(){
    return '<div class="file newFile" style="display:none;"><div class="img"></div><div class="fileDesc"></div>'+getSVG('x')+'</div>'
}

function IF_fileSizeToBig(file){
    if(file.size > 10000000){ return true }
    return false
}

function clickOnFile(path, el, fileName = '', fakeFileName = '', extra = ''){
    if(fileName == ''){ fileName = el.closest('.file').attr('data-file') }
    if(fakeFileName == ''){ fakeFileName = fileName }
    var url = '/crm/static/uploads/'+path+'/'+fileName;
    var ext = url.split('.').pop().toUpperCase();
    if(['JPG','JPEG','PNG','GIF'].includes(ext)){ return openImgFile(url, fakeFileName, extra) }
    if(ext == 'PDF'){ return openPdfFile(url, fakeFileName, extra) }
    if(['MP3','MP4'].includes(ext)){ return openMediaFile(url, ext, fakeFileName, extra) }
    return openUnknownFile(url, fakeFileName);
}

function removeFile(el){
    var file = el.parent();
    var fileArea = el.closest('.fileArea');
    fileArea.parent().find('.alert').remove();

    function testRequirement(fileArea){
        var inputCount = fileArea.parent().find('input[type=file]').length;
        var inputRequired = fileArea.parent().find('input[type=file]').first().attr('data-required');
        if(inputCount == 1 && inputRequired == 'true'){ fileArea.parent().find('input[type=file]').prop('required', true); }
    }

    if(file.hasClass('newFile')){
        var pos = fileArea.find('.newFile').index(file);
        file.fadeOut('fast', function(){
            $(this).remove();
            fileArea.parent().find('input[type=file]:eq(' + pos + ')').remove();
            testRequirement(fileArea);
        });
    }
    else{
        POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
            $.post('/crm/php/main/module.php?delete_file=1', {
                csrf_token: $('input[name=csrf_token]').val(),
                module: el.closest('form').attr('data-module'),
                file: file.attr('data-file')
            }, function(data){
                data = JSON.parse(data);
                if(data.error){ createAlert(fileArea.parent(), 'Red', data.error); }
                else{
                    file.fadeOut('fast', function(){
                        $(this).remove();
                        testRequirement(fileArea);
                        tableLoad($('#main_table'), 0);
                    })
                }
            });
        });
    }
}

// ---------------------- OPEN FILES

function fileOpenTopNav_HTML(url, name, extra, html = ''){
    html += '<div id="popupRightTopMenu">';
    html += fileDownloadButton_HTML(url, name, extra);
    html += '<a onclick="removePOPUPbox()" data-tooltip="'+slovar('Close')+'">'+getSVG('x')+'</a>';
    html += '</div>';
    return html;
}
function fileDownloadButton_HTML(url, name, extra = []){
    if(extra.noDownload){ return '' }
    return '<a href="'+url+'" data-tooltip="'+slovar('Download')+'" download="'+name+'">'+getSVG('download')+'</a>'
}

function openUnknownFile(url, fakeFileName){
    POPUPconfirm(slovar('Unknown_file_title'), slovar('Unknown_file_desc'), function(){
        var a = document.createElement("a");
        a.href = url;
        a.setAttribute("download", fakeFileName);
        a.click();
    })
}

function openImgFile(url, fakeFileName, extra){
    var popup = createPOPUPbox();
    var box = popup.find('.popupBox');
    box.append(fileOpenTopNav_HTML(url, fakeFileName, extra));
    tooltips();
    const img = new Image();
    img.onload = function() {
      var w = this.width;
      var h = this.height;
      if(w > $(window).width() - 50){ w = $(window).width() - 50; }
      if(h > $(window).height() - 50){ h = $(window).height() - 50; }
      box.css({
        'width': w, 'height': h,
        'background-image': 'url("' + url + '")',
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-size': 'contain'
      });
      popup.fadeIn('fast');
    }
    img.src = url;
}

function openPdfFile(url, fakeFileName, extra){
    var popup = createPOPUPbox();
    var box = popup.find('.popupBox');
    box.append(fileOpenTopNav_HTML(url, fakeFileName, extra));
    tooltips();
    $('<iframe id="PdflFrame"/>').appendTo(box);
    box.css({
        'width': $(window).width() - 50,
        'height': $(window).height() - 50
    });
    box.find('#PdflFrame').css({ 'width': '99%', 'height': '99%' }).attr('src', url);
    popup.fadeIn('fast');
}

function openMediaFile(url, ext, fakeFileName, extra){
    var popup = createPOPUPbox();
    var box = popup.find('.popupBox');
    box.append(fileOpenTopNav_HTML(url, fakeFileName, extra));
    tooltips();
    var type = ['video', 'video/mp4'];
    if(ext ==  'MP3'){ type = ['audio', 'audio/mpeg'] }
    html = '<' + type[0] + ' controls controlsList="nodownload"><source src="' + url + '" type="' + type[1] + '"></' + type[0] + '>';
    $(html).appendTo(box);
    box.find(type[0]).css({ 'max-height': '70vh', 'max-width': '80vw' });
    popup.fadeIn('fast');
}