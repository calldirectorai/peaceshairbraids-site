(function () {
  var sliders = document.querySelectorAll('.rv');
  if (!sliders.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  sliders.forEach(function (rv) {
    var track = rv.querySelector('.rv-track');
    var slides = [].slice.call(rv.querySelectorAll('.rv-slide'));
    var n = slides.length;
    if (!track || n < 2) return;
    var ctl = document.createElement('div'); ctl.className = 'rv-ctl';
    var prev = document.createElement('button'); prev.type = 'button'; prev.className = 'rv-btn rv-prev'; prev.textContent = 'Previous'; prev.setAttribute('aria-label', 'Previous review');
    var next = document.createElement('button'); next.type = 'button'; next.className = 'rv-btn rv-next'; next.textContent = 'Next'; next.setAttribute('aria-label', 'Next review');
    var count = document.createElement('div'); count.className = 'rv-count'; count.setAttribute('aria-hidden', 'true');
    var dots = document.createElement('div'); dots.className = 'rv-dots';
    var dotEls = slides.map(function (s, i) {
      var d = document.createElement('button'); d.type = 'button'; d.className = 'rv-dot';
      d.setAttribute('aria-label', 'Go to review ' + (i + 1) + ' of ' + n);
      d.addEventListener('click', function () { go(i, true); });
      dots.appendChild(d); return d;
    });
    var pause = document.createElement('button'); pause.type = 'button'; pause.className = 'rv-btn rv-pause';
    ctl.appendChild(prev); ctl.appendChild(count); ctl.appendChild(dots); ctl.appendChild(pause); ctl.appendChild(next);
    rv.appendChild(ctl);

    var idx = 0, timer = null, userPaused = reduce, hover = false;
    function width() { return track.clientWidth || 1; }
    function render(i) {
      idx = i;
      dotEls.forEach(function (d, k) { if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      count.textContent = (i + 1) + ' / ' + n;
    }
    function go(i, byUser) {
      i = (i + n) % n;
      track.scrollTo({ left: i * width(), behavior: reduce ? 'auto' : 'smooth' });
      render(i);
      if (byUser) stop();
    }
    var raf = null;
    track.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = null; var i = Math.round(track.scrollLeft / width()); if (i !== idx && i >= 0 && i < n) render(i); });
    });
    function label() {
      pause.textContent = userPaused ? 'Play' : 'Pause';
      pause.setAttribute('aria-label', userPaused ? 'Start automatic slideshow' : 'Pause automatic slideshow');
      track.setAttribute('aria-live', userPaused || hover ? 'polite' : 'off');
    }
    function start() { stop(); if (userPaused || hover) return; timer = setInterval(function () { go(idx + 1, false); }, 7000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    pause.addEventListener('click', function () { userPaused = !userPaused; label(); if (userPaused) stop(); else start(); });
    prev.addEventListener('click', function () { go(idx - 1, true); });
    next.addEventListener('click', function () { go(idx + 1, true); });
    rv.addEventListener('mouseenter', function () { hover = true; stop(); label(); });
    rv.addEventListener('mouseleave', function () { hover = false; label(); start(); });
    rv.addEventListener('focusin', function () { hover = true; stop(); label(); });
    rv.addEventListener('focusout', function () { hover = false; label(); start(); });
    rv.addEventListener('touchstart', function () { stop(); }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1, true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1, true); }
    });
    window.addEventListener('resize', function () { track.scrollTo({ left: idx * width(), behavior: 'auto' }); });
    render(0); label(); start();
  });
})();
