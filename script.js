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

/* Chat bubble teaser: a small, dismissible pop-up beside the chat bubble.
   Page-aware text, shown once per session, never on legal pages.
   Also lifts the bubble above the mobile Book/Call bar so it no longer covers the Call button. */
(function () {
  var ID = 'ultra-fast-widget-bubble-44739970';
  var path = location.pathname.replace(/index\.html$/, '');
  if (/^\/(privacy|terms)\//.test(path)) return;

  var MSG = [
    [/^\/styles\/knotless/, 'Knotless or box?', 'I can help you pick, and tell you the price.'],
    [/^\/styles\/fulani/, 'Fulani curious?', 'Ask me about patterns, time and price.'],
    [/^\/styles\/cornrows/, 'Cornrows or feed-ins?', 'Ask me what fits your hair and your day.'],
    [/^\/styles\/goddess/, 'Dreaming of boho curls?', 'Ask me what to bring and how long it takes.'],
    [/^\/styles\/twists/, 'Passion, Senegalese or kinky?', 'Ask me which twist fits your look.'],
    [/^\/styles\/locs/, 'Locs questions?', 'Retwist, starter or repair: ask away.'],
    [/^\/styles\/kids/, 'Booking for your little one?', 'Ask me about ages, time and price.'],
    [/^\/styles\/mens/, 'Fresh cornrows?', 'Ask me about price and time.'],
    [/^\/services\//, "Can't decide what to book?", 'Tell me what you want and I will point you.'],
    [/^\/style-finder\//, 'Need a hand picking?', 'Ask me anything about the styles.'],
    [/^\/first-visit\//, 'First time with Abla?', 'Ask me what to bring and how to prepare.'],
    [/^\/contact\//, 'Rather chat than call?', 'I can answer most questions right here.'],
    [/^\/(gallery|reviews)\//, 'Love what you see?', 'Ask me what a style costs and how long it takes.'],
    [/^\/(faq|aftercare)\//, 'Still wondering?', 'Ask me anything about your appointment.']
  ];
  var head = 'Braids on your mind?', sub = 'Ask me about styles, prices and booking.';
  for (var i = 0; i < MSG.length; i++) { if (MSG[i][0].test(path)) { head = MSG[i][1]; sub = MSG[i][2]; break; } }

  var css = '@media (max-width:700px){#' + ID + '{bottom:calc(84px + env(safe-area-inset-bottom,0px)) !important}}' +
    '.phb-tz{position:fixed;z-index:999998;max-width:min(290px,calc(100vw - 32px));display:flex;align-items:stretch;opacity:0;transform:translateY(10px);transition:opacity .35s ease,transform .35s ease;font-family:"Hanken Grotesk",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.phb-tz.on{opacity:1;transform:none}' +
    '.phb-tz-b{all:unset;box-sizing:border-box;cursor:pointer;background:#fff;color:#2A1426;border-radius:16px 16px 4px 16px;padding:14px 38px 14px 16px;box-shadow:0 10px 30px rgba(42,20,38,.22),0 0 0 1px rgba(42,20,38,.08);display:block}' +
    '.phb-tz-b:focus-visible,.phb-tz-x:focus-visible{outline:3px solid #B5326F;outline-offset:2px}' +
    '.phb-tz-h{display:block;font:600 1.02rem/1.25 "Bodoni Moda",Georgia,serif;margin:0 0 3px}' +
    '.phb-tz-s{display:block;font-size:.88rem;line-height:1.35;color:#6B5463}' +
    '.phb-tz-x{all:unset;box-sizing:border-box;position:absolute;top:4px;right:4px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6B5463;font:600 1.2rem/1 system-ui,sans-serif;border-radius:50%}' +
    '.phb-tz-x:hover{background:#F3DCE3}' +
    '@media (prefers-reduced-motion:reduce){.phb-tz{transition:none;transform:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var seen = false;
  try { seen = sessionStorage.getItem('phb_tz') === '1'; } catch (e) {}
  if (seen) return;

  var tz = null, bubble = null;
  function remember() { try { sessionStorage.setItem('phb_tz', '1'); } catch (e) {} }
  function hide() { if (!tz) return; tz.classList.remove('on'); var n = tz; setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 400); tz = null; }
  function place() {
    if (!tz || !bubble) return;
    var r = bubble.getBoundingClientRect();
    tz.style.right = Math.max(12, window.innerWidth - r.right) + 'px';
    tz.style.bottom = (window.innerHeight - r.top + 12) + 'px';
  }
  function show() {
    bubble = document.getElementById(ID);
    if (!bubble || tz) return;
    tz = document.createElement('div'); tz.className = 'phb-tz';
    tz.setAttribute('role', 'region'); tz.setAttribute('aria-label', 'Chat suggestion');
    tz.innerHTML = '<button type="button" class="phb-tz-b"><span class="phb-tz-h"></span><span class="phb-tz-s"></span></button><button type="button" class="phb-tz-x" aria-label="Dismiss chat suggestion">\u00d7</button>';
    tz.querySelector('.phb-tz-h').textContent = head;
    tz.querySelector('.phb-tz-s').textContent = sub;
    document.body.appendChild(tz); place();
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (tz) tz.classList.add('on'); }); });
    remember();
    tz.querySelector('.phb-tz-b').addEventListener('click', function () { hide(); if (bubble) bubble.click(); });
    tz.querySelector('.phb-tz-x').addEventListener('click', hide);
    bubble.addEventListener('click', hide, { once: true });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
    window.addEventListener('resize', place);
    setTimeout(hide, 25000);
  }
  // wait for the chat bubble to exist, then show 8 seconds after the page loaded
  var started = Date.now(), poll = setInterval(function () {
    if (document.getElementById(ID)) { clearInterval(poll); setTimeout(show, Math.max(0, 8000 - (Date.now() - started))); }
    else if (Date.now() - started > 20000) clearInterval(poll);
  }, 400);
})();
