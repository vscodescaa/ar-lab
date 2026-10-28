# Bitácora experimental — AR Lab

Fecha de primera prueba: 28 de octubre de 2026.
Dispositivo: Samsung Galaxy S20 FE. Navegador: Chrome (versión no registrada).
Versiones Android y Servicios de Google Play para RA: pendientes.

## Prueba inicial — antes de los ajustes

| Implementación | Observación reportada |
|---|---|
| Model Viewer | El modelo 3D aparece. Al pulsar «Ver en mi espacio», Android muestra «Google continúa fallando», sin iniciar AR. |
| Three.js + WebXR | El modelo 3D aparece; «START AR» abre la cámara, pero inicialmente no muestra la bola. |
| Android + ARCore nativo | Pendiente de desarrollar. |

## Hipótesis y correcciones (sin confirmar todavía)

- **Model Viewer:** la configuración priorizaba Scene Viewer (app externa de Google), que pudo causar el fallo. Se cambió a WebXR exclusivamente para aislar la dependencia de Scene Viewer. No se ha confirmado la causa definitiva.
- **Three.js:** la versión anterior ocultaba la bola al entrar a AR hasta detectar una superficie y recibir un toque. Ahora mantiene una vista previa visible enfrente del usuario y busca superficies mediante hit-test.
- **Diagnósticos:** se agregaron mensajes de estado y una superposición AR opcional.
- Si no se detecta una superficie, se puede colocar una bola a distancia aproximada. **Eso NO demuestra detección real de planos**.

## Próxima prueba

1. Confirmar la compilación y el despliegue del cambio en GitHub Actions.
2. Abrir la web en Chrome del S20 FE y actualizar.
3. Probar Model Viewer nuevamente con WebXR.
4. Probar «START AR»: comprobar bola provisional, anillo verde al detectar superficie y toque para fijar la bola.
5. Registrar resultados, versión Android, Chrome, servicios RA, fallos y evidencia.

No se han medido tiempos ni confirmado todavía experiencias AR completas.

## Auditoría de código — 28 de octubre de 2026

- La primera implementación ocultaba la bola hasta obtener hit-test. La revisión posterior añadió una vista previa, pero calculaba su posición con la cámara XR de Three.js antes del render del fotograma; por ello dependía del estado anterior de esa cámara. La causa del resultado real en el S20 FE aún no se puede confirmar sin repetir la prueba.
- El botón AR de Three.js no muestra en la página los rechazos de `requestSession`. El experimento ahora solicita la sesión directamente, informa el error y deja `hit-test` como función opcional: una sesión AR puede iniciar aunque la detección de superficies no esté disponible.
- La vista previa se calcula desde `XRFrame.getViewerPose()` en el mismo fotograma. El panel separa falta de pose, falta de render, falta de resultados hit-test, objeto fuera de vista y colocación aproximada. El resultado físico permanece pendiente.
- El GLB se genera localmente con Three.js y ambos experimentos usan la misma URL, ajustada con la ruta base de Vite para GitHub Pages. La carga 3D había funcionado en la primera prueba; la experiencia AR de Model Viewer todavía requiere nueva prueba.

### Registro para la próxima prueba

Fecha y hora:
Android / Chrome / Servicios de Google Play para RA:
URL y commit:
Model Viewer — estado inicial, al tocar, seguimiento y resultado:
Three.js — WebXR, sesión, render, pose, hit-test y objeto:
¿Se vio la bola flotante?:
¿Apareció el anillo verde?:
¿La bola quedó en la superficie tras tocar?:
Error visible o captura de pantalla:

## Segunda observación del Samsung — pendiente de diagnóstico

El usuario informó que la cámara vuelve a abrirse sin mostrar contenido. Aún falta saber si ocurre en Model Viewer, Three.js o ambos, y si aparece el panel de diagnóstico. Se añadió visibilidad del panel durante la solicitud e inicialización WebXR, con un aviso tras ocho segundos si la sesión o el render no terminan de iniciar. Para aislar el dispositivo del código de AR Lab, comparar con el ejemplo oficial [Barebones AR](https://immersive-web.github.io/webxr-samples/ar-barebones.html), que dibuja un rectángulo sin librerías ni hit-test. No se atribuye todavía el fallo a una capa concreta.
