/* NEO VISTA — shared behaviour */
(function () {
  // header scroll state
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 30); };
    onScroll(); addEventListener('scroll', onScroll, { passive: true });
  }

  // mobile menu
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    var toggle = function () {
      document.body.classList.toggle('menu-open');
      menu.classList.toggle('open');
    };
    burger.addEventListener('click', toggle);
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        menu.classList.remove('open');
      });
    });
  }

  // starfield inside any .vista
  document.querySelectorAll('.vista .stars').forEach(function (box) {
    var n = box.dataset.n ? +box.dataset.n : 30;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.className = 'star';
      s.style.left = (Math.random() * 100) + '%';
      s.style.top = (Math.random() * 58) + '%';
      s.style.opacity = (Math.random() * 0.5 + 0.15).toFixed(2);
      s.style.transform = 'scale(' + (Math.random() * 1.1 + 0.4).toFixed(2) + ')';
      box.appendChild(s);
    }
  });

  // reveal on scroll
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // accordions (generic)
  document.querySelectorAll('.acc-item').forEach(function (item) {
    var head = item.querySelector('.acc-head');
    var body = item.querySelector('.acc-body');
    if (!head || !body) return;
    var set = function () { body.style.maxHeight = item.classList.contains('open') ? body.scrollHeight + 'px' : '0px'; };
    if (item.classList.contains('open')) requestAnimationFrame(set);
    head.addEventListener('click', function () {
      var open = item.classList.contains('open');
      var group = item.closest('.acc');
      if (group) group.querySelectorAll('.acc-item').forEach(function (o) {
        o.classList.remove('open'); o.querySelector('.acc-body').style.maxHeight = '0px';
      });
      if (!open) { item.classList.add('open'); requestAnimationFrame(set); }
    });
  });
})();
