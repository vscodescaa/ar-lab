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