function externalTableSelector(d){
    loadCSS('externalTableSelector');

    if(valEmpty(d.table.labels)){ d.table.labels = d.table.columns }

    if(d.input){ if_external_table_input(d) }
    else if(d.box){ if_external_table_box(d) }
}

function if_external_table_input(d){
    if(valEmpty(d.input.label)){ d.input.label = slovar('Select') }

    d.input.el.closest('.formField').find('.inputPlaceholder').remove();

    d.input.el
    .removeAttr('onfocus')
    .addClass('hiddenInput')
    .on('focus', function(){ popup_external_table(d) })
    .after(`<div class="inputPlaceholder" id="${d.input.id}">${d.input.label}</div>`);

    d.input.placeholder = d.input.el.parent().find(`#${d.input.id}`);
    d.title = d.input.el.closest('.formField').find('label').text();

    if(!valEmpty(d.input.el.val())){ external_table_value_exists(d) }
    d.input.placeholder.click(function(){
        d.table.offset = 0;
        popup_external_table(d);
    })
}

function external_table_value_exists(d){
    $.getJSON('/crm/php/form/externalTableSelector', {
        select_external_table_row:true,
        module:d.table.module,
        columns:d.table.columns,
        where:d.table.where,
        value:d.input.el.val()
    }, function(data){
        if(data.error){ return createAlertPOPUP(data.error) }
        return d.input.placeholder.text(data);
    })
}

function if_external_table_box(d){
    d.popup = d.box.el;
    d.title = d.box.title;
    d.popup.html('<div class="popupBox" />');
    popup_external_table(d);
}

function popup_external_table(d){
    if(valEmpty(d.box)){ d.popup = createPOPUPbox() }

    d.popup.find('.popupBox').html(HTML_popup_external_table(d));
    debug_searchable_external_column(d);
    d.popup.find('form').on('submit', function(e){ e.preventDefault() })

    if(valEmpty(d.box)){
        d.popup.fadeIn('fast', function(){ $(this).find('input').first().focus() });
    }

    d.popup.find('thead .sortingRow th:not(.no-sort)').click(function(){
        click_external_table_sort_row($(this), d);
    });

    d.popup.find('.tableLoadMoreButton').click(function(){
        click_external_table_showmore($(this), d)
    });

    let ET_timer;
    d.popup.find('input').on('keyup', function(e){
        empty_external_table(d);

        if(e.keyCode == 13){
            clearTimeout(ET_timer);
            search_external_table(d);
            return;
        }

        clearTimeout(ET_timer);

        ET_timer = setTimeout(function() {
            search_external_table(d);
        }, 800);
    })

    search_external_table(d);
}

