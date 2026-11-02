// Ejemplo Runway Dev API — Gen-4 Turbo ($0.05/s) y Gen-4.5 ($0.12/s).
// SOLO backend (Node 18+). Uso: RUNWAY_API_KEY=... node examples/runway.js "tu prompt"
// Créditos API: $0.01 cada uno, saldo separado de los planes de la app.
// Oferta nov 2026: Kling 4.0 con 20% dto. vía Runway Dev hasta el 30-nov-2026.

const prompt = process.argv[2] || 'Un jinete cruza dunas doradas al amanecer';
const KEY = process.env.RUNWAY_API_KEY;
if (!KEY) { console.error('Falta RUNWAY_API_KEY'); process.exit(1); }

const HEADERS = {
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  'X-Runway-Version': '2024-11-06'
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const create = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
    method: 'POST', headers: HEADERS,
    body: JSON.stringify({ model: 'gen4_turbo', promptText: prompt, duration: 5, ratio: '1280:720' })
  });
  if (!create.ok) throw new Error(`Create ${create.status}: ${await create.text()}`);
  const { id } = await create.json();

  while (true) {
    const task = await fetch(`https://api.dev.runwayml.com/v1/tasks/${id}`, { headers: HEADERS }).then(r => r.json());
    console.log('Estado:', task.status);
    if (task.status === 'SUCCEEDED') { console.log('Video:', task.output?.[0]); return; }
    if (task.status === 'FAILED') throw new Error(task.failure || 'Generación fallida');
    await sleep(5000);
  }
}
main().catch(e => { console.error(e.message); process.exit(1); });
