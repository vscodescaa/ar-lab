import '@google/model-viewer';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import './style.css';
const url = `${import.meta.env.BASE_URL}models/bowling-ball.glb`;
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header><strong>◉ AR LAB</strong><nav><a href="#experimentos">Experimentos</a><a href="#metodologia">Metodología</a></nav></header>
<main><section class="hero"><p class="eyebrow">LABORATORIO EXPERIMENTAL · 2026</p><h1>Una idea.<br><em>Tres tecnologías.</em></h1><p>Comparamos maneras de implementar realidad aumentada, desde una solución web sencilla hasta una aplicación nativa Android.</p><span class="chip">Prototipo educativo · no es entrega oficial</span></section>
<section id="experimentos"><div class="section-title"><p class="eyebrow">EXPERIMENTO 01 / BÁSICO</p><h2>Model Viewer</h2><p>Gira la bola de boliche y prueba la visualización en tu espacio desde Android compatible.</p></div><model-viewer alt="Bola de boliche 3D de prueba" src="${url}" camera-controls auto-rotate ar ar-modes="webxr" shadow-intensity="1" exposure="1" touch-action="pan-y"><button class="cta" slot="ar-button">Ver en mi espacio ↗</button></model-viewer><p class="diagnostic" id="model-status" role="status">Modo 3D listo. Presiona «Ver en mi espacio» para probar WebXR.</p><p class="hint">Esta prueba usa WebXR dentro de Chrome para evitar abrir la app de Google. Se requiere Android y servicios AR compatibles.</p></section>
<section><div class="section-title"><p class="eyebrow">EXPERIMENTO 02 / INTERMEDIO</p><h2>Three.js + WebXR</h2><p>Escena 3D interactiva. En dispositivos compatibles, coloca una esfera en superficies reales mediante WebXR.</p></div><div id="canvas-host"></div><div id="ar-button-host"></div><p class="diagnostic" id="ar-status" role="status">Modo 3D listo. Aún no se ha iniciado AR.</p><p class="hint">En modo AR, mueve el dispositivo para detectar una superficie y toca la pantalla para colocar el objeto.</p></section>
<section><div class="section-title"><p class="eyebrow">EXPERIMENTO 03 / AVANZADO</p><h2>Android + ARCore</h2><p>Aplicación nativa Android que se implementará y evaluará en una fase posterior.</p></div><div class="pending">Pendiente · No hay APK disponible todavía</div></section>
<section id="metodologia"><p class="eyebrow">METODOLOGÍA</p><h2>¿Cómo comparamos?</h2><div class="criteria"><article><b>01</b><h3>Tiempo</h3><p>Preparación y desarrollo real.</p></article><article><b>02</b><h3>Compatibilidad</h3><p>Dispositivos, navegadores y permisos.</p></article><article><b>03</b><h3>Complejidad</h3><p>Herramientas y conocimientos necesarios.</p></article><article><b>04</b><h3>Reutilización</h3><p>Capacidad de trabajar con otros modelos.</p></article></div><p class="hint">Todavía no se han realizado pruebas en dispositivos físicos ni medido resultados.</p></section></main><footer>AR LAB · INVESTIGACIÓN INDEPENDIENTE · 2026</footer>`;

const viewer=document.querySelector('model-viewer');
const modelStatus=document.querySelector<HTMLElement>('#model-status')!;
viewer?.addEventListener('ar-status',(event:Event)=>{
 const status=(event as CustomEvent<{status:string}>).detail?.status;
 const descriptions:Record<string,string>={
  'session-started':'Sesión WebXR iniciada. Mueve el teléfono para encontrar una superficie.',
  'object-placed':'Modelo colocado en realidad aumentada.',
  'failed':'No se pudo iniciar la realidad aumentada. Comprueba los Servicios de Google Play para RA y Chrome.',
  'not-presenting':'La sesión de realidad aumentada terminó.'
 };
 if(status)modelStatus.textContent=descriptions[status]??'Estado WebXR: '+status;
});
const host=document.querySelector<HTMLElement>('#canvas-host')!;
const diagnostic=document.querySelector<HTMLElement>('#ar-status')!;
const overlay=document.createElement('div');
overlay.id='ar-overlay';
overlay.innerHTML='<div id="ar-overlay-message">Iniciando realidad aumentada…</div>';
overlay.hidden=true;
document.body.appendChild(overlay);
const overlayMessage=document.querySelector<HTMLElement>('#ar-overlay-message')!;
let previousStatus='';
function setStatus(key:string,message:string){
 if(key===previousStatus)return;
 previousStatus=key;
 diagnostic.textContent=message;
 overlayMessage.textContent=message;
}
const scene=new THREE.Scene();
scene.background=new THREE.Color('#102038');
const camera=new THREE.PerspectiveCamera(55,1,0.01,20);
camera.position.set(0.35,0.25,0.5);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.xr.enabled=true;
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
host.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x1b3c67,3));
const light=new THREE.DirectionalLight(0xffffff,3);
light.position.set(2,3,2);
scene.add(light);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
const ball=new THREE.Group();
ball.add(new THREE.Mesh(
 new THREE.SphereGeometry(0.11,40,32),
 new THREE.MeshStandardMaterial({color:0x174a97,metalness:0.25,roughness:0.25})
));
for(const [x,y,z] of [[-0.035,.075,.075],[.025,.085,.069],[0,.045,.099]]){
 const dot=new THREE.Mesh(
  new THREE.SphereGeometry(.012,16,12),
  new THREE.MeshStandardMaterial({color:0x010307})
 );
 dot.position.set(x,y,z);
 ball.add(dot);
}
scene.add(ball);
const grid=new THREE.GridHelper(1,10,0x4d7192,0x24415a);
grid.position.y=-0.15;
scene.add(grid);
const reticle=new THREE.Mesh(
 new THREE.RingGeometry(.05,.065,24).rotateX(-Math.PI/2),
 new THREE.MeshBasicMaterial({color:0x61f3cd,side:THREE.DoubleSide})
);
reticle.matrixAutoUpdate=false;
reticle.visible=false;
scene.add(reticle);
const arButton=ARButton.createButton(renderer,{
 requiredFeatures:['hit-test'],
 optionalFeatures:['dom-overlay'],
 domOverlay:{root:overlay}
} as Parameters<typeof ARButton.createButton>[1]);
document.querySelector('#ar-button-host')!.append(arButton);
let source:XRHitTestSource|null=null;
let hitState:'idle'|'pending'|'ready'|'failed'='idle';
let placed=false;
let surfaceFound=false;
const camPosition=new THREE.Vector3();
const camRotation=new THREE.Quaternion();
const previewOffset=new THREE.Vector3(0,-0.10,-0.75);
function placeObject(){
 if(!renderer.xr.isPresenting || placed)return;
 placed=true;
 reticle.visible=false;
 if(surfaceFound){
  setStatus('placed-plane','Bola colocada sobre la superficie. Sal de AR para volver a probar.');
 }else{
  setStatus('placed-manual','Bola colocada a distancia aproximada, sin detectar una superficie real.');
 }
}
renderer.xr.getController(0).addEventListener('select',placeObject);
renderer.xr.addEventListener('sessionstart',()=>{
 scene.background=null; // AR necesita conservar la imagen del mundo real.
 grid.visible=false;
 ball.visible=true; // No ocultar el objeto mientras buscamos una superficie.
 reticle.visible=false;
 source=null;hitState='idle';placed=false;surfaceFound=false;
 overlay.hidden=false;
 renderer.xr.getSession()?.addEventListener('select',placeObject);
 setStatus('scanning','AR activa. Verás una bola de prueba; mueve el teléfono lentamente hacia una mesa o suelo.');
});
renderer.xr.addEventListener('sessionend',()=>{
 source?.cancel?.();source=null;
 hitState='idle';placed=false;surfaceFound=false;
 scene.background=new THREE.Color('#102038');
 grid.visible=true;
 ball.visible=true;ball.position.set(0,0,0);
 reticle.visible=false;
 overlay.hidden=true;
 setStatus('ended','Sesión AR terminada. Si la bola flotaba, no se detectó una superficie.');
});
function requestHitTest(){
 const session=renderer.xr.getSession();
 if(!session||hitState!=='idle')return;
 if(typeof session.requestHitTestSource!=='function'){
  hitState='failed';
  setStatus('unsupported-hit','AR abierta sin detección de superficies. Puedes tocar para colocar la bola de forma aproximada.');
  return;
 }
 hitState='pending';
 session.requestReferenceSpace('viewer')
 .then(space=>session.requestHitTestSource!({space}))
 .then(hit=>{
  if(renderer.xr.getSession()!==session){hit.cancel?.();return;}
  source=hit;hitState='ready';
 })
 .catch(error=>{
  console.warn('AR Lab: no se pudo iniciar hit-test',error);
  hitState='failed';
  setStatus('hit-error','No fue posible activar el seguimiento de superficies. Puedes colocar la bola de forma aproximada.');
 });
}
renderer.setAnimationLoop((_time,frame)=>{
 if(renderer.xr.isPresenting){
  requestHitTest();
  if(!placed){
   surfaceFound=false;
   reticle.visible=false;
   if(frame&&source){
    const space=renderer.xr.getReferenceSpace();
    if(space){
     try{
      const result=frame.getHitTestResults(source)[0];
      const pose=result?.getPose(space);
      if(pose){
       surfaceFound=true;
       reticle.visible=true;
       reticle.matrix.fromArray(pose.transform.matrix);
       ball.position.setFromMatrixPosition(reticle.matrix);
       setStatus('surface','Superficie detectada. Toca la pantalla para colocar la bola.');
      }
     }catch(error){
      console.warn('AR Lab: fallo al procesar hit-test',error);
      source=null;hitState='failed';
      setStatus('hit-render-error','No se pudo procesar la superficie. La bola sigue en modo de prueba.');
     }
    }
   }
   if(!surfaceFound){
    const xrCamera=renderer.xr.getCamera();
    xrCamera.getWorldPosition(camPosition);
    xrCamera.getWorldQuaternion(camRotation);
    ball.position.copy(camPosition).add(previewOffset.clone().applyQuaternion(camRotation));
    if(hitState!=='failed')setStatus('scanning','Bola provisional visible. Apunta a una mesa iluminada y mueve el teléfono; toca para colocarla sin superficie.');
   }
  }
 }else{
  controls.update();
 }
 renderer.render(scene,camera);
});
function resize(){
 const width=Math.max(1,host.clientWidth);
 camera.aspect=width/360;
 camera.updateProjectionMatrix();
 renderer.setSize(width,360);
}
new ResizeObserver(resize).observe(host);
resize();
