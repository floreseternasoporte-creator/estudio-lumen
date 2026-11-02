// Ejemplo fal.ai — UNA key para Kling, Veo, Hailuo/MiniMax, Seedance y Wan.
// SOLO backend (Node 18+). Nunca ejecutes esto en el navegador: expondrías la key.
// Uso: FAL_KEY=... node examples/fal.js "tu prompt" [modelo]
// Modelos útiles (endpoints fal, nov 2026):
//   fal-ai/kling-video/v3/standard/text-to-video   (~$0.084/s sin audio)
//   fal-ai/minimax/hailuo-02/standard/text-to-video (~$0.045/s)
//   fal-ai/veo3.1/fast/text-to-video               (Veo 3.1 Fast)
// Cambia el endpoint para image-to-video pasando image_url en el input.

const prompt = process.argv[2] || 'Una mujer camina bajo la lluvia por una calle de Tokio de noche, reflejos de neón';
const model = process.argv[3] || 'fal-ai/kling-video/v3/standard/text-to-video';
const KEY = process.env.FAL_KEY;
if (!KEY) { console.error('Falta FAL_KEY'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const submit = await fetch(`https://queue.fal.run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, duration: '5', aspect_ratio: '16:9' })
  });
  if (!submit.ok) throw new Error(`Submit ${submit.status}: ${await submit.text()}`);
  const { status_url, response_url } = await submit.json();

  while (true) {
    const st = await fetch(status_url, { headers: { Authorization: `Key ${KEY}` } }).then(r => r.json());
    console.log('Estado:', st.status);
    if (st.status === 'COMPLETED') break;
    if (st.status === 'FAILED') throw new Error('Generación fallida');
    await sleep(5000);
  }
  const result = await fetch(response_url, { headers: { Authorization: `Key ${KEY}` } }).then(r => r.json());
  console.log('Video:', result.video?.url || result);
}
main().catch(e => { console.error(e.message); process.exit(1); });
