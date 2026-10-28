import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { previewPosition } from './ar-geometry.js';

type HitState = 'pendiente' | 'solicitando' | 'listo' | 'no disponible' | 'error';
type Placement = 'vista previa flotante' | 'superficie detectada' | 'aproximada';

export function setupArExperiment(): void {
  const host = document.querySelector<HTMLElement>('#canvas-host')!;
  const status = document.querySelector<HTMLElement>('#ar-status')!;
  const buttonHost = document.querySelector<HTMLElement>('#ar-button-host')!;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Comprobando WebXR…';
  button.disabled = true;
  buttonHost.append(button);

  const overlay = document.createElement('div');
  overlay.id = 'ar-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `<div id="ar-panel" role="status" aria-live="polite">
    <div class="ar-panel-top"><strong>Diagnóstico WebXR</strong><button id="ar-exit" type="button">Salir de AR</button></div>
    <p id="ar-message">Iniciando sesión…</p>
    <dl>
      <div><dt>WebXR</dt><dd id="ar-webxr">Comprobando</dd></div>
      <div><dt>Sesión</dt><dd id="ar-session">Inactiva</dd></div>
      <div><dt>Render</dt><dd id="ar-render">0 fotogramas</dd></div>
      <div><dt>Pose</dt><dd id="ar-pose">Pendiente</dd></div>
      <div><dt>Hit-test</dt><dd id="ar-hit">Pendiente</dd></div>
      <div><dt>Objeto</dt><dd id="ar-object">Pendiente</dd></div>
    </dl>
    <p id="ar-error" hidden></p>
  </div>`;
  document.body.append(overlay);
  const field = (id: string) => overlay.querySelector<HTMLElement>(`#ar-${id}`)!;
  const message = field('message');
  const errorField = field('error');
  const setMessage = (value: string) => {
    if (message.textContent === value) return;
    message.textContent = value;
    status.textContent = value;
  };
  const showError = (context: string, error: unknown) => {
    const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    errorField.hidden = false;
    errorField.textContent = `${context}: ${detail}`;
    setMessage(`${context}. Consulta el detalle en el diagnóstico.`);
    console.error('AR Lab:', context, error);
  };
  overlay.addEventListener('beforexrselect', (event) => {
    if ((event.target as Element).closest('#ar-panel')) event.preventDefault();
  });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#102038');
  const camera = new THREE.PerspectiveCamera(55, 1, 0.01, 20);
  camera.position.set(0.35, 0.25, 0.5);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.xr.enabled = true;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.append(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1b3c67, 3));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(2, 3, 2);
  scene.add(light);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const ball = new THREE.Group();
  ball.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 40, 32),
    new THREE.MeshStandardMaterial({ color: 0x174a97, metalness: 0.25, roughness: 0.25 }),
  ));
  for (const [x, y, z] of [[-0.035, .075, .075], [.025, .085, .069], [0, .045, .099]]) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(.012, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0x010307 }),
    );
    dot.position.set(x, y, z);
    ball.add(dot);
  }
  scene.add(ball);
  const grid = new THREE.GridHelper(1, 10, 0x4d7192, 0x24415a);
  grid.position.y = -0.15;
  scene.add(grid);
  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(.05, .065, 24).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x61f3cd, side: THREE.DoubleSide }),
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  let session: XRSession | null = null;
  let hitSource: XRHitTestSource | null = null;
  let hitState: HitState = 'pendiente';
  let hitCount = 0;
  let frameCount = 0;
  let poseAvailable = false;
  let placement: Placement = 'vista previa flotante';
  let lastDiagnostic = 0;
  const clipPosition = new THREE.Vector3();
  const formatPosition = () => ball.position.toArray().map(v => v.toFixed(2)).join(', ');

  const updateDiagnostic = () => {
    field('session').textContent = session ? 'Activa' : 'Inactiva';
    field('render').textContent = `${frameCount} fotogramas · ${renderer.info.render.calls} llamadas de dibujo`;
    field('pose').textContent = poseAvailable ? 'Disponible' : 'Sin seguimiento';
    field('hit').textContent = `${hitState} · ${hitCount} resultados en el último análisis`;
    let inView = false;
    const view = renderer.xr.getCamera().cameras[0];
    if (view && ball.visible) {
      clipPosition.copy(ball.position).project(view);
      inView = Math.abs(clipPosition.x) <= 1 && Math.abs(clipPosition.y) <= 1 && clipPosition.z >= -1 && clipPosition.z <= 1;
    }
    const placed = placement === 'vista previa flotante' ? 'sin colocar' : 'colocado';
    field('object').textContent = `${ball.visible ? 'Activado en escena' : 'Oculto'} · ${placed}: ${placement} · posición (${formatPosition()}) m · ${inView ? 'centro dentro del campo de cámara' : 'centro fuera del campo de cámara'}`;
  };

  const resetSession = () => {
    hitSource?.cancel();
    hitSource = null;
    session = null;
    hitState = 'pendiente';
    hitCount = 0;
    poseAvailable = false;
    placement = 'vista previa flotante';
    scene.background = new THREE.Color('#102038');
    grid.visible = true;
    ball.visible = true;
    ball.position.set(0, 0, 0);
    reticle.visible = false;
    overlay.hidden = true;
    button.disabled = false;
    button.textContent = 'START AR';
    resize();
    setMessage(errorField.hidden
      ? 'Sesión AR terminada. La vista previa flotante no confirma una superficie.'
      : errorField.textContent ?? 'La sesión AR terminó con un error.');
  };

  const onSelect = () => {
    if (!session || placement !== 'vista previa flotante') return;
    if (reticle.visible) {
      placement = 'superficie detectada';
      reticle.visible = false;
      setMessage('Bola fijada en la posición de una superficie detectada por hit-test.');
    } else if (poseAvailable && ball.visible) {
      placement = 'aproximada';
      setMessage('Bola fijada a distancia aproximada. No se detectó una superficie.');
    } else {
      setMessage('No hay pose de cámara para colocar la bola. Mueve el teléfono lentamente.');
    }
    updateDiagnostic();
  };

  window.addEventListener('error', event => {
    if (session) showError('Error durante la sesión AR', event.error ?? event.message);
  });
  window.addEventListener('unhandledrejection', event => {
    if (session) showError('Promesa rechazada durante la sesión AR', event.reason);
  });

  const requestHitTest = async (activeSession: XRSession) => {
    if (typeof activeSession.requestHitTestSource !== 'function') {
      hitState = 'no disponible';
      return;
    }
    hitState = 'solicitando';
    try {
      const viewerSpace = await activeSession.requestReferenceSpace('viewer');
      const source = await activeSession.requestHitTestSource({ space: viewerSpace });
      if (!source) {
        hitState = 'no disponible';
        return;
      }
      if (session !== activeSession) {
        source.cancel();
        return;
      }
      hitSource = source;
      hitState = 'listo';
    } catch (error) {
      if (session !== activeSession) return;
      hitState = 'error';
      showError('No se pudo iniciar hit-test', error);
    }
  };

  const startSession = async () => {
    if (!navigator.xr || session) return;
    button.disabled = true;
    errorField.hidden = true;
    errorField.textContent = '';
    overlay.hidden = false;
    field('session').textContent = 'Solicitando acceso';
    setMessage('Solicitando sesión WebXR y acceso a la cámara…');
    let ready = false;
    let phase: 'acceso' | 'render' = 'acceso';
    const startupTimer = window.setTimeout(() => {
      if (!ready) {
        const context = phase === 'acceso'
          ? 'La solicitud WebXR sigue pendiente tras 8 segundos'
          : 'La cámara abrió, pero el render WebXR no terminó de iniciar en 8 segundos';
        showError(context, new Error('Comprueba el seguimiento y los servicios de RA'));
      }
    }, 8000);
    let requestedSession: XRSession | null = null;
    try {
      requestedSession = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['dom-overlay'],
        optionalFeatures: ['hit-test'],
        domOverlay: { root: overlay },
      });
      phase = 'render';
      field('session').textContent = 'Configurando render';
      setMessage('Cámara autorizada. Configurando el render WebXR…');
      renderer.xr.setReferenceSpaceType('local');
      await renderer.xr.setSession(requestedSession);
      ready = true;
      errorField.hidden = true;
      errorField.textContent = '';
      session = requestedSession;
      session.addEventListener('end', resetSession, { once: true });
      session.addEventListener('select', onSelect);
      scene.background = null;
      grid.visible = false;
      ball.visible = false;
      reticle.visible = false;
      hitSource = null;
      hitState = 'pendiente';
      hitCount = 0;
      frameCount = 0;
      poseAvailable = false;
      placement = 'vista previa flotante';
      overlay.hidden = false;
      button.textContent = 'STOP AR';
      button.disabled = false;
      setMessage('Sesión activa. Buscando pose de cámara y superficies…');
      updateDiagnostic();
      void requestHitTest(session);
    } catch (error) {
      showError('No se pudo iniciar la sesión AR', error);
      status.textContent = errorField.textContent;
      if (requestedSession) await requestedSession.end().catch(() => undefined);
      overlay.hidden = true;
      button.disabled = false;
      button.textContent = 'START AR';
    } finally {
      window.clearTimeout(startupTimer);
    }
  };

  button.addEventListener('click', () => {
    if (session) void session.end().catch(error => showError('No se pudo cerrar la sesión AR', error));
    else void startSession();
  });
  field('exit').addEventListener('click', () => {
    if (session) void session.end().catch(error => showError('No se pudo cerrar la sesión AR', error));
  });
  const xr = navigator.xr;
  if (!window.isSecureContext) {
    field('webxr').textContent = 'No: se requiere HTTPS';
    status.textContent = 'WebXR requiere HTTPS. Abre la versión publicada.';
    button.textContent = 'AR requiere HTTPS';
  } else if (!xr) {
    field('webxr').textContent = 'No disponible';
    status.textContent = 'Este navegador no expone WebXR immersive-ar.';
    button.textContent = 'AR NO DISPONIBLE';
  } else {
    xr.isSessionSupported('immersive-ar').then(supported => {
      field('webxr').textContent = supported ? 'Sí: immersive-ar' : 'No: immersive-ar';
      button.textContent = supported ? 'START AR' : 'AR NO COMPATIBLE';
      button.disabled = !supported;
      if (!supported) status.textContent = 'WebXR existe, pero immersive-ar no está disponible en este dispositivo.';
    }).catch(error => {
      field('webxr').textContent = 'Error de consulta';
      button.textContent = 'AR NO DISPONIBLE';
      showError('No se pudo comprobar WebXR', error);
    });
  }

  renderer.setAnimationLoop((_time, frame) => {
    if (renderer.xr.isPresenting) {
      frameCount += 1;
      const space = renderer.xr.getReferenceSpace();
      const pose = frame && space ? frame.getViewerPose(space) : null;
      poseAvailable = Boolean(pose);
      if (placement === 'vista previa flotante') {
        hitCount = 0;
        reticle.visible = false;
        if (frame && space && hitSource) {
          try {
            const results = frame.getHitTestResults(hitSource);
            hitCount = results.length;
            const hitPose = results[0]?.getPose(space);
            if (hitPose) {
              reticle.matrix.fromArray(hitPose.transform.matrix);
              reticle.visible = true;
              ball.position.setFromMatrixPosition(reticle.matrix);
              ball.visible = true;
              setMessage('Superficie detectada (anillo verde). Toca para fijar la bola.');
            }
          } catch (error) {
            hitSource?.cancel();
            hitSource = null;
            hitState = 'error';
            showError('Error al procesar hit-test', error);
          }
        }
        if (!reticle.visible && pose) {
          const preview = previewPosition(pose.transform.position, pose.transform.orientation);
          ball.position.set(preview.x, preview.y, preview.z);
          ball.visible = true;
          if (hitState === 'no disponible') setMessage('Vista previa flotante. Hit-test no disponible; toca para fijarla de modo aproximado.');
          else if (hitState !== 'error') setMessage('Vista previa flotante. Esperando una superficie; también puedes fijarla sin hit-test.');
        } else if (!reticle.visible) {
          ball.visible = false;
          if (hitState !== 'error') setMessage('Sin pose de cámara. Mueve el teléfono para recuperar el seguimiento.');
        }
      }
    } else {
      controls.update();
    }
    try {
      renderer.render(scene, camera);
    } catch (error) {
      showError('Falló el renderizado', error);
      return;
    }
    if (renderer.xr.isPresenting && performance.now() - lastDiagnostic > 250) {
      lastDiagnostic = performance.now();
      updateDiagnostic();
    }
  });

  const resize = () => {
    if (renderer.xr.isPresenting) return;
    const width = Math.max(1, host.clientWidth);
    camera.aspect = width / 360;
    camera.updateProjectionMatrix();
    renderer.setSize(width, 360);
  };
  new ResizeObserver(resize).observe(host);
  resize();
}
