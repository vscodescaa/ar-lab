import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mkdir, writeFile } from 'node:fs/promises';
class NodeFileReader {
  result = null; onloadend = null; onerror = null;
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(b=>{this.result=b;this.onloadend?.({target:this});}).catch(e=>this.onerror?.(e)); }
  readAsDataURL(blob) { blob.arrayBuffer().then(b=>{this.result='data:'+blob.type+';base64,'+Buffer.from(b).toString('base64');this.onloadend?.({target:this});}).catch(e=>this.onerror?.(e)); }
}
globalThis.FileReader = NodeFileReader;
const root = new THREE.Group();
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11,40,28),new THREE.MeshStandardMaterial({color:0x143b7c,metalness:0.2,roughness:0.3}));
root.add(ball);
for (const [x,y,z] of [[-0.035,0.075,0.075],[0.025,0.085,0.069],[0.0,0.045,0.099]]) {
 const hole=new THREE.Mesh(new THREE.SphereGeometry(0.012,16,12),new THREE.MeshStandardMaterial({color:0x02050b,roughness:0.9}));
 hole.position.set(x,y,z);root.add(hole);
}
const buffer=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});
await mkdir('public/models',{recursive:true});
await writeFile('public/models/bowling-ball.glb',Buffer.from(buffer));
console.log('Modelo GLB de demostración generado');
