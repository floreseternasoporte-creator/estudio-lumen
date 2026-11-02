# Estudio Lumen

Estudio de creación de video con IA en un solo archivo HTML — interfaz estilo Apple, sin dependencias, lista para conectar a una API real de generación de video.

> **Estado actual:** prototipo frontend funcional. La “generación” es simulada en el navegador con canvas procedural (sin backend). La estructura ya está preparada para sustituir esa simulación por una API real — ver [`docs/APIS-VIDEO.md`](docs/APIS-VIDEO.md) y [`docs/INTEGRACION.md`](docs/INTEGRACION.md).

![Tipo](https://img.shields.io/badge/tipo-single--file%20HTML-black) ![Licencia](https://img.shields.io/badge/licencia-MIT-blue)

## Demo

Abre `index.html` en cualquier navegador, o sírvelo con GitHub Pages:

- **GitHub Pages:** Settings → Pages → Deploy from branch `main` / `(root)`
- **Local:** `python3 -m http.server 8000` y entra a `http://localhost:8000`

## Qué hace

- **3 modos de entrada:** Texto, Imagen (hasta 4 referencias) y Fotogramas (inicial + final)
- **Prompt** con contador (800 caracteres), “Mejorar prompt” y “Sorpréndeme”
- **4 modelos (ficticios, mapeables a reales):**

  | Modelo en la UI | Uso | Duración máx. | Resoluciones | Equivalente real sugerido |
  |---|---|---|---|---|
  | Lumen 2 Pro — *Recomendado* | Equilibrio calidad/velocidad | 15 s | 720p, 1080p | Kling 3.0 vía fal.ai |
  | Lumen Rápido | Borradores en segundos | 8 s | 720p, 1080p | Runway Gen-4 Turbo / Pika 2.2 |
  | Lumen Cine | Calidad película, hasta 4K | 10 s | 720p, 1080p, 4K | Veo 3.1 / Luma Ray3.2 |
  | Lumen Largo | Planos extendidos | 30 s | 720p, 1080p | Seedance 2.5 / Kling 3.0 (30 s) |

- **Duración** 3–15 s (30 s en Lumen Largo), **formatos** 16:9, 9:16, 1:1, 4:3, 21:9
- **12 movimientos de cámara:** Dolly in/out, Paneo izq./der., Órbita, Grúa arriba/abajo, FPV, Zoom rápido, Cámara en mano, Estático, Giro
- **7 estilos:** Cinematográfico, Natural, Anime, Retro VHS, Blanco y negro, Neón, Documental (con grano, viñeta, letterbox y scanlines simulados)
- **Avanzado:** intensidad de movimiento, semilla, variantes (1/2/4), sonido ambiente (Web Audio)
- **Sistema de créditos simulado:** coste calculado por modelo × duración × resolución × sonido × variantes; saldo inicial 1.000
- **Vistas:** Crear, Explorar (8 ideas precargadas) e Historial de la sesión, con reproductor, barra de progreso y miniaturas
- **Tema** claro/oscuro (respeta `prefers-color-scheme`) y diseño responsive para móvil

## Estructura

```
estudio-lumen/
├── index.html                        # La app completa (HTML + CSS + JS, sin build)
├── original/
│   └── Estudio_Lumen_original.html   # Archivo tal cual fue entregado
├── docs/
│   ├── APIS-VIDEO.md                 # Comparativa de APIs de video (precios nov 2026)
│   └── INTEGRACION.md                # Cómo conectar una API real, con ejemplos
├── examples/
│   ├── fal.js                        # Ejemplo fal.ai (Kling / Veo / Hailuo con 1 key)
│   ├── runway.js                     # Ejemplo Runway Dev API
│   └── minimax.js                    # Ejemplo MiniMax H3 directo
├── .gitignore
└── LICENSE
```

## Cómo funciona por dentro

Todo vive en `index.html`:

- `MODELS`, `CAMS`, `STYLES`, `RATIOS`, `IDEAS` — catálogos de la UI
- `drawScene()` + `renderClip()` — motor procedural en canvas que simula el video (gradientes, cámara, grano, tintes)
- `camT()` — transforma de cámara por tipo de movimiento
- `makeClips()` — construye el objeto “clip” a partir del estado: **este es el punto exacto donde se enchufa una API real** (ver `docs/INTEGRACION.md`)
- El estado global es el objeto `S` (modo, modelo, duración, créditos, historial…)

Sin frameworks, sin bundler, sin llamadas de red salvo la fuente Inter de Google Fonts.

## Roadmap

- [ ] Conectar generación real vía fal.ai (una sola key para Kling, Veo, Hailuo, Seedance, Wan)
- [ ] Backend mínimo que oculte la API key (nunca en el frontend) y gestione créditos reales
- [ ] Descarga real del MP4 generado (hoy el botón abre pantalla completa)
- [ ] Persistir historial (localStorage / backend)
- [ ] Subida de referencias a storage temporal para pasar URLs a la API

## Licencia

MIT — ver [LICENSE](LICENSE).
