/* ============================================================
   NEO VISTA — interaction layer (vanilla, no dependencies)
   ============================================================ */
(function () {
  'use strict';

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var raf = window.requestAnimationFrame.bind(window);

  /* ---------- 1. HEADER STATE ---------- */
  var hd = document.querySelector('.hd');
  var prog = document.querySelector('.progress');
  var mcta = document.querySelector('.mcta');

  function onScroll() {
    var y = window.scrollY;
    if (hd) hd.classList.toggle('stuck', y > 24);
    if (prog) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = 'scaleX(' + (h > 0 ? clamp(y / h, 0, 1) : 0) + ')';
    }
    if (mcta) mcta.classList.toggle('show', y > window.innerHeight * 0.55);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. MOBILE MENU ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    menu.querySelectorAll('.ml').forEach(function (a, i) { a.style.setProperty('--i', i); });
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- 3. PAGE TRANSITION (horizon wipe) ---------- */
  var tx = document.querySelector('.tx');
  if (tx && !RM) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || a.target === '_blank' || a.hasAttribute('download')) return;
      if (href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
      if (a.host && a.host !== location.host) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      tx.classList.remove('enter');
      void tx.offsetWidth;
      tx.classList.add('exit');
      setTimeout(function () { location.href = href; }, 560);
    });
    // returning via browser back button
    addEventListener('pageshow', function (ev) {
      if (ev.persisted) { tx.classList.remove('exit'); }
    });
  }

  /* ---------- 4. BOOT SEQUENCE (home, first arrival) ---------- */
  var boot = document.querySelector('.boot');
  if (boot) {
    var internal = document.referrer && document.referrer.indexOf(location.origin) === 0;
    if (RM || internal) {
      boot.remove();
    } else {
      document.body.style.overflow = 'hidden';
      var out = boot.querySelector('.bn');
      var n = 0;
      var tick = setInterval(function () {
        n = Math.min(100, n + Math.ceil(Math.random() * 9));
        if (out) out.textContent = String(n).padStart(3, '0');
        if (n >= 100) {
          clearInterval(tick);
          setTimeout(function () {
            boot.classList.add('done');
            document.body.style.overflow = '';
            setTimeout(function () { boot.remove(); }, 850);
          }, 220);
        }
      }, 95);
    }
  }

  /* ---------- 5. CUSTOM CURSOR + MAGNETIC ---------- */
  if (FINE && !RM) {
    var dot = document.createElement('div'); dot.className = 'cur';
    var ring = document.createElement('div'); ring.className = 'cur-ring';
    ring.innerHTML = '<span class="lb"></span>';
    document.body.append(dot, ring);
    var lb = ring.querySelector('.lb');
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, on = false;

    addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!on) { on = true; document.body.classList.add('cursor-on'); rx = mx; ry = my; }
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      raf(loop);
    })();

    var HOT = 'a,button,.axis-card,.card,.case,input,textarea,select,.acc-head';
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest(HOT);
      if (t) {
        document.body.classList.add('cur-hot');
        lb.textContent = t.dataset.cursor || '';
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(HOT)) {
        document.body.classList.remove('cur-hot');
        lb.textContent = '';
      }
    });

    // magnetic buttons
    document.querySelectorAll('.btn, .hd-cta').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + dx * 0.22 + 'px,' + dy * 0.3 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- 6. SPOTLIGHT (pointer-tracking gradient) ---------- */
  document.querySelectorAll('.card, .axis-card, .case').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- 7. SPLIT TEXT (latin display headings) ---------- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    el.classList.add('sw');
    words.forEach(function (w, i) {
      var o = document.createElement('span'); o.className = 'sp';
      var inn = document.createElement('span');
      inn.textContent = w;
      inn.style.setProperty('--i', i);
      o.appendChild(inn);
      el.appendChild(o);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- 8. REVEAL ON SCROLL ---------- */
  var pending = [].slice.call(document.querySelectorAll('.rv, .hz-rule, .sw, .ladder, .tl-step'));
  var show = function (el) {
    el.classList.add('in');
    io.unobserve(el);
    var i = pending.indexOf(el);
    if (i > -1) pending.splice(i, 1);
  };
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) show(e.target); });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  pending.forEach(function (el) { io.observe(el); });

  // Anything scrolled past without ever intersecting (hash landings, restored
  // scroll position, very fast scrolling) would otherwise stay invisible.
  var sweeping = false;
  function sweep() {
    sweeping = false;
    for (var i = pending.length - 1; i >= 0; i--) {
      if (pending[i].getBoundingClientRect().bottom < 0) show(pending[i]);
    }
  }
  addEventListener('scroll', function () {
    if (!sweeping && pending.length) { sweeping = true; raf(sweep); }
  }, { passive: true });
  addEventListener('load', sweep);
  addEventListener('hashchange', function () { setTimeout(sweep, 80); });
  sweep();

  /* ---------- 9. COUNTERS ---------- */
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      cio.unobserve(el);
      var to = parseFloat(el.dataset.count);
      var dur = 1300, t0 = performance.now();
      (function step(t) {
        var p = clamp((t - t0) / dur, 0, 1);
        var e2 = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e2).toString();
        if (p < 1) raf(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------- 10. DEPTH AXIS — pinned horizontal scroll ---------- */
  var axis = document.querySelector('.axis-sec');
  if (axis && !RM) {
    var track = axis.querySelector('.axis-track');
    var pin = axis.querySelector('.axis-pin');
    var meter = axis.querySelector('.axis-meter .rail i');
    var range = 0;

    function measure() {
      if (innerWidth < 1000) { axis.style.height = ''; return; }
      range = Math.max(0, track.scrollWidth - innerWidth + 40);
      axis.style.height = (innerHeight + range) + 'px';
      move();
    }
    function move() {
      if (innerWidth < 1000 || range <= 0) { track.style.transform = ''; return; }
      var p = clamp(-axis.getBoundingClientRect().top / range, 0, 1);
      track.style.transform = 'translate3d(' + (-p * range) + 'px,0,0)';
      if (meter) meter.style.width = (p * 100) + '%';
    }
    addEventListener('scroll', move, { passive: true });
    addEventListener('resize', measure);
    addEventListener('load', measure);
    measure();
    if (pin) pin.setAttribute('aria-label', 'サービス4領域');
  }

  /* ---------- 11. TIMELINE — scroll-drawn horizon rail ---------- */
  var rail = document.querySelector('.tl-rail i');
  if (rail && !RM) {
    var tl = document.querySelector('.tl');
    var drawRail = function () {
      var r = tl.getBoundingClientRect();
      var p = clamp((innerHeight * 0.72 - r.top) / r.height, 0, 1);
      rail.style.height = (p * 100) + '%';
    };
    addEventListener('scroll', drawRail, { passive: true });
    drawRail();
  }

  /* ---------- 12. SERVICES — sticky index sync ---------- */
  var idx = document.querySelectorAll('.svc-index a');
  if (idx.length) {
    var blocks = document.querySelectorAll('.svc-block');
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        idx.forEach(function (a) {
          a.classList.toggle('on', a.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    blocks.forEach(function (b) { sio.observe(b); });
  }

  /* ---------- 13. CASE FILTER ---------- */
  var filter = document.querySelector('.filter');
  if (filter) {
    var cards = document.querySelectorAll('.case-grid .case');
    filter.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      filter.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      var cat = b.dataset.cat;
      cards.forEach(function (c) {
        var match = cat === 'all' || c.dataset.cat === cat;
        c.classList.add('fade');
        setTimeout(function () {
          c.classList.toggle('hide', !match);
          requestAnimationFrame(function () { if (match) c.classList.remove('fade'); });
        }, 200);
      });
    });
  }

  /* ---------- 14. ACCORDION ---------- */
  document.querySelectorAll('.acc-item').forEach(function (item) {
    var head = item.querySelector('.acc-head');
    var body = item.querySelector('.acc-body');
    if (!head || !body) return;
    head.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
    var size = function () { body.style.maxHeight = item.classList.contains('open') ? body.scrollHeight + 'px' : '0px'; };
    if (item.classList.contains('open')) raf(size);
    head.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      var group = item.closest('.acc');
      if (group) group.querySelectorAll('.acc-item').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.acc-body').style.maxHeight = '0px';
        o.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        head.setAttribute('aria-expanded', 'true');
        raf(size);
      }
    });
  });

  /* ---------- 15. VISTA — parallax vanishing point ---------- */
  var vistas = document.querySelectorAll('.vista');
  if (vistas.length && FINE && !RM) {
    addEventListener('mousemove', function (e) {
      var off = (e.clientX / innerWidth - 0.5) * 40;
      vistas.forEach(function (v) { v.style.setProperty('--vx', off.toFixed(1) + 'px'); });
    }, { passive: true });
  }

  /* ---------- 16. STARFIELD ---------- */
  document.querySelectorAll('.vista .stars').forEach(function (box) {
    var n = +(box.dataset.n || 30);
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.className = 'star';
      s.style.left = (Math.random() * 100) + '%';
      s.style.top = (Math.random() * 56) + '%';
      s.style.opacity = (Math.random() * 0.5 + 0.12).toFixed(2);
      s.style.transform = 'scale(' + (Math.random() * 1.1 + 0.4).toFixed(2) + ')';
      frag.appendChild(s);
    }
    box.appendChild(frag);
  });
})();
