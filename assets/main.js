  const state = { qty: 1, price: 34.00, shipping: 0, promo: 0, colorName: 'Slate' };

  function fmt(n){ return '$' + n.toFixed(2); }

  function recalc(){
    const subtotal = state.price * state.qty;
    const discount = subtotal * state.promo;
    const tax = (subtotal - discount + state.shipping) * 0.05;
    const total = subtotal - discount + state.shipping + tax;

    document.getElementById('subtotalVal').textContent = fmt(subtotal);
    document.getElementById('itemPrice').textContent = fmt(subtotal);
    document.getElementById('shippingVal').textContent = state.shipping === 0 ? 'Free' : fmt(state.shipping);
    document.getElementById('taxVal').textContent = fmt(tax);
    document.getElementById('totalVal').textContent = fmt(total);
    document.getElementById('mobileTotal').textContent = fmt(total);
    document.getElementById('payLabel').textContent = 'Pay ' + fmt(total);

    const discountLine = document.getElementById('discountLine');
    if(state.promo > 0){
      discountLine.style.display = 'flex';
      document.getElementById('discountVal').textContent = '–' + fmt(discount);
    } else {
      discountLine.style.display = 'none';
    }
  }

  // Quantity stepper
  document.getElementById('qtyPlus').addEventListener('click', () => {
    state.qty = Math.min(state.qty + 1, 9);
    document.getElementById('qtyVal').textContent = state.qty;
    recalc();
  });
  document.getElementById('qtyMinus').addEventListener('click', () => {
    state.qty = Math.max(state.qty - 1, 1);
    document.getElementById('qtyVal').textContent = state.qty;
    recalc();
  });

  // Colour swatches
  document.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      const color = sw.dataset.color;
      const name = sw.dataset.name;
      document.getElementById('caseRender').style.setProperty('--swatch', color);
      document.getElementById('variantLabel').textContent = 'Colour: ' + name;
      state.colorName = name;
    });
  });

  // Delivery options
  document.querySelectorAll('.delivery-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.delivery-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.shipping = parseFloat(opt.dataset.price);
      recalc();
    });
  });

  // Payment tabs (wallet buttons act as quick-pay, card is default panel)
  // Promo code
  document.getElementById('promoBtn').addEventListener('click', () => {
    const val = document.getElementById('promoInput').value.trim().toUpperCase();
    const msg = document.getElementById('promoMsg');
    if(val === 'CASE10'){
      state.promo = 0.10;
      msg.textContent = 'Promo code applied — 10% off.';
      msg.className = 'promo-msg show ok';
    } else if(val.length === 0){
      msg.className = 'promo-msg';
    } else {
      state.promo = 0;
      msg.textContent = 'That code isn\'t valid.';
      msg.className = 'promo-msg show bad';
    }
    recalc();
  });

  // Card number formatting + type detection
  const cardInput = document.getElementById('cardNumber');
  const cardType = document.getElementById('cardType');
  cardInput.addEventListener('input', (e) => {
    let digits = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = formatted;

    if(digits.startsWith('4')){ cardType.textContent = 'VISA'; cardType.classList.add('show'); }
    else if(/^5[1-5]/.test(digits)){ cardType.textContent = 'MC'; cardType.classList.add('show'); }
    else if(/^3[47]/.test(digits)){ cardType.textContent = 'AMEX'; cardType.classList.add('show'); }
    else { cardType.classList.remove('show'); }
  });

  // Expiry formatting
  const expiryInput = document.getElementById('expiry');
  expiryInput.addEventListener('input', (e) => {
    let digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    if(digits.length >= 3){ digits = digits.slice(0,2) + '/' + digits.slice(2); }
    e.target.value = digits;
  });

  // Mobile summary toggle
  document.getElementById('summaryToggle').addEventListener('click', () => {
    document.getElementById('summaryCol').classList.toggle('expanded');
  });

  // Validation + submit
  function validate(){
    let ok = true;
    const required = ['f-email','f-first','f-last','f-address','f-city','f-zip','f-cardname','f-cardnum','f-exp','f-cvc'];
    required.forEach(id => {
      const field = document.getElementById(id);
      const input = field.querySelector('input');
      let valid = input.value.trim().length > 0;
      if(id === 'f-email'){
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      }
      if(id === 'f-cardnum'){
        valid = input.value.replace(/\D/g,'').length >= 13;
      }
      field.classList.toggle('error', !valid);
      if(!valid) ok = false;
    });
    return ok;
  }

  document.getElementById('placeOrderBtn').addEventListener('click', () => {
    if(!validate()){
      document.querySelector('.field.error')?.scrollIntoView({behavior:'smooth', block:'center'});
      return;
    }
    const btn = document.getElementById('placeOrderBtn');
    btn.classList.add('loading');
    setTimeout(() => {
      btn.classList.remove('loading');
      document.getElementById('successOverlay').classList.add('show');
    }, 900);
  });

  document.getElementById('successClose').addEventListener('click', () => {
    document.getElementById('successOverlay').classList.remove('show');
  });

  recalc();
