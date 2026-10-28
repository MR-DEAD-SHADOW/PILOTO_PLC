/* =========================================================
   SCADA DTI · Página piloto
   Banco de intercambiadores de calor con PLC Delta
   Todos los valores son SIMULADOS con perfiles programados.
   Para conectar datos reales, reemplazar leerValor() por la
   lectura de la base de datos (ver comentario al final).
   ========================================================= */

/* ---------- 1. Catálogo de variables (tags del DTI) ----------
   base: valor medio · amp: amplitud de oscilación · per: periodo en s
   L / H / HH: límites de operación · sensor: tipo de instrumento      */
const V = {
  // Intercambiador I-1
  "TT-13":   {d:"Entrada lado caliente",  tipo:"Temperatura", u:"°C", base:148, amp:5,  per:24, L:40, H:170, HH:185, sensor:"PT100"},
  "TT-14":   {d:"Salida lado caliente",   tipo:"Temperatura", u:"°C", base:121, amp:4,  per:30, L:40, H:150, HH:165, sensor:"PT100"},
  "TT-I1-3": {d:"Entrada lado frío",      tipo:"Temperatura", u:"°C", base:38,  amp:2,  per:20, L:15, H:60,  HH:70,  sensor:"PT100"},
  "TT-I1-4": {d:"Salida lado frío",       tipo:"Temperatura", u:"°C", base:72,  amp:3,  per:18, L:15, H:85,  HH:95,  sensor:"PT100"},
  // Intercambiador I-2
  "TT-I2-1": {d:"Salida lado frío",       tipo:"Temperatura", u:"°C", base:96,  amp:4,  per:26, L:20, H:120, HH:135, sensor:"PT100"},
  "TT-I2-2": {d:"Salida lado caliente",   tipo:"Temperatura", u:"°C", base:205, amp:6,  per:22, L:60, H:240, HH:260, sensor:"PT100"},
  "TT-12":   {d:"Entrada lado caliente",  tipo:"Temperatura", u:"°C", base:322, amp:14, per:16, L:80, H:330, HH:360, sensor:"Termopar K"},
  // Intercambiador I-3 (instrumentos del punto 6)
  "TT-P6":   {d:"Punto 6, después del quemador inferior", tipo:"Temperatura", u:"°C", base:286, amp:10, per:28, L:80, H:320, HH:350, sensor:"Termopar K"},
  "PT-P6":   {d:"Presión punto 6",        tipo:"Presión",     u:"bar", base:3.4, amp:0.25, per:19, L:1.0, H:4.5, HH:5.0, sensor:"Transmisor 4–20 mA"},
  "FT-P6":   {d:"Caudal punto 6 (QI)",    tipo:"Caudal",      u:"L/min", base:46, amp:3, per:25, L:15, H:70, HH:80, sensor:"Transmisor 4–20 mA"},
  // Intercambiador I-4
  "TT-15":   {d:"Entrada lado caliente",  tipo:"Temperatura", u:"°C", base:112, amp:4,  per:27, L:30, H:140, HH:155, sensor:"PT100"},
  "TT-16":   {d:"Salida lado caliente",   tipo:"Temperatura", u:"°C", base:88,  amp:3,  per:21, L:30, H:110, HH:125, sensor:"PT100"},
  "TT-I4-3": {d:"Entrada lado frío",      tipo:"Temperatura", u:"°C", base:35,  amp:2,  per:23, L:15, H:60,  HH:70,  sensor:"PT100"},
  "TT-I4-4": {d:"Salida lado frío",       tipo:"Temperatura", u:"°C", base:64,  amp:3,  per:17, L:15, H:85,  HH:95,  sensor:"PT100"},
  // Intercambiador I-5
  "TT-17":   {d:"Entrada lado caliente",  tipo:"Temperatura", u:"°C", base:176, amp:6,  per:20, L:50, H:200, HH:220, sensor:"PT100"},
  "TT-18":   {d:"Salida lado caliente",   tipo:"Temperatura", u:"°C", base:139, amp:5,  per:25, L:50, H:170, HH:185, sensor:"PT100"},
  "TT-I5-3": {d:"Entrada lado frío",      tipo:"Temperatura", u:"°C", base:41,  amp:2,  per:19, L:15, H:60,  HH:70,  sensor:"PT100"},
  "TT-I5-4": {d:"Salida lado frío",       tipo:"Temperatura", u:"°C", base:79,  amp:3,  per:22, L:15, H:90,  HH:100, sensor:"PT100"},
  // Quemadores
  "TT-11":   {d:"Salida de quemador y resistencias (punto 11)", tipo:"Temperatura", u:"°C", base:412, amp:18, per:30, L:100, H:450, HH:500, sensor:"Termopar K"},
  "BR-01.F": {d:"Tasa de fuego quemador superior", tipo:"Potencia", u:"%", base:68, amp:8, per:34, L:10, H:90, HH:98, sensor:"Calculado en PLC"},
  "TT-P5":   {d:"Punto 5, antes del quemador inferior", tipo:"Temperatura", u:"°C", base:164, amp:5, per:21, L:40, H:200, HH:220, sensor:"PT100"},
  "PT-P5":   {d:"Presión punto 5",        tipo:"Presión",     u:"bar", base:3.8, amp:0.3, per:23, L:1.0, H:4.8, HH:5.3, sensor:"Transmisor 4–20 mA"},
  "BR-02.F": {d:"Tasa de fuego quemador inferior", tipo:"Potencia", u:"%", base:57, amp:9, per:29, L:10, H:90, HH:98, sensor:"Calculado en PLC"},
  // Resistencias
  "RH-01.P": {d:"Potencia aplicada resistencia 1", tipo:"Potencia", u:"%", base:62, amp:12, per:15, L:5, H:92, HH:100, sensor:"SSR / salida transistor"},
  "RH-01.T": {d:"Temperatura de la resistencia 1", tipo:"Temperatura", u:"°C", base:388, amp:16, per:15, L:50, H:430, HH:470, sensor:"Termopar K"},
  "RH-02.P": {d:"Potencia aplicada resistencia 2", tipo:"Potencia", u:"%", base:48, amp:10, per:18, L:5, H:92, HH:100, sensor:"SSR / salida transistor"},
  "RH-02.T": {d:"Temperatura de la resistencia 2", tipo:"Temperatura", u:"°C", base:351, amp:14, per:18, L:50, H:430, HH:470, sensor:"Termopar K"},
  // Válvulas de control
  "FV-01":   {d:"Apertura válvula entre puntos 2 y 3", tipo:"Apertura", u:"%", base:54, amp:9, per:26, L:5, H:92, HH:98, sensor:"Posicionador 4–20 mA"},
  "FV-01.SP":{d:"Consigna (setpoint) FV-01", tipo:"Apertura", u:"%", base:55, amp:0, per:60, L:5, H:92, HH:98, sensor:"HMI / PLC"},
  "FV-02":   {d:"Apertura válvula entre puntos 9 y 10", tipo:"Apertura", u:"%", base:41, amp:7, per:31, L:5, H:92, HH:98, sensor:"Posicionador 4–20 mA"},
  "FV-02.SP":{d:"Consigna (setpoint) FV-02", tipo:"Apertura", u:"%", base:40, amp:0, per:60, L:5, H:92, HH:98, sensor:"HMI / PLC"},
  // Línea de proceso, punto 1
  "TT-P1":   {d:"Temperatura punto 1",    tipo:"Temperatura", u:"°C", base:188, amp:6, per:24, L:50, H:220, HH:240, sensor:"PT100"},
  "PT-P1":   {d:"Presión punto 1",        tipo:"Presión",     u:"bar", base:3.1, amp:0.2, per:20, L:1.0, H:4.5, HH:5.0, sensor:"Transmisor 4–20 mA"},
  "FT-P1":   {d:"Flujo punto 1 (FE)",     tipo:"Flujo",       u:"L/min", base:52, amp:3, per:27, L:15, H:70, HH:80, sensor:"Transmisor 4–20 mA"},
  "DT-01":   {d:"Densidad del fluido (DI)", tipo:"Densidad",  u:"kg/m³", base:868, amp:4, per:40, L:820, H:900, HH:920, sensor:"Transmisor 4–20 mA"},
  // PLC
  "TT-19":   {d:"Temperatura ambiente",   tipo:"Temperatura", u:"°C", base:24.5, amp:0.6, per:45, L:5, H:40, HH:45, sensor:"PT100"},
  "PLC.SCAN":{d:"Tiempo de ciclo del programa", tipo:"Tiempo", u:"ms", base:6.2, amp:0.8, per:11, L:0, H:20, HH:50, sensor:"Registro interno del PLC"},
};

