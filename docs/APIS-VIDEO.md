# APIs de generación de video — ofertas y precios

Investigación realizada el **2 de noviembre de 2026**, con precios contrastados en comparativas verificadas entre el 25 y el 31 de octubre de 2026 y en las páginas oficiales de precios enlazadas. Los precios de video IA cambian casi cada mes: confirma siempre en la página oficial antes de comprar volumen.

> Unidad común: **USD por segundo de video generado a 720p**, sin audio salvo que se indique. Un clip típico de Estudio Lumen = 5 s.

## Resumen rápido — recomendación para Estudio Lumen

| Orden | Ruta | Por qué |
|---|---|---|
| **1. Empezar aquí** | **fal.ai** (agregador) | Una sola API key y un solo saldo para 600–1.000+ modelos: Kling, Veo, Seedance, Wan, Hailuo/MiniMax H3, Pika. Pago por uso, sin suscripción, solo cobra generaciones con éxito. Ideal para mapear los 4 “Lumen” a modelos reales sin firmar 4 contratos. |
| **2. Barato y rápido** | **Runway Dev** directo | Gen-4 Turbo a $0,05/s es de lo más barato con API limpia. Además revende Kling/Veo/Seedance con el mismo saldo. **Oferta vigente: Kling 4.0 con 20 % dto. hasta el 30-nov-2026.** |
| **3. Audio nativo + tu caso H3** | **MiniMax directo** | H3 genera video + audio estéreo nativo en una pasada, hasta 15 s y 2K. $0,08/s a 768p directo (en fal cuesta el doble a 2K). Tú ya tienes H3 instalado en local, así que la API es la vía 2K. |
| **4. Máxima calidad** | **Google Veo 3.1** (Vertex AI / Gemini API) | El más caro ($0,40/s con audio), pero referencia en calidad y con SLA en Vertex. **$300 de crédito gratis de Google Cloud (90 días)** para probarlo. |
| **5. Clips largos / keyframes** | **Luma Ray3.2** directo | Precio por clip (no por segundo), control por keyframes, HDR/EXR. Sin audio nativo. |

## Tabla comparativa (720p, octubre–noviembre 2026)

| Proveedor / modelo | $/s (720p) | Clip 5 s | Clip 10 s | Duración máx. | Audio nativo | Acceso / mínimo |
|---|---:|---:|---:|---:|---|---|
| Pika 2.2 (vía fal) | $0,04 | $0,20 | $0,40 | ~10 s | No | Pay-as-you-go en fal |
| LTX-2.3 Fast | $0,03 | $0,15 | $0,30 | — | — | Vía agregadores |
| Vidu Q4 Preview | desde $0,014* | ~$0,07* | ~$0,14* | 16 s | Sí | *Precio de lanzamiento, tier bajo; verificar tier real |
| Runway Gen-4 Turbo | **$0,05** | $0,25 | $0,50 | 10 s | No | Créditos API a $0,01, sin mínimo público |
| Veo 3.1 Lite (Google) | **$0,05** | $0,25 | n/a (máx. 8 s) | 8 s | Sí, incluido | Gemini API / Vertex AI |
| MiniMax Hailuo 2.3 | ~$0,047 | ~$0,28 (6 s, 768p) | — | 6–10 s | No | API MiniMax |
| MiniMax H3 Lite | $0,04 (768p) | $0,20 | $0,40 | 15 s | **Sí, estéreo** | Pay-as-you-go MiniMax |
| MiniMax H3 | $0,08 (768p) / $0,13 (2K) | $0,40 | $0,80 | 15 s | **Sí, estéreo** | Pay-as-you-go, desde $5 |
| Luma Ray3.2 | ~$0,06 | $0,30 | $0,90 | 10 s (20 s V2V) | No | Por clip, sin compromiso |
| Kling 3.0 Standard | $0,084 sin audio / $0,126 con audio | $0,42 / $0,63 | $0,84 / $1,26 | 15 s (30 s según ruta) | Opcional | Directo: paquetes prepago desde **$700** ⚠️; vía fal/Runway: sin ese mínimo |
| Wan 2.5 / Wan 3 (vía fal) | $0,05–$0,10 | $0,25–$0,50 | $0,50–$1,00 | — | Según modelo | Vía fal |
| Runway Gen-4.5 | $0,12 | $0,60 | $1,20 | 10 s | No | Créditos API |
| Gemini Omni Flash 1.1 | ~$0,10 (720p) / $0,152 (1080p) | ~$0,51 | ~$1,01 | 10 s (ext. 40 s) | Sí, siempre | Gemini API (sustituye a Veo en la Gemini API) |
| Seedance 2.0 Fast (BytePlus directo) | ~$0,09–$0,12 | ~$0,60 (5 s, 720p) | — | 30 s | Sí | BytePlus ModelArk; vía fal cuesta ~el doble por tokens |
| Seedance 2.5 | ~$0,23 (720p) | ~$1,16 | ~$2,31 | 30 s | Sí | BytePlus / agregadores |
| Veo 3.1 Fast | $0,10 (720p) / $0,12–$0,15 (1080p) | $0,50 | n/a (máx. 8 s) | 8 s | Opcional | Gemini API / Vertex / fal / Runway |
| Veo 3.1 Standard | **$0,40 con audio / $0,20 sin audio** | $2,00 / $1,00 | n/a (máx. 8 s) | 8 s | Sí | El más caro; 4K y SLA en Vertex |

