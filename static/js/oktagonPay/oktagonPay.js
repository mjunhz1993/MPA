function oktagonPay(price, currency, onDone = ''){
    loadJS('https://js.stripe.com/v3/', function(){
        loadJS('oktagonPay/slovar/'+slovar(), function(){
            $.get('/crm/php/oktagonPay/oktagonPay.php', {oktagon_pay_key: true}, function(key){
                key = JSON.parse(key);
                if(valEmpty(key)){ return }
                run_oktagonPay(key, price, currency, onDone)
            })
        })
    })
}

function run_oktagonPay(key, price, currency, onDone){
    HTML_oktagonPay(price, currency, function(){
        var stripe = get_oktagonPay_stripe(key);
        var elements = get_oktagonPay_elements(price, currency, stripe);
        const form = document.getElementById('payment-form');
        const submitBtn = $('#payment-submit');
        
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if(!submitBtn.is(':visible')){ return }
            submitBtn.hide();
            
            const {error: submitError} = await elements.submit();
            if(submitError){ return oktagonPay_error(submitError.message) }
            
            run_oktagonPay_submit(price, currency, stripe, elements, onDone);
        })
    })
}

function HTML_oktagonPay(price, currency, callback, html = ''){
    loadCSS('oktagonPay');
    var popup = createPOPUPbox();
    var popupBox = popup.find('.popupBox');
    html += '<form id="payment-form">';
    html += '<div id="payment-price">'+(price/100).toFixed(2)+' '+currency.toUpperCase()+'</div>';
    html += '<hr><div id="payment-element"></div><hr>';
    html += '<button id="payment-submit" class="buttonSquare button100 buttonGreen" type="submit">'+slovar('Submit_payment')+'</button>';
    html += '<div id="payment-error"></div>';
    html += '</form>';
    popupBox.html(html);
    popupBox.find('#payment-submit').hide();
    popup.fadeIn('fast', function(){ callback() })
}

function get_oktagonPay_stripe(key){ return Stripe(key) }

function get_oktagonPay_elements(price, currency, stripe){
    var elements = stripe.elements({ mode:'payment', amount:price, currency:currency });
    var paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
    paymentElement.on('ready', function(){ $('#payment-submit').fadeIn('fast') });
    return elements;
}

function run_oktagonPay_submit(price, currency, stripe, elements, onDone){
    get_oktagonPay_intent(price, currency, function(intent){
        stripe.confirmPayment({
            elements,
            clientSecret: intent,
            redirect: 'if_required',
            confirmParams: { return_url: window.location.href }
        }).then(function(result){
            if(result.error){ return oktagonPay_error(result.error.message) }
            return oktagonPay_done(result.paymentIntent.id, onDone)
        })
    })
}

function get_oktagonPay_intent(price, currency, callback){
    $.post('/crm/php/oktagonPay/oktagonPay.php?oktagon_pay_intent=1', {
        amount: price,
        currency: currency
    }, function(data){
        data = JSON.parse(data);
        if(data.error){ return oktagonPay_error('ERROR: '+data.error) }
        callback(data.client_secret)
    })
}

function oktagonPay_done(id, onDone){
    var popupBox = $('.popupBox').last();
    popupBox.html('');
    createAlert(popupBox, 'Green', slovar('Thank_you'));
    if(typeof onDone === 'function'){ onDone(id) }
}

function oktagonPay_error(msg){
    $('#payment-submit').show();
    return createAlert($('.popupBox').last(), 'Red', msg);
}