# Cómo conectar Estudio Lumen a una API real

La app simula la generación en `index.html` dentro del handler de `#go` (progreso + `makeClips()`).
Para pasar a video real hay que sustituir **solo esa simulación** por una llamada a API; el resto de la UI (prompt, referencias, cámara, estilo, historial) ya produce todos los parámetros necesarios.

## Regla de oro: la API key nunca va en el frontend

`index.html` es público (GitHub Pages). Cualquier key pegada ahí la puede copiar cualquiera.
Arquitectura mínima correcta:

```
[Navegador: index.html]  →  [Tu backend mínimo]  →  [fal / Runway / MiniMax]
                                 ↑
                    guarda la key, valida créditos,
                    sube referencias, hace polling/webhook
```

Backend mínimo viable: una función serverless (Cloudflare Worker, Vercel Function o una Lambda como las que ya usas en Drex) con 2 endpoints:

- `POST /api/generar` — recibe `{prompt, mode, imageUrls, duration, aspectRatio, resolution, model}` y devuelve `{jobId}`
- `GET /api/estado/:jobId` — devuelve `{status, videoUrl}` cuando el proveedor termina

## Mapeo de parámetros de la UI al proveedor

| Estudio Lumen (`S`) | API genérica |
|---|---|
| `S.mode`: `text` / `image` / `frames` | text-to-video / image-to-video / first+last frame |
| `S.refs[]` / `S.f1`, `S.f2` | Primero subir a storage temporal → URLs públicas |
| `$('#prompt').value` + cámara + estilo | Concatenar: `prompt + ", " + cameraText + ", " + styleText` (los proveedores no tienen parámetros de cámara/estilo separados en la mayoría de modelos) |
| `S.dur` | `duration` (recortar al máximo del modelo real) |
| `S.ar` | `aspect_ratio` |
| `S.res` | `resolution` / tamaño |
| `S.model` | Ver tabla en `APIS-VIDEO.md` |

## Ejemplos listos

En [`../examples/`](../examples/) hay tres clientes mínimos en JavaScript (Node 18+, sin dependencias, usan `fetch`):

- `fal.js` — **recomendado para empezar**: una key para Kling, Veo, Hailuo, Seedance y Wan
- `runway.js` — Runway Dev directo (Gen-4 Turbo / Gen-4.5)
- `minimax.js` — MiniMax H3 directo (video + audio estéreo nativo)

Todos leen la key de una variable de entorno y **solo deben ejecutarse en el backend**, nunca en el navegador.

```bash
FAL_KEY=...    node examples/fal.js "Una mujer camina bajo la lluvia en Tokio de noche"
RUNWAY_API_KEY=... node examples/runway.js "Un jinete cruza dunas al amanecer"
MINIMAX_API_KEY=... node examples/minimax.js "Olas rompen en una playa al atardecer"
```

## Sustituir la simulación (esquema)

```js
// En index.html, handler de #go: en vez del setInterval de progreso simulado…
const { jobId } = await fetch('/api/generar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: $('#prompt').value.trim(),
    model: S.model, duration: S.dur,
    aspectRatio: S.ar, resolution: S.res,
    // imageUrls: urls ya subidas de S.refs / S.f1 / S.f2
  })
}).then(r => r.json());

// Polling de estado → al completar, crear el <video> en el stage
// y guardar la URL en el historial en lugar del thumbnail de canvas.
```

El coste por generación debe descontarse de los créditos del usuario **solo cuando el proveedor confirma éxito** (fal y Replicate no cobran fallos; Runway reembolsa salvo rechazos de moderación).
