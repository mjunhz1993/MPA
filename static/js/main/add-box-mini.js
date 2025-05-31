loadCSS('add-box-mini');

function addBoxMini(d){
    GET_module({
        module: d.module,
        done: function(m){
            GET_column({
                module: d.module,
                showAll:true,
                done: function(col){
                    displayAddBoxMini({
                        box: d.box,
                        module: m,
                        column: col,
                        filter: d.filter,
                        filter_value: d.filter_value,
                        callback: d.callback
                    });
                }
            })
        }
    })
}

function displayAddBoxMini(d){
    d.box.append(`
    <fieldset class="add-box-mini-form">
        <legend>${slovar(d.module.name)}</legend>
        <div class="add-box-mini">
            ${d.column ? d.column.map(col => createFormField(col, 'ADD')).join('') : ''}
            <div class="linksvg" onclick="addBoxMini_remove($(this))">${getSVG('x')}</div>
        </div>
        <span class="button buttonBlue" onclick="addBoxMini_add($(this))">${slovar('Add_new')}</span>
    </fieldset>
    `);

    d.box = d.box.find('.add-box-mini-form').last();

    d.box.find('input').each(function(){
        $(this).attr('name', `${$(this).attr('name')}[]`);
    });

    if(d.filter && d.filter_value){ return grabDataForAddBoxMini(d) }
    if(typeof d.callback === 'function'){ return d.callback(d) }
}

function grabDataForAddBoxMini(d){
    $.getJSON('/crm/php/main/add-box-mini', {
        addBoxMini_joinData: true,
        module: d.module.module,
        filter: d.filter,
        filter_value: d.filter_value
    }, function(data){
        if(!data){ return }
        data.forEach((thisData, index) => {
            addBoxMini_joinData(d.box.find('.add-box-mini').last(), thisData);
            if(index < data.length - 1){ addBoxMini_add(d.box.find('.buttonBlue')) }
        });
        refreshFormData(d.box);
        if(typeof d.callback === 'function'){ return d.callback(d) }
    })
}

// EVENTS

function addBoxMini_joinInputSelectEvent(d, input){
    d.box.find(`[name="${input}[]"]`).each(function(){
        $(this).next().attr({
            'data-callback': `addBoxMini_joinInputGrabData('${$(this).data('list').split(',')[1]}', '${d.module.module}', input)`
        })
    });
}
function addBoxMini_joinInputGrabData(moduleFrom, moduleTo, input){
    GET_row({
        module: moduleFrom,
        id: input.val(),
        each:function(i, v){
            if(!i.includes(moduleFrom)){ return }
            addBoxMini_joinData(input.closest('.add-box-mini'), {
                [i.replace(moduleFrom, moduleTo)]: v
            });
        }
    })
}

function addBoxMini_add(el){
    if(el.closest('form').find('.add-box-mini').length >= 100){ return createAlertPOPUP(slovar('Too_many_inputs')) }
    el.before(el.prev().clone());
    el.prev().find('input, select').val('');
    el.prev().find('.inputPlaceholder').text(slovar('Search'));
}

function addBoxMini_joinData(box, data){
    Object.entries(data).forEach(([name, val]) => {
        box.find(`[name="${name}[]"]`).val(val);
    })
}

function addBoxMini_remove(el){
    if(el.closest('form').find('.add-box-mini').length == 1){ return }
    el.parent().remove();
}