function externalTableSelector(d){
    loadCSS('externalTableSelector');

    if(valEmpty(d.input.label)){ d.input.label = slovar('Select') }
    if(valEmpty(d.table.labels)){ d.table.labels = d.table.columns }

    d.input.el.closest('.formField').find('.inputPlaceholder').remove();

    d.input.el
    .removeAttr('onfocus')
    .addClass('hiddenInput')
    .on('focus', function(){ popup_external_table(d) })
    .after(`<div class="inputPlaceholder" id="${d.input.id}">${d.input.label}</div>`);

    d.input.placeholder = d.input.el.parent().find(`#${d.input.id}`);
    d.title = d.input.el.closest('.formField').find('label').text();

    if(!valEmpty(d.input.el.val())){ external_table_value_exists(d) }

    d.input.placeholder.click(function(){ popup_external_table(d) })
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

function popup_external_table(d){
    d.popup = createPOPUPbox();
    d.popup.find('.popupBox').html(HTML_popup_external_table(d));
    d.popup.fadeIn('fast', function(){ $(this).find('input').first().focus() });

    d.popup.find('form').on('submit', function(e){ e.preventDefault() })
    d.popup.find('input').on('keyup', function(e){if(e.keyCode == 13){ search_external_table(d) }})
    search_external_table(d);
}

function HTML_popup_external_table(d){
    return `
    <form>
        <label>${d.title}</label>
        <input type="text" placeholder="${slovar('Search')}">
        <div class="horizontalTable" style="max-height:60vh;">
            <table class="table extTable">
                <thead>
                    ${d.table.labels.map(c => `<th class="no-sort">${c}</th>`).join('')}
                </thead>
                <tbody></tbody>
            </table>
        </div>
        <span class="button buttonGrey" onclick="removePOPUPbox()">${slovar('Cancel')}</span>
    </form>
    `
}

function search_external_table(d){
    $.getJSON('/crm/php/form/externalTableSelector', {
        search_external_table:true,
        module:d.table.module,
        columns:d.table.columns,
        where:d.table.where,
        search_columns:d.table.search_columns,
        search_types:d.table.search_types,
        search:d.popup.find('input').val(),
        order:d.table.order,
        limit:d.table.limit
    }, function(data){
        if(data.error){ return createAlertPOPUP(data.error) }
        return render_external_table_data(d, data)
    })
}

function render_external_table_data(d, data){
    d.popup.find('tbody').html(`
        ${data.map(r => `
            <tr data-id="${r[0]}">
                ${r.map(c => `<td>${c}</td>`).join('')}
            </tr>
        `).join('')}
    `);
    d.popup.find('tbody tr').click(function(){ click_external_table_row($(this), d) })
}

function click_external_table_row(el, d){
    let label = el.find("td").map(function() {
        return $(this).text().trim();
    }).get().join(" - ");

    d.input.el.val(el.data('id'));
    d.input.placeholder.text(label);

    removePOPUPbox();
}

/*
externalTableSelector({
    input:{
        el: $(el),
        id: str,
        label: str
    },
    table:{
        module: str,
        columns: array,
        labels: array,
        where: array,
        search_columns: array,
        search_types: array,
        order: str,
        limit: int
    }
})
*/