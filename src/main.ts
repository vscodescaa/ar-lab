import '@google/model-viewer';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import './style.css';
const url = `${import.meta.env.BASE_URL}models/bowling-ball.glb`;
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header><strong>◉ AR LAB</strong><nav><a href="#experimentos">Experimentos</a><a href="#metodologia">Metodología</a></nav></header>
<main><section class="hero"><p class="eyebrow">LABORATORIO EXPERIMENTAL · 2026</p><h1>Una idea.<br><em>Tres tecnologías.</em></h1><p>Comparamos maneras de implementar realidad aumentada, desde una solución web sencilla hasta una aplicación nativa Android.</p><span class="chip">Prototipo educativo · no es entrega oficial</span></section>
<section id="experimentos"><div class="section-title"><p class="eyebrow">EXPERIMENTO 01 / BÁSICO</p><h2>Model Viewer</h2><p>Gira la bola de boliche y prueba la visualización en tu espacio desde Android compatible.</p></div><model-viewer alt="Bola de boliche 3D de prueba" src="${url}" camera-controls auto-rotate ar ar-modes="scene-viewer webxr" shadow-intensity="1" exposure="1" touch-action="pan-y"><button class="cta" slot="ar-button">Ver en mi espacio ↗</button></model-viewer><p class="hint">AR disponible solo si el navegador y dispositivo son compatibles.</p></section>
<section><div class="section-title"><p class="eyebrow">EXPERIMENTO 02 / INTERMEDIO</p><h2>Three.js + WebXR</h2><p>Escena 3D interactiva. En dispositivos compatibles, coloca una esfera en superficies reales mediante WebXR.</p></div><div id="canvas-host"></div><div id="ar-button-host"></div><p class="hint">En modo AR, mueve el dispositivo para detectar una superficie y toca la pantalla para colocar el objeto.</p></section>
<section><div class="section-title"><p class="eyebrow">EXPERIMENTO 03 / AVANZADO</p><h2>Android + ARCore</h2><p>Aplicación nativa Android que se implementará y evaluará en una fase posterior.</p></div><div class="pending">Pendiente · No hay APK disponible todavía</div></section>
<section id="metodologia"><p class="eyebrow">METODOLOGÍA</p><h2>¿Cómo comparamos?</h2><div class="criteria"><article><b>01</b><h3>Tiempo</h3><p>Preparación y desarrollo real.</p></article><article><b>02</b><h3>Compatibilidad</h3><p>Dispositivos, navegadores y permisos.</p></article><article><b>03</b><h3>Complejidad</h3><p>Herramientas y conocimientos necesarios.</p></article><article><b>04</b><h3>Reutilización</h3><p>Capacidad de trabajar con otros modelos.</p></article></div><p class="hint">Todavía no se han realizado pruebas en dispositivos físicos ni medido resultados.</p></section></main><footer>AR LAB · INVESTIGACIÓN INDEPENDIENTE · 2026</footer>`;
const host=document.querySelector<HTMLElement>('#canvas-host')!;
const scene=new THREE.Scene();scene.background=new THREE.Color('#102038');
const camera=new THREE.PerspectiveCamera(55,1,0.01,20);camera.position.set(0.35,0.25,0.5);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.xr.enabled=true;renderer.setPixelRatio(Math.min(devicePixelRatio,2));host.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x1b3c67,3));
const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(2,3,2);scene.add(light);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
const ball=new THREE.Group();const sphere=new THREE.Mesh(new THREE.SphereGeometry(0.11,40,32),new THREE.MeshStandardMaterial({color:0x174a97,metalness:0.25,roughness:0.25}));ball.add(sphere);
for(const [x,y,z] of [[-0.035,.075,.075],[.025,.085,.069],[0,.045,.099]]){const dot=new THREE.Mesh(new THREE.SphereGeometry(.012,16,12),new THREE.MeshStandardMaterial({color:0x010307}));dot.position.set(x,y,z);ball.add(dot)}scene.add(ball);
const grid=new THREE.GridHelper(1,10,0x4d7192,0x24415a);grid.position.y=-0.15;scene.add(grid);
const reticle=new THREE.Mesh(new THREE.RingGeometry(.05,.065,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x61f3cd}));reticle.matrixAutoUpdate=false;reticle.visible=false;scene.add(reticle);
const arButton=ARButton.createButton(renderer,{requiredFeatures:['hit-test']});document.querySelector('#ar-button-host')!.append(arButton);
let source: XRHitTestSource|null=null;let requested=false;
const controller=renderer.xr.getController(0);scene.add(controller);
controller.addEventListener('select',()=>{if(reticle.visible){ball.position.setFromMatrixPosition(reticle.matrix);ball.visible=true;}});
renderer.xr.addEventListener('sessionstart',()=>{ball.visible=false;grid.visible=false;});
renderer.xr.addEventListener('sessionend',()=>{ball.visible=true;ball.position.set(0,0,0);grid.visible=true;reticle.visible=false;source=null;requested=false;});
renderer.setAnimationLoop((_t,frame)=>{
 if(frame&&renderer.xr.isPresenting){const session=renderer.xr.getSession();if(!requested&&session){requested=true;session.requestReferenceSpace('viewer').then(space=>session.requestHitTestSource?.({space})).then(hit=>{source=hit??null;}).catch(()=>{requested=false;});}
 const ref=renderer.xr.getReferenceSpace();if(source&&ref){const hit=frame.getHitTestResults(source)[0];const pose=hit?.getPose(ref);reticle.visible=!!pose;if(pose)reticle.matrix.fromArray(pose.transform.matrix);}
 }else controls.update();
 renderer.render(scene,camera);
});
function resize(){const w=host.clientWidth;camera.aspect=w/360;camera.updateProjectionMatrix();renderer.setSize(w,360);}new ResizeObserver(resize).observe(host);resize();
