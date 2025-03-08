function getColumnSum(el, type){
    var box = el.closest('.tableBox');
    var module = box.attr('data-module');
    var F = getFilterData(box, module);
    var th = box.find(`.table thead th:nth-child(${el.parent().index() + 1})`);
    el.hide();
    $.getJSON('/crm/php/main/sum.php', {
        get_column_sum: true,
        module: module,
        column: th.attr('data-column'),
        filters: F[0],
        filter_values: F[1],
        type: type
    }, function(data){
        if(data){
            displayColumnSum({
                el: el,
                data: data,
                th: th
            });
        }
    })
}

function displayColumnSum(d){
    if(['ID','INT','DECIMAL'].includes(d.th.data('type'))){ return d.el.before(d.data[0].sum) }
    if(d.th.data('type') == 'PRICE'){ return d.el.before(Price(d.data[0].sum)) }
    if(d.th.data('type') == 'PERCENT'){ return d.el.before(Percent(d.data[0].sum)) }
    if(d.th.data('type') == 'SELECT'){
        var list = d.th.data('list').split('|').map(item => {
            const [key, value, color] = item.split(',');
            return { key, value, color };
        });
        d.el.before(sumColumnForSelect(d.data, list));
        tooltips();
    }
}

function sumColumnForSelect(data, list, html = ''){
    list.forEach(item => {
        var thisPercentage = data.find(obj => obj.status === item.key);
        thisPercentage = thisPercentage ? thisPercentage.percentage : 0;
        html += `<div 
        style="
            background-color:${item.color ?? 'var(--blue)'};
            width:${thisPercentage}%;
        "
        data-tooltip="${slovar(item.value)}: ${thisPercentage}%"></div>`
    })
    return `<div class="statusSum">${html}</div>`
}