function HTML_popup_external_table(d){
    return `
    <form>
        <h2 style="padding-bottom:9px">${d.title}</h2>
        <div class="horizontalTable" style="max-height:60vh;">
            <table class="table extTable">
                <thead>
                    <tr class="sortingRow">
                        ${d.table.labels.map(
                            (l, i) => `<th class="${d.table.sortable?.[i] ? '' : 'no-sort'}" data-col="${d.table.columns[i]}">${l}</th>`
                        ).join('')}
                    </tr>
                    <tr>
                        ${d.table.columns.map((c, i) => `
                            <th class="no-sort">
                                <input type="text" data-col="${c}" placeholder="${slovar('Search')}">
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
        <div class="tableFooter">
            <div>
                ${slovar('Showing')} <b>0</b>
            </div>
            <div class="paginator">
                <button class="button buttonBlue tableLoadMoreButton">
                ${getSVG('show_more')} ${slovar('Show_more')}
                </button>
            </div>
        </div>
        ${!d.box ? `<span class="button buttonGrey" onclick="removePOPUPbox()">${slovar('Cancel')}</span>` : ''}
    </form>
    `
}

function debug_searchable_external_column(d){
    if(d.table.search_columns === undefined){ return }

    let i = 0;
    d.popup.find('input').each(function(){
        if(!d.table.search_columns.includes($(this).data('col'))){ return $(this).remove() }

        type = d.table.search_types[i] ?? 'Contains';
        
        if(type == 'Toggle'){
            $(this)
            .wrap('<div class="toggleBox"></div>')
            .after('<a onclick="toggleExtTableColumn($(this))">%A%</a>')
            type = 'Contains';
        }

        $(this).attr('data-type', type);
        i++;
    })
}

// SEARCH

function search_external_table(d){
    let thisSearchType = [];
    let thisSearchVal = [];

    d.popup.find('input').each(function(){
        thisSearchType.push($(this).data('type') ?? 'Contains');
        thisSearchVal.push($(this).val());
    });

    const sortedCol = d.popup.find('thead .sorted');
    if(sortedCol.length) {
        d.table.order = sortedCol.data('col') + (sortedCol.hasClass('ascending') ? ' ASC' : ' DESC');
    }

    $.getJSON('/crm/php/form/externalTableSelector', {
        search_external_table: true,
        module: d.table.module,
        columns: d.table.columns,
        where: d.table.where,
        search_columns: d.table.search_columns,
        search_types: thisSearchType,
        search_values: thisSearchVal,
        order: d.table.order,
        limit: d.table.limit,
        offset: d.table.offset
    }, function(data){
        if(data.error){ return createAlertPOPUP(data.error) }
        return render_external_table_data(d, data)
    })
}

function render_external_table_data(d, data){
    d.popup.find('tbody').append(`
        ${data.map(r => `
            <tr data-id="${r[0]}">
                ${r.map(c => `<td>${c}</td>`).join('')}
            </tr>
        `).join('')}
    `);

    d.popup.find('.tableFooter b').text(d.popup.find('tbody tr').length);
    d.popup.find('.tableLoadMoreButton').show();

    if(d.box){ return }

    d.popup.find('tbody tr')
    .addClass('selectable')
    .click(function(){
        click_external_table_row($(this), d);
    })
}

// CLICK EVENTS

function click_external_table_sort_row(el, d){
    empty_external_table(d);

    if(el.hasClass('ascending')){
        el.parent().find('th').removeClass('sorted ascending descending');
        el.addClass('sorted descending');
    }
    else{
        el.parent().find('th').removeClass('sorted ascending descending');
        el.addClass('sorted ascending');
    }
    search_external_table(d);
}

function toggleExtTableColumn(el) {
    let input = el.parent().find('input');
    let type = input.data('type') === 'Contains' ? 'Begins_with' : 'Contains';
    input.data('type', type).focus();
    el.text(type === 'Begins_with' ? 'A%' : '%A%');
}

function click_external_table_row(el, d){
    let label = el.find("td").map(function() {
        return $(this).text().trim();
    }).get().join(" - ");

    d.input.el.val(el.data('id'));
    d.input.placeholder.text(label);

    removePOPUPbox();
    test_external_table_addons(d);
}

function click_external_table_showmore(el, d){
    el.hide();
    let tr = el.closest('.popupBox').find('tbody tr');
    d.table.offset = tr.length;
    search_external_table(d);
}

// EXTRA

function empty_external_table(d){
    d.table.offset = 0;
    d.popup.find('tbody').empty();
    d.popup.find('.tableLoadMoreButton').hide();
}

function test_external_table_addons(d){
    // ADDON_copyDifferentModule
    if (
        !valEmpty(d.input.el.data('childinput')) &&
        d.input.el.closest('.formField').data('type') == 'JOIN_ADD'
    ){
        focusOutJOIN_ADDInput(d.input.el);
    }
    // ADDON_parent_filter
    if (
        !valEmpty(d.input.el.data('parentfilter')) &&
        d.input.el.closest('.formField').data('type') == 'JOIN_ADD'
    ){
        console.log('ddd');
        clearChildInput(
            d.input.el.closest('form'),
            d.input.el.data('childfilter')
        );
    }
}