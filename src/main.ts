import '@google/model-viewer';
import { setupArExperiment } from './ar-experiment.js';
import './style.css';
const url = `${import.meta.env.BASE_URL}models/bowling-ball.glb`;
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header><strong>◉ AR LAB</strong><nav><a href="#experimentos">Experimentos</a><a href="#metodologia">Metodología</a></nav></header>
<main><section class="hero"><p class="eyebrow">LABORATORIO EXPERIMENTAL · 2026</p><h1>Una idea.<br><em>Tres tecnologías.</em></h1><p>Comparamos maneras de implementar realidad aumentada, desde una solución web sencilla hasta una aplicación nativa Android.</p><span class="chip">Prototipo educativo · no es entrega oficial</span></section>
<section id="experimentos"><div class="section-title"><p class="eyebrow">EXPERIMENTO 01 / BÁSICO</p><h2>Model Viewer</h2><p>Gira la bola de boliche y prueba la visualización en tu espacio desde Android compatible.</p></div><model-viewer alt="Bola de boliche 3D de prueba" src="${url}" camera-controls auto-rotate ar ar-modes="webxr" shadow-intensity="1" exposure="1" touch-action="pan-y"><button class="cta" slot="ar-button">Ver en mi espacio ↗</button></model-viewer><p class="diagnostic" id="model-status" role="status">Modo 3D listo. Presiona «Ver en mi espacio» para probar WebXR.</p><p class="hint">Esta prueba usa WebXR dentro de Chrome para evitar abrir la app de Google. Se requiere Android y servicios AR compatibles.</p></section>
<section><div class="section-title"><p class="eyebrow">EXPERIMENTO 02 / INTERMEDIO</p><h2>Three.js + WebXR</h2><p>Escena 3D interactiva. En dispositivos compatibles, coloca una esfera en superficies reales mediante WebXR.</p></div><div id="canvas-host"></div><div id="ar-button-host"></div><p class="diagnostic" id="ar-status" role="status">Modo 3D listo. Aún no se ha iniciado AR.</p><p class="hint">En modo AR, mueve el dispositivo para detectar una superficie y toca la pantalla para colocar el objeto.</p></section>
<section><div class="section-title"><p class="eyebrow">EXPERIMENTO 03 / AVANZADO</p><h2>Android + ARCore</h2><p>Aplicación nativa Android que se implementará y evaluará en una fase posterior.</p></div><div class="pending">Pendiente · No hay APK disponible todavía</div></section>
<section id="metodologia"><p class="eyebrow">METODOLOGÍA</p><h2>¿Cómo comparamos?</h2><div class="criteria"><article><b>01</b><h3>Tiempo</h3><p>Preparación y desarrollo real.</p></article><article><b>02</b><h3>Compatibilidad</h3><p>Dispositivos, navegadores y permisos.</p></article><article><b>03</b><h3>Complejidad</h3><p>Herramientas y conocimientos necesarios.</p></article><article><b>04</b><h3>Reutilización</h3><p>Capacidad de trabajar con otros modelos.</p></article></div><p class="hint">Se realizó una primera prueba en Android; aún faltan validar las correcciones y medir resultados.</p></section></main><footer>AR LAB · INVESTIGACIÓN INDEPENDIENTE · 2026</footer>`;

const viewer=document.querySelector('model-viewer');
const modelStatus=document.querySelector<HTMLElement>('#model-status')!;
const viewerNote=document.createElement('div');
viewerNote.id='viewer-ar-note';
viewerNote.textContent='Sesión WebXR iniciada. Mueve el teléfono hasta colocar el modelo.';
viewer?.append(viewerNote);
viewer?.addEventListener('load',()=>{
 modelStatus.textContent='Modelo GLB cargado. Presiona «Ver en mi espacio» para probar WebXR.';
});
viewer?.addEventListener('ar-status',(event:Event)=>{
 const status=(event as CustomEvent<{status:string}>).detail?.status;
 const descriptions:Record<string,string>={
  'session-started':'Sesión WebXR iniciada. Mueve el teléfono para encontrar una superficie.',
  'object-placed':'Model Viewer informó «object-placed». Comprueba si el modelo es visible; este estado no lo garantiza.',
  'failed':'No se pudo iniciar la realidad aumentada. Comprueba los Servicios de Google Play para RA y Chrome.',
  'not-presenting':'La sesión de realidad aumentada terminó.'
 };
 if(status){
  modelStatus.textContent=descriptions[status]??'Estado WebXR: '+status;
  viewerNote.textContent=modelStatus.textContent;
 }
});
viewer?.addEventListener('ar-tracking',(event:Event)=>{
 const tracking=(event as CustomEvent<{status:string}>).detail?.status;
 if(tracking==='not-tracking')modelStatus.textContent='WebXR activo, pero sin seguimiento. Apunta a una superficie iluminada con textura.';
 if(tracking==='tracking')modelStatus.textContent='Seguimiento WebXR recuperado. Mueve el teléfono para colocar el modelo.';
 viewerNote.textContent=modelStatus.textContent;
});
viewer?.addEventListener('error',(event:Event)=>{
 const detail=(event as CustomEvent<{type?:string}>).detail;
 modelStatus.textContent=`Error de Model Viewer: ${detail?.type??'desconocido'}.`;
});
setupArExperiment();
