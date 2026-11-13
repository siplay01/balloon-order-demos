// Balloon Atelier concept demos. Shared data and helpers.
// Real prices from the studio's posts: Signature Set $125, Gender Reveal Box $180, Themed set $163.
// Every other price, the delivery fees and the calendar are placeholders.
var Shop = (function () {
  var PALETTE = {
    "Deep Merlot": "#6e1f2e", "Dusk Pink": "#d7a3a6", "Blush": "#f1d3d0", "Cream": "#f2e8d8", "Nude": "#d9bba1",
    "Chrome Gold": "#c9a45c", "Sage": "#aab79f", "Baby Blue": "#b7d2e6", "Lilac": "#c9b8de", "Pearl White": "#f8f6f1", "Black": "#2a2626"
  };
  var CATALOG = [
    { id: "signature", name: "Signature Set", desc: "24-inch personalized jumbo balloon with a coordinated bouquet", price: 125, real: true, for: ["her", "him"], art: { kind: "bouquet", palette: ["Deep Merlot", "Dusk Pink"], line1: "Emma", line2: "IS TWENTY", ink: "Merlot" } },
    { id: "reveal", name: "Gender Reveal Box", desc: "50 balloons, your name on the box, big bow and ribbons", price: 180, real: true, for: ["baby"], art: { kind: "box", palette: ["Blush", "Baby Blue"], line1: "Baby Miller", line2: "BOY OR GIRL" } },
    { id: "themed", name: "Themed Bubble Set", desc: "Built around their favorite thing: mermaids, ballet, trucks", price: 163, real: true, for: ["girls", "boys"], art: { kind: "bouquet", palette: ["Lilac", "Baby Blue"], line1: "Mia", line2: "IS FIVE", fill: "pearls" } },
    { id: "bubble", name: "Personalized Bubble", desc: "Clear 24-inch bubble with a name, filling and ribbons", price: 85, for: ["her", "girls", "boys", "baby"], art: { kind: "bubble", line1: "Amina", line2: "IS ONE", fill: "feathers" } },
    { id: "glass", name: "Glass Balloon Set", desc: "Four glass balloons in blush and cream with a personal message", price: 140, for: ["her"], art: { kind: "glass", palette: ["Blush", "Cream"], line1: "Love you" } },
    { id: "statement", name: "Floor-to-Ceiling", desc: "20 oversized balloons, gold ribbons, one statement balloon", price: 290, for: ["her", "him"], art: { kind: "statement", palette: ["Nude", "Blush", "Cream"], line1: "Sofia", line2: "THIRTY" } }
  ];
  function byId(id) { for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].id === id) return CATALOG[i]; }
  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // Delivery from the Studio City studio. Placeholder fees.
  var NEAR = "91601 91602 91604 91607 91423 91403 91436 91505 91506 91401 91411 91606 91316 91356 90068 90046 90069 90028 90038";
  var MID = "90004 90005 90010 90019 90020 90024 90025 90026 90027 90029 90034 90035 90036 90039 90048 90049 90064 90067 90077 90210 90211 90212 90401 90402 90403 90404 90405 91201 91202 91203 91204 91205 91206";
  function zoneFor(zip) {
    zip = String(zip || "").trim();
    if (!/^\d{5}$/.test(zip)) return null;
    if (NEAR.indexOf(zip) > -1) return { name: "Valley and Hollywood", fee: 20 };
    if (MID.indexOf(zip) > -1) return { name: "Central LA and Westside", fee: 35 };
    if (/^(90[0-8]|91[0-8]|935)/.test(zip)) return { name: "Greater Los Angeles", fee: 50 };
    return { name: "Outside our area", fee: null };
  }
  function todayISO(plus) { var d = new Date(); d.setDate(d.getDate() + (plus || 0)); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function dayStatus(iso) {
    if (!iso) return null;
    var d = new Date(iso + "T12:00:00"), t = new Date(); t.setHours(12, 0, 0, 0);
    var diff = Math.round((d - t) / 864e5);
    if (diff < 0) return { s: "bad", t: "That date has passed." };
    if (diff === 0) return { s: "bad", t: "Same-day orders go by DM. Pick tomorrow or later." };
    if (d.getDate() % 9 === 4) return { s: "bad", t: "This day is fully booked. Try the day before or after." };
    if (diff < 3) return { s: "warn", t: "Short notice: one or two slots left." };
    return { s: "ok", t: "Available." };
  }

  // ---------- illustration ----------
  var INK = { "Gold": "#a8823c", "White": "#ffffff", "Black": "#2a2222", "Merlot": "#6e1f2e" };
  function hex(n) { return PALETTE[n] || n; }
  function shade(h, k) { var n = parseInt(h.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255; function f(c) { return Math.max(0, Math.min(255, Math.round(c * k))); } return "rgb(" + f(r) + "," + f(g) + "," + f(b) + ")"; }
  var uid = 0;
  function latex(cx, cy, r, color, id) {
    var c = hex(color);
    return '<radialGradient id="' + id + '" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="' + c + '"/><stop offset="1" stop-color="' + shade(c, .78) + '"/></radialGradient>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + (r * 1.08) + '" fill="url(#' + id + ')"/>' +
      '<path d="M' + (cx - 4) + " " + (cy + r * 1.08) + " l4 7 l4 -7z" + '" fill="' + shade(c, .7) + '"/>';
  }
  function bubble(cx, cy, r, o) {
    var id = "g" + (++uid), s = "", i, rnd = seeded(5);
    s += '<radialGradient id="' + id + '" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".6" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity=".6"/></radialGradient>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#' + id + ')" stroke="rgba(70,50,45,.22)" stroke-width="1.2"/>';
    var fill = o.fill || "none";
    if (fill === "confetti") for (i = 0; i < 70; i++) { var a = rnd() * 6.28, d = Math.sqrt(rnd()) * r * .85; s += '<circle cx="' + (cx + Math.cos(a) * d) + '" cy="' + (cy + Math.sin(a) * d) + '" r="' + (1 + rnd() * 1.8) + '" fill="#c9a45c" opacity=".85"/>'; }
    if (fill === "pearls") for (i = 0; i < 55; i++) { var a2 = rnd() * 6.28, d2 = Math.sqrt(rnd()) * r * .88; s += '<circle cx="' + (cx + Math.cos(a2) * d2) + '" cy="' + (cy + Math.sin(a2) * d2) + '" r="' + (1.6 + rnd() * 1.6) + '" fill="#fff" stroke="rgba(120,100,90,.35)" stroke-width=".6"/>'; }
    if (fill === "feathers" || fill === "flowers") for (i = 0; i < 9; i++) {
      var fx = cx - r * .45 + rnd() * r * .9, fy = cy + r * .35 + rnd() * r * .45;
      s += fill === "feathers" ? '<ellipse cx="' + fx + '" cy="' + fy + '" rx="' + (r * .11) + '" ry="' + (r * .045) + '" transform="rotate(' + (rnd() * 180) + " " + fx + " " + fy + ')" fill="#fff" opacity=".95" stroke="rgba(120,100,90,.25)" stroke-width=".6"/>'
        : '<g fill="#fff" stroke="rgba(120,100,90,.3)" stroke-width=".5">' + [0, 1, 2, 3, 4].map(function (k) { return '<circle cx="' + (fx + Math.cos(k * 1.26) * 5) + '" cy="' + (fy + Math.sin(k * 1.26) * 5) + '" r="4"/>'; }).join("") + '</g><circle cx="' + fx + '" cy="' + fy + '" r="2.4" fill="#e7d9a8"/>';
    }
    // lettering
    var ink = INK[o.ink || "Gold"] || hex(o.ink), l1 = esc(o.line1 || ""), l2 = esc(o.line2 || ""), style = o.style || "script";
    var fam = style === "script" ? "Pinyon Script" : style === "serif" ? "Marcellus" : "Jost";
    var fs = Math.min(r * .5, r * 2.6 / Math.max(3, l1.length * (style === "script" ? .55 : .62)));
    if (l1) s += '<text x="' + cx + '" y="' + (cy - (l2 ? r * .02 : -r * .08)) + '" text-anchor="middle" font-family="' + fam + '" font-size="' + fs.toFixed(1) + '" fill="' + ink + '">' + l1 + "</text>";
    if (l2) s += '<text x="' + cx + '" y="' + (cy + r * .26) + '" text-anchor="middle" font-family="Marcellus" font-size="' + Math.min(r * .15, r * 1.3 / Math.max(4, l2.length * .82)).toFixed(1) + '" letter-spacing="' + (r * .02).toFixed(1) + '" fill="' + ink + '">' + l2 + "</text>";
    s += '<path d="M' + (cx - r * .5) + " " + (cy - r * .62) + " A" + r * .8 + " " + r * .8 + " 0 0 1 " + (cx + r * .05) + " " + (cy - r * .82) + '" stroke="#fff" stroke-width="' + (r * .05) + '" stroke-linecap="round" fill="none" opacity=".8"/>';
    return s;
  }
  function seeded(seed) { return function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }; }
  function ribbons(x, y, n, color, len) {
    var s = "", i;
    for (i = 0; i < n; i++) { var dx = (i - (n - 1) / 2) * 7; s += '<path d="M' + x + " " + y + " q" + (dx + 10) + " " + len * .3 + " " + dx + " " + len * .55 + " t" + (dx * .3) + " " + len * .45 + '" stroke="' + (color || "#c9a45c") + '" stroke-width="1.4" fill="none" opacity=".9"/>'; }
    return s;
  }
  function art(a) {
    var s = "", p = (a.palette && a.palette.length ? a.palette : ["Blush", "Cream"]), k = a.kind || "bubble", i, base = "b" + (++uid);
    if (k === "bubble") { s += ribbons(200, 330, 5, null, 95) + bubble(200, 190, 140, a); }
    else if (k === "bouquet") {
      var pos = [[95, 150, 62], [305, 140, 62], [70, 255, 54], [330, 250, 56], [140, 90, 50], [262, 82, 50]];
      var n = Math.max(2, Math.min(6, a.count || 6));
      s += ribbons(200, 330, 7, null, 95);
      for (i = 0; i < n; i++) s += latex(pos[i][0], pos[i][1], pos[i][2], p[i % p.length], base + i);
      s += bubble(200, 195, 118, a);
    } else if (k === "box") {
      var r2 = seeded(3);
      for (i = 0; i < 22; i++) { var bx = 110 + r2() * 180, by = 60 + r2() * 150; s += '<path d="M' + bx + " " + (by + 30) + " Q" + (bx + 10) + " " + (by + 120) + " 200 290" + '" stroke="#c9a45c" stroke-width=".9" fill="none" opacity=".7"/>'; s += latex(bx, by, 20 + r2() * 8, p[i % p.length], base + i); }
      s += '<rect x="96" y="262" width="208" height="150" fill="#fbf8f4" stroke="rgba(70,50,45,.18)"/><path d="M86 262h228l-12-26H98z" fill="#fff" stroke="rgba(70,50,45,.15)"/>';
      s += '<text x="200" y="316" text-anchor="middle" font-family="Marcellus" font-size="' + Math.min(20, 300 / Math.max(6, (a.line1 || "").length * .9)).toFixed(1) + '" letter-spacing="2" fill="#3a2c28">' + esc((a.line1 || "").toUpperCase()) + '</text><text x="200" y="358" text-anchor="middle" font-family="Pinyon Script" font-size="30" fill="' + INK.Gold + '">' + esc(a.line2 ? a.line2.charAt(0) + a.line2.slice(1).toLowerCase() : "") + "</text>";
      var bw = hex(a.bow || "Chrome Gold"); s += '<g fill="none" stroke="' + bw + '" stroke-width="6" stroke-linejoin="round"><path d="M200 250 C170 222 146 238 160 254 C170 266 190 258 200 250Z"/><path d="M200 250 C230 222 254 238 240 254 C230 266 210 258 200 250Z"/><path d="M196 252 l-14 34 M204 252 l14 34"/></g><circle cx="200" cy="250" r="6" fill="' + bw + '"/>';
    } else if (k === "glass") {
      var g = [[120, 150, 78], [282, 140, 78], [150, 290, 70], [262, 288, 70]];
      s += ribbons(200, 380, 4, null, 50);
      for (i = 0; i < 4; i++) s += latex(g[i][0], g[i][1], g[i][2], p[i % p.length], base + i);
      s += '<text x="120" y="160" text-anchor="middle" font-family="Pinyon Script" font-size="' + Math.min(34, 260 / Math.max(5, (a.line1 || "").length)).toFixed(1) + '" fill="' + (INK[a.ink] || INK.Gold) + '">' + esc(a.line1 || "") + "</text>";
    } else {
      var r3 = seeded(9);
      for (i = 0; i < 16; i++) s += latex(40 + r3() * 320, 50 + r3() * 280, 34 + r3() * 18, p[i % p.length], base + i);
      s += ribbons(200, 330, 9, null, 100) + bubble(200, 200, 105, a);
    }
    return '<svg viewBox="0 0 400 440" role="img" aria-label="Illustration: ' + esc(k) + (a.line1 ? " with " + esc(a.line1) : "") + '">' + s + "</svg>";
  }

  // ---------- page chrome ----------
  var DEMOS = [["", "All demos"], ["demo1/", "1 Shop"], ["demo2/", "2 Personalize"], ["demo3/", "3 Gender reveal"], ["demo4/", "4 Gift finder"], ["demo5/", "5 Order by DM"]];
  function chrome(n) {
    var bar = document.createElement("nav"); bar.className = "demo-bar"; bar.setAttribute("aria-label", "Demos");
    bar.innerHTML = '<div class="wrap"><span>Concept demo</span>' + DEMOS.map(function (d, i) { return '<a href="' + ((n ? "../" : "") + d[0] || "./") + '"' + (i === n ? ' aria-current="page"' : "") + ">" + d[1] + "</a>"; }).join("") + "</div>";
    var top = document.createElement("header"); top.className = "top";
    top.innerHTML = '<div class="wrap"><a class="logo" href="./" aria-label="Balloon Atelier"><b>BALLOON</b><i>Atelier</i></a><span class="meta">Studio City, Los Angeles &middot; pickup and local delivery</span></div>';
    document.body.insertBefore(top, document.body.firstChild); document.body.insertBefore(bar, top);
    var f = document.createElement("footer");
    f.innerHTML = '<div class="wrap">Concept demo for Balloon Atelier. The $125, $163 and $180 prices come from the studio\'s posts. Other prices, delivery fees and the calendar are placeholders. Nothing is sent or charged.</div>';
    document.body.appendChild(f);
  }

  // ---------- checkout ----------
  function checkout(el, o) {
    el.innerHTML =
      '<div class="field"><span class="label" id="ml">Pickup or delivery</span><div class="opts" role="group" aria-labelledby="ml">' +
      '<button type="button" class="opt" data-m="pickup" aria-pressed="true">Pickup<small>Studio City, free</small></button>' +
      '<button type="button" class="opt" data-m="delivery" aria-pressed="false">Delivery<small>Fee by ZIP</small></button></div></div>' +
      '<div class="field hide" data-z><label for="co-zip">Delivery ZIP</label><input id="co-zip" inputmode="numeric" maxlength="5" autocomplete="postal-code"><div class="readout" aria-live="polite" data-zo></div></div>' +
      '<div class="row"><div class="field"><label for="co-date">Date</label><input id="co-date" type="date"><div class="readout" aria-live="polite" data-do></div></div>' +
      '<div class="field"><label for="co-time">Time</label><select id="co-time"><option>10 am to 12 pm</option><option>12 to 2 pm</option><option>2 to 4 pm</option><option>4 to 6 pm</option></select></div></div>' +
      '<div class="row"><div class="field"><label for="co-name">Name</label><input id="co-name" autocomplete="name"></div><div class="field"><label for="co-phone">Mobile</label><input id="co-phone" type="tel" autocomplete="tel"></div></div>' +
      '<div class="sum" data-sum aria-live="polite"></div><p class="readout bad" data-err aria-live="assertive"></p>' +
      '<button type="button" class="btn block" data-go>' + (o.cta || "Place order and pay") + " (demo)</button>";
    var st = { m: "pickup", z: null, d: null };
    function q(s) { return el.querySelector(s); }
    function sum() {
      var items = o.items(), sub = 0, h = "";
      items.forEach(function (it) { sub += it.price; h += "<div><span>" + esc(it.name) + "</span><span>" + money(it.price) + "</span></div>"; });
      var fee = st.m === "pickup" ? 0 : st.z && st.z.fee;
      h += "<div><span>" + (st.m === "pickup" ? "Pickup in Studio City" : "Delivery") + "</span><span>" + (st.m === "pickup" ? "Free" : st.z ? (fee === null ? "Quoted by text" : money(fee)) : "Enter ZIP") + "</span></div>";
      h += '<div class="t"><span>Total</span><span>' + money(sub + (fee || 0)) + "</span></div>";
      q("[data-sum]").innerHTML = h;
      return sub + (fee || 0);
    }
    [].forEach.call(el.querySelectorAll("[data-m]"), function (b) {
      b.onclick = function () { st.m = b.dataset.m; [].forEach.call(el.querySelectorAll("[data-m]"), function (x) { x.setAttribute("aria-pressed", x === b); }); q("[data-z]").classList.toggle("hide", st.m !== "delivery"); sum(); };
    });
    var zip = q("#co-zip"), date = q("#co-date"); date.min = todayISO(1);
    zip.oninput = function () { st.z = zoneFor(zip.value); q("[data-zo]").innerHTML = st.z ? (st.z.fee === null ? '<span class="warn">' + st.z.name + ". We will quote delivery by text.</span>" : '<span class="ok">' + st.z.name + ": " + money(st.z.fee) + "</span>") : (zip.value.length >= 5 ? '<span class="bad">Enter a 5-digit ZIP.</span>' : ""); sum(); };
    date.oninput = date.onchange = function () { st.d = dayStatus(date.value); q("[data-do]").innerHTML = st.d ? '<span class="' + st.d.s + '">' + st.d.t + "</span>" : ""; };
    q("[data-go]").onclick = function () {
      var err = q("[data-err]"), e = o.validate ? o.validate() : "";
      if (!e && st.m === "delivery" && !st.z) e = "Add the delivery ZIP or choose pickup.";
      if (!e && (!st.d || st.d.s === "bad")) e = "Choose an available date.";
      if (!e && !q("#co-name").value.trim()) e = "Add your name.";
      if (!e && q("#co-phone").value.replace(/\D/g, "").length < 10) e = "Add a 10-digit mobile number so we can confirm by text.";
      err.textContent = e || "";
      if (e) return;
      var lines = o.items().map(function (it) { return it.name + (it.note ? ": " + it.note : "") + ", " + money(it.price); });
      lines.push((st.m === "pickup" ? "Pickup in Studio City" : "Delivery to " + zip.value) + ", " + date.value + ", " + q("#co-time").value, "Total " + money(sum()));
      done(o.doneEl, lines);
    };
    sum();
    return { refresh: sum };
  }
  function done(el, lines) {
    el.innerHTML = '<div class="panel"><h2>Order received</h2><p class="muted">Demo only. Nothing was sent or charged. In the live shop the customer gets this summary by text, and the studio sees it in one list.</p><ul class="list">' +
      lines.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + '</ul><p style="margin-top:16px"><a class="btn line" href="./">Start again</a></p></div>';
    el.classList.add("show", "fade"); el.setAttribute("tabindex", "-1"); el.scrollIntoView({ behavior: "smooth", block: "start" }); el.focus({ preventScroll: true });
  }
  return { PALETTE: PALETTE, CATALOG: CATALOG, byId: byId, money: money, esc: esc, zoneFor: zoneFor, dayStatus: dayStatus, todayISO: todayISO, art: art, chrome: chrome, checkout: checkout, done: done };
})();
