
let lang = "en";
const home = document.getElementById("home");
const kitchens = document.getElementById("kitchens");
const kitchen = document.getElementById("kitchen");

function goHome(){home.classList.remove("hidden");kitchens.classList.add("hidden");kitchen.classList.add("hidden");}
function goKitchens(){home.classList.add("hidden");kitchens.classList.remove("hidden");kitchen.classList.add("hidden");}
function goKitchen(){home.classList.add("hidden");kitchens.classList.add("hidden");kitchen.classList.remove("hidden");}

document.getElementById("langBtn").onclick=()=>{
  lang = lang==="en"?"ar":"en";
  document.querySelectorAll("[data-en]").forEach(el=>{
    el.textContent = el.dataset[lang];
  });
};

const doors=document.getElementById("doors");
const drawers=document.getElementById("drawers");
const price=document.getElementById("price");

function updatePrice(){
  let p=120000+doors.value*1500+drawers.value*2000;
  price.textContent=(lang==="en"?"Estimated Price: ":"السعر التقريبي: ")+p.toLocaleString()+" EGP";
}
doors.oninput=updatePrice;
drawers.oninput=updatePrice;
