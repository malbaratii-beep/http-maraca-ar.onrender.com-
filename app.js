const mv = document.querySelector('model-viewer');
const color = document.getElementById('color');

color.addEventListener('input', async ()=>{
  await mv.updateComplete;
  const m = mv.model?.materials?.[0];
  if(!m) return;
  const r=parseInt(color.value.substr(1,2),16)/255;
  const g=parseInt(color.value.substr(3,2),16)/255;
  const b=parseInt(color.value.substr(5,2),16)/255;
  m.pbrMetallicRoughness.setBaseColorFactor([r,g,b,1]);
});
