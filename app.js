// MARACA Showcase — static prototype (no backend)
// Goal: feel like "final app" with real navigation + configurator + pricing.
// Later we swap the viewer with real 3D models + AR + backend rules.

const view = document.getElementById('view');
const crumb = document.getElementById('crumb');
const shareBtn = document.getElementById('shareBtn');
const demoModeBtn = document.getElementById('demoModeBtn');

const money = new Intl.NumberFormat('en-EG', { style:'currency', currency:'EGP', maximumFractionDigits:0 });

const state = {
  route: '/home',
  showroom: false,
  kitchen: {
    layout: 'L-Shape (20 m²)',
    wood: 'MDF',
    color: '#DE7A31',
    top: 'Quartz',
    handles: 'Minimal Black',
    modules: {
      baseUnits: 8,
      wallUnits: 6,
      drawers: 5,
      tallUnit: 1,
      oven: true,
      microwave: true,
      hob: true,
      dishwasher: true,
      washer: false
    }
  }
};

const pricing = {
  baseProject: 85000,
  woodMultiplier: { 'MDF': 1.00, 'HPL': 1.20 },
  topMultiplier: { 'Laminate': 1.00, 'Quartz': 1.35 },
  module: {
    baseUnit: 3800,
    wallUnit: 2400,
    drawer: 1400,
    tallUnit: 10500
  },
  appliances: {
    oven: 12000,
    microwave: 6500,
    hob: 9000,
    dishwasher: 14500,
    washer: 11000
  }
};

const colors = [
  { name:'MARACA Orange', hex:'#DE7A31' },
  { name:'Deep Black', hex:'#0B0B0E' },
  { name:'Ivory', hex:'#F3EDE2' },
  { name:'Stone Gray', hex:'#7B7F8A' },
  { name:'Sage', hex:'#6B7C6F' },
  { name:'Navy', hex:'#122129' }
];

function setToast(msg){
  let t = document.querySelector('.toast');
  if (!t){
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> t.style.display='none', 2200);
}

function calcKitchenPrice(){
  const k = state.kitchen;
  let total = pricing.baseProject;

  total += k.modules.baseUnits * pricing.module.baseUnit;
  total += k.modules.wallUnits * pricing.module.wallUnit;
  total += k.modules.drawers * pricing.module.drawer;
  total += k.modules.tallUnit * pricing.module.tallUnit;

  for (const [key, on] of Object.entries(k.modules)){
    if (pricing.appliances[key] && on) total += pricing.appliances[key];
  }

  total = Math.round(total * (pricing.woodMultiplier[k.wood] ?? 1));
  total = Math.round(total * (pricing.topMultiplier[k.top] ?? 1));
  return total;
}

function setRoute(hash){
  const r = (hash || '#/home').replace('#','');
  state.route = r.startsWith('/') ? r : '/home';
  render();
}

function navActive(){
  document.querySelectorAll('.navItem').forEach(a=>{
    const href = a.getAttribute('href')?.replace('#','') || '';
    a.classList.toggle('active', href === state.route);
  });
}

function render(){
  navActive();
  document.body.classList.toggle('showroom', state.showroom);

  const r = state.route;

  if (r === '/home') return renderHome();
  if (r === '/kitchens') return renderKitchens();
  if (r === '/bedrooms') return renderPlaceholder('Bedrooms', 'Bedroom sets are next after kitchens (your focus).');
  if (r === '/furniture') return renderPlaceholder('Furniture', 'Living rooms & custom pieces can plug into the same configurator system.');
  if (r === '/quotes') return renderQuotes();
  if (r === '/about') return renderAbout();

  return renderHome();
}