/* ---------- 2. Equipos (pestañas) y sus unidades ---------- */
const I = (p) => `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const EQUIPOS = [
  {id:"dti", nombre:"DTI", estado:"Monitoreo", icon:I('<path d="M3 17l5-6 4 4 8-9"/><path d="M14 6h6v6"/>')},
  {id:"hx", nombre:"Intercambiadores", estado:"Operando", icon:I('<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 7v10M17 7v10M7 10h10M7 14h10"/>'),
   unidades:[
    {id:"I-1", n:"Intercambiador I-1", ub:"Superior izquierdo", vars:["TT-13","TT-14","TT-I1-3","TT-I1-4"]},
    {id:"I-2", n:"Intercambiador I-2", ub:"Superior derecho",   vars:["TT-12","TT-I2-2","TT-I2-1"]},
    {id:"I-3", n:"Intercambiador I-3", ub:"Central",            vars:["TT-P6","PT-P6","FT-P6"]},
    {id:"I-4", n:"Intercambiador I-4", ub:"Inferior izquierdo", vars:["TT-15","TT-16","TT-I4-3","TT-I4-4"]},
    {id:"I-5", n:"Intercambiador I-5", ub:"Inferior derecho",   vars:["TT-17","TT-18","TT-I5-3","TT-I5-4"]}]},
  {id:"br", nombre:"Quemadores", estado:"Encendidos", icon:I('<path d="M12 3c3 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-4 2-5 0 2 1 3 2 3 0-3 0-5 1-8z"/>'),
   unidades:[
    {id:"BR-01", n:"Quemador BR-01", ub:"Superior, antes de resistencias", vars:["TT-11","BR-01.F"]},
    {id:"BR-02", n:"Quemador BR-02", ub:"Inferior, entre puntos 5 y 6",    vars:["TT-P5","TT-P6","PT-P5","BR-02.F"]}]},
  {id:"rh", nombre:"Resistencias", estado:"Encendidas", icon:I('<path d="M4 12h3l2-5 3 10 3-10 2 5h3"/>'),
   unidades:[
    {id:"RH-01", n:"Resistencia RH-01", ub:"Superior, después del quemador", vars:["RH-01.T","RH-01.P","TT-11"]},
    {id:"RH-02", n:"Resistencia RH-02", ub:"Superior, retorno de línea",      vars:["RH-02.T","RH-02.P","TT-11"]}]},
  {id:"fv", nombre:"Válvulas de control", estado:"Automático", icon:I('<path d="M4 6l16 12V6L4 18z"/><path d="M12 12V5M9 5h6"/>'),
   unidades:[
    {id:"FV-01", n:"Válvula FV-01", ub:"Entre puntos 2 y 3",  vars:["FV-01","FV-01.SP"]},
    {id:"FV-02", n:"Válvula FV-02", ub:"Entre puntos 9 y 10", vars:["FV-02","FV-02.SP"]}]},
  {id:"ln", nombre:"Línea de proceso", estado:"Punto 1", icon:I('<path d="M3 12h18"/><circle cx="12" cy="12" r="3"/><path d="M12 9V4"/>'),
   unidades:[{id:"P1", n:"Instrumentos del punto 1", ub:"Entre I-2 e I-1", vars:["TT-P1","PT-P1","FT-P1","DT-01"]}]},
  {id:"plc", nombre:"PLC controlador", estado:"RUN", icon:I('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8v5H8zM8 16h2M12 16h2"/>')},
];

/* ---------- 3. Simulación con perfiles programados ---------- */
const HIST_S = 60, VENTANA = 20;                 // se guardan 60 s, la gráfica muestra 20 s
const hist = {}; Object.keys(V).forEach(k => hist[k] = []);
const fase = {}; Object.keys(V).forEach((k, i) => fase[k] = (i * 1.37) % (2 * Math.PI));
let t0 = Date.now(), heartbeat = 0;

function leerValor(tag, t) {
  // Perfil: onda principal + armónico + ruido pequeño. Reemplazar por la lectura real de la base de datos.
  const v = V[tag], w = 2 * Math.PI / v.per;
  const s = Math.sin(w * t + fase[tag]) + 0.35 * Math.sin(2.3 * w * t + fase[tag] * 2);
  return v.base + v.amp * s / 1.35 + v.amp * 0.06 * (Math.random() - 0.5);
}
function estado(tag, x) {
  const v = V[tag];
  if (x >= v.HH) return {c:"hh", t:"Crítico (HH)"};
  if (x >= v.H)  return {c:"h",  t:"Advertencia (H)"};
  if (x <= v.L)  return {c:"l",  t:"Bajo (L)"};
  return {c:"ok", t:"Normal"};
}
const dec = tag => (V[tag].u === "bar" || V[tag].u === "ms") ? 2 : 1;
const fmt = (tag, x) => x.toLocaleString("es-MX", {minimumFractionDigits:dec(tag), maximumFractionDigits:dec(tag)});
const hora = d => d.toLocaleTimeString("es-MX", {hour12:false});
const ultimo = tag => hist[tag][hist[tag].length - 1];
const alarmas = [];

function muestrear() {
  const now = new Date(), t = (Date.now() - t0) / 1000; heartbeat++;
  for (const tag in V) {
    const x = leerValor(tag, t), e = estado(tag, x), h = hist[tag], prev = h[h.length - 1];
    h.push({t:now, x, e}); if (h.length > HIST_S) h.shift();
    if (e.c !== "ok" && (!prev || prev.e.c !== e.c)) {
      alarmas.unshift({t:now, tag, x, e}); if (alarmas.length > 40) alarmas.pop();
    }
  }
}

/* ---------- 4. Gráfica en canvas (sin librerías) ---------- */
function grafica(cv, tag, {mini=false, n=VENTANA} = {}) {
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
  if (!W || !H) return;
  cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const d = hist[tag].slice(-n); if (d.length < 2) return;
  const xs = d.map(p => p.x); let lo = Math.min(...xs), hi = Math.max(...xs);
  const pad = (hi - lo) * 0.12 || V[tag].amp * 0.2 || 1; lo -= pad; hi += pad;
  const L = mini ? 0 : 48, R = mini ? 0 : 16, T = mini ? 2 : 8, B = mini ? 2 : 26;
  const X = i => L + (W - L - R) * i / (d.length - 1), Y = x => T + (H - T - B) * (1 - (x - lo) / (hi - lo));
  if (!mini) {
    g.font = "11px JetBrains Mono, monospace"; g.fillStyle = "#8a97b0"; g.strokeStyle = "#1c2741"; g.lineWidth = 1;
    for (let k = 0; k <= 5; k++) {
      const val = lo + (hi - lo) * k / 5, y = Y(val);
      g.beginPath(); g.moveTo(L, y); g.lineTo(W - R, y); g.stroke();
      g.textAlign = "right"; g.fillText(val.toLocaleString("es-MX", {maximumFractionDigits: dec(tag)}), L - 6, y + 4);
    }
    g.textAlign = "center"; const paso = Math.max(1, Math.ceil(d.length / Math.max(2, Math.floor((W - L - R) / 72))));
    d.forEach((p, i) => { g.beginPath(); g.moveTo(X(i), T); g.lineTo(X(i), H - B); g.stroke();
      if (i % paso === 0) g.fillText(hora(p.t), X(i), H - 8); });
    // límites visibles dentro del rango
    [["H", "#f5a623"], ["HH", "#ff5b5b"], ["L", "#38bdf8"]].forEach(([k, c]) => {
      const v = V[tag][k]; if (v > lo && v < hi) { g.setLineDash([5, 5]); g.strokeStyle = c; g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(W - R, Y(v)); g.stroke(); g.setLineDash([]); g.strokeStyle = "#1c2741"; }
    });
  }
  // curva suavizada
  const path = () => { g.beginPath(); g.moveTo(X(0), Y(d[0].x));
    for (let i = 0; i < d.length - 1; i++) { const xm = (X(i) + X(i + 1)) / 2; g.bezierCurveTo(xm, Y(d[i].x), xm, Y(d[i + 1].x), X(i + 1), Y(d[i + 1].x)); } };
  path(); g.lineTo(X(d.length - 1), H - B); g.lineTo(X(0), H - B); g.closePath();
  const grd = g.createLinearGradient(0, T, 0, H - B); grd.addColorStop(0, "rgba(30,144,214,.35)"); grd.addColorStop(1, "rgba(30,144,214,.03)");
  g.fillStyle = grd; g.fill();
  path(); g.strokeStyle = "#1e90d6"; g.lineWidth = mini ? 1.5 : 2.2; g.stroke();
  if (!mini) { g.fillStyle = "#1e90d6"; d.forEach((p, i) => { g.beginPath(); g.arc(X(i), Y(p.x), 2.6, 0, 7); g.fill(); }); }
}

/* ---------- 5. Estado de la interfaz ---------- */
const ui = {tab:"dti", unidad:{}, variable:{}};
EQUIPOS.forEach(e => { if (e.unidades) { ui.unidad[e.id] = 0; } });
const $ = s => document.querySelector(s);

function renderTabs() {
  $("#tabs").innerHTML = EQUIPOS.map(e => {
    const al = alarmasDe(e); const st = al.hh ? "crit" : al.h ? "warn" : "ok";
    const txt = al.hh ? "Alarma crítica" : al.h ? "Advertencia" : e.estado;
    return `<button class="tab ${ui.tab === e.id ? "active" : ""}" data-tab="${e.id}">${e.id === "dti" ? e.icon : ""}${e.nombre}<span class="st ${ui.tab === e.id ? "" : st}">${txt}</span></button>`;
  }).join("");
  const act = document.querySelector(".tab.active"); if (act && renderTabs.ultimo !== ui.tab) { act.scrollIntoView({inline:"nearest", block:"nearest"}); renderTabs.ultimo = ui.tab; }
}
function tagsDe(e) { return e.unidades ? e.unidades.flatMap(u => u.vars) : e.id === "plc" ? ["TT-19", "PLC.SCAN"] : Object.keys(V); }
function alarmasDe(e) {
  const r = {h:0, hh:0}; tagsDe(e).forEach(t => { const u = ultimo(t); if (u) { if (u.e.c === "hh") r.hh++; else if (u.e.c === "h") r.h++; } }); return r;
}

/* ---- vista de un equipo ---- */
function vistaEquipo(e) {
  const ui_u = ui.unidad[e.id], u = e.unidades[ui_u];
  const sel = ui.variable[u.id] || u.vars[0]; ui.variable[u.id] = sel;
  const v = V[sel];
  return `
  ${e.unidades.length > 1 ? `<div class="units">${e.unidades.map((x, i) => `<button class="unit ${i === ui_u ? "active" : ""}" data-unit="${i}">${x.n}</button>`).join("")}</div>` : ""}
  <div class="section-title">${u.n} · ${u.ub}</div>
  <div class="vars">${u.vars.map(t => `<button class="var ${t === sel ? "active" : ""}" data-var="${t}">
      <div class="t">${t}</div><div class="d">${V[t].d}</div><div class="v" data-live="${t}">--<small>${V[t].u}</small></div></button>`).join("")}</div>
  <section class="panel"><div class="pv">
    <div><div class="lbl">Lectura actual en tiempo real (PV) · ${sel}</div><div class="num" id="pv">--<small>${v.u}</small></div></div>
    <div class="right"><div class="k">Unidad DTI · ${v.sensor}</div><div class="u">${v.tipo}</div><div class="s" id="pvst">--</div></div>
  </div></section>
  <section class="panel"><div class="panel-head"><h3>Tendencia de lectura (últimos ${VENTANA} s)</h3><span class="live"><i></i>Vivo</span></div>
    <div class="chart-wrap"><canvas id="chart"></canvas></div></section>
  <div class="grid2">
    <section class="panel limits"><div class="panel-head"><h3>Límites de operación</h3><span class="sub">Solo consulta</span></div>
      <div class="row"><span>Límite máximo crítico (HH):</span><b style="color:var(--red)">${fmt(sel, v.HH)} ${v.u}</b></div>
      <div class="row"><span>Advertencia superior (H):</span><b style="color:var(--amber)">${fmt(sel, v.H)} ${v.u}</b></div>
      <div class="row"><span>Valor de referencia:</span><b style="color:var(--text)">${fmt(sel, v.base)} ${v.u}</b></div>
      <div class="row"><span>Mínimo permitido (L):</span><b style="color:var(--cyan)">${fmt(sel, v.L)} ${v.u}</b></div></section>
    <section class="panel"><div class="panel-head"><h3>Estadística (últimos ${HIST_S} s)</h3><span class="tag-sm">${sel}</span></div>
      <div class="info" id="stats"></div></section>
  </div>
  <section class="panel" style="margin-top:18px"><div class="panel-head"><h3>Historial de lecturas recientes</h3><span class="sub">Cada 1 s</span></div>
    <table><thead><tr><th>Hora</th><th>Tag</th><th>Valor</th><th>Estado</th></tr></thead><tbody id="hist"></tbody></table></section>`;
}

/* ---- vista general DTI ---- */
const TARJETAS = [
  ["hx", 0], ["ln", 0], ["hx", 1],
  ["fv", 0], ["br", 1], ["hx", 2],
  ["hx", 3], ["fv", 1], ["hx", 4],
  ["br", 0], ["rh", 0], ["rh", 1]];
function vistaDTI() {
  return `
  <div class="kpis">
    <div class="kpi"><div class="k">Equipos supervisados</div><div class="n">${EQUIPOS.filter(e => e.unidades).reduce((a, e) => a + e.unidades.length, 0)}</div></div>
    <div class="kpi"><div class="k">Alarmas activas</div><div class="n" id="k-al">0</div></div>
    <div class="kpi"><div class="k">Temperatura máxima del banco</div><div class="n" id="k-max">--</div></div>
    <div class="kpi"><div class="k">Temperatura ambiente (TT-19)</div><div class="n" id="k-amb">--</div></div>
  </div>
  <div class="section-title">Vista del banco según el DTI · haz clic en un equipo para ver su detalle</div>
  <div class="dti">${TARJETAS.map(([eid, i], k) => {
    const e = EQUIPOS.find(x => x.id === eid), u = e.unidades[i];
    return `<div class="eq" data-go="${eid}" data-ui="${i}" id="eq-${k}"><div class="eh"><span class="en">${u.n}</span><span class="ei">${u.ub}</span></div>
      ${u.vars.filter(t => !t.endsWith(".SP")).slice(0, 4).map(t => `<div class="r"><span>${t}</span><b data-live="${t}">--</b></div>`).join("")}
      <canvas data-spark="${u.vars[0]}"></canvas></div>`; }).join("")}</div>
  <section class="panel alarms"><div class="panel-head"><h3>Alarmas y eventos recientes</h3><span class="sub">Generados por la simulación</span></div><div id="al-list"></div></section>`;
}

/* ---- vista PLC ---- */
function vistaPLC() {
  const mods = [["CPU","DVP12SE11R","8 E / 4 S relé, Ethernet"],["Digital","DVP16SP11T","8 E / 8 S transistor"],["Especial 1–5","DVP04PT-S × 5","20 canales PT100 (17 en uso)"],
    ["Especial 6","DVP04TC-S","4 canales termopar K (3 en uso)"],["Especial 7","DVP04AD-S","4 entradas 4–20 mA"],["Especial 8","DVP06XA-S","4 entradas + 2 salidas 4–20 mA"],["HMI","DOP-107EV","7 pulgadas, Ethernet"]];
  ui.variable.plc = ui.variable.plc || "TT-19"; const sel = ui.variable.plc;
  return `
  <div class="grid2">
    <section class="panel info"><div class="panel-head"><h3>Información del controlador</h3><span class="pill on">RUN</span></div>
      <div class="row"><span>Modelo</span><b>Delta DVP12SE11R</b></div>
      <div class="row"><span>Propuesta de expansión</span><b>Delta AS332T-A</b></div>
      <div class="row"><span>Dirección IP</span><b>192.168.1.10</b></div>
      <div class="row"><span>Protocolo</span><b>Modbus TCP · puerto 502</b></div>
      <div class="row"><span>Área de intercambio</span><b>D1000 – D1099</b></div>
      <div class="row"><span>Contador de vida (heartbeat)</span><b id="hb">0</b></div>
      <div class="row"><span>Tiempo en línea</span><b id="up">00:00:00</b></div>
      <div class="row"><span>Última lectura</span><b id="last">--</b></div></section>
    <section class="panel"><div class="panel-head"><h3>Módulos instalados</h3><span class="sub">8 de 8 ranuras especiales</span></div>
      <table><thead><tr><th>Posición</th><th>Modelo</th><th>Función</th><th>Estado</th></tr></thead><tbody>
      ${mods.map(m => `<tr><td>${m[0]}</td><td>${m[1]}</td><td class="txt">${m[2]}</td><td><span class="pill ok">OK</span></td></tr>`).join("")}</tbody></table></section>
  </div>
  <div class="vars" style="margin-top:18px">${["TT-19", "PLC.SCAN"].map(t => `<button class="var ${t === sel ? "active" : ""}" data-var="${t}"><div class="t">${t}</div><div class="d">${V[t].d}</div><div class="v" data-live="${t}">--<small>${V[t].u}</small></div></button>`).join("")}</div>
  <section class="panel"><div class="pv"><div><div class="lbl">Lectura actual en tiempo real (PV) · ${sel}</div><div class="num" id="pv">--<small>${V[sel].u}</small></div></div>
    <div class="right"><div class="k">Unidad DTI · ${V[sel].sensor}</div><div class="u">${V[sel].tipo}</div><div class="s" id="pvst">--</div></div></div></section>
  <section class="panel"><div class="panel-head"><h3>Tendencia de lectura (últimos ${VENTANA} s)</h3><span class="live"><i></i>Vivo</span></div><div class="chart-wrap"><canvas id="chart"></canvas></div></section>
  <section class="panel"><div class="panel-head"><h3>Historial de lecturas recientes</h3><span class="sub">Cada 1 s</span></div>
    <table><thead><tr><th>Hora</th><th>Tag</th><th>Valor</th><th>Estado</th></tr></thead><tbody id="hist"></tbody></table></section>`;
}

function render() {
  renderTabs();
  const e = EQUIPOS.find(x => x.id === ui.tab);
  $("#main").innerHTML = e.id === "dti" ? vistaDTI() : e.id === "plc" ? vistaPLC() : vistaEquipo(e);
  actualizar();
}
function seleccionActual() {
  const e = EQUIPOS.find(x => x.id === ui.tab);
  if (e.id === "plc") return ui.variable.plc;
  if (!e.unidades) return null;
  return ui.variable[e.unidades[ui.unidad[e.id]].id];
}

/* ---------- 6. Actualización cada segundo ---------- */
function actualizar() {
  document.querySelectorAll("[data-live]").forEach(el => {
    const t = el.dataset.live, p = ultimo(t); if (!p) return;
    el.innerHTML = el.classList.contains("v") ? `${fmt(t, p.x)}<small>${V[t].u}</small>` : `${fmt(t, p.x)} ${V[t].u}`;
    el.className = el.className.replace(/\bs-\w+/g, "").trim() + " s-" + p.e.c;
  });
  const sel = seleccionActual();
  if (sel && $("#pv")) {
    const p = ultimo(sel);
    $("#pv").innerHTML = `${fmt(sel, p.x)}<small>${V[sel].u}</small>`; $("#pv").className = "num s-" + p.e.c;
    $("#pvst").textContent = "Estado: " + p.e.t; $("#pvst").className = "s s-" + p.e.c;
    grafica($("#chart"), sel);
    $("#hist").innerHTML = hist[sel].slice(-8).reverse().map(q => `<tr><td>${hora(q.t)}</td><td>${sel}</td><td>${fmt(sel, q.x)} ${V[sel].u}</td><td><span class="pill ${q.e.c}">${q.e.t}</span></td></tr>`).join("");
    if ($("#stats")) {
      const xs = hist[sel].map(q => q.x), avg = xs.reduce((a, b) => a + b, 0) / xs.length;
      $("#stats").innerHTML = [["Promedio", avg], ["Máximo", Math.max(...xs)], ["Mínimo", Math.min(...xs)], ["Variación (máx − mín)", Math.max(...xs) - Math.min(...xs)]]
        .map(([k, x]) => `<div class="row"><span>${k}</span><b>${fmt(sel, x)} ${V[sel].u}</b></div>`).join("") + `<div class="row"><span>Muestras</span><b>${xs.length}</b></div>`;
    }
  }
  if (ui.tab === "dti") {
    const temps = Object.keys(V).filter(t => V[t].u === "°C" && t !== "TT-19").map(t => ultimo(t)).filter(Boolean);
    const activas = Object.keys(V).filter(t => ultimo(t) && ultimo(t).e.c !== "ok").length;
    $("#k-al").textContent = activas; $("#k-al").className = "n " + (activas ? "s-h" : "s-ok");
    $("#k-max").textContent = Math.max(...temps.map(p => p.x)).toLocaleString("es-MX", {maximumFractionDigits:1}) + " °C";
    $("#k-amb").textContent = fmt("TT-19", ultimo("TT-19").x) + " °C";
    document.querySelectorAll("[data-spark]").forEach(cv => grafica(cv, cv.dataset.spark, {mini:true, n:HIST_S}));
    TARJETAS.forEach(([eid, i], k) => { const u = EQUIPOS.find(x => x.id === eid).unidades[i];
      $("#eq-" + k).classList.toggle("alarm", u.vars.some(t => ultimo(t).e.c === "hh" || ultimo(t).e.c === "h")); });
    $("#al-list").innerHTML = alarmas.length ? alarmas.slice(0, 10).map(a => `<div class="a"><span class="time">${hora(a.t)}</span><span class="pill ${a.e.c}">${a.e.t}</span><b style="font-family:var(--mono)">${a.tag}</b><span class="muted">${V[a.tag].d}: ${fmt(a.tag, a.x)} ${V[a.tag].u}</span></div>`).join("")
      : `<div class="empty">Sin alarmas por el momento. Todas las variables dentro de límites.</div>`;
  }
  if ($("#hb")) {
    $("#hb").textContent = heartbeat;
    const s = Math.floor((Date.now() - t0) / 1000); $("#up").textContent = [s / 3600, s / 60 % 60, s % 60].map(n => String(Math.floor(n)).padStart(2, "0")).join(":");
    $("#last").textContent = hora(new Date());
  }
  renderTabs();
}

/* ---------- 7. Eventos ---------- */
document.addEventListener("click", ev => {
  const b = ev.target.closest("[data-tab],[data-unit],[data-var],[data-go]"); if (!b) return;
  if (b.dataset.tab) { ui.tab = b.dataset.tab; window.scrollTo({top:0}); }
  else if (b.dataset.unit) { ui.unidad[ui.tab] = +b.dataset.unit; }
  else if (b.dataset.var) {
    if (ui.tab === "plc") ui.variable.plc = b.dataset.var;
    else { const e = EQUIPOS.find(x => x.id === ui.tab); ui.variable[e.unidades[ui.unidad[e.id]].id] = b.dataset.var; }
  }
  else if (b.dataset.go) { ui.tab = b.dataset.go; ui.unidad[ui.tab] = +b.dataset.ui; window.scrollTo({top:0}); }
  render();
});
$("#fab").addEventListener("click", () => window.scrollTo({top:document.body.scrollHeight, behavior:"smooth"}));
window.addEventListener("resize", actualizar);

// precarga 20 s de historial para que la gráfica arranque llena
t0 = Date.now() - VENTANA * 1000;
for (let k = VENTANA; k > 0; k--) {
  const now = new Date(Date.now() - k * 1000), t = (VENTANA - k);
  for (const tag in V) { const x = leerValor(tag, t); hist[tag].push({t:now, x, e:estado(tag, x)}); }
}
render();
setInterval(() => { $("#clock").textContent = hora(new Date()); }, 250);
setInterval(() => { muestrear(); actualizar(); }, 1000);

/* ---------- Conexión futura a datos reales ----------
   Cuando el puente PLC → base de datos esté listo, sustituir la función
   leerValor(tag, t) por los valores recibidos de la base de datos
   (por ejemplo, una suscripción en tiempo real a la tabla de lecturas),
   usando los mismos tags de este catálogo.                              */

/* =========================================================
   8. Registro tipo base de datos y exportación a Excel
   Cada segundo se guarda una "fotografía" de todas las variables.
   Se conservan hasta 3 600 fotografías (1 hora); las más viejas se descartan.
   El archivo .xlsx se arma en el navegador, sin internet ni librerías.
   ========================================================= */
const REG_MAX = 3600, registro = [];
const equipoDe = {};
EQUIPOS.forEach(e => (e.unidades || []).forEach(u => u.vars.forEach(t => { if (!equipoDe[t]) equipoDe[t] = u.n; })));
equipoDe["TT-19"] = equipoDe["PLC.SCAN"] = "PLC controlador";

function registrar(t) {
  const fila = {t, v:{}, e:{}};
  for (const tag in V) { const p = ultimo(tag); fila.v[tag] = p.x; fila.e[tag] = p.e.t; }
  registro.push(fila); if (registro.length > REG_MAX) registro.shift();
  const c = document.getElementById("cnt"); if (c) c.textContent = (registro.length * Object.keys(V).length).toLocaleString("es-MX");
}
// las 20 lecturas precargadas también entran al registro
for (let k = 0; k < hist["TT-13"].length; k++) {
  const fila = {t:hist["TT-13"][k].t, v:{}, e:{}};
  for (const tag in V) { fila.v[tag] = hist[tag][k].x; fila.e[tag] = hist[tag][k].e.t; }
  registro.push(fila);
}
setInterval(() => registrar(new Date()), 1000);

/* ---- utilidades para el archivo .xlsx ---- */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const serial = d => (d.getTime() - d.getTimezoneOffset() * 60000) / 86400000 + 25569;   // fecha de Excel en hora local
const col = n => { let s = ""; n++; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
// celda: {s:"texto"} | {n:numero, st:estilo} | {d:Date}
function hoja(cab, filas, anchos) {
  const out = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>',
    '<cols>' + anchos.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("") + '</cols><sheetData>'];
  const fila = (r, celdas, cabecera) => `<row r="${r}">` + celdas.map((c, i) => {
    const ref = col(i) + r;
    if (cabecera) return `<c r="${ref}" t="inlineStr" s="1"><is><t>${esc(c)}</t></is></c>`;
    if (c == null) return "";
    if (c.d) return `<c r="${ref}" s="2"><v>${serial(c.d)}</v></c>`;
    if (c.n != null) return `<c r="${ref}" s="${c.st || 0}"><v>${c.n}</v></c>`;
    return `<c r="${ref}" t="inlineStr"><is><t>${esc(c.s)}</t></is></c>`;
  }).join("") + "</row>";
  out.push(fila(1, cab, true));
  filas.forEach((f, i) => out.push(fila(i + 2, f)));
  out.push(`</sheetData><autoFilter ref="A1:${col(cab.length - 1)}${filas.length + 1}"/></worksheet>`);
  return out.join("");
}
function crc32(buf) {
  if (!crc32.t) { crc32.t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crc32.t[n] = c >>> 0; } }
  let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = crc32.t[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0;
}
function zip(archivos) {   // ZIP sin compresión (método "store"), suficiente para .xlsx
  const enc = new TextEncoder(), partes = [], central = []; let off = 0;
  const u16 = n => [n & 255, n >> 8 & 255], u32 = n => [n & 255, n >> 8 & 255, n >> 16 & 255, n >>> 24 & 255];
  archivos.forEach(([nombre, texto]) => {
    const nb = enc.encode(nombre), data = enc.encode(texto), crc = crc32(data);
    const loc = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nb.length), ...u16(0)]);
    partes.push(loc, nb, data);
    central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length),
      ...u16(nb.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), nb);
    off += loc.length + nb.length + data.length;
  });
  const tam = central.reduce((a, b) => a + b.length, 0);
  const fin = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(archivos.length), ...u16(archivos.length), ...u32(tam), ...u32(off), ...u16(0)]);
  return new Blob([...partes, ...central, fin], {type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
}

function exportarExcel() {
  const btn = document.getElementById("btn-xls"); btn.disabled = true;
  setTimeout(() => {
    try {
      const tags = Object.keys(V), ahora = new Date();
      // Hoja 1: Lecturas (formato tabla de base de datos, una fila por lectura)
      const lect = []; let id = 1;
      registro.forEach(f => tags.forEach(tag => lect.push([{n:id++}, {d:f.t}, {s:tag}, {s:equipoDe[tag] || ""}, {s:V[tag].d}, {s:V[tag].tipo},
        {n:+f.v[tag].toFixed(dec(tag)), st:3}, {s:V[tag].u}, {s:f.e[tag]}])));
      // Hoja 2: Tendencias (una fila por segundo, una columna por tag)
      const tend = registro.map(f => [{d:f.t}, ...tags.map(tag => ({n:+f.v[tag].toFixed(dec(tag)), st:3}))]);
      // Hoja 3: Alarmas
      const alm = alarmas.slice().reverse().map((a, i) => [{n:i + 1}, {d:a.t}, {s:a.tag}, {s:equipoDe[a.tag] || ""}, {s:V[a.tag].d}, {n:+a.x.toFixed(dec(a.tag)), st:3}, {s:V[a.tag].u}, {s:a.e.t}]);
      // Hoja 4: Catálogo de tags
      const cat = tags.map(tag => [{s:tag}, {s:equipoDe[tag] || ""}, {s:V[tag].d}, {s:V[tag].tipo}, {s:V[tag].u}, {s:V[tag].sensor}, {n:V[tag].L, st:3}, {n:V[tag].H, st:3}, {n:V[tag].HH, st:3}]);
      // Hoja 5: Resumen
      const res = [[{s:"Sistema"}, {s:"SCADA DTI · Banco de intercambiadores de calor"}], [{s:"Origen de los datos"}, {s:"Simulación con perfiles programados (página piloto)"}],
        [{s:"PLC"}, {s:"Delta DVP12SE11R"}], [{s:"Fecha de exportación"}, {d:ahora}], [{s:"Primera lectura"}, registro.length ? {d:registro[0].t} : {s:"-"}],
        [{s:"Última lectura"}, registro.length ? {d:registro[registro.length - 1].t} : {s:"-"}], [{s:"Intervalo de muestreo"}, {s:"1 segundo"}],
        [{s:"Variables (tags)"}, {n:tags.length}], [{s:"Registros de tiempo"}, {n:registro.length}], [{s:"Lecturas totales"}, {n:lect.length}], [{s:"Alarmas registradas"}, {n:alm.length}]];
      const hojas = [
        ["Resumen", hoja(["Concepto", "Valor"], res, [26, 56])],
        ["Lecturas", hoja(["id", "fecha_hora", "tag", "equipo", "descripcion", "tipo", "valor", "unidad", "estado"], lect, [9, 20, 11, 24, 40, 13, 11, 9, 16])],
        ["Tendencias", hoja(["fecha_hora", ...tags.map(t => `${t} (${V[t].u})`)], tend, [20, ...tags.map(() => 14)])],
        ["Alarmas", hoja(["id", "fecha_hora", "tag", "equipo", "descripcion", "valor", "unidad", "estado"], alm, [7, 20, 11, 24, 40, 11, 9, 16])],
        ["Catalogo_tags", hoja(["tag", "equipo", "descripcion", "tipo", "unidad", "sensor", "limite_L", "limite_H", "limite_HH"], cat, [11, 24, 40, 13, 9, 24, 11, 11, 11])]];
      const archivos = [
        ["[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
          + hojas.map((h, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("") + '</Types>'],
        ["_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
        ["xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
          + hojas.map((h, i) => `<sheet name="${h[0]}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") + '</sheets>'
          + '</workbook>'],
        ["xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
          + hojas.map((h, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")
          + `<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
        ["xl/styles.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="yyyy-mm-dd hh:mm:ss"/><numFmt numFmtId="165" formatCode="0.00"/></numFmts>'
          + '<fonts count="2"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts>'
          + '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F4E78"/></patternFill></fill></fills>'
          + '<borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
          + '<cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'],
        ...hojas.map((h, i) => [`xl/worksheets/sheet${i + 1}.xml`, h[1]])];
      const blob = zip(archivos), a = document.createElement("a"), p2 = n => String(n).padStart(2, "0");
      a.href = URL.createObjectURL(blob);
      a.download = `SCADA_DTI_registros_${ahora.getFullYear()}-${p2(ahora.getMonth() + 1)}-${p2(ahora.getDate())}_${p2(ahora.getHours())}${p2(ahora.getMinutes())}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } finally { btn.disabled = false; }
  }, 30);
}
document.getElementById("btn-xls").addEventListener("click", exportarExcel);
