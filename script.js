(function () {
  if (window.__phbInit) return; window.__phbInit = true;
  var cfg = window.PHB || {
    webhook: 'https://app.calldirector.ai/api/webhooks/flow/6354/fdc75592913a4851551a0962fc519876e5e3a9ece831c0cf44abacb63ee431c2',
    phone: '(612) 707-5534'
  };

  /* Mobile nav */
  var mb = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (mb && nav) {
    mb.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      mb.textContent = open ? 'Close' : 'Menu';
    });
  }

  /* Gallery filter + lightbox */
  var chips = document.querySelectorAll('.chip');
  var tiles = document.querySelectorAll('.masonry [data-cat]');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      chips.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      c.setAttribute('aria-pressed', 'true');
      var f = c.getAttribute('data-filter');
      tiles.forEach(function (t) {
        var show = f === 'all' || (' ' + t.getAttribute('data-cat') + ' ').indexOf(' ' + f + ' ') > -1;
        t.hidden = !show;
      });
    });
  });
  var lb = document.getElementById('lb');
  if (lb && tiles.length) {
    var lbi = lb.querySelector('img'), lbc = lb.querySelector('.lbcap');
    tiles.forEach(function (t) {
      t.addEventListener('click', function () {
        var im = t.querySelector('img');
        lbi.src = im.getAttribute('data-full') || im.src;
        lbi.alt = im.alt;
        lbc.textContent = im.alt;
        if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
      });
    });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.querySelector('.lbx').addEventListener('click', function () { lb.close(); });
  }

  /* Lead forms -> CallDirector flow webhook (Peace's sub-account) */
  function e164(p) {
    var d = (p || '').replace(/\D/g, '');
    if (d.length === 10) return '+1' + d;
    if (d.length === 11 && d.charAt(0) === '1') return '+' + d;
    return p;
  }
  document.querySelectorAll('form[data-lead]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var msg = form.querySelector('.fmsg');
      var btn = form.querySelector('button[type=submit]');
      var fd = new FormData(form);
      if (fd.get('company_site')) return; // honeypot
      var digits = String(fd.get('phone') || '').replace(/\D/g, '');
      if (!String(fd.get('name') || '').trim() || !(digits.length === 10 || (digits.length === 11 && digits.charAt(0) === '1'))) {
        msg.className = 'fmsg show err';
        msg.textContent = 'Please enter your name and a 10-digit phone number.';
        return;
      }
      var data = { source: form.getAttribute('data-lead'), page: location.pathname };
      fd.forEach(function (v, k) {
        if (['name', 'phone', 'email', 'company_site', 'consent'].indexOf(k) === -1 && v) data[k] = v;
      });
      if (fd.get('consent')) data.marketing_consent = 'yes';
      var payload = {
        contactName: fd.get('name') || '',
        contactPhone: e164(fd.get('phone')),
        contactEmail: fd.get('email') || '',
        channel: 'sms',
        data: data
      };
      msg.className = 'fmsg'; msg.textContent = '';
      if (!cfg.webhook) { msg.className = 'fmsg show err'; msg.textContent = 'This form is not connected yet. Please call ' + cfg.phone + ' or book on Booksy.'; return; }
      btn.disabled = true; var old = btn.textContent; btn.textContent = 'Sending';
      fetch(cfg.webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error('bad'); return r; })
        .then(function () {
          form.reset();
          msg.className = 'fmsg show';
          msg.textContent = form.getAttribute('data-ok') || 'Thank you. Abla will reach out within 24 hours.';
        })
        .catch(function () {
          msg.className = 'fmsg show err';
          msg.textContent = 'Your request did not go through. Please call ' + cfg.phone + ' or book on Booksy.';
        })
        .finally(function () { btn.disabled = false; btn.textContent = old; });
    });
  });
})();