function renderHome(){
  crumb.textContent = 'Home';
  view.innerHTML = `
    <div class="grid2">
      <div class="card">
        <div class="cardPad">
          <h2 class="h1">MARACA — The app-first furniture brand</h2>
          <p class="p">
            This is a <b>showcase prototype</b> that looks and behaves like the final app:
            categories, a real kitchen configurator, and instant pricing.
            Next step is replacing the 2D/3D placeholder viewer with <b>true AR room scanning</b>.
          </p>

          <div class="badges">
            <div class="badge">Bold & Exclusive identity</div>
            <div class="badge">Made-to-measure</div>
            <div class="badge">AR-ready roadmap</div>
            <div class="badge">Factory-backed execution</div>
          </div>

          <div class="kpis">
            <div class="kpi"><b>1</b><span>Featured Kitchen (20 m²)</span></div>
            <div class="kpi"><b>2</b><span>Wood Types (demo)</span></div>
            <div class="kpi"><b>6</b><span>Color Options</span></div>
          </div>

          <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap">
            <a class="btn" href="#/kitchens">Open Kitchens</a>
            <button class="btn ghost" type="button" id="whyBtn">What is next?</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="viewer">
          <div class="canvasWrap">
            <canvas id="heroCanvas" width="700" height="420"></canvas>
          </div>
          <div class="viewerHint">Preview placeholder — we will swap this with real 3D kitchen models.</div>
        </div>
        <div class="cardPad">
          <div class="sectionTitle">Today’s goal</div>
          <div class="small">
            Impress your partner with a clean, modern “final-like” UI for MARACA,
            then we move into Unity AR (real scanning + real configuration).
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('whyBtn').onclick = () => {
    setToast('Next: add 3D kitchen model + AR button, then connect to pricing rules & order flow.');
  };

  drawHero();
}

function renderKitchens(){
  crumb.textContent = 'Kitchens';
  const price = calcKitchenPrice();

  view.innerHTML = `
    <div class="grid2">
      <div class="card">
        <div class="viewer">
          <div class="canvasWrap">
            <canvas id="kCanvas" width="900" height="520"></canvas>
          </div>
          <div class="viewerHint">Drag not required — use controls to customize.</div>
        </div>
        <div class="cardPad">
          <div class="sectionTitle">Featured Kitchen</div>
          <div class="itemRow" style="margin-top:10px">
            <div class="thumb"></div>
            <div class="meta">
              <b>Modern ${escapeHtml(state.kitchen.layout)}</b>
              <span>Modular • Fast production • Premium finish</span>
            </div>
            <div class="right">
              <div class="price">${money.format(price)}</div>
              <div class="small">Instant estimate</div>
            </div>
          </div>
          <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap">
            <button class="btn" id="saveQuoteBtn" type="button">Save Quote</button>
            <button class="btn ghost" id="arBtn" type="button">AR (next phase)</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="cardPad">
          <div class="sectionTitle">Customize</div>
          <div class="controls">

            <div class="row2">
              <div>
                <label>Layout</label>
                <select id="layout">
                  <option ${sel(state.kitchen.layout,'L-Shape (20 m²)')}>L-Shape (20 m²)</option>
                  <option ${sel(state.kitchen.layout,'I-Shape (20 m²)')}>I-Shape (20 m²)</option>
                </select>
              </div>
              <div>
                <label>Wood Type</label>
                <select id="wood">
                  <option ${sel(state.kitchen.wood,'MDF')}>MDF</option>
                  <option ${sel(state.kitchen.wood,'HPL')}>HPL</option>
                </select>
              </div>
            </div>

            <div class="row2">
              <div>
                <label>Countertop</label>
                <select id="top">
                  <option ${sel(state.kitchen.top,'Laminate')}>Laminate</option>
                  <option ${sel(state.kitchen.top,'Quartz')}>Quartz</option>
                </select>
              </div>
              <div>
                <label>Handles</label>
                <select id="handles">
                  <option ${sel(state.kitchen.handles,'Minimal Black')}>Minimal Black</option>
                  <option ${sel(state.kitchen.handles,'Gold Line')}>Gold Line</option>
                </select>
              </div>
            </div>

            <div>
              <label>Main Color</label>
              <div class="colorRow" id="swatches"></div>
            </div>

            <div class="row2">
              <div>
                <label>Base Units</label>
                <input id="baseUnits" type="range" min="6" max="12" value="${state.kitchen.modules.baseUnits}">
                <div class="small">Value: <span id="baseUnitsVal">${state.kitchen.modules.baseUnits}</span></div>
              </div>
              <div>
                <label>Wall Units</label>
                <input id="wallUnits" type="range" min="4" max="10" value="${state.kitchen.modules.wallUnits}">
                <div class="small">Value: <span id="wallUnitsVal">${state.kitchen.modules.wallUnits}</span></div>
              </div>
            </div>

            <div class="row2">
              <div>
                <label>Drawers</label>
                <input id="drawers" type="range" min="2" max="10" value="${state.kitchen.modules.drawers}">
                <div class="small">Value: <span id="drawersVal">${state.kitchen.modules.drawers}</span></div>
              </div>
              <div>
                <label>Tall Unit</label>
                <input id="tallUnit" type="range" min="0" max="2" value="${state.kitchen.modules.tallUnit}">
                <div class="small">Value: <span id="tallUnitVal">${state.kitchen.modules.tallUnit}</span></div>
              </div>
            </div>

            <div class="sectionTitle" style="margin-top:6px">Appliances</div>
            <div class="list" id="appliances"></div>

            <div class="card" style="border-radius:16px">
              <div class="cardPad">
                <div class="sectionTitle">Price</div>
                <div style="display:flex; justify-content:space-between; align-items:end; gap:10px">
                  <div>
                    <div style="font-size:24px; font-weight:900" id="priceBox">${money.format(price)}</div>
                    <div class="small">Demo estimate (we’ll swap to factory rules later).</div>
                  </div>
                  <button class="btn ghost" id="resetBtn" type="button">Reset</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;

  bindKitchenControls();
  drawKitchen();
}