Fuentes principales: comparativa KitCut (precios verificados 25-oct-2026), Higgsfield (comparativa de 9 APIs), HiAPI (verificado 28-oct-2026), Picto.Video vía fal (24-sep-2026) y páginas oficiales de Runway Dev y MiniMax enlazadas abajo.

## Ofertas y vías gratis / baratas reales

1. **Google Cloud — $300 gratis (90 días).** Crédito de bienvenida de GCP, válido también para Veo en Vertex AI. Requiere tarjeta. Es la forma legítima más generosa de probar el modelo más caro sin pagarlo.
2. **Runway — Kling 4.0 al −20 % hasta el 30 de noviembre de 2026** en Runway Dev: 720p a $0,1256/s (antes $0,157) y 1080p a $0,188/s (antes $0,235). Visible en su página oficial de precios de API.
3. **fal.ai — sin suscripción y solo pagas éxitos.** Saldo prepago, sin mínimo de suscripción; los errores del servidor y la cola no se cobran. Créditos de prueba al registrarse (cantidad variable). La “oferta” aquí es no comprometerte: cambias de modelo sin cambiar de integración.
4. **Higgsfield API — mínimo de recarga de solo $5** y Kling 3.0 a $0,84 por clip de 10 s. Alternativa de agregador con top-up bajo.
5. **MiniMax — desde $5** en su plataforma; H3 Lite a $0,025/s (480p) / $0,04/s (768p) es de lo más barato **con audio incluido**. Ojo revendedores: el mismo H3 a 2K cuesta $0,13/s directo, $0,26/s en fal y ~$0,039–$0,064/s en revendedores con descuento (ArgoLink, −51 %, verificado 25-oct-2026) — compara antes de recargar en un tercero.
6. **Apps con créditos diarios (no son API):** Google Flow da créditos diarios gratis (Veo 3.1 Fast ≈ 20 créditos/generación) y Dreamina (ByteDance) da asignación diaria. Sirven para probar calidad a mano, no para integrar en Estudio Lumen.
7. **Lo que NO existe:** en octubre de 2026 las APIs serias **prácticamente no tienen free tier** (Gemini Omni, Pika, Luma API y PixVerse: ninguno; MiniMax gratis solo en imagen). Desconfía de sitios que prometen “Veo/Seedance ilimitado gratis por API”: son revendedores con créditos de bienvenida y límites por saldo, no una API gratuita.

⚠️ **Kling directo:** su plataforma de desarrollador vende paquetes prepago **desde $700**. Para Estudio Lumen no compensa: Kling vía fal o vía Runway cuesta lo mismo por segundo ($0,084/s sin audio) sin ese mínimo.

⚠️ **Sora:** OpenAI retiró la API de Sora 2 en septiembre de 2026. No la incluyas en ningún plan.

## Mapeo sugerido a los modelos de Estudio Lumen

| UI actual | Modelo real recomendado | Ruta | Coste real 5 s aprox. |
|---|---|---:|---:|
| Lumen Rápido | Runway Gen-4 Turbo **o** Pika 2.2 | Runway Dev / fal | $0,25 / $0,20 |
| Lumen 2 Pro | Kling 3.0 Standard | fal.ai | $0,42 (sin audio) |
| Lumen Cine | Veo 3.1 (o Luma Ray3.2 si priorizas keyframes/HDR) | Vertex AI / fal / Luma | $2,00 con audio / $0,30 en Luma 720p |
| Lumen Largo | Seedance 2.5 (30 s) o MiniMax H3 (15 s con audio) | BytePlus / fal / MiniMax | ~$1,16 (Seedance 5 s) / $0,40 (H3 5 s) |

Con ese mapeo, el “crédito” interno de la app puede calibrarse a coste real: hoy la UI cobra 40 créditos por un clip de 5 s en 1080p con sonido; con Kling vía fal el coste real sería ≈ $0,63–$0,84.

## Enlaces oficiales

- fal.ai — https://fal.ai (precios por modelo en cada página de modelo)
- Runway Dev (precios API, con la promo de Kling 4.0) — https://dev.runway.com/pricing
- MiniMax Platform — https://platform.minimax.io
- Google Vertex AI / Gemini API — https://cloud.google.com/vertex-ai
- Luma API — https://lumalabs.ai (sección API; precios por clip)
- BytePlus ModelArk (Seedance) — https://www.byteplus.com/en/product/ModelArk
- Replicate — https://replicate.com (agregador alternativo; mismo Kling ≈ el doble que en fal: $1,68 / 10 s)

---
*Precios en USD, sin impuestos. Verificados en fuentes de octubre de 2026; reconfirmar en la página oficial el día de la compra.*
