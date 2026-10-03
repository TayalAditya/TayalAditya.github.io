// Generative covers for the selected-work panels, plus the hero ridgelines.
// Each cover is drawn on canvas from the project's own facts; nothing here is an image.
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONO = '"JetBrains Mono", ui-monospace, monospace';

  // ---------- shared helpers ----------
  function palette() {
    var s = getComputedStyle(document.documentElement);
    var g = function (n) { return s.getPropertyValue(n).trim(); };
    return { bg: g('--bg'), bg2: g('--bg-2'), fg: g('--fg'), mute: g('--mute'), accent: g('--accent') };
  }
  var C = palette();

  function rgba(hex, a) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pad(n, l) { n = String(n); while (n.length < l) n = '0' + n; return n; }
  function font(ctx, size, weight) { ctx.font = (weight || 500) + ' ' + size + 'px ' + MONO; }

  // ---------- covers ----------
  var Covers = {};

  // 01 PlanMyDegree: one dot per student who signed in.
  Covers.pmd = function () {
    var TOTAL = 1741, LIT = 1741, r = rng(11), rank = new Array(TOTAL), order = [], i;
    for (i = 0; i < TOTAL; i++) order.push(i);
    for (i = TOTAL - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = order[i]; order[i] = order[j]; order[j] = t; }
    for (i = 0; i < TOTAL; i++) rank[order[i]] = i;
    var L = {};
    return {
      resize: function (w, h) {
        var px = 22, top = 46, bottom = 40, aw = w - px * 2, ah = h - top - bottom;
        var cols = Math.ceil(Math.sqrt(TOTAL * aw / ah)), rows = Math.ceil(TOTAL / cols);
        var cell = Math.min(aw / cols, ah / rows);
        L = { cols: cols, cell: cell, ox: px + (aw - cols * cell) / 2 + cell / 2, oy: top + (ah - rows * cell) / 2 + cell / 2, r: Math.max(1, cell * .3) };
      },
      draw: function (ctx, w, h, t) {
        var cyc = t % 10, p = cyc < 5 ? ease(cyc / 5) : cyc < 8.6 ? 1 : 1 - ease((cyc - 8.6) / 1.4);
        var lit = Math.round(p * LIT);
        ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
        var dim = rgba(C.fg, .14);
        for (var k = 0; k < TOTAL; k++) {
          var x = L.ox + (k % L.cols) * L.cell, y = L.oy + Math.floor(k / L.cols) * L.cell;
          var on = rank[k] < lit, fresh = on && rank[k] > lit - 24;
          ctx.fillStyle = on ? C.accent : dim;
          ctx.beginPath(); ctx.arc(x, y, fresh ? L.r * 1.7 : L.r, 0, 6.2832); ctx.fill();
        }
        font(ctx, 11); ctx.fillStyle = C.fg; ctx.textBaseline = 'top';
        ctx.fillText('SIGNED IN  ' + pad(lit, 4), 22, 18);
        ctx.textAlign = 'right'; ctx.fillStyle = C.accent;
        ctx.fillText('IIT MANDI', w - 22, 18);
        ctx.textAlign = 'left';
      }
    };
  };

  // 02 Faculty Leave Portal: an append-only ledger that refuses edits.
  Covers.ledger = function () {
    var r = rng(4), rows = [], held = 0, availed = 0, entitled = 30, open = [], id = 1040;
    function day() { return pad(1 + Math.floor(r() * 28), 2); }
    function add(type, text) {
      rows.push({ type: type, text: text, bal: entitled - availed - held });
    }
    for (var i = 0; i < 160; i++) {
      var x = r();
      if (x < .3 || open.length === 0) {
        var d = 1 + Math.floor(r() * 4); held += d; open.push({ id: ++id, d: d });
        add('HOLD', 'EL  ' + d + '.0d  #A-' + id);
      } else if (x < .58) {
        var a = open.shift(); held -= a.d; availed += a.d;
        add('DEBIT', 'EL  ' + a.d + '.0d  #A-' + a.id + '  sanctioned');
      } else if (x < .72) {
        var b = open.shift(); held -= b.d;
        add('RELEASE', 'HOLD #A-' + b.id + '  withdrawn');
      } else if (x < .84) {
        add('REFUSED', 'UPDATE ledger #' + (id - Math.floor(r() * 30)) + '  trigger');
      } else if (availed > 18) {
        entitled += 15; add('CREDIT', 'EL  +15d  half-year');
      } else {
        add('AUDIT', 'read by establishment  ' + day() + ' SEP');
      }
    }
    var colors = function (type) {
      return type === 'DEBIT' || type === 'REFUSED' ? C.accent : type === 'RELEASE' || type === 'AUDIT' ? C.mute : C.fg;
    };
    return {
      draw: function (ctx, w, h, t) {
        ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
        var lh = 22, top = 70, bottom = h - 70, speed = 16;
        var off = t * speed, first = Math.floor(off / lh), frac = off % lh;
        font(ctx, 11); ctx.textBaseline = 'middle';
        ctx.save(); ctx.beginPath(); ctx.rect(0, top, w, bottom - top); ctx.clip();
        var n = Math.ceil((bottom - top) / lh) + 1, last = null;
        for (var k = 0; k < n; k++) {
          var idx = (first + k) % rows.length, row = rows[idx];
          var y = top + k * lh - frac + lh / 2;
          var fade = clamp((y - top) / 60, 0, 1) * clamp((bottom - y) / 20, 0, 1);
          ctx.globalAlpha = fade;
          ctx.fillStyle = C.mute; ctx.fillText(pad(idx + 1, 4), 22, y);
          ctx.fillStyle = colors(row.type); ctx.fillText(row.type, 72, y);
          ctx.fillStyle = row.type === 'REFUSED' ? C.accent : C.fg;
          ctx.fillText(row.text, 158, y);
          if (row.type === 'REFUSED') {
            var tw = ctx.measureText(row.text).width;
            ctx.fillRect(158, y, tw, 1.2);
          }
          if (y < bottom - 4) last = row;
        }
        ctx.restore(); ctx.globalAlpha = 1;
        font(ctx, 11); ctx.textBaseline = 'top'; ctx.fillStyle = C.fg;
        ctx.fillText('LEDGER — APPEND ONLY', 22, 18);
        ctx.fillStyle = C.mute; ctx.fillText('available = entitled − availed − held', 22, 38);
        ctx.strokeStyle = rgba(C.fg, .18); ctx.beginPath(); ctx.moveTo(22, top - 8); ctx.lineTo(w - 22, top - 8); ctx.stroke();
        if (last) {
          ctx.textAlign = 'right'; ctx.fillStyle = C.accent;
          ctx.fillText('AVAILABLE ' + last.bal.toFixed(1) + 'd', w - 22, 18);
          ctx.textAlign = 'left';
        }
      }
    };
  };

  // 03 Exodia: QR scans at the gate; every so often a ticket comes back twice.
  Covers.gate = function () {
    var N = 25;
    function ticket(seed) {
      var r = rng(seed), m = [];
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var fx = x < 7 ? x : x >= N - 7 ? x - (N - 7) : -1, fy = y < 7 ? y : y >= N - 7 ? y - (N - 7) : -1;
        var finder = fx >= 0 && fy >= 0 && !(x >= N - 7 && y >= N - 7);
        if (finder) {
          var ring = Math.max(Math.abs(fx - 3), Math.abs(fy - 3));
          m.push(ring !== 2);
        } else if ((x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8)) {
          m.push(false);
        } else m.push(r() < .48);
      }
      return m;
    }
    var cache = {};
    return {
      draw: function (ctx, w, h, t) {
        ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
        var period = 1.25, k = Math.floor(t / period), ph = (t % period) / period;
        var blocked = k % 5 === 3, bcount = (Math.floor(k / 5) % 26) + 1, admitted = k - Math.floor(k / 5);
        var m = cache[k] || (cache = {}, cache[k] = ticket(blocked ? 1000 + (k - 5) : 77 + k));
        var s = Math.min(w * .6, h - 130), cell = s / N, ox = (w - s) / 2, oy = 48;
        var showResult = ph > .55;
        for (var i = 0; i < m.length; i++) {
          if (!m[i]) continue;
          ctx.fillStyle = showResult && blocked ? C.accent : C.fg;
          ctx.fillRect(ox + (i % N) * cell, oy + Math.floor(i / N) * cell, Math.ceil(cell), Math.ceil(cell));
        }
        // viewfinder corners
        ctx.strokeStyle = showResult ? (blocked ? C.accent : C.fg) : C.mute; ctx.lineWidth = 2;
        var g = 14, L = 22, x0 = ox - g, y0 = oy - g, x1 = ox + s + g, y1 = oy + s + g;
        ctx.beginPath();
        ctx.moveTo(x0, y0 + L); ctx.lineTo(x0, y0); ctx.lineTo(x0 + L, y0);
        ctx.moveTo(x1 - L, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + L);
        ctx.moveTo(x1, y1 - L); ctx.lineTo(x1, y1); ctx.lineTo(x1 - L, y1);
        ctx.moveTo(x0 + L, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - L);
        ctx.stroke(); ctx.lineWidth = 1;
        if (!showResult) {
          var sy = oy + ease(ph / .55) * s;
          var grd = ctx.createLinearGradient(0, sy - 40, 0, sy);
          grd.addColorStop(0, rgba(C.accent, 0)); grd.addColorStop(1, rgba(C.accent, .35));
          ctx.fillStyle = grd; ctx.fillRect(ox - 6, sy - 40, s + 12, 40);
          ctx.fillStyle = C.accent; ctx.fillRect(ox - 6, sy, s + 12, 2);
        } else if (blocked) {
          ctx.strokeStyle = C.bg; ctx.lineWidth = Math.max(6, s * .05);
          ctx.beginPath(); ctx.moveTo(ox + s * .2, oy + s * .2); ctx.lineTo(ox + s * .8, oy + s * .8);
          ctx.moveTo(ox + s * .8, oy + s * .2); ctx.lineTo(ox + s * .2, oy + s * .8); ctx.stroke(); ctx.lineWidth = 1;
        }
        font(ctx, 11); ctx.textBaseline = 'top'; ctx.fillStyle = C.fg;
        ctx.fillText('GATE 1 — PRONITE', 22, 18);
        ctx.textAlign = 'right'; ctx.fillStyle = C.mute;
        ctx.fillText('ADMITTED ' + pad(admitted % 201, 3), w - 22, 18); ctx.textAlign = 'left';
        var msg = !showResult ? 'SCANNING…' : blocked ? 'ALREADY CLAIMED — BLOCKED ' + pad(bcount, 2) + '/26' : 'CLAIMED ONCE — ADMITTED';
        font(ctx, 12, 500); ctx.fillStyle = showResult && blocked ? C.accent : C.fg; ctx.textAlign = 'center';
        ctx.fillText(msg, w / 2, oy + s + 30); ctx.textAlign = 'left';
      }
    };
  };

  // 04 Camouflage: a texture with something hidden in it. Hover reveals it.
  Covers.camo = function () {
    var off = document.createElement('canvas'), octx = off.getContext('2d');
    var blob = null, inside = [], cycle = -1, W = 0, H = 0, dpr = 1, reveal = 0, hover = null;
    function field(x, y) { return 1.6 * Math.sin(x * .011 + 1.4 * Math.sin(y * .009)) + .9 * Math.cos(y * .014 - x * .004); }
    function inBlob(x, y) {
      var b = blob, dx = x - b.x, dy = y - b.y;
      var c = Math.cos(b.a), s = Math.sin(b.a), u = dx * c + dy * s, v = -dx * s + dy * c;
      var wing = function (cx, cy, rx, ry) { var p = (u - cx) / rx, q = (v - cy) / ry; return p * p + q * q < 1; };
      return wing(-b.r * .55, -b.r * .1, b.r * .62, b.r * .78) || wing(b.r * .55, -b.r * .1, b.r * .62, b.r * .78) ||
        wing(-b.r * .38, b.r * .5, b.r * .4, b.r * .42) || wing(b.r * .38, b.r * .5, b.r * .4, b.r * .42) ||
        wing(0, 0, b.r * .14, b.r * .9);
    }
    function build(seed) {
      var r = rng(seed);
      var rad = Math.min(W, H) * .2;
      blob = { x: rad * 1.4 + r() * (W - rad * 2.8), y: 60 + rad + r() * Math.max(1, H - 120 - rad * 2), r: rad, a: (r() - .5) * .8 };
      off.width = W * dpr; off.height = H * dpr; octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.fillStyle = C.bg; octx.fillRect(0, 0, W, H);
      octx.strokeStyle = rgba(C.fg, .5); octx.lineWidth = 1.1; octx.lineCap = 'round';
      inside = [];
      var step = 9, len = 6.5;
      octx.beginPath();
      for (var y = step / 2; y < H; y += step) for (var x = step / 2; x < W; x += step) {
        var jx = x + (r() - .5) * 3, jy = y + (r() - .5) * 3, a = field(jx, jy), hit = inBlob(jx, jy);
        if (hit) a += .6;
        var dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2;
        octx.moveTo(jx - dx, jy - dy); octx.lineTo(jx + dx, jy + dy);
        if (hit) inside.push(jx - dx, jy - dy, jx + dx, jy + dy);
      }
      octx.stroke();
    }
    return {
      resize: function (w, h, d) { W = w; H = h; dpr = d; cycle = -1; },
      pointer: function (p) { hover = p; },
      theme: function () { cycle = -1; },
      draw: function (ctx, w, h, t) {
        var period = 6, c = Math.floor(t / period);
        if (c !== cycle && reveal < .02) { cycle = c; build(31 + c); }
        if (!blob) build(31);
        var target;
        if (hover) {
          var dx = hover.x - blob.x, dy = hover.y - blob.y;
          target = clamp(1.4 - Math.hypot(dx, dy) / (blob.r * 1.6), 0, 1);
        } else {
          var ph = (t % period) / period;
          target = ph > .45 && ph < .8 ? 1 : 0;
        }
        reveal += (target - reveal) * .08;
        ctx.drawImage(off, 0, 0, w, h);
        if (hover) {
          ctx.strokeStyle = rgba(C.fg, .5); ctx.beginPath(); ctx.arc(hover.x, hover.y, 46, 0, 6.2832); ctx.stroke();
        }
        if (reveal > .01) {
          ctx.strokeStyle = rgba(C.accent, reveal); ctx.lineWidth = 1.6; ctx.lineCap = 'round';
          ctx.beginPath();
          for (var i = 0; i < inside.length; i += 4) { ctx.moveTo(inside[i], inside[i + 1]); ctx.lineTo(inside[i + 2], inside[i + 3]); }
          ctx.stroke(); ctx.lineWidth = 1;
          font(ctx, 11); ctx.fillStyle = rgba(C.accent, reveal); ctx.textBaseline = 'bottom';
          ctx.fillText('FOUND  S = 0.847', blob.x - blob.r, blob.y - blob.r * 1.05);
        }
        ctx.fillStyle = C.bg; ctx.fillRect(14, 12, 230, 22);
        font(ctx, 11); ctx.textBaseline = 'top'; ctx.fillStyle = C.fg;
        ctx.fillText('COD10K-STYLE SCENE', 22, 18);
      }
    };
  };

  // 05 CLIP unlearning: one domain fades while the others hold (illustrative bars).
  Covers.forget = function () {
    var names = ['ART', 'CLIPART', 'PRODUCT', 'REAL WORLD'], base = [.8, .72, .9, .86];
    return {
      draw: function (ctx, w, h, t) {
        ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
        var period = 4.6, k = Math.floor(t / period) % 4, ph = (t % period) / period;
        var drop = ph < .15 ? 0 : ph < .55 ? ease((ph - .15) / .4) : ph < .82 ? 1 : 1 - ease((ph - .82) / .18);
        var x0 = 22, x1 = w - 22, top = 70, rowH = (h - top - 70) / 4, bh = Math.min(30, rowH * .38);
        font(ctx, 11); ctx.textBaseline = 'top'; ctx.fillStyle = C.fg;
        ctx.fillText('CLIP ViT-B/16 — OFFICE-HOME', 22, 18);
        ctx.textAlign = 'right'; ctx.fillStyle = C.accent; ctx.fillText('H-SCORE 83.6', w - 22, 18); ctx.textAlign = 'left';
        for (var i = 0; i < 4; i++) {
          var y = top + i * rowH, forget = i === k;
          var v = forget ? base[i] * (1 - .93 * drop) : base[i] + .012 * Math.sin(t * 2.1 + i * 1.7);
          font(ctx, 11); ctx.textBaseline = 'alphabetic';
          ctx.fillStyle = forget ? C.accent : C.mute; ctx.fillText(names[i], x0, y + 14);
          ctx.textAlign = 'right'; ctx.fillText(forget && drop > .5 ? 'FORGET' : 'KEEP', x1, y + 14); ctx.textAlign = 'left';
          ctx.fillStyle = rgba(C.fg, .08); ctx.fillRect(x0, y + 24, x1 - x0, bh);
          ctx.fillStyle = forget ? C.accent : C.fg; ctx.fillRect(x0, y + 24, (x1 - x0) * v, bh);
          if (forget) {
            ctx.strokeStyle = rgba(C.accent, .6); ctx.setLineDash([3, 4]);
            ctx.strokeRect(x0 + .5, y + 24.5, (x1 - x0) * base[i] - 1, bh - 1); ctx.setLineDash([]);
          }
        }
      }
    };
  };

  // 06 Vehicle counting: boxes cross a gate line; pedestrians are tracked but ignored.
  Covers.traffic = function () {
    var r = rng(9), cars = [], peds = [], count = 0, nid = 1, W = 0, H = 0, spawnT = 0, pedT = 2;
    function lanes() { var top = H * .26, bot = H * .74, n = 4, out = []; for (var i = 0; i < n; i++) out.push(top + (bot - top) * (i + .5) / n); return out; }
    function spawn(x) {
      var ln = lanes(), lane = Math.floor(r() * ln.length);
      cars.push({ id: nid++, lane: lane, x: x === undefined ? -60 : x, len: 30 + r() * 26, v: 60 + r() * 90, flash: 0 });
    }
    return {
      resize: function (w, h) {
        var first = !W; W = w; H = h;
        if (first) { for (var i = 0; i < 7; i++) spawn(r() * w); }
      },
      draw: function (ctx, w, h, t, dt) {
        dt = Math.min(dt || 0, .05);
        ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
        var ln = lanes(), gate = w * .62, laneH = (ln[1] - ln[0]);
        ctx.strokeStyle = rgba(C.fg, .14); ctx.setLineDash([10, 12]);
        for (var i = 0; i <= ln.length; i++) {
          var yy = ln[0] - laneH / 2 + i * laneH; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(w, yy); ctx.stroke();
        }
        ctx.setLineDash([6, 6]); ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(gate, ln[0] - laneH / 2 - 14); ctx.lineTo(gate, ln[ln.length - 1] + laneH / 2 + 14); ctx.stroke();
        ctx.setLineDash([]); ctx.lineWidth = 1;
        spawnT -= dt; if (spawnT <= 0 && cars.length < 10) { spawn(); spawnT = .45 + r() * .9; }
        pedT -= dt; if (pedT <= 0) { peds.push({ x: w * (.15 + r() * .35), y: ln[0] - laneH, v: 26 + r() * 16 }); pedT = 2.5 + r() * 3; }
        font(ctx, 10);
        for (i = cars.length - 1; i >= 0; i--) {
          var c = cars[i], prev = c.x + c.len / 2;
          c.x += c.v * dt;
          if (prev < gate && c.x + c.len / 2 >= gate) { count++; c.flash = 1; }
          c.flash = Math.max(0, c.flash - dt * 2);
          if (c.x > w + 80) { cars.splice(i, 1); continue; }
          var y = ln[c.lane], bh = laneH * .5;
          if (c.flash > 0) { ctx.fillStyle = rgba(C.accent, .35 * c.flash); ctx.fillRect(c.x, y - bh / 2, c.len, bh); }
          ctx.strokeStyle = c.x + c.len / 2 >= gate ? C.accent : C.fg;
          ctx.strokeRect(c.x + .5, y - bh / 2 + .5, c.len, bh);
          ctx.fillStyle = ctx.strokeStyle; ctx.textBaseline = 'bottom'; ctx.fillText('#' + c.id, c.x, y - bh / 2 - 3);
        }
        for (i = peds.length - 1; i >= 0; i--) {
          var p = peds[i]; p.y += p.v * dt;
          if (p.y > ln[ln.length - 1] + laneH) { peds.splice(i, 1); continue; }
          ctx.fillStyle = C.mute; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 6.2832); ctx.fill();
          ctx.setLineDash([2, 3]); ctx.strokeStyle = C.mute; ctx.strokeRect(p.x - 8, p.y - 10, 16, 20); ctx.setLineDash([]);
          ctx.textBaseline = 'middle'; ctx.fillText('ignored', p.x + 13, p.y);
        }
        font(ctx, 11); ctx.textBaseline = 'top'; ctx.fillStyle = C.fg;
        ctx.fillText('COUNT ' + pad(count % 10000, 4), 22, 18);
        ctx.textAlign = 'right'; ctx.fillStyle = C.accent; ctx.fillText('MAE 16.4 · NO DEEP LEARNING', w - 22, 18); ctx.textAlign = 'left';
      }
    };
  };

  // ---------- runner ----------
  function mount(canvas, inst, opts) {
    var ctx = canvas.getContext('2d'), w = 0, h = 0, dpr = 1, visible = false, t0 = performance.now(), last = t0, t = opts.t || 0;
    function size() {
      var b = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, b.width); h = Math.max(1, b.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (inst.resize) inst.resize(w, h, dpr);
      if (reduce || !visible) inst.draw(ctx, w, h, opts.still || 3.2, 0);
    }
    var ro = new ResizeObserver(size); ro.observe(canvas);
    var io = new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { rootMargin: '100px' });
    io.observe(canvas);
    if (inst.pointer) {
      canvas.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var b = canvas.getBoundingClientRect(); inst.pointer({ x: e.clientX - b.left, y: e.clientY - b.top });
      });
      canvas.addEventListener('pointerleave', function () { inst.pointer(null); });
    }
    document.addEventListener('cv:theme', function () { if (inst.theme) inst.theme(); if (reduce) inst.draw(ctx, w, h, opts.still || 3.2, 0); });
    return {
      tick: function (now) {
        var dt = (now - last) / 1000; last = now;
        if (!visible || reduce) return;
        t += dt; inst.draw(ctx, w, h, t, dt);
      }
    };
  }

  // Hero: Himalayan ridgelines, drawn back to front so nearer ridges hide farther ones.
  // Everything that does not move is precomputed on resize; a frame is only multiply-adds.
  function ridges(canvas) {
    var ctx = canvas.getContext('2d'), w = 0, h = 0, dpr = 1, rows = [], visible = true, t = 0, last = performance.now();
    var mouse = { x: -9999, y: -9999, k: 0 }, docLeft = 0, docTop = 0;
    var N = 0, P = 0, step = 6, top = 0, gap = 0, xs = null;
    function build() {
      var r = rng(23), small = w < 700;
      N = small ? 28 : 44; step = small ? 8 : 6;
      top = h * .2; gap = (h * .98 - top) / N;
      P = Math.ceil((w + 4) / step) + 1;
      xs = new Float32Array(P);
      for (var k = 0; k < P; k++) xs[k] = k * step - 2;
      rows = [];
      for (var i = 0; i < N; i++) {
        var peaks = [];
        for (var p = 0; p < 4; p++) peaks.push({ c: .1 + r() * .8, s: .05 + r() * .12, a: .35 + r() * .8 });
        var f1 = 6 + r() * 6, f2 = 15 + r() * 14, p1 = r() * 6.28, p2 = r() * 6.28, sp = .15 + r() * .25;
        var env = new Float32Array(P), s1 = new Float32Array(P), c1 = new Float32Array(P), s2 = new Float32Array(P), c2 = new Float32Array(P);
        for (k = 0; k < P; k++) {
          var nx = xs[k] / w, e = 0;
          for (p = 0; p < 4; p++) { var d = (nx - peaks[p].c) / peaks[p].s; e += peaks[p].a * Math.exp(-d * d); }
          env[k] = e;
          s1[k] = Math.sin(nx * f1 + p1); c1[k] = Math.cos(nx * f1 + p1);
          s2[k] = Math.sin(nx * f2 + p2); c2[k] = Math.cos(nx * f2 + p2);
        }
        rows.push({ env: env, s1: s1, c1: c1, s2: s2, c2: c2, sp: sp, y: new Float32Array(P) });
      }
    }
    function size() {
      var b = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = b.width; h = b.height;
      docLeft = b.left + window.scrollX; docTop = b.top + window.scrollY;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build(); draw();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = 'round';
      var near = Math.round((mouse.y - top) / gap), mk = mouse.k, bx = w * .07, by = gap * 5;
      var fg = C.fg, bg = C.bg, accent = C.accent;
      for (var i = 0; i < N; i++) {
        var row = rows[i], y0 = top + i * gap, depth = i / (N - 1);
        var a1 = t * row.sp, a2 = t * row.sp * 1.7;
        var sa1 = Math.sin(a1), ca1 = Math.cos(a1), sa2 = Math.sin(a2), ca2 = Math.cos(a2);
        var scale = gap * (.55 + .45 * (1 - depth)) * .5;
        var my = (y0 - mouse.y) / by, rowBump = mk > .01 && my * my < 9 ? mk * gap * 7 * Math.exp(-my * my) : 0;
        var env = row.env, s1 = row.s1, c1 = row.c1, s2 = row.s2, c2 = row.c2, ys = row.y;
        for (var k = 0; k < P; k++) {
          // sin(x + a) and sin(x - b) expanded, so no trig runs per point
          var wave = .55 + .3 * (s1[k] * ca1 + c1[k] * sa1) + .15 * (s2[k] * ca2 - c2[k] * sa2);
          var yy = y0 - scale * (2 + 9 * env[k] * wave);
          if (rowBump) { var mx = (xs[k] - mouse.x) / bx; if (mx * mx < 9) yy -= rowBump * Math.exp(-mx * mx); }
          ys[k] = yy;
        }
        // Fill only the ridge itself (line down to its baseline): that is all a nearer ridge needs to hide.
        ctx.beginPath(); ctx.moveTo(xs[0], ys[0]);
        for (k = 1; k < P; k++) ctx.lineTo(xs[k], ys[k]);
        ctx.lineTo(xs[P - 1], y0 + 1); ctx.lineTo(xs[0], y0 + 1); ctx.closePath();
        ctx.fillStyle = bg; ctx.fill();
        ctx.beginPath(); ctx.moveTo(xs[0], ys[0]);
        for (k = 1; k < P; k++) ctx.lineTo(xs[k], ys[k]);
        var glow = Math.max(0, 1 - Math.abs(i - near) / 3) * mk;
        ctx.strokeStyle = glow > .05 ? rgba(accent, .25 + .7 * glow) : rgba(fg, .1 + .32 * depth);
        ctx.lineWidth = 1 + .6 * glow;
        ctx.stroke();
      }
    }
    new ResizeObserver(size).observe(canvas);
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(canvas);
    // Pointer position from cached page offsets: no layout reads while the page animates.
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mouse.x = e.clientX + window.scrollX - docLeft; mouse.y = e.clientY + window.scrollY - docTop;
    }, { passive: true });
    document.addEventListener('cv:theme', draw);
    var acc = 0;
    return {
      tick: function (now) {
        var dt = Math.min((now - last) / 1000, .05); last = now;
        if (!visible || reduce) return;
        // On high-refresh screens, draw at most ~60 times a second.
        acc += dt; if (acc < .0155) return;
        var inside = mouse.x > 0 && mouse.y > 0 && mouse.y < h;
        mouse.k += ((inside ? 1 : 0) - mouse.k) * Math.min(1, acc * 3.6);
        t += acc; acc = 0; draw();
      }
    };
  }

  // ---------- boot ----------
  var running = [];
  document.addEventListener('cv:theme', function () { C = palette(); });

  window.CVCovers = {
    init: function () {
      var hero = document.querySelector('.hero__canvas');
      if (hero) running.push(ridges(hero));
      document.querySelectorAll('canvas[data-cover]').forEach(function (cv) {
        var make = Covers[cv.dataset.cover];
        if (make) running.push(mount(cv, make(), {}));
      });
      if (reduce) return;
      (function loop(now) {
        for (var i = 0; i < running.length; i++) running[i].tick(now);
        requestAnimationFrame(loop);
      })(performance.now());
    }
  };
})();