function renderQuotes(){
  crumb.textContent = 'Quotes';
  const saved = JSON.parse(localStorage.getItem('maraca_quotes') || '[]');
  view.innerHTML = `
    <div class="card">
      <div class="cardPad">
        <div class="sectionTitle">Saved Quotes</div>
        ${saved.length ? '' : `<div class="small">No quotes yet. Open Kitchens and click “Save Quote”.</div>`}
        <div class="list" style="margin-top:10px">
          ${saved.map(q => `
            <div class="itemRow">
              <div class="thumb"></div>
              <div class="meta">
                <b>${escapeHtml(q.title)}</b>
                <span>${escapeHtml(q.when)}</span>
              </div>
              <div class="right">
                <div class="price">${money.format(q.total)}</div>
                <div class="small">${escapeHtml(q.wood)} • ${escapeHtml(q.top)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderAbout(){
  crumb.textContent = 'About';
  view.innerHTML = `
    <div class="card">
      <div class="cardPad">
        <h2 class="h1">About MARACA</h2>
        <p class="p">
          MARACA is a furniture brand built around an app-first experience:
          scan the space, configure the product, see it in AR, then manufacture and install from our factory.
          The identity is <b>bold and exclusive</b>, with premium finishing and accurate measurement flow.
        </p>

        <div class="badges">
          <div class="badge">Yemen × Egypt story</div>
          <div class="badge">AR-first roadmap</div>
          <div class="badge">Factory production</div>
        </div>

        <div style="margin-top:14px" class="small">
          This build is a <b>free showcase prototype</b> for partner presentation.
          Next: Unity AR Foundation version (real room scan + real 3D assets + backend pricing).
        </div>
      </div>
    </div>
  `;
}

function renderPlaceholder(title, msg){
  crumb.textContent = title;
  view.innerHTML = `
    <div class="card">
      <div class="cardPad">
        <h2 class="h1">${escapeHtml(title)}</h2>
        <p class="p">${escapeHtml(msg)}</p>
        <div style="margin-top:12px">
          <a class="btn" href="#/kitchens">Go to Kitchens</a>
        </div>
      </div>
    </div>
  `;
}

function bindKitchenControls(){
  const layout = document.getElementById('layout');
  const wood = document.getElementById('wood');
  const top = document.getElementById('top');
  const handles = document.getElementById('handles');

  layout.onchange = () => { state.kitchen.layout = layout.value; redrawKitchenUI(); };
  wood.onchange = () => { state.kitchen.wood = wood.value; redrawKitchenUI(); };
  top.onchange = () => { state.kitchen.top = top.value; redrawKitchenUI(); };
  handles.onchange = () => { state.kitchen.handles = handles.value; redrawKitchenUI(); };

  const sw = document.getElementById('swatches');
  sw.innerHTML = '';
  for (const c of colors){
    const d = document.createElement('div');
    d.className = 'swatch' + (c.hex === state.kitchen.color ? ' active' : '');
    d.style.background = c.hex;
    d.title = c.name;
    d.onclick = () => { state.kitchen.color = c.hex; redrawKitchenUI(); };
    sw.appendChild(d);
  }

  const sliders = [
    ['baseUnits', 'baseUnitsVal'],
    ['wallUnits', 'wallUnitsVal'],
    ['drawers', 'drawersVal'],
    ['tallUnit', 'tallUnitVal']
  ];
  for (const [id, valId] of sliders){
    const el = document.getElementById(id);
    const val = document.getElementById(valId);
    el.oninput = () => {
      state.kitchen.modules[id] = parseInt(el.value,10);
      val.textContent = el.value;
      redrawKitchenUI();
    };
  }

  const applianceList = document.getElementById('appliances');
  const ap = [
    ['oven','Built-in Oven'],
    ['microwave','Microwave Slot'],
    ['hob','Cooktop / Hob'],
    ['dishwasher','Dishwasher Slot'],
    ['washer','Washer Slot']
  ];
  applianceList.innerHTML = '';
  for (const [key, label] of ap){
    const on = !!state.kitchen.modules[key];
    const row = document.createElement('div');
    row.className = 'itemRow';
    row.innerHTML = `
      <div class="meta">
        <b>${escapeHtml(label)}</b>
        <span>${pricing.appliances[key] ? money.format(pricing.appliances[key]) : ''}</span>
      </div>
      <div class="right">
        <button class="btn ghost" type="button">${on ? 'On' : 'Off'}</button>
      </div>
    `;
    row.querySelector('button').onclick = () => {
      state.kitchen.modules[key] = !state.kitchen.modules[key];
      bindKitchenControls(); // refresh list UI
      redrawKitchenUI();
    };
    applianceList.appendChild(row);
  }

  document.getElementById('resetBtn').onclick = () => {
    state.kitchen = {
      layout: 'L-Shape (20 m²)',
      wood: 'MDF',
      color: '#DE7A31',
      top: 'Quartz',
      handles: 'Minimal Black',
      modules: {
        baseUnits: 8,
        wallUnits: 6,
        drawers: 5,
        tallUnit: 1,
        oven: true,
        microwave: true,
        hob: true,
        dishwasher: true,
        washer: false
      }
    };
    renderKitchens();
  };

  document.getElementById('arBtn').onclick = () => {
    setToast('AR is in the Unity version (phase 2). This page is the “final-looking” prototype.');
  };

  document.getElementById('saveQuoteBtn').onclick = () => {
    const total = calcKitchenPrice();
    const saved = JSON.parse(localStorage.getItem('maraca_quotes') || '[]');
    saved.unshift({
      title: `Kitchen • ${state.kitchen.layout}`,
      when: new Date().toLocaleString(),
      total,
      wood: state.kitchen.wood,
      top: state.kitchen.top
    });
    localStorage.setItem('maraca_quotes', JSON.stringify(saved.slice(0,10)));
    setToast('Saved to Quotes.');
  };
}

function redrawKitchenUI(){
  // update swatches selection
  document.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('active', rgbToHex(window.getComputedStyle(s).backgroundColor) === state.kitchen.color.toLowerCase());
  });

  const total = calcKitchenPrice();
  const box = document.getElementById('priceBox');
  if (box) box.textContent = money.format(total);

  drawKitchen();
}

