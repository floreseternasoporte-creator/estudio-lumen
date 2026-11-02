# Backend de Estudio Lumen — MiniMax H3 directo

Servidor Node (18+, sin dependencias) que sirve la app y llama a la API de
MiniMax H3 con la key guardada **solo en el servidor**. El navegador nunca ve
la key.

## Arrancar

```bash
# Prueba sin gastar saldo (devuelve un video de muestra tras ~4 s):
npm run mock            # = MINIMAX_MOCK=1 node server.js

# Real BARATO — fal.ai + PixVerse V6 (720p: $0,045/s sin audio, $0,06/s con audio):
FAL_KEY=tu_key_de_fal node server.js

# Real — MiniMax H3 directo ($0,08/s a 768P, $0,13/s a 2K):
MINIMAX_API_KEY=tu_key node server.js
```

Si están las dos keys, manda `FAL_KEY` (es el proveedor barato). Con fal,
el modo Imagen usa `image-to-video` con la primera imagen y el modo
Fotogramas usa el primer fotograma como arranque; PixVerse no ofrece 21:9,
así que ese formato se genera sin fijar proporción.

Abre http://localhost:8787 — la app detecta el backend sola (`/api/health`)
y el botón Generar pasa a generar video real. Sin backend (p. ej. GitHub
Pages), la app sigue con su simulación de siempre.

## Endpoints

| Ruta | Qué hace |
|---|---|
| `GET /api/health` | `{ok, provider:"minimax", model:"MiniMax-H3", hasKey, mock}` |
| `POST /api/generar` | Crea la tarea en MiniMax. Body: `{prompt, duration, ratio, resolution, uiModel, mode, images:[{dataUrl, role}]}` → `{jobId, estimate}` |
| `GET /api/estado/:jobId` | `{status:"processing"}` o `{status:"done", videoUrl, cost}` o `{status:"failed", error}` |

## Mapeo UI → MiniMax H3

- **Modelo:** todos los “Lumen” son `MiniMax-H3`; *Rápido* fuerza 768P, *Cine* fuerza 2K.
- **Duración:** se limita a **4–15 s** (máximo de H3; “Lumen Largo” ya no llega a 30 s).
- **Resolución:** 720p → `768P`; 1080p/4K → `2K` (H3 no tiene 4K).
- **Formato:** `ratio` directo (16:9, 9:16, 1:1, 4:3, 21:9 — todos los soporta H3).
- **Imágenes:** modo Imagen → `reference_image`; modo Fotogramas → `first_frame` / `last_frame`. El servidor las sube antes a MiniMax (`/v1/files/upload`).
- **Cámara y estilo:** se añaden al prompt como instrucciones (`[push in]`, `cinematic lighting…`), que es como H3 los entiende.
- **Sonido:** H3 genera audio siempre; si el interruptor de la UI está apagado, el reproductor silencia el video.

## Despliegue

Vale cualquier sitio donde corra Node con la variable `MINIMAX_API_KEY`:
tu PC, un VPS, Render/Railway/Fly, o un contenedor. GitHub Pages **no**
puede alojar el backend (es estático): la demo pública seguirá en modo
simulación y la generación real irá en tu despliegue con servidor.
