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