function drawHero(){
  const c = document.getElementById('heroCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W=c.width, H=c.height;

  ctx.clearRect(0,0,W,H);

  // background
  const g = ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,'rgba(222,122,49,0.10)');
  g.addColorStop(1,'rgba(255,255,255,0.02)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // simple "kitchen silhouette"
  const accent = state.kitchen.color || '#DE7A31';
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  rounded(ctx, 80, 190, 520, 90, 18);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  rounded(ctx, 120, 120, 260, 55, 16); ctx.fill();
  rounded(ctx, 410, 120, 160, 55, 16); ctx.fill();

  ctx.fillStyle = accent;
  rounded(ctx, 120, 220, 140, 40, 14); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  rounded(ctx, 270, 220, 300, 40, 14); ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '800 18px ui-sans-serif, system-ui';
  ctx.fillText('KITCHEN CONFIGURATOR', 120, 85);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '500 12px ui-sans-serif, system-ui';
  ctx.fillText('Prototype UI • pricing • materials • modules', 120, 105);
}

function drawKitchen(){
  const c = document.getElementById('kCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const W=c.width, H=c.height;
  ctx.clearRect(0,0,W,H);

  // bg
  const bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'rgba(222,122,49,0.10)');
  bg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,W,H);

  // draw “room”
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  rounded(ctx, 70, 60, W-140, H-120, 22); ctx.fill();

  // kitchen blocks
  const k = state.kitchen;
  const accent = k.color;
  const base = k.modules.baseUnits;
  const wall = k.modules.wallUnits;
  const drawers = k.modules.drawers;

  // base line length proportional
  const baseLen = 360 + (base-6)*22;
  const wallLen = 280 + (wall-4)*20;

  // layout
  const isL = k.layout.startsWith('L');

  // base cabinets
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  rounded(ctx, 160, 320, baseLen, 70, 16); ctx.fill();
  if (isL){
    rounded(ctx, 160, 220, 70, 170, 16); ctx.fill();
  }

  // accent fronts
  ctx.fillStyle = accent;
  rounded(ctx, 178, 338, Math.max(120, drawers*32), 34, 12); ctx.fill();

  // wall cabinets
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  rounded(ctx, 160, 130, wallLen, 54, 16); ctx.fill();
  if (isL){
    rounded(ctx, 160, 130, 54, 130, 16); ctx.fill();
  }

  // countertop hint
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(160, 312);
  ctx.lineTo(160+baseLen, 312);
  if (isL){
    ctx.lineTo(160+baseLen, 252);
    ctx.lineTo(160, 252);
  }
  ctx.stroke();

  // appliances icons (simple)
  drawIcon(ctx, 520, 335, k.modules.oven, 'Oven');
  drawIcon(ctx, 580, 335, k.modules.hob, 'Hob');
  drawIcon(ctx, 640, 335, k.modules.dishwasher, 'DW');

  // labels
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '800 18px ui-sans-serif, system-ui';
  ctx.fillText('KITCHEN (20 m²) — LIVE CONFIG', 120, 105);

  ctx.fillStyle = 'rgba(255,255,255,0.50)';
  ctx.font = '600 12px ui-sans-serif, system-ui';
  ctx.fillText(`Wood: ${k.wood} • Top: ${k.top} • Handles: ${k.handles}`, 120, 125);

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText(`Base units: ${base} • Wall units: ${wall} • Drawers: ${drawers}`, 120, 145);

  // price badge
  const total = calcKitchenPrice();
  ctx.fillStyle = 'rgba(10,10,14,0.65)';
  rounded(ctx, W-280, 92, 200, 46, 14); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '900 16px ui-sans-serif, system-ui';
  ctx.fillText(money.format(total), W-265, 122);
}

