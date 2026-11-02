// Ejemplo MiniMax API directo — MiniMax H3: video + audio estéreo nativo en una pasada.
// $0.08/s a 768p, $0.13/s a 2K, clips de 4–15 s. SOLO backend (Node 18+).
// Uso: MINIMAX_API_KEY=... node examples/minimax.js "tu prompt"
// Nota: en fal el mismo H3 a 2K cuesta el doble ($0.26/s); directo es la ruta barata.

const prompt = process.argv[2] || 'Olas largas rompen en una playa vacía bajo cielo rosado';
const KEY = process.env.MINIMAX_API_KEY;
if (!KEY) { console.error('Falta MINIMAX_API_KEY'); process.exit(1); }

const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const create = await fetch('https://api.minimax.io/v1/video_generation', {
    method: 'POST', headers: HEADERS,
    body: JSON.stringify({ model: 'MiniMax-H3', prompt, duration: 5, resolution: '768P' })
  });
  const data = await create.json();
  const taskId = data.task_id;
  if (!taskId) throw new Error(`Create: ${JSON.stringify(data)}`);

  let fileId = null;
  while (!fileId) {
    const st = await fetch(`https://api.minimax.io/v1/query/video_generation?task_id=${taskId}`, { headers: HEADERS }).then(r => r.json());
    console.log('Estado:', st.status);
    if (st.status === 'Success') fileId = st.file_id;
    else if (st.status === 'Fail') throw new Error('Generación fallida');
    else await sleep(6000);
  }
  const file = await fetch(`https://api.minimax.io/v1/files/retrieve?file_id=${fileId}`, { headers: HEADERS }).then(r => r.json());
  console.log('Video:', file.file?.download_url);
}
main().catch(e => { console.error(e.message); process.exit(1); });
