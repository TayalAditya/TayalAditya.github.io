// Small generative scenes for every project in the index. Each motif is a renderer
// { draw(ctx, w, h, t, dt), resize?(w, h) } built from a project's own params (see projects.js).
(function () {
  'use strict';
  var K = window.CVKit;
  if (!K) return;
  var rgba = K.rgba, rng = K.rng, ease = K.ease, clamp = K.clamp, pad = K.pad, font = K.font, C = K.colors;
  var TAU = Math.PI * 2;

  function bg(ctx, w, h) { ctx.fillStyle = C().bg; ctx.fillRect(0, 0, w, h); }
  function head(ctx, w, left, right) {
    var c = C(); font(ctx, 10); ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    ctx.fillStyle = c.fg; ctx.fillText(left || '', 12, 10);
    if (right) { ctx.textAlign = 'right'; ctx.fillStyle = c.accent; ctx.fillText(right, w - 12, 10); ctx.textAlign = 'left'; }
  }
  function box(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function fit(ctx, text, max) {
    if (ctx.measureText(text).width <= max) return text;
    while (text.length > 1 && ctx.measureText(text + '…').width > max) text = text.slice(0, -1);
    return text + '…';
  }
  function shuffle(n, seed) {
    var r = rng(seed), a = []; for (var i = 0; i < n; i++) a.push(i);
    for (i = n - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  var M = {};

  // Scrolling log: [tag, text, kind] where kind a = accent tag, m = muted, x = refused (struck through).
  M.log = function (p) {
    var tagW = p.tagW || 62;
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var lh = 17, top = 32, bottom = h - 6, n = p.lines.length, off = t * (p.speed || 13), first = Math.floor(off / lh), frac = off % lh;
      font(ctx, 10); ctx.textBaseline = 'middle';
      ctx.save(); ctx.beginPath(); ctx.rect(0, top, w, bottom - top); ctx.clip();
      for (var k = 0; k * lh < bottom - top + lh; k++) {
        var L = p.lines[(first + k) % n], y = top + k * lh - frac + lh / 2;
        ctx.globalAlpha = clamp((y - top) / 26, 0, 1) * clamp((bottom - y) / 12, 0, 1);
        ctx.fillStyle = L[2] === 'a' || L[2] === 'x' ? c.accent : L[2] === 'm' ? c.mute : c.fg;
        ctx.fillText(L[0], 12, y);
        var txt = fit(ctx, L[1], w - 24 - tagW);
        ctx.fillStyle = L[2] === 'x' ? c.accent : L[2] === 'm' ? c.mute : c.fg;
        ctx.fillText(txt, 12 + tagW, y);
        if (L[2] === 'x') ctx.fillRect(12 + tagW, y, ctx.measureText(txt).width, 1);
      }
      ctx.restore(); ctx.globalAlpha = 1;
    } };
  };

  // Documents: diff (lines added / removed), tex (typed source), outline (headings found → contents),
  // reflow (dense text opening up for easier reading), form (fields filling in).
  M.doc = function (p) {
    var r = rng(p.seed || 5), rows = [];
    for (var i = 0; i < 40; i++) {
      var words = [], n = 3 + Math.floor(r() * 5);
      for (var k = 0; k < n; k++) words.push(12 + r() * 40);
      var x = r();
      rows.push({ words: words, kind: x < .5 ? 'add' : x < .72 ? 'del' : 'keep', head: i % 6 === 0 });
    }
    function bars(ctx, ws, x, y, gap, hgt, color, maxX) {
      ctx.fillStyle = color;
      for (var j = 0; j < ws.length && x < maxX; j++) { var bw = Math.min(ws[j], maxX - x); ctx.fillRect(x, y, bw, hgt); x += bw + gap; }
      return x;
    }
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var top = 34, lh = 13, R = Math.max(1, Math.floor((h - top - 8) / lh)), i, y;
      if (p.mode === 'diff') {
        var applied = Math.floor(t * 2.4) % (R + 6);
        for (i = 0; i < R; i++) {
          var row = rows[i]; y = top + i * lh;
          var done = i < applied, col = !done ? rgba(c.fg, .22) : row.kind === 'add' ? c.accent : row.kind === 'del' ? rgba(c.fg, .25) : rgba(c.fg, .55);
          font(ctx, 10); ctx.textBaseline = 'top';
          if (done && row.kind !== 'keep') { ctx.fillStyle = row.kind === 'add' ? c.accent : c.mute; ctx.fillText(row.kind === 'add' ? '+' : '−', 12, y - 2); }
          var end = bars(ctx, row.words, 26, y + 2, 5, 5, col, w - 12);
          if (done && row.kind === 'del') { ctx.fillStyle = c.mute; ctx.fillRect(26, y + 4, end - 31, 1); }
        }
      } else if (p.mode === 'tex') {
        var lines = p.lines, total = 0; lines.forEach(function (l) { total += l.length; });
        var typed = Math.floor(t * 32) % (total + 80), shown = typed;
        font(ctx, 10); ctx.textBaseline = 'top';
        for (i = 0; i < lines.length; i++) {
          y = top + i * 14; if (y > h - 14) break;
          var s = lines[i].slice(0, Math.max(0, shown)); shown -= lines[i].length;
          ctx.fillStyle = lines[i].charAt(0) === '\\' ? c.accent : lines[i].charAt(0) === '%' ? c.mute : c.fg;
          ctx.fillText(fit(ctx, s, w - 24), 12, y);
          if (shown < 0 && shown > -lines[i].length - 1 && Math.floor(t * 2.5) % 2) {
            ctx.fillStyle = c.accent; ctx.fillRect(12 + ctx.measureText(fit(ctx, s, w - 24)).width + 1, y, 6, 11);
          }
          if (shown < 0) break;
        }
      } else if (p.mode === 'outline') {
        var pw = Math.floor(w * .54), scan = top + ((t * 34) % (R * lh + 40)), toc = [];
        for (i = 0; i < R; i++) {
          y = top + i * lh; var hd = rows[i].head, found = hd && y < scan;
          bars(ctx, hd ? rows[i].words.slice(0, 2) : rows[i].words, 12, y + (hd ? 1 : 3), 4, hd ? 7 : 4, found ? c.accent : rgba(c.fg, hd ? .55 : .25), pw);
          if (found) toc.push(i);
        }
        ctx.fillStyle = c.accent; ctx.fillRect(10, Math.min(scan, top + R * lh), pw, 1);
        ctx.strokeStyle = rgba(c.fg, .18); ctx.beginPath(); ctx.moveTo(pw + 16, top); ctx.lineTo(pw + 16, h - 10); ctx.stroke();
        font(ctx, 10); ctx.textBaseline = 'top';
        ctx.fillStyle = c.mute; ctx.fillText('CONTENTS', pw + 26, top);
        toc.forEach(function (ri, j) {
          ctx.fillStyle = c.fg; var label = (p.toc || [])[j % (p.toc || ['H']).length] || 'H' + (j + 1);
          ctx.fillText(fit(ctx, label, w - pw - 40), pw + 26 + (j % 3 === 2 ? 10 : 0), top + 16 + j * 14);
        });
      } else if (p.mode === 'reflow') {
        var s2 = ease(.5 + .5 * Math.sin(t * .9)), gap = 3 + s2 * 7, lh2 = 10 + s2 * 8, word = Math.floor(t * 3), count = 0;
        for (i = 0; i < 30; i++) {
          y = top + i * lh2; if (y > h - 30) break;
          var x2 = 12, ws = rows[i].words;
          for (var j2 = 0; j2 < ws.length; j2++) {
            var bw = ws[j2] * (1 + s2 * .15); if (x2 + bw > w - 12) break;
            ctx.fillStyle = count === word % 60 ? c.accent : rgba(c.fg, .35 + s2 * .25);
            ctx.fillRect(x2, y, bw, 4 + s2 * 2); x2 += bw + gap; count++;
          }
        }
        for (i = 0; i < 40; i++) {
          var a = Math.abs(Math.sin(i * .5 + t * 6) * Math.sin(i * .17 - t * 2)) * 10 + 1;
          ctx.fillStyle = rgba(c.accent, .7); ctx.fillRect(12 + i * ((w - 24) / 40), h - 14 - a / 2, 2, a);
        }
      } else if (p.mode === 'form') {
        var f = p.fields, per = 1.2, cyc = f.length * per + 2.4, ph = t % cyc, cur = Math.floor(ph / per), rowH = Math.min(30, (h - top - 26) / f.length);
        font(ctx, 9); ctx.textBaseline = 'top';
        for (i = 0; i < f.length; i++) {
          y = top + i * rowH;
          ctx.fillStyle = c.mute; ctx.fillText(f[i][0], 12, y);
          ctx.strokeStyle = i < cur ? c.accent : rgba(c.fg, .25); ctx.strokeRect(12.5, y + 11.5, w - 25, rowH - 15);
          var v = i < cur ? f[i][1] : i === cur ? f[i][1].slice(0, Math.floor((ph - i * per) / per * f[i][1].length)) : '';
          ctx.fillStyle = c.fg; font(ctx, 10); ctx.fillText(fit(ctx, v, w - 34), 17, y + 13); font(ctx, 9);
        }
        if (cur >= f.length) { font(ctx, 11); ctx.fillStyle = c.accent; ctx.fillText(p.done || 'DONE', 12, h - 18); }
      }
    } };
  };

  // A circuit loop with current pulses and a 555-style square wave driving an LED.
  M.circuit = function (p) {
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var x0 = w * .14, y0 = 42, x1 = w * .86, y1 = h * .6, W = x1 - x0, H = y1 - y0, P = 2 * (W + H);
      var high = Math.floor(t * 1.6) % 2 === 0;
      ctx.strokeStyle = rgba(c.fg, .7); ctx.lineWidth = 1.5; ctx.strokeRect(x0, y0, W, H); ctx.lineWidth = 1;
      // battery (left), resistor (top), LED (right), timer IC (bottom)
      var my = y0 + H / 2;
      ctx.fillStyle = c.bg; ctx.fillRect(x0 - 8, my - 10, 16, 20);
      ctx.strokeStyle = c.fg; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 - 9, my - 4); ctx.lineTo(x0 + 9, my - 4); ctx.moveTo(x0 - 5, my + 4); ctx.lineTo(x0 + 5, my + 4); ctx.stroke(); ctx.lineWidth = 1;
      var rx = x0 + W * .35; ctx.fillStyle = c.bg; ctx.fillRect(rx, y0 - 6, 44, 12);
      ctx.strokeStyle = c.fg; ctx.beginPath(); ctx.moveTo(rx, y0);
      for (var z = 0; z < 6; z++) ctx.lineTo(rx + 3.7 + z * 7.3, y0 + (z % 2 ? 5 : -5));
      ctx.lineTo(rx + 44, y0); ctx.stroke();
      ctx.fillStyle = c.bg; ctx.fillRect(x1 - 9, my - 9, 18, 18);
      ctx.beginPath(); ctx.arc(x1, my, 7, 0, TAU); ctx.fillStyle = high ? c.accent : c.bg; ctx.fill(); ctx.strokeStyle = c.fg; ctx.stroke();
      if (high) { ctx.strokeStyle = rgba(c.accent, .4); ctx.beginPath(); ctx.arc(x1, my, 13, 0, TAU); ctx.stroke(); }
      var ix = x0 + W * .45; ctx.fillStyle = c.bg2 || c.bg; ctx.fillRect(ix, y1 - 10, 40, 20); ctx.strokeStyle = c.fg; ctx.strokeRect(ix + .5, y1 - 9.5, 39, 19);
      font(ctx, 9); ctx.fillStyle = c.fg; ctx.textBaseline = 'middle'; ctx.fillText('555', ix + 11, y1);
      // pulses travel the loop only while the LED is driven
      if (high) for (var k = 0; k < 7; k++) {
        var s = ((t * 70 + k * P / 7) % P), px, py;
        if (s < W) { px = x0 + s; py = y0; } else if (s < W + H) { px = x1; py = y0 + s - W; } else if (s < 2 * W + H) { px = x1 - (s - W - H); py = y1; } else { px = x0; py = y1 - (s - 2 * W - H); }
        ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(px, py, 2.4, 0, TAU); ctx.fill();
      }
      // square wave trace
      var gy = h - 26, amp = 9; ctx.strokeStyle = c.accent; ctx.beginPath();
      for (var x = 12; x < w - 12; x += 2) {
        var v = Math.floor((t - (w - 12 - x) / 90) * 1.6) % 2 === 0 ? -amp : amp;
        if (x === 12) ctx.moveTo(x, gy + v); else ctx.lineTo(x, gy + v);
      }
      ctx.stroke();
    } };
  };

  // A damped pendulum and its angle plotted live.
  M.pendulum = function (p) {
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var tt = t % 9, th0 = .7, wv = 2.4, damp = .12;
      var th = function (s) { return th0 * Math.exp(-damp * s) * Math.cos(wv * s); };
      var px = w * .24, py = 34, L = Math.min(h - 70, w * .3), a = th(tt), bx = px + Math.sin(a) * L, by = py + Math.cos(a) * L;
      ctx.strokeStyle = rgba(c.fg, .3); ctx.beginPath(); ctx.moveTo(px - 30, py); ctx.lineTo(px + 30, py); ctx.stroke();
      ctx.strokeStyle = c.fg; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
      ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(bx, by, 7, 0, TAU); ctx.fill();
      var gx0 = w * .48, gx1 = w - 12, gy = 34 + (h - 60) / 2, ga = (h - 70) / 2;
      ctx.strokeStyle = rgba(c.fg, .2); ctx.beginPath(); ctx.moveTo(gx0, gy); ctx.lineTo(gx1, gy); ctx.moveTo(gx0, 34); ctx.lineTo(gx0, h - 26); ctx.stroke();
      ctx.strokeStyle = c.accent; ctx.beginPath();
      for (var x = gx0; x <= gx1; x += 2) {
        var s = tt - (gx1 - x) / (gx1 - gx0) * 4; if (s < 0) continue;
        var yy = gy - th(s) / th0 * ga; if (x === gx0 || s - 2 / (gx1 - gx0) * 4 < 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
      font(ctx, 10); ctx.fillStyle = c.mute; ctx.textBaseline = 'bottom'; ctx.fillText('θ(t) = θ₀ e^(−bt) cos ωt', gx0, h - 8);
    } };
  };

  // An exam: a server-held countdown and a paper that shuffles per student.
  M.timer = function (p) {
    var N = 12;
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var cx = w * .24, cy = h * .56, R = Math.min(w * .16, h * .3), rem = 1 - (t % 24) / 24;
      ctx.lineWidth = 5; ctx.strokeStyle = rgba(c.fg, .12); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
      ctx.strokeStyle = c.accent; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * rem); ctx.stroke(); ctx.lineWidth = 1;
      var secs = Math.floor(rem * 1800); font(ctx, 13, 600); ctx.fillStyle = c.fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(pad(Math.floor(secs / 60), 2) + ':' + pad(secs % 60, 2), cx, cy); ctx.textAlign = 'left';
      var cycle = Math.floor(t / 2.6), ph = clamp((t % 2.6) / .7, 0, 1), a = shuffle(N, 3 + cycle), b = shuffle(N, 4 + cycle);
      var gx = w * .48, cols = 4, cw = (w - 12 - gx) / cols, ch = Math.min(34, (h - 50) / 3);
      for (var i = 0; i < N; i++) {
        var from = a.indexOf(i), to = b.indexOf(i), e = ease(ph);
        var fx = gx + (from % cols) * cw, fy = 38 + Math.floor(from / cols) * (ch + 6), tx = gx + (to % cols) * cw, ty = 38 + Math.floor(to / cols) * (ch + 6);
        var x = fx + (tx - fx) * e, y = fy + (ty - fy) * e, answered = (i * 7 + cycle) % 3 === 0;
        ctx.fillStyle = answered ? c.accent : rgba(c.fg, .08); ctx.fillRect(x + 2, y, cw - 4, ch);
        ctx.fillStyle = answered ? (c.bg) : c.fg; font(ctx, 10); ctx.textBaseline = 'middle'; ctx.fillText('Q' + (i + 1), x + 8, y + ch / 2);
      }
    } };
  };

  // A compile queue with a hard cap and a waiting room.
  M.queue = function (p) {
    var cap = p.cap || 50, r = rng(8), slots = [], waiting = 0, spawn = 0, simT = 0;
    for (var i = 0; i < cap; i++) slots.push(r() * 5);
    return { draw: function (ctx, w, h, t, dt) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      dt = dt || 0; simT += dt; spawn -= dt;
      while (spawn <= 0) { waiting++; spawn += .04 + r() * .06; }
      for (i = 0; i < cap; i++) { slots[i] -= dt; if (slots[i] <= 0 && waiting > 0) { waiting--; slots[i] = 3 + r() * 4; } }
      if (waiting > 14) waiting = 14;
      var cols = 10, rows = Math.ceil(cap / cols), gx = w * .3, cw = (w - 12 - gx) / cols, chh = Math.min(cw, (h - 70) / rows), active = 0;
      for (i = 0; i < cap; i++) {
        var x = gx + (i % cols) * cw, y = 36 + Math.floor(i / cols) * chh, busy = slots[i] > 0;
        if (busy) active++;
        ctx.fillStyle = busy ? rgba(c.accent, .35 + .65 * clamp(slots[i] / 3, 0, 1)) : 'transparent';
        if (busy) ctx.fillRect(x + 2, y + 2, cw - 4, chh - 4); else { ctx.strokeStyle = rgba(c.fg, .25); ctx.strokeRect(x + 2.5, y + 2.5, cw - 5, chh - 5); }
      }
      font(ctx, 9); ctx.fillStyle = c.mute; ctx.textBaseline = 'top'; ctx.fillText('WAITING ROOM', 12, 36);
      for (i = 0; i < waiting; i++) { ctx.fillStyle = c.fg; ctx.beginPath(); ctx.arc(18 + (i % 4) * 12, 56 + Math.floor(i / 4) * 12, 3.5, 0, TAU); ctx.fill(); }
      font(ctx, 10); ctx.fillStyle = c.fg; ctx.textBaseline = 'bottom';
      ctx.fillText('ACTIVE ' + pad(active, 2) + ' / ' + cap + '   WAITING ' + pad(waiting, 2), 12, h - 8);
    } };
  };

  // Rows that re-score and re-sort themselves; the top k are highlighted.
  M.rank = function (p) {
    var items = p.items, n = items.length, r = rng(p.seed || 12), score = [], target = [], ypos = [], lastCycle = -1;
    for (var i = 0; i < n; i++) { score[i] = target[i] = .3 + r() * .6; ypos[i] = i; }
    return { draw: function (ctx, w, h, t, dt) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var cyc = Math.floor(t / 2.4);
      if (cyc !== lastCycle) { lastCycle = cyc; for (var i = 0; i < n; i++) target[i] = clamp(target[i] + (r() - .5) * .45, .1, .98); }
      for (i = 0; i < n; i++) score[i] += (target[i] - score[i]) * .06;
      var order = items.map(function (_, j) { return j; }).sort(function (a, b) { return score[b] - score[a]; });
      var rowH = Math.min(22, (h - 44) / n), k = p.topk || 3, lx = 12, bx = Math.max(w * .42, 120), bw = w - 12 - bx - 34;
      for (var rank = 0; rank < n; rank++) {
        var j = order[rank]; ypos[j] += (rank - ypos[j]) * .12;
        var y = 34 + ypos[j] * rowH, top = rank < k;
        font(ctx, 10); ctx.textBaseline = 'middle';
        ctx.fillStyle = top ? c.accent : c.mute; ctx.fillText(pad(rank + 1, 2), lx, y + rowH / 2);
        ctx.fillStyle = top ? c.fg : rgba(c.fg, .6); ctx.fillText(fit(ctx, items[j], bx - lx - 34), lx + 24, y + rowH / 2);
        ctx.fillStyle = rgba(c.fg, .08); ctx.fillRect(bx, y + rowH / 2 - 3, bw, 6);
        ctx.fillStyle = top ? c.accent : rgba(c.fg, .5); ctx.fillRect(bx, y + rowH / 2 - 3, bw * score[j], 6);
        ctx.fillStyle = c.mute; ctx.fillText(Math.round(score[j] * 100), bx + bw + 8, y + rowH / 2);
      }
    } };
  };

  // Cards that flip over one after another; in select mode some stay picked.
  M.cards = function (p) {
    var labels = p.labels, n = labels.length, cols = p.cols || 4, rows = Math.ceil(n / cols), picked = p.picked || [];
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var gx = 12, gy = 34, cw = (w - 24) / cols, chh = (h - gy - 10) / rows;
      for (var i = 0; i < n; i++) {
        var x = gx + (i % cols) * cw + 3, y = gy + Math.floor(i / cols) * chh + 3, wi = cw - 6, hi = chh - 6;
        var ang = clamp((t % 8) - i * .25, 0, 1.2) / 1.2 * Math.PI, sx = Math.abs(Math.cos(ang)), back = ang > Math.PI / 2;
        if ((t % 8) > 6.8) { back = false; sx = 1; }
        var isPick = back && picked.indexOf(i) > -1;
        ctx.save(); ctx.translate(x + wi / 2, y); ctx.scale(Math.max(.02, sx), 1);
        if (back) {
          ctx.fillStyle = isPick || !p.picked ? c.accent : rgba(c.fg, .12); ctx.fillRect(-wi / 2, 0, wi, hi);
          font(ctx, 10, 600); ctx.fillStyle = isPick || !p.picked ? c.bg : c.mute; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
          ctx.fillText(fit(ctx, labels[i], wi - 8), 0, hi / 2); ctx.textAlign = 'left';
        } else {
          ctx.strokeStyle = rgba(c.fg, .3); ctx.strokeRect(-wi / 2 + .5, .5, wi - 1, hi - 1);
          ctx.fillStyle = rgba(c.fg, .1); ctx.fillRect(-wi / 2 + 6, 6, wi - 12, hi * .45);
          ctx.fillRect(-wi / 2 + 6, hi * .45 + 12, (wi - 12) * .7, 3); ctx.fillRect(-wi / 2 + 6, hi * .45 + 19, (wi - 12) * .45, 3);
        }
        ctx.restore();
      }
    } };
  };

  // Agents passing work along: nodes, a travelling message, and the current step underneath.
  M.agents = function (p) {
    var nodes = p.nodes, n = nodes.length, hub = p.layout === 'hub';
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var pos = [], cx = w / 2, cy = 34 + (h - 66) / 2, i;
      if (hub) {
        pos.push([cx, cy]);
        for (i = 1; i < n; i++) { var a = -Math.PI / 2 + (i - 1) / (n - 1) * TAU; pos.push([cx + Math.cos(a) * w * .32, cy + Math.sin(a) * (h - 80) * .42]); }
      } else for (i = 0; i < n; i++) pos.push([24 + i * (w - 48) / (n - 1), cy + (i % 2 ? 14 : -14)]);
      var edges = []; for (i = 1; i < n; i++) edges.push(hub ? [0, i] : [i - 1, i]);
      if (hub) for (i = 1; i < n; i++) edges.push([i, 0]);
      var step = Math.floor(t / 1.1) % edges.length, ph = ease((t % 1.1) / 1.1), e = edges[step];
      ctx.strokeStyle = rgba(c.fg, .2); edges.forEach(function (ed) { ctx.beginPath(); ctx.moveTo(pos[ed[0]][0], pos[ed[0]][1]); ctx.lineTo(pos[ed[1]][0], pos[ed[1]][1]); ctx.stroke(); });
      var mx = pos[e[0]][0] + (pos[e[1]][0] - pos[e[0]][0]) * ph, my = pos[e[0]][1] + (pos[e[1]][1] - pos[e[0]][1]) * ph;
      for (i = 0; i < n; i++) {
        var on = i === e[1] && ph > .85;
        ctx.beginPath(); ctx.arc(pos[i][0], pos[i][1], on ? 9 : 7, 0, TAU); ctx.fillStyle = on ? c.accent : c.bg; ctx.fill();
        ctx.strokeStyle = i === e[0] || i === e[1] ? c.accent : rgba(c.fg, .6); ctx.stroke();
        font(ctx, 9); ctx.fillStyle = c.fg; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(nodes[i], pos[i][0], pos[i][1] + 12); ctx.textAlign = 'left';
      }
      ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(mx, my, 3.5, 0, TAU); ctx.fill();
      if (p.steps) { font(ctx, 10); ctx.fillStyle = c.mute; ctx.textBaseline = 'bottom'; ctx.fillText(fit(ctx, p.steps[step % p.steps.length], w - 24), 12, h - 8); }
    } };
  };

  // A voice waveform with a cycling label (languages, classes).
  M.wave = function (p) {
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var N = 56, cy = 34 + (h - 74) / 2, amp = (h - 90) / 2, play = (t * .25) % 1;
      for (var i = 0; i < N; i++) {
        var x = 12 + i * (w - 24) / N, env = Math.sin(i / N * Math.PI);
        var a = (Math.abs(Math.sin(i * .42 + t * 4.6) * Math.sin(i * .13 - t * 1.9)) * .85 + .1) * env * amp;
        ctx.fillStyle = i / N < play ? c.accent : rgba(c.fg, .4);
        ctx.fillRect(x, cy - a, Math.max(1.5, (w - 24) / N - 2), a * 2);
      }
      var labels = p.labels, li = Math.floor(t / 1.5) % labels.length;
      font(ctx, 13, 600); ctx.fillStyle = c.fg; ctx.textBaseline = 'bottom'; ctx.fillText(labels[li], 12, h - 10);
      if (p.classes) {
        for (var k = 0; k < p.classes; k++) {
          ctx.fillStyle = k === li % p.classes ? c.accent : rgba(c.fg, .18);
          ctx.fillRect(w - 12 - (p.classes - k) * 16, h - 22, 12, 12);
        }
      }
    } };
  };

  // A question typed in, an answer (SQL / citation) typed back, then result rows.
  M.chat = function (p) {
    var items = p.items;
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var per = 8, it = items[Math.floor(t / per) % items.length], ph = t % per, i;
      font(ctx, 10);
      var q = it.q.slice(0, Math.floor(clamp(ph / 1.6, 0, 1) * it.q.length)), qw = Math.min(w - 40, ctx.measureText(it.q).width + 18);
      ctx.fillStyle = rgba(c.fg, .1); box(ctx, w - 12 - qw, 32, qw, 22, 4); ctx.fill();
      ctx.fillStyle = c.fg; ctx.textBaseline = 'middle'; ctx.fillText(fit(ctx, q, qw - 16), w - 12 - qw + 9, 43);
      var aChars = Math.floor(clamp((ph - 1.8) / 2.2, 0, 1) * it.a.join('').length), y = 66;
      ctx.fillStyle = c.accent; ctx.fillRect(12, 62, 2, Math.min(it.a.length, 4) * 13 + 4);
      for (i = 0; i < it.a.length && aChars > 0; i++) {
        var line = it.a[i].slice(0, aChars); aChars -= it.a[i].length;
        ctx.fillStyle = i === 0 ? c.accent : c.fg; ctx.textBaseline = 'top'; ctx.fillText(fit(ctx, line, w - 36), 20, y); y += 13;
      }
      if (ph > 4.3 && it.rows) {
        var ry = Math.max(y + 8, 66 + it.a.length * 13 + 8), k = Math.floor((ph - 4.3) * 5);
        for (i = 0; i < it.rows.length && i < k; i++) {
          if (ry + i * 14 > h - 12) break;
          ctx.fillStyle = i === 0 ? c.mute : c.fg; ctx.textBaseline = 'top'; ctx.fillText(fit(ctx, it.rows[i], w - 24), 12, ry + i * 14);
          ctx.fillStyle = rgba(c.fg, .1); ctx.fillRect(12, ry + i * 14 + 12, w - 24, 1);
        }
      }
    } };
  };

  // A metric falling as the model improves (e.g. error from a baseline to the final score).
  M.series = function (p) {
    var r = rng(p.seed || 4), N = 26, pts = [];
    for (var i = 0; i < N; i++) { var f = i / (N - 1); pts.push(p.from + (p.to - p.from) * (1 - Math.pow(1 - f, 2.2)) + (r() - .5) * Math.abs(p.from - p.to) * .08 * (1 - f)); }
    pts[N - 1] = p.to;
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var x0 = 12, x1 = w - 12, y0 = 40, y1 = h - 30, lo = Math.min(p.from, p.to), hi = Math.max(p.from, p.to), span = hi - lo || 1;
      var X = function (k) { return x0 + k / (N - 1) * (x1 - x0); }, Y = function (v) { return y1 - (v - lo + span * .1) / (span * 1.2) * (y1 - y0); };
      var prog = clamp((t % 7) / 5, 0, 1), upto = prog * (N - 1);
      ctx.strokeStyle = rgba(c.fg, .12); for (var g = 0; g < 4; g++) { var gy = y0 + g * (y1 - y0) / 3; ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke(); }
      ctx.strokeStyle = c.accent; ctx.lineWidth = 1.6; ctx.beginPath();
      for (var k = 0; k <= Math.floor(upto); k++) { if (k === 0) ctx.moveTo(X(k), Y(pts[k])); else ctx.lineTo(X(k), Y(pts[k])); }
      var fk = Math.floor(upto), fr = upto - fk, cur = fk < N - 1 ? pts[fk] + (pts[fk + 1] - pts[fk]) * fr : pts[N - 1];
      if (fk < N - 1) ctx.lineTo(X(upto), Y(cur));
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(X(upto), Y(cur), 3.5, 0, TAU); ctx.fill();
      font(ctx, 12, 600); ctx.fillStyle = c.fg; ctx.textBaseline = 'bottom';
      ctx.fillText((p.label || '') + ' ' + cur.toFixed(2) + (p.unit || ''), 12, h - 8);
    } };
  };

  // Land parcels seen from above: a satellite pass classifies crops; or a scene where only persistent changes count.
  M.plots = function (p) {
    var r = rng(p.seed || 21), cols = 9, rows = 5, cells = [];
    for (var i = 0; i < cols * rows; i++) cells.push({ cls: Math.floor(r() * 4), bad: r() < .12, j: [r(), r(), r(), r()] });
    var blobs = [];
    return { draw: function (ctx, w, h, t, dt) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var gx = 12, gy = 34, cw = (w - 24) / cols, chh = (h - gy - 26) / rows;
      if (p.mode === 'change') {
        var pc = 30, pr = 14, sw = (w - 24) / pc, sh = (h - gy - 26) / pr;
        if (r() < (dt || 0) * .9) blobs.push({ x: Math.floor(r() * pc), y: Math.floor(r() * pr), born: t, s: 1 + Math.floor(r() * 2) });
        blobs = blobs.filter(function (b) { return t - b.born < 7; });
        for (var yy = 0; yy < pr; yy++) for (var xx = 0; xx < pc; xx++) {
          var flick = Math.sin(xx * 12.9 + yy * 78.2 + Math.floor(t * 6) * 3.1) > .93;
          ctx.fillStyle = flick ? rgba(c.fg, .35) : rgba(c.fg, .06); ctx.fillRect(gx + xx * sw + 1, gy + yy * sh + 1, sw - 2, sh - 2);
        }
        blobs.forEach(function (b) {
          var age = t - b.born, persist = age > 2;
          ctx.fillStyle = persist ? c.accent : rgba(c.fg, .5);
          for (var dy = -b.s; dy <= b.s; dy++) for (var dx = -b.s; dx <= b.s; dx++) {
            var X = b.x + dx, Y = b.y + dy; if (X < 0 || Y < 0 || X >= pc || Y >= pr || dx * dx + dy * dy > b.s * b.s + 1) continue;
            ctx.fillRect(gx + X * sw + 1, gy + Y * sh + 1, sw - 2, sh - 2);
          }
        });
        font(ctx, 10); ctx.fillStyle = c.mute; ctx.textBaseline = 'bottom'; ctx.fillText(p.foot || 'FLICKER IGNORED · PERSISTENT CHANGE MASKED', 12, h - 8);
        return;
      }
      var scan = ((t * .22) % 1.25) * (cols + rows);
      for (i = 0; i < cells.length; i++) {
        var cx = i % cols, cy = Math.floor(i / cols), seen = cx + cy < scan, q = cells[i];
        var x = gx + cx * cw, y = gy + cy * chh, jj = q.j, k = 3;
        ctx.beginPath(); ctx.moveTo(x + jj[0] * k, y + jj[1] * k); ctx.lineTo(x + cw - jj[2] * k, y + jj[0] * k); ctx.lineTo(x + cw - jj[3] * k, y + chh - jj[2] * k); ctx.lineTo(x + jj[1] * k, y + chh - jj[3] * k); ctx.closePath();
        ctx.fillStyle = seen ? (q.cls === 0 ? rgba(c.accent, .7) : q.cls === 1 ? rgba(c.accent, .35) : q.cls === 2 ? rgba(c.fg, .35) : rgba(c.fg, .15)) : rgba(c.fg, .05);
        ctx.fill(); ctx.strokeStyle = seen && q.bad ? c.accent : rgba(c.fg, .2); ctx.lineWidth = seen && q.bad ? 2 : 1; ctx.stroke(); ctx.lineWidth = 1;
        if (seen && q.bad) { font(ctx, 10, 700); ctx.fillStyle = c.fg; ctx.textBaseline = 'middle'; ctx.fillText('≠', x + cw / 2 - 3, y + chh / 2); }
      }
      ctx.strokeStyle = c.accent; ctx.beginPath(); var sx = gx + scan * cw; ctx.moveTo(sx, gy); ctx.lineTo(sx - rows * cw, gy + rows * chh); ctx.stroke();
      font(ctx, 10); ctx.fillStyle = c.mute; ctx.textBaseline = 'bottom'; ctx.fillText(p.foot || '', 12, h - 8);
    } };
  };

  // A scanner working down a list, or a risk gauge built from several checks.
  M.scan = function (p) {
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var i;
      if (p.mode === 'gauge') {
        var cx = w * .3, cy = h * .72, R = Math.min(w * .22, h * .5), cyc = t % 7, v = ease(clamp(cyc / 3, 0, 1)) * p.score / 100;
        ctx.lineWidth = 8; ctx.strokeStyle = rgba(c.fg, .12); ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, TAU); ctx.stroke();
        ctx.strokeStyle = c.accent; ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, Math.PI + Math.PI * v); ctx.stroke(); ctx.lineWidth = 1;
        var a = Math.PI + Math.PI * v; ctx.strokeStyle = c.fg; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (R - 12), cy + Math.sin(a) * (R - 12)); ctx.stroke();
        font(ctx, 16, 700); ctx.fillStyle = c.fg; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(Math.round(v * 100), cx, cy - 10); ctx.textAlign = 'left';
        font(ctx, 10); ctx.textBaseline = 'middle';
        p.checks.forEach(function (ck, j) {
          var done = cyc > .6 + j * .6, y = 44 + j * 18;
          ctx.fillStyle = done ? c.accent : c.mute; ctx.fillText(done ? '■' : '□', w * .6, y);
          ctx.fillStyle = done ? c.fg : c.mute; ctx.fillText(fit(ctx, ck, w * .4 - 30), w * .6 + 16, y);
        });
        return;
      }
      var rows = p.rows, per = .65, cyc2 = t % (rows.length * per + 2), rowH = Math.min(20, (h - 44) / rows.length), lw = w * .5;
      for (i = 0; i < rows.length; i++) {
        var y = 36 + i * rowH, prog = clamp((cyc2 - i * per) / per, 0, 1), flag = p.flags && p.flags.indexOf(i) > -1;
        font(ctx, 10); ctx.textBaseline = 'middle'; ctx.fillStyle = prog > 0 ? c.fg : c.mute;
        ctx.fillText(fit(ctx, rows[i], lw - 16), 12, y + rowH / 2);
        var bx = lw, bw = w - 12 - lw - 70;
        ctx.fillStyle = rgba(c.fg, .08); ctx.fillRect(bx, y + rowH / 2 - 2, bw, 4);
        ctx.fillStyle = prog >= 1 && flag ? c.accent : rgba(c.fg, .55); ctx.fillRect(bx, y + rowH / 2 - 2, bw * prog, 4);
        if (prog >= 1) { ctx.fillStyle = flag ? c.accent : c.mute; ctx.fillText(flag ? (p.bad || 'FLAGGED') : (p.good || 'CLEAN'), bx + bw + 8, y + rowH / 2); }
      }
    } };
  };

  // A decision tree growing level by level.
  M.tree = function (p) {
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var depth = 4, grow = (t % 7) / 1.2, levelH = (h - 60) / (depth - 1);
      for (var d = 0; d < depth; d++) {
        var n = Math.pow(2, d), vis = clamp(grow - d, 0, 1); if (vis <= 0) break;
        for (var i = 0; i < n; i++) {
          var x = 12 + (i + .5) * (w - 24) / n, y = 38 + d * levelH;
          if (d > 0) {
            var px = 12 + (Math.floor(i / 2) + .5) * (w - 24) / (n / 2), py = 38 + (d - 1) * levelH;
            ctx.strokeStyle = rgba(c.fg, .35 * vis); ctx.beginPath(); ctx.moveTo(px, py + 8); ctx.lineTo(px + (x - px) * vis, py + 8 + (y - py - 16) * vis); ctx.stroke();
          }
          ctx.globalAlpha = vis;
          if (d === depth - 1) { ctx.fillStyle = (i * 5 + 1) % 3 === 0 ? c.fg : c.accent; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill(); }
          else {
            font(ctx, 9); var label = 'x' + ((d * 3 + i) % 4 + 1) + ' < ' + (((d + 1) * (i + 2) * 37) % 90 / 100 + .05).toFixed(2), tw = ctx.measureText(label).width + 10;
            ctx.strokeStyle = c.fg; ctx.strokeRect(x - tw / 2 + .5, y - 7.5, tw, 15); ctx.fillStyle = c.fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, y); ctx.textAlign = 'left';
          }
          ctx.globalAlpha = 1;
        }
      }
    } };
  };

  // Detection overlays: faces with engagement, real/fake tiles, or a live blur map.
  M.detect = function (p) {
    var r = rng(p.seed || 17), tiles = [];
    for (var i = 0; i < 8; i++) tiles.push({ fake: r() < .45, conf: .7 + r() * .29, k: r() * 10 });
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      if (p.mode === 'faces') {
        var n = 4, ids = ['ID 01', 'ID 02', 'UNKNOWN_001', 'ID 04'];
        for (var i = 0; i < n; i++) {
          var cx = 12 + (i + .5) * (w - 24) / n + Math.sin(t * .8 + i) * 4, cy = h * .5 + Math.cos(t * .6 + i * 2) * 3, R = Math.min(18, w / 16);
          ctx.fillStyle = rgba(c.fg, .22); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.arc(cx, cy + R * 2.4, R * 1.5, Math.PI, TAU); ctx.fill();
          var bx = cx - R - 5, by = cy - R - 5, bs = R * 2 + 10, known = i !== 2;
          ctx.strokeStyle = known ? c.accent : c.mute; ctx.lineWidth = 1.5;
          [[0, 0, 1, 1], [1, 0, -1, 1], [0, 1, 1, -1], [1, 1, -1, -1]].forEach(function (q) {
            var x = bx + q[0] * bs, y = by + q[1] * bs; ctx.beginPath(); ctx.moveTo(x, y + q[3] * 7); ctx.lineTo(x, y); ctx.lineTo(x + q[2] * 7, y); ctx.stroke();
          });
          ctx.lineWidth = 1;
          font(ctx, 9); ctx.fillStyle = known ? c.accent : c.mute; ctx.textBaseline = 'bottom'; ctx.textAlign = 'center'; ctx.fillText(ids[i], cx, by - 3); ctx.textAlign = 'left';
          var e = .45 + .4 * Math.sin(t * 1.3 + i * 1.9);
          ctx.fillStyle = rgba(c.fg, .1); ctx.fillRect(cx - R, h - 34, R * 2, 5);
          ctx.fillStyle = c.accent; ctx.fillRect(cx - R, h - 34, R * 2 * e, 5);
        }
        font(ctx, 9); ctx.fillStyle = c.mute; ctx.textBaseline = 'bottom'; ctx.fillText('ENGAGEMENT = .35 BRIGHTNESS + .30 EYES + .35 MOTION', 12, h - 8);
      } else if (p.mode === 'fakes') {
        var cols = 4, gx = 12, gy = 34, cw = (w - 24) / cols, chh = (h - gy - 12) / 2, cur = Math.floor(t * 1.4) % (tiles.length + 3);
        tiles.forEach(function (q, j) {
          var x = gx + (j % cols) * cw + 3, y = gy + Math.floor(j / cols) * chh + 3, tw = cw - 6, th = chh - 6;
          ctx.save(); ctx.beginPath(); ctx.rect(x, y, tw, th); ctx.clip();
          for (var s = 0; s < 6; s++) {
            ctx.fillStyle = rgba(c.fg, .06 + .05 * ((s + j) % 3));
            ctx.beginPath(); ctx.arc(x + tw * (.3 + .4 * Math.sin(q.k + s)), y + th * (.5 + .3 * Math.cos(q.k * 2 + s)), th * (.18 + .05 * s), 0, TAU); ctx.fill();
          }
          ctx.restore();
          var judged = j < cur;
          ctx.strokeStyle = judged ? (q.fake ? c.accent : rgba(c.fg, .6)) : rgba(c.fg, .15); ctx.strokeRect(x + .5, y + .5, tw - 1, th - 1);
          if (j === cur) { ctx.fillStyle = rgba(c.accent, .15); ctx.fillRect(x, y, tw, th); }
          if (judged) { font(ctx, 9, 600); ctx.fillStyle = q.fake ? c.accent : c.fg; ctx.textBaseline = 'top'; ctx.fillText((q.fake ? 'FAKE ' : 'REAL ') + q.conf.toFixed(2), x + 5, y + 4); }
        });
      } else {
        var gc = 14, gr = 7, sx = (w - 24) / gc, sy = (h - 64) / gr, rx = .5 + .4 * Math.sin(t * .5), ry = .5 + .35 * Math.cos(t * .7);
        for (var yy = 0; yy < gr; yy++) for (var xx = 0; xx < gc; xx++) {
          var dx = xx / gc - rx, dy = yy / gr - ry, v = clamp(Math.sqrt(dx * dx + dy * dy) * 1.8 + .12 * Math.sin(xx * 1.3 + yy + t), 0, 1);
          ctx.fillStyle = rgba(c.accent, .08 + .8 * v); ctx.fillRect(12 + xx * sx + 1, 34 + yy * sy + 1, sx - 2, sy - 2);
        }
        var fx = 12 + rx * (w - 24), fy = 34 + ry * (h - 64);
        ctx.strokeStyle = c.fg; ctx.strokeRect(fx - 14.5, fy - 14.5, 29, 29); ctx.beginPath(); ctx.moveTo(fx - 4, fy); ctx.lineTo(fx + 4, fy); ctx.moveTo(fx, fy - 4); ctx.lineTo(fx, fy + 4); ctx.stroke();
        font(ctx, 10); ctx.fillStyle = c.mute; ctx.textBaseline = 'bottom'; ctx.fillText('SHARP ▢  →  BLURRED ■', 12, h - 8);
      }
    } };
  };

  // Attendance filling in, with how many classes you can still skip at an 80% floor.
  M.calendar = function (p) {
    var r = rng(p.seed || 9), days = [];
    for (var i = 0; i < 35; i++) days.push(i % 7 > 4 ? 'off' : r() < .13 ? 'A' : 'P');
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var shown = Math.floor((t * 4) % 46), cw = (w - 24) / 7, chh = (h - 66) / 5, pres = 0, tot = 0;
      for (var i = 0; i < 35; i++) {
        var x = 12 + (i % 7) * cw, y = 34 + Math.floor(i / 7) * chh, d = days[i], on = i < shown;
        if (d === 'off') { ctx.fillStyle = rgba(c.fg, .04); ctx.fillRect(x + 2, y + 2, cw - 4, chh - 4); continue; }
        if (on) { tot++; if (d === 'P') pres++; }
        if (on && d === 'P') { ctx.fillStyle = rgba(c.fg, .55); ctx.fillRect(x + 2, y + 2, cw - 4, chh - 4); }
        else if (on) { ctx.strokeStyle = c.accent; ctx.strokeRect(x + 2.5, y + 2.5, cw - 5, chh - 5); ctx.beginPath(); ctx.moveTo(x + 6, y + 6); ctx.lineTo(x + cw - 6, y + chh - 6); ctx.stroke(); }
        else { ctx.strokeStyle = rgba(c.fg, .15); ctx.strokeRect(x + 2.5, y + 2.5, cw - 5, chh - 5); }
      }
      var pct = tot ? pres / tot * 100 : 100, skip = Math.max(0, Math.floor(pres / .8 - tot));
      font(ctx, 11, 600); ctx.fillStyle = c.fg; ctx.textBaseline = 'bottom';
      ctx.fillText('ATTENDANCE ' + pct.toFixed(0) + '%', 12, h - 8);
      ctx.textAlign = 'right'; ctx.fillStyle = c.accent; ctx.fillText('CAN SKIP ' + skip, w - 12, h - 8); ctx.textAlign = 'left';
    } };
  };

  // A robot tracing a figure-eight, with its velocity vector and trail.
  M.robot = function (p) {
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var cx = w / 2, cy = 34 + (h - 50) / 2, ax = w * .36, ay = (h - 70) * .5;
      var pos = function (u) { return [cx + ax * Math.sin(u), cy + ay * Math.sin(u) * Math.cos(u)]; };
      ctx.strokeStyle = rgba(c.fg, .12); ctx.setLineDash([3, 5]); ctx.beginPath();
      for (var u = 0; u <= TAU + .05; u += .05) { var q = pos(u); if (u === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]); }
      ctx.stroke(); ctx.setLineDash([]);
      var s = t * .9;
      for (var k = 30; k > 0; k--) { var tp = pos(s - k * .03); ctx.fillStyle = rgba(c.accent, .4 * (1 - k / 30)); ctx.beginPath(); ctx.arc(tp[0], tp[1], 2, 0, TAU); ctx.fill(); }
      var a = pos(s), b = pos(s + .05), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, vx = dx / L, vy = dy / L, sp = L * 7;
      ctx.fillStyle = c.bg; ctx.strokeStyle = c.fg; ctx.beginPath(); ctx.arc(a[0], a[1], 8, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = c.accent; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0] + vx * (14 + sp * 3), a[1] + vy * (14 + sp * 3)); ctx.stroke(); ctx.lineWidth = 1;
    } };
  };

  // Many small bars, each rising past its own baseline tick.
  M.bars = function (p) {
    var r = rng(p.seed || 6), N = p.count || 42, base = [], gain = [];
    for (var i = 0; i < N; i++) { base.push(.25 + r() * .45); gain.push(.04 + r() * .2); }
    return { draw: function (ctx, w, h, t) {
      var c = C(); bg(ctx, w, h); head(ctx, w, p.title, p.right);
      var prog = ease(clamp((t % 6) / 3.5, 0, 1)), bw = (w - 24) / N, top = 36, H = h - top - 26, above = 0;
      for (var i = 0; i < N; i++) {
        var v = base[i] + gain[i] * prog, x = 12 + i * bw, group = Math.floor(i / 7);
        ctx.fillStyle = group % 2 ? rgba(c.fg, .5) : rgba(c.fg, .35); ctx.fillRect(x + 1, top + H * (1 - v), bw - 2, H * v);
        if (v > base[i] + .005) { above++; ctx.fillStyle = c.accent; ctx.fillRect(x + 1, top + H * (1 - v), bw - 2, H * (v - base[i])); }
        ctx.fillStyle = c.fg; ctx.fillRect(x, top + H * (1 - base[i]), bw, 1);
      }
      font(ctx, 10); ctx.fillStyle = c.mute; ctx.textBaseline = 'bottom'; ctx.fillText(above + ' / ' + N + ' ABOVE THE BASELINE', 12, h - 8);
    } };
  };

  window.CVMotifs = {
    make: function (spec) {
      if (!spec) return null;
      var cover = window.CVCovers && window.CVCovers.make(spec.m);
      if (cover) return cover;
      return M[spec.m] ? M[spec.m](spec.p || {}) : null;
    }
  };
})();
