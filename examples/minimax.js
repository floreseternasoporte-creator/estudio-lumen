// Ejemplo MiniMax API directo — MiniMax H3 (API v2): video + audio estéreo
// nativo en una pasada. $0.08/s a 768P, $0.13/s a 2K, clips de 4–15 s.
// SOLO backend (Node 18+). Uso: MINIMAX_API_KEY=... node examples/minimax.js "tu prompt"
//
// Flujo verificado en docs oficiales (nov 2026):
//   1. POST /v2/video_generation {model, content[], resolution, duration, ratio} → task_id
//   2. GET  /v1/query/video_generation?task_id= → status + file_id (o content.url)
//   3. GET  /v1/files/retrieve?file_id= → file.download_url

const prompt = process.argv[2] || 'Olas largas rompen en una playa vacía bajo cielo rosado';
const KEY = process.env.MINIMAX_API_KEY;
if (!KEY) { console.error('Falta MINIMAX_API_KEY'); process.exit(1); }

const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const create = await fetch('https://api.minimax.io/v2/video_generation', {
    method: 'POST', headers: HEADERS,
    body: JSON.stringify({
      model: 'MiniMax-H3',
      content: [{ type: 'text', text: prompt }],
      resolution: '768P', duration: 5, ratio: '16:9'
    })
  });
  const data = await create.json();
  const taskId = data.task_id || (data.data && data.data.task_id);
  if (!taskId) throw new Error(`Create (${create.status}): ${JSON.stringify(data).slice(0, 300)}`);
  console.log('task_id:', taskId);

  while (true) {
    const st = await fetch(`https://api.minimax.io/v1/query/video_generation?task_id=${taskId}`, { headers: HEADERS }).then(r => r.json());
    const status = st.status || (st.data && st.data.status);
    console.log('Estado:', status);
    if (status === 'Success') {
      if (st.content && st.content.url) { console.log('Video:', st.content.url); return; }
      const fileId = st.file_id || (st.data && st.data.file_id);
      const file = await fetch(`https://api.minimax.io/v1/files/retrieve?file_id=${fileId}`, { headers: HEADERS }).then(r => r.json());
      console.log('Video:', file.file && file.file.download_url);
      return;
    }
    if (status === 'Failed') throw new Error('Generación fallida: ' + ((st.base_resp && st.base_resp.status_msg) || ''));
    await sleep(6000);
  }
}
main().catch(e => { console.error(e.message); process.exit(1); });
