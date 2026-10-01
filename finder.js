(function () {
  var data = JSON.parse(document.getElementById('fdata').textContent);
  var form = document.getElementById('finder');
  var out = document.getElementById('fres');
  var err = document.getElementById('ferr');
  var booksy = window.PHB_BOOKSY;

  function val(n) { var c = form.querySelector('input[name=' + n + ']:checked'); return c ? c.value : null; }
  function num(p) { var m = (p || '').match(/\d+/); return m ? parseInt(m[0], 10) : 9999; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }

  function run() {
    var w = val('w'), t = val('t'), h = val('h'), l = val('l');
    if (!w || !t || !h || !l) { err.classList.add('show', 'err'); return; }
    err.classList.remove('show');
    var limit = parseInt(t, 10);
    var list = data.filter(function (i) { return i.w === w; }).map(function (i) {
      var s = 0;
      if (i.m <= limit) s++;
      if (h === 'any' || i.h === h) s++;
      if (i.l === l) s++;
      return { i: i, s: s };
    });
    list.sort(function (a, b) { return b.s - a.s || num(a.i.p) - num(b.i.p); });
    var best = list.length ? list[0].s : 0;
    var picks = list.filter(function (x) { return x.s === best; }).slice(0, 4);

    out.textContent = '';
    var wrap = el('div');
    var hd = el('h2', null, best === 3 ? 'Styles that fit' : 'Closest matches');
    hd.style.marginTop = '0'; hd.setAttribute('tabindex', '-1');
    wrap.appendChild(hd);
    if (best < 3) {
      var note = el('p', 'muted', 'No style matches all three of your answers on time, hair and look, so these are the closest. Abla can tell you what is possible.');
      wrap.appendChild(note);
    }
    picks.forEach(function (x) {
      var i = x.i;
      var card = el('div', 'panel'); card.style.marginBottom = '14px';
      var h3 = el('h3', null, i.n); h3.style.marginTop = '0';
      card.appendChild(h3);
      var meta = el('p', 'muted', 'Starting at ' + i.p.replace('+', '') + ' \u00b7 about ' + i.d + (i.note ? ' \u00b7 ' + i.note : ''));
      meta.style.marginBottom = '12px';
      card.appendChild(meta);
      var row = el('div', 'btnrow'); row.style.marginTop = '0';
      var a1 = el('a', 'btn sm', 'Book on Booksy'); a1.href = booksy; a1.target = '_blank'; a1.rel = 'noopener';
      var a2 = el('a', 'btn ghost sm', 'About this style'); a2.href = i.u;
      row.appendChild(a1); row.appendChild(a2); card.appendChild(row);
      wrap.appendChild(card);
    });
    var foot = el('p', 'muted', 'Starting prices and typical times. Abla confirms the final price before she starts. ');
    var c = el('a', null, 'Send a request'); c.href = '/contact/';
    foot.appendChild(c); foot.appendChild(document.createTextNode(' or call (612) 707-5534.'));
    wrap.appendChild(foot);
    out.appendChild(wrap);
    hd.focus();
    if (window.matchMedia('(max-width:860px)').matches) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.getElementById('fgo').addEventListener('click', run);
  document.getElementById('freset').addEventListener('click', function () { form.reset(); err.classList.remove('show'); });
})();
