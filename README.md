# AR Lab — Laboratorio de Realidad Aumentada

Proyecto educativo preliminar para comparar **tres enfoques**: Model Viewer (básico), Three.js + WebXR (intermedio) y Android + ARCore (avanzado, pendiente).

## Instalación local

```bash
npm install
npm run dev
```

El modelo de prueba GLB se genera automáticamente mediante `scripts/create-model.mjs`, para que los dos prototipos web trabajen con la misma geometría. El modelo es provisional.

## Despliegue gratuito

Preparado para GitHub Pages mediante `.github/workflows/deploy.yml`. Activar **Settings → Pages → Build and deployment → Source: GitHub Actions**. Vite utiliza la ruta base `/ar-lab/` en Actions.

## Limitaciones y evidencia

- AR requiere HTTPS, permisos y soporte del navegador/dispositivo.
- Aún no se ha validado el funcionamiento en Samsung Galaxy S20 FE.
- No hay mediciones de tiempo o rendimiento realizadas.
- Android nativo aún no implementado.
- Las instrucciones finales de coordinación están pendientes.
- Pedir autorización antes de reutilizar materiales institucionales en portafolio.

Consultar `docs/experiment-log.md` para registrar las pruebas.

## Pruebas de realidad aumentada (28/10/2026)

En la primera prueba real desde un Samsung Galaxy S20 FE, el modelo 3D se visualizó, pero Scene Viewer provocó el aviso «Google continúa fallando» y WebXR abrió la cámara sin mostrar la bola. Desde entonces se ajustó el experimento:

- **Model Viewer:** utiliza únicamente WebXR dentro de Chrome para no depender de iniciar Scene Viewer.
- **Three.js:** conserva una bola provisional visible durante el escaneo, muestra un indicador verde al encontrar una superficie real y permite fijarla con un toque.
- **Mensajes:** se muestra el estado de la sesión y se distingue entre colocación sobre superficie detectada y colocación aproximada.

Para probar: abre el sitio publicado en Chrome, actualiza la página, pulsa «START AR» y mueve despacio el teléfono hacia una mesa iluminada. Si ves un **anillo verde**, toca para colocar la bola sobre la superficie. Si nunca aparece el anillo, aún puedes tocar para fijarla de modo aproximado, pero ese resultado no valida hit-test.

Si la experiencia web sigue fallando, comprueba en Google Play Store las actualizaciones de **Servicios de Google Play para RA** y **Google**, además de Chrome; no borres datos ni restablezcas el teléfono como primera medida.

La bitácora se encuentra en `docs/experiment-log.md`. Las correcciones todavía requieren validación física.

## Diagnóstico WebXR (versión actual)

`npm ci`, `npm test` y `npm run build` verifican las dependencias, la posición de la vista previa y la compilación. La prueba física de AR sigue pendiente.

En **Three.js + WebXR**, `START AR` comprueba soporte de `immersive-ar` y muestra un panel dentro de la cámara cuando Chrome concede DOM Overlay. El panel indica sesión, fotogramas y llamadas de dibujo, pose de cámara, estado y resultados de hit-test, visibilidad y posición de la bola, modo de colocación y errores. La bola antes del toque es una **vista previa flotante**. El anillo verde indica un resultado de hit-test; tocar en ese momento fija la bola en esa posición del espacio. Tocar sin anillo mantiene la colocación aproximada existente, claramente marcada como tal. Se usa una posición fija en el espacio WebXR, no la API opcional `XRAnchor`.

En **Model Viewer**, `ar-modes="webxr"` evita abrir Scene Viewer. El aviso dentro del visor muestra inicio, pérdida de seguimiento y colocación; el estado bajo el visor muestra los mismos eventos al salir. Un error de carga del GLB también se muestra allí.

Si la cámara aparece sin bola, anota los seis renglones del panel. En particular, `Pose: Sin seguimiento` significa que el navegador aún no entrega una posición válida; `Render: 0 fotogramas` apunta al bucle de render; `Hit-test: listo · 0 resultados` indica sesión y detector activos, pero ninguna superficie hallada; `Objeto: ... fuera de vista` indica un problema de posición o cámara. Registra esos valores en la bitácora.
