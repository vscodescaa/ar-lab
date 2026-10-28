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
