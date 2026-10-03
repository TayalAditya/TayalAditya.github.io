(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var anim = root.classList.contains('anim') && hasGSAP && !reduce;
  window.__cvReady = true;
  if (!anim) root.classList.remove('anim');

  // ---------- theme + palette ----------
  // The palette is picked at random in <head> (window.__palettes); light/dark re-applies it.
  var themeBtn = $('.theme-toggle'), pal = window.__palettes;
  function syncTheme() {
    themeBtn.textContent = root.getAttribute('data-theme') === 'light' ? 'Dark' : 'Light';
  }
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('cv-theme', next); } catch (e) {}
    if (pal) pal.apply(pal.index());
    syncTheme();
    document.dispatchEvent(new Event('cv:theme'));
  });
  syncTheme();

  // ---------- nav turns solid once the hero has scrolled away ----------
  var navEl = $('.nav'), heroEl = $('.hero');
  function syncNav() { navEl.classList.toggle('is-solid', scrollY > heroEl.offsetHeight * .7); }
  addEventListener('scroll', syncNav, { passive: true }); syncNav();

  // ---------- clock (IST) ----------
  var clock = $('#clock');
  var fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  (function tick() { clock.textContent = fmt.format(new Date()); setTimeout(tick, 1000); })();

  // ---------- project index ----------
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ORDER = window.CV_ORDER || [], rankOf = function (p) { var i = ORDER.indexOf(p.name); return i === -1 ? ORDER.length : i; };
  var projects = (window.CV_PROJECTS || []).slice().sort(function (a, b) { return rankOf(a) - rankOf(b); });
  var plist = $('#plist');
  plist.innerHTML = projects.map(function (p) {
    return '<li class="prow acc" data-cats="' + p.cats + '">' +
      '<button class="prow__head acc__trigger" type="button" aria-expanded="false">' +
      '<span class="prow__y mono">' + p.y + '</span><span class="prow__name">' + esc(p.name) + '</span>' +
      '<span class="prow__ctx mono">' + esc(p.ctx) + '</span><span class="prow__arrow" aria-hidden="true">→</span></button>' +
      '<div class="acc__body"><div class="acc__inner"><div class="prow__body"><div class="prow__text"><p class="prow__desc">' + esc(p.desc) + '</p>' +
      '<p class="prow__meta mono"><span>' + esc(p.stack) + '</span>' +
      (p.link ? '<a href="' + esc(p.link) + '" target="_blank" rel="noopener" data-cursor="Open">' + (/github\.com/.test(p.link) ? 'Code' : 'Open') + ' ↗</a>' : '') +
      (p.live ? '<a href="' + esc(p.live) + '" target="_blank" rel="noopener" data-cursor="Open">Live ↗</a>' : '') +
      '</p></div><figure class="prow__fig" aria-hidden="true"><canvas></canvas></figure></div></div></div></li>';
  }).join('');
  var rows = $$('.prow', plist), idxCount = $('#idxCount');
  var ANIMS = window.CV_ANIMS || {};
  rows.forEach(function (r, i) { r._spec = ANIMS[projects[i].name]; r._name = projects[i].name; });

  // A row's animation runs only while the row is open.
  function rowAnim(row, open) {
    if (!window.CVMotifs || !window.CVCovers) return;
    if (open && !row._anim) {
      var inst = window.CVMotifs.make(row._spec);
      if (inst) row._anim = window.CVCovers.attach(row.querySelector('.prow__fig canvas'), inst);
    } else if (!open && row._anim) {
      setTimeout(function () {
        if (!row.classList.contains('is-open') && row._anim) { row._anim.detach(); row._anim = null; }
      }, 650);
    }
  }
  idxCount.textContent = rows.length;
  $$('.filters button').forEach(function (b) {
    var f = b.dataset.filter;
    var n = f === 'all' ? rows.length : rows.filter(function (r) { return r.dataset.cats.split(' ').indexOf(f) > -1; }).length;
    b.insertAdjacentHTML('beforeend', '<sup>' + n + '</sup>');
    b.addEventListener('click', function () {
      $$('.filters button').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      var shown = [];
      rows.forEach(function (r) {
        var on = f === 'all' || r.dataset.cats.split(' ').indexOf(f) > -1;
        r.classList.toggle('is-hidden', !on);
        if (on) shown.push(r);
      });
      idxCount.textContent = shown.length;
      if (anim) {
        gsap.fromTo(shown.slice(0, 18), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .6, ease: 'expo.out', stagger: .025, overwrite: true });
        ScrollTrigger.refresh();
      }
    });
  });

  // ---------- accordions ----------
  var refreshT;
  document.addEventListener('click', function (e) {
    var trg = e.target.closest('.acc__trigger');
    if (!trg) return;
    var item = trg.closest('.acc'), open = !item.classList.contains('is-open');
    item.classList.toggle('is-open', open);
    trg.setAttribute('aria-expanded', String(open));
    if (item.classList.contains('prow')) { rowAnim(item, open); if (open && typeof hidePreview === 'function') hidePreview(); }
    if (anim) { clearTimeout(refreshT); refreshT = setTimeout(function () { ScrollTrigger.refresh(); }, 650); }
  });

  // ---------- copy email ----------
  var toast = $('.toast'), toastT;
  function say(msg) {
    toast.textContent = msg; toast.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('is-on'); }, 1800);
  }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.dataset.copy;
      var done = function () { say('Copied — ' + text); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () { location.href = 'mailto:' + text; });
      else location.href = 'mailto:' + text;
    });
  });

  // ---------- mobile menu ----------
  var menu = $('#menu'), menuBtn = $('.menu-btn'), lenis = null;
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    if (open && anim) gsap.fromTo($$('.menu__links a'), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .06, duration: .8, ease: 'expo.out', delay: .2 });
  }
  menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });

  // ---------- generative canvases ----------
  if (window.CVCovers) window.CVCovers.init();

  // ---------- split helpers ----------
  function splitWords(el, outer, inner) {
    var made = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var o = document.createElement('span'); o.className = outer;
            if (inner) { var i = document.createElement('span'); i.className = inner; i.textContent = part; o.appendChild(i); made.push(i); }
            else { o.textContent = part; made.push(o); }
            frag.appendChild(o);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    return made;
  }
  function splitChars(el) {
    var text = el.textContent; el.textContent = '';
    return text.split('').map(function (ch) {
      var s = document.createElement('span'); s.className = 'char'; s.textContent = ch; el.appendChild(s); return s;
    });
  }

  // Characters exist in every mode so the hero lens works without the intro.
  var chars = [];
  $$('.hero__word').forEach(function (w) { chars = chars.concat(splitChars(w)); });

  // ---------- without motion: done ----------
  if (!anim) {
    var bar = $('.progress');
    var onScroll = function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    return;
  }

  // ================= motion from here on =================
  gsap.registerPlugin(ScrollTrigger);

  // smooth scroll
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .09, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'), target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      if (menu.classList.contains('is-open')) setMenu(false);
      if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: function (x) { return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); } });
      else if (target === 0) scrollTo(0, 0); else target.scrollIntoView();
    });
  });

  // ---------- loader → intro ----------
  var count = { v: 0 }, countEl = $('#loaderCount');
  var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .to(count, { v: 100, duration: 1.25, ease: 'power2.inOut', onUpdate: function () { countEl.textContent = ('00' + Math.round(count.v)).slice(-3); } }, 0)
    .to('.loader__bar span', { scaleX: 1, duration: 1.25, ease: 'power2.inOut' }, 0)
    .to('#loader', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, 1.35)
    .set('#loader', { display: 'none' })
    .fromTo(chars, { yPercent: 105, y: 0 }, { yPercent: 0, y: 0, duration: 1.3, stagger: .045 }, 1.75)
    .fromTo('.hero__tag', { yPercent: 105, y: 0 }, { yPercent: 0, y: 0, duration: 1.1 }, 2.05)
    .fromTo('.hero [data-reveal]', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.2, stagger: .1 }, 2.1)
    .to(['.nav', '.hero__coords'], { opacity: 1, duration: .8, ease: 'power2.out' }, 2.2)
    .add(function () { if (lenis) lenis.start(); ScrollTrigger.refresh(); }, 2.2);

  // ---------- reveals ----------
  $$('[data-reveal]').forEach(function (el) {
    if (el.closest('.hero')) return;
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  $$('[data-split]').forEach(function (el) {
    var words = splitWords(el, 'w', 'wi');
    gsap.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // ---------- counters ----------
  var nf = new Intl.NumberFormat('en-IN');
  $$('[data-count]').forEach(function (el) {
    var to = +el.dataset.count, from = el.dataset.from ? +el.dataset.from : 0, o = { v: from };
    el.textContent = nf.format(from);
    gsap.to(o, {
      v: to, duration: 2.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: function () { el.textContent = nf.format(Math.round(o.v)); }
    });
  });

  // ---------- marquee bands: speed and direction follow the scroll ----------
  var bands = $$('.band__track').map(function (el, i) { return { el: el, x: 0, dir: i % 2 ? 1 : -1, half: 0 }; });
  function measureBands() { bands.forEach(function (b) { b.half = b.el.scrollWidth / 2; b.x = -b.half / 2; }); }
  measureBands(); addEventListener('resize', measureBands);
  var vel = 0, sign = 1;
  if (lenis) lenis.on('scroll', function (e) { vel = e.velocity || 0; if (Math.abs(vel) > .5) sign = vel > 0 ? 1 : -1; });
  gsap.ticker.add(function (time, dt) {
    var s = Math.min(dt, 50) / 1000, boost = Math.min(Math.abs(vel) * 14, 900);
    bands.forEach(function (b) {
      if (!b.half) return;
      b.x += b.dir * sign * (70 + boost) * s;
      if (b.x <= -b.half) b.x += b.half;
      if (b.x > 0) b.x -= b.half;
      b.el.style.transform = 'translate3d(' + b.x.toFixed(2) + 'px,0,0)';
    });
    vel *= .92;
  });

  // ---------- selected work: horizontal on desktop ----------
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    var track = $('.work__track'), pin = $('.work__pin'), idx = $('#workIdx'), fill = $('.work__hud em'), panels = $$('.panel', track);
    var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
    gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: pin, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: .7, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (self) {
          var n = Math.min(panels.length, Math.floor(self.progress * panels.length) + 1);
          idx.textContent = ('0' + n).slice(-2);
          fill.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')';
        }
      }
    });
  });
  mm.add('(max-width: 899px)', function () {
    $$('.panel').forEach(function (p) {
      gsap.fromTo(p, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 88%', once: true } });
    });
  });

  // ---------- leadership statement: words light up as you read ----------
  var stmt = $('[data-words]');
  if (stmt) {
    var lw = splitWords(stmt, 'lw');
    gsap.to(lw, { opacity: 1, ease: 'none', stagger: .1, scrollTrigger: { trigger: stmt, start: 'top 82%', end: 'bottom 48%', scrub: .6 } });
  }

  // ---------- contact: the letters stretch as you arrive ----------
  gsap.fromTo('.contact__big', { '--wdth': 62 }, { '--wdth': 125, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top 90%', end: 'bottom bottom', scrub: .6 } });

  // ---------- page progress ----------
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  // ---------- hero lens on the name ----------
  // Letter centres are measured once in page coordinates (again on resize), so a frame never
  // reads layout; styles are written only when the rounded value changes, so a still lens costs nothing.
  var hero = $('.hero'), nameEl = $('.hero__name'), heroOn = true, px = -9999, py = -9999, ready = false;
  var lens = chars.map(function () { return { w: 800, d: 92, cx: 0, cy: 0, out: '' }; }), nameBox = { l: 0, t: 0, w: 1, h: 1 };
  function measureLens() {
    var sx = scrollX, sy = scrollY;
    chars.forEach(function (c, i) {
      var b = c.getBoundingClientRect();
      lens[i].cx = b.left + sx + b.width / 2; lens[i].cy = b.top + sy + b.height / 2;
    });
    var nb = nameEl.getBoundingClientRect();
    nameBox = { l: nb.left + sx, t: nb.top + sy, w: nb.width, h: nb.height };
    ready = true;
  }
  intro.add(measureLens, 3.6);
  var lensT; addEventListener('resize', function () { clearTimeout(lensT); lensT = setTimeout(measureLens, 200); });
  new IntersectionObserver(function (e) { heroOn = e[0].isIntersecting; }).observe(hero);
  addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') { px = e.clientX + scrollX; py = e.clientY + scrollY; } }, { passive: true });
  gsap.ticker.add(function (time) {
    if (!heroOn || !ready) return;
    var x = px, y = py;
    if (!finePointer) {
      x = nameBox.l + (.5 + .55 * Math.sin(time * .8)) * nameBox.w;
      y = nameBox.t + (.5 + .5 * Math.sin(time * .5)) * nameBox.h;
    }
    var R = Math.max(200, innerWidth * .26);
    for (var i = 0; i < chars.length; i++) {
      var s = lens[i], d = Math.hypot(x - s.cx, y - s.cy);
      var k = Math.max(0, 1 - d / R); k = k * k * (3 - 2 * k);
      s.w += (800 - 560 * k - s.w) * .14; s.d += (92 + 33 * k - s.d) * .14;
      var out = '"wght" ' + Math.round(s.w / 4) * 4 + ', "wdth" ' + Math.round(s.d * 2) / 2;
      if (out !== s.out) { chars[i].style.fontVariationSettings = out; s.out = out; }
    }
  });

  // ---------- index: floating preview on hover (desktop) ----------
  var hidePreview = function () {};
  if (finePointer && window.CVMotifs && window.CVCovers) {
    var pv = document.createElement('div');
    pv.className = 'pv'; pv.setAttribute('aria-hidden', 'true');
    pv.innerHTML = '<canvas></canvas><span class="pv__label mono"></span>';
    document.body.appendChild(pv);
    var pvCanvas = pv.querySelector('canvas'), pvLabel = pv.querySelector('.pv__label'), pvAnim = null, pvRow = null, pvOn = false;
    var pvX = gsap.quickTo(pv, 'x', { duration: .55, ease: 'power3' }), pvY = gsap.quickTo(pv, 'y', { duration: .55, ease: 'power3' });
    hidePreview = function () {
      if (!pvOn) return; pvOn = false; pvRow = null;
      gsap.to(pv, { autoAlpha: 0, scale: .7, duration: .3, ease: 'power2.in', overwrite: 'auto' });
    };
    plist.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var row = e.target.closest('.prow'), head = e.target.closest('.prow__head');
      if (!row || !head || row.classList.contains('is-open')) { hidePreview(); return; }
      var w = pv.offsetWidth, h = pv.offsetHeight;
      var x = e.clientX + 32 + w > innerWidth ? e.clientX - w - 32 : e.clientX + 32, y = Math.min(Math.max(e.clientY - h / 2, 70), innerHeight - h - 16);
      if (!pvOn) { gsap.set(pv, { x: x, y: y }); }
      pvX(x); pvY(y);
      if (row !== pvRow) {
        pvRow = row;
        if (pvAnim) { pvAnim.detach(); pvAnim = null; }
        var inst = window.CVMotifs.make(row._spec);
        if (inst) pvAnim = window.CVCovers.attach(pvCanvas, inst);
        pvLabel.textContent = row._name;
      }
      if (!pvOn) { pvOn = true; gsap.to(pv, { autoAlpha: 1, scale: 1, duration: .45, ease: 'expo.out', overwrite: 'auto' }); }
    });
    plist.addEventListener('pointerleave', hidePreview);
    addEventListener('scroll', function () { if (pvOn) hidePreview(); }, { passive: true });
  }

  // ---------- custom cursor ----------
  if (finePointer) {
    root.classList.add('has-cursor');
    var cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    });
    gsap.ticker.add(function () {
      rx += (mx - rx) * .16; ry += (my - ry) * .16;
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
    });
    document.addEventListener('pointerover', function (e) {
      var link = e.target.closest('a, button'), tagged = e.target.closest('[data-cursor]');
      var text = (link && link.dataset.cursor) || (!link && tagged && tagged.dataset.cursor) || '';
      cur.classList.toggle('is-label', !!text);
      cur.classList.toggle('is-link', !text && !!link);
      label.textContent = text;
    });
    document.addEventListener('pointerleave', function () { cur.style.opacity = 0; });
    document.addEventListener('pointerenter', function () { cur.style.opacity = 1; });
  }

  // ---------- nav scramble ----------
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/#_<>';
  $$('[data-scramble]').forEach(function (a) {
    var txt = a.textContent, raf = 0;
    a.setAttribute('aria-label', txt);
    a.addEventListener('mouseenter', function () {
      var f = 0, total = txt.length * 3;
      cancelAnimationFrame(raf);
      (function step() {
        a.textContent = txt.split('').map(function (ch, i) { return i < f / 3 ? ch : GLYPHS[Math.random() * GLYPHS.length | 0]; }).join('');
        if (++f <= total) raf = requestAnimationFrame(step); else a.textContent = txt;
      })();
    });
  });

  // ---------- magnetic ----------
  if (finePointer) {
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - b.left - b.width / 2) * .22, y: (e.clientY - b.top - b.height / 2) * .35, duration: .4, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', function () { gsap.to(el, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1, .4)' }); });
    });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measureBands(); if (ready) measureLens(); ScrollTrigger.refresh(); });
  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
