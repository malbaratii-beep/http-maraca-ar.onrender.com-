
(function(){
  const $ = (q, el=document)=>el.querySelector(q);
  const $$ = (q, el=document)=>Array.from(el.querySelectorAll(q));

  // Language toggle (simple)
  const langBtn = document.getElementById("langToggle");
  const langKey = "maraca_lang";
  function applyLang(lang){
    document.documentElement.dir = (lang==="ar") ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    $$(".i18n").forEach(el=>{
      const v = el.getAttribute("data-"+lang);
      if(v) el.textContent = v;
    });
    $$(".i18n-ph").forEach(el=>{
      const v = el.getAttribute("data-"+lang);
      if(v) el.setAttribute("placeholder", v);
    });
    if(langBtn) langBtn.textContent = (lang==="ar") ? "عربي / EN" : "EN / عربي";
  }
  const saved = localStorage.getItem(langKey) || "en";
  applyLang(saved);
  if(langBtn){
    langBtn.addEventListener("click", ()=>{
      const next = (document.documentElement.lang==="en") ? "ar" : "en";
      localStorage.setItem(langKey, next);
      applyLang(next);
    });
  }

  // Configurator logic (only on mk01.html)
  const priceEl = document.getElementById("price");
  if(!priceEl) return;

  const state = {
    wood: "Walnut",
    finish: "Matte Black",
    kitchenType: "Linear + Island",
    color: "Matte Black",
    appliances: { oven:true, cooktop:true, dishwasher:false, hood:true, fridge:true },
    shelves: 6,
    drawers: 5,
    tallUnits: 2,
    baseUnits: 6,
    wallUnits: 5
  };

  function moneyEGP(n){
    return new Intl.NumberFormat("en-EG").format(Math.round(n)) + " EGP";
  }

  function calc(){
    let base = 98000;

    // kitchen type
    const type = $("#kitchenType").value;
    base += (type.includes("U-Shape") ? 18000 : type.includes("L-Shape") ? 12000 : 8000);

    // wood
    const wood = state.wood;
    base += (wood==="MDF" ? 0 : wood==="HPL" ? 9000 : 16000);

    // finish premium
    const fin = $("#finish").value;
    base += (fin.includes("High Gloss") ? 6500 : fin.includes("Soft Touch") ? 8500 : 0);

    // counts
    base += state.shelves * 420;
    base += state.drawers * 1050;
    base += state.tallUnits * 4800;
    base += state.baseUnits * 2100;
    base += state.wallUnits * 1700;

    // appliances
    if(state.appliances.oven) base += 9500;
    if(state.appliances.cooktop) base += 5200;
    if(state.appliances.dishwasher) base += 7800;
    if(state.appliances.hood) base += 3900;
    if(state.appliances.fridge) base += 14800;

    // small design premium
    base *= 1.06;

    priceEl.textContent = moneyEGP(base);
  }

  function setActive(groupSel, value){
    $$(groupSel+" .chip").forEach(btn=>{
      btn.classList.toggle("active", btn.dataset.value===value);
    });
  }

  // wood chips
  $$("#woodGroup .chip").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      state.wood = btn.dataset.value;
      setActive("#woodGroup", state.wood);
      calc();
    });
  });
  setActive("#woodGroup", state.wood);

  // color swatches (visual only)
  $$("#colorGroup .swatch").forEach(sw=>{
    sw.addEventListener("click", ()=>{
      state.color = sw.dataset.value;
      $$("#colorGroup .swatch").forEach(s=>s.classList.remove("active"));
      sw.classList.add("active");
      calc();
    });
  });
  const firstSw = $("#colorGroup .swatch"); if(firstSw) firstSw.classList.add("active");

  // appliances
  ["oven","cooktop","dishwasher","hood","fridge"].forEach(k=>{
    const el = document.getElementById(k);
    if(el){
      el.checked = !!state.appliances[k];
      el.addEventListener("change", ()=>{
        state.appliances[k]=el.checked;
        calc();
      });
    }
  });

  // steppers
  function hookStepper(key, min, max){
    const wrap = document.querySelector(`[data-stepper="${key}"]`);
    if(!wrap) return;
    const valEl = wrap.querySelector(".val");
    const minus = wrap.querySelector(".minus");
    const plus = wrap.querySelector(".plus");
    function render(){ valEl.textContent = state[key]; calc(); }
    minus.addEventListener("click", ()=>{ state[key]=Math.max(min, state[key]-1); render(); });
    plus.addEventListener("click", ()=>{ state[key]=Math.min(max, state[key]+1); render(); });
    render();
  }
  hookStepper("shelves", 0, 16);
  hookStepper("drawers", 0, 16);
  hookStepper("tallUnits", 0, 8);
  hookStepper("baseUnits", 2, 18);
  hookStepper("wallUnits", 0, 18);

  // selects
  ["kitchenType","finish"].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.addEventListener("change", calc);
  });

  // actions
  const cartBtn = document.getElementById("addToCart");
  const arBtn = document.getElementById("arBtn");
  if(cartBtn){
    cartBtn.addEventListener("click", ()=>{
      cartBtn.textContent = (document.documentElement.lang==="ar") ? "تمت الإضافة ✓" : "Added ✓";
      setTimeout(()=>cartBtn.textContent = (document.documentElement.lang==="ar") ? "أضف إلى السلة" : "Add to Cart", 1200);
    });
  }
  if(arBtn){
    arBtn.addEventListener("click", ()=>{
      alert((document.documentElement.lang==="ar")
        ? "AR Demo: على الآيباد افتح الصفحة في Safari واضغط View in Your Space (قريباً نربط نموذج 3D حقيقي)."
        : "AR Demo: On iPad open this page in Safari and tap View in Your Space (we'll hook a real 3D model next)."
      );
    });
  }

  calc();
})();
