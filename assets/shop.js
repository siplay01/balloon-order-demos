// Shared demo logic. All prices, zones and availability are DEMO data.
var Shop = (function () {
  var COLORS = [
    ["White", "#f7f5ef"], ["Blush", "#f4b8c1"], ["Coral", "#f26b5b"], ["Ruby", "#b3122a"],
    ["Marigold", "#f5a623"], ["Lemon", "#f7e35a"], ["Sage", "#9cb79a"], ["Mint", "#8fe0c8"],
    ["Sky", "#8cc8f0"], ["Cobalt", "#1d4fd8"], ["Lilac", "#c3a6e6"], ["Gold", "#c9a227"], ["Black", "#1c1c1c"]
  ];
  var ZONES = {
    A: { name: "Westside", fee: 25, zips: "90024 90025 90034 90035 90049 90064 90066 90067 90073 90077 90094 90210 90211 90212 90230 90232 90272 90291 90292 90401 90402 90403 90404 90405" },
    B: { name: "Central LA", fee: 45, zips: "90004 90005 90006 90007 90010 90012 90013 90014 90015 90016 90017 90019 90020 90026 90027 90028 90029 90036 90038 90039 90046 90048 90057 90068 90069 90071" }
  };
  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function zoneFor(zip) {
    zip = String(zip || "").trim();
    if (!/^\d{5}$/.test(zip)) return null;
    for (var k in ZONES) if (ZONES[k].zips.indexOf(zip) > -1) return { id: k, name: ZONES[k].name, fee: ZONES[k].fee };
    if (/^(900|902|903|913|914|916)/.test(zip)) return { id: "C", name: "Greater LA", fee: 65 };
    return { id: "X", name: "Outside our area", fee: null };
  }
  function zoneHTML(z) {
    if (!z) return "";
    if (z.fee === null) return '<span class="zone z-X">' + z.name + "</span> We will quote delivery by text.";
    return '<span class="zone z-' + z.id + '">' + z.name + "</span> Delivery " + money(z.fee) + ". Pickup in studio is free.";
  }
  // Demo calendar: deterministic, so the client sees all three states.
  function dayStatus(iso) {
    if (!iso) return null;
    var d = new Date(iso + "T12:00:00"), today = new Date(); today.setHours(12, 0, 0, 0);
    var diff = Math.round((d - today) / 864e5);
    if (diff < 0) return { s: "bad", t: "That date has passed." };
    if (d.getDate() % 9 === 4) return { s: "bad", t: "Fully booked (demo). Try the next day." };
    if (diff < 2) return { s: "warn", t: "Rush order: +$30, limited slots." , rush: 30 };
    return { s: "ok", t: "Open for delivery." };
  }
  function todayISO(plus) { var d = new Date(); d.setDate(d.getDate() + (plus || 0)); return d.toISOString().slice(0, 10); }
  function wireZip(input, out, cb) {
    function run() { var z = zoneFor(input.value); out.innerHTML = z ? zoneHTML(z) : (input.value.length >= 5 ? '<span class="bad">Enter a 5-digit ZIP.</span>' : ""); if (cb) cb(z); }
    input.addEventListener("input", run); run();
  }
  function wireDate(input, out, cb) {
    input.min = todayISO(0);
    function run() { var s = dayStatus(input.value); out.innerHTML = s ? '<span class="' + s.s + '">' + s.t + "</span>" : ""; if (cb) cb(s); }
    input.addEventListener("input", run); input.addEventListener("change", run); run();
  }
  function hex(name) { for (var i = 0; i < COLORS.length; i++) if (COLORS[i][0] === name) return COLORS[i][1]; return name; }
  // Balloon drawing from a color list. layout: garland | bouquet | arch | columns
  function balloon(cx, cy, r, fill) {
    return '<g><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + (r * 1.12) + '" fill="' + fill + '" stroke="rgba(0,0,0,.28)" stroke-width="1.2"/>' +
      '<ellipse cx="' + (cx - r * .35) + '" cy="' + (cy - r * .45) + '" rx="' + (r * .22) + '" ry="' + (r * .32) + '" fill="#fff" opacity=".45"/></g>';
  }
  function draw(layout, colors, size) {
    colors = (colors && colors.length ? colors : ["White", "Gold"]).map(hex);
    var s = "", i, n, W = 320, H = 220, seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    if (layout === "bouquet") {
      n = Math.max(3, Math.min(15, size || 7));
      for (i = 0; i < n; i++) s += '<path d="M160 210 Q' + (120 + rnd() * 80) + ' 150 ' + (90 + (i % 5) * 35 + rnd() * 10) + " " + (60 + Math.floor(i / 5) * 32) + '" stroke="#555" fill="none" stroke-width="1"/>';
      for (i = 0; i < n; i++) s += balloon(90 + (i % 5) * 35 + rnd() * 10, 60 + Math.floor(i / 5) * 32, 20, colors[i % colors.length]);
    } else if (layout === "arch") {
      n = 26;
      for (i = 0; i < n; i++) { var a = Math.PI * (i / (n - 1)); s += balloon(160 - Math.cos(a) * 130 + rnd() * 6, 205 - Math.sin(a) * 170 + rnd() * 6, 12 + rnd() * 6, colors[Math.floor(rnd() * colors.length)]); }
    } else if (layout === "columns") {
      for (var c = 0; c < 2; c++) for (i = 0; i < 9; i++) s += balloon(80 + c * 160 + (i % 2 ? 9 : -9), 200 - i * 20, 14, colors[i % colors.length]);
      s += '<rect x="56" y="206" width="48" height="10" rx="3" fill="#333"/><rect x="216" y="206" width="48" height="10" rx="3" fill="#333"/>';
    } else {
      n = Math.max(10, Math.min(60, (size || 8) * 5));
      for (i = 0; i < n; i++) { var t = i / (n - 1); s += balloon(20 + t * 280 + rnd() * 8, 110 - Math.sin(t * Math.PI) * 50 + (rnd() - .5) * 34, 9 + rnd() * 11, colors[Math.floor(rnd() * colors.length)]); }
    }
    return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Illustration of a ' + layout + ' in ' + colors.length + ' colors" width="100%" style="max-width:420px">' + s + "</svg>";
  }
  function done(el, lines) {
    el.innerHTML = '<h2>Demo order received</h2><p>Nothing was sent or charged. In the live shop the customer would get this summary by text and email.</p><ul>' +
      lines.map(function (l) { return "<li>" + l + "</li>"; }).join("") + '</ul><p><a class="btn ghost" href="./">Start again</a></p>';
    el.classList.add("show", "pop"); el.scrollIntoView({ behavior: "smooth", block: "start" }); el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true });
  }
  return { COLORS: COLORS, money: money, zoneFor: zoneFor, zoneHTML: zoneHTML, dayStatus: dayStatus, todayISO: todayISO, wireZip: wireZip, wireDate: wireDate, draw: draw, hex: hex, done: done };
})();