function drawIcon(ctx, x, y, on, label){
  ctx.fillStyle = on ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)';
  rounded(ctx, x, y, 46, 46, 14); ctx.fill();
  ctx.strokeStyle = on ? 'rgba(124,255,201,0.55)' : 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = on ? 'rgba(124,255,201,0.85)' : 'rgba(255,255,255,0.35)';
  ctx.font = '900 12px ui-sans-serif, system-ui';
  ctx.fillText(label, x+8, y+28);
}

function rounded(ctx, x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function escapeHtml(s){
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

function sel(cur, val){ return cur===val ? 'selected' : ''; }

// Convert rgb(...) to hex for swatch compare
function rgbToHex(rgb){
  const m = rgb.match(/(\d+)/g);
  if (!m || m.length < 3) return rgb.toLowerCase();
  const r = Number(m[0]).toString(16).padStart(2,'0');
  const g = Number(m[1]).toString(16).padStart(2,'0');
  const b = Number(m[2]).toString(16).padStart(2,'0');
  return ('#'+r+g+b).toLowerCase();
}

/* Top actions */
shareBtn.onclick = async () => {
  const url = location.href;
  try{
    await navigator.clipboard.writeText(url);
    setToast('Link copied.');
  }catch{
    prompt('Copy this link:', url);
  }
};

demoModeBtn.onclick = () => {
  state.showroom = !state.showroom;
  setToast(state.showroom ? 'Showroom Mode ON' : 'Showroom Mode OFF');
  render();
};

/* Router */
window.addEventListener('hashchange', () => setRoute(location.hash));
setRoute(location.hash || '#/home');
