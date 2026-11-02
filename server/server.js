// Estudio Lumen — backend mínimo para MiniMax H3 (directo).
// Node 18+, SIN dependencias. Sirve la app estática y hace de proxy seguro:
// la API key vive SOLO aquí (variable de entorno), nunca en el navegador.
//
// Uso real:   MINIMAX_API_KEY=... node server/server.js
// Uso prueba: MINIMAX_MOCK=1 node server/server.js   (no llama a MiniMax,
//             devuelve server/sample.mp4 tras unos segundos: sirve para
//             verificar todo el flujo sin gastar saldo)
// Puerto: PORT (por defecto 8787)
//
// API de MiniMax H3 verificada en sus docs oficiales (nov 2026):
//   Crear tarea:  POST https://api.minimax.io/v2/video_generation
//                 { model:"MiniMax-H3", content:[{type:"text",text}, …],
//                   resolution:"768P"|"2K", duration:4–15, ratio:"16:9"|… }
//   Estado:       GET  https://api.minimax.io/v1/query/video_generation?task_id=
//                 → status Preparing|Processing|Success|Failed (+ file_id)
//   Descarga:     GET  https://api.minimax.io/v1/files/retrieve?file_id=
//                 → file.download_url  (algunas cuentas devuelven content.url
//                   ya en el estado; se aceptan ambas formas)
//   Subir imagen: POST https://api.minimax.io/v1/files/upload (multipart,
//                   purpose=video_generation) → file.url

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 8787;
const KEY = process.env.MINIMAX_API_KEY || '';
const API = 'https://api.minimax.io';

// Proveedor barato alternativo: fal.ai + PixVerse V6 (ver docs/APIS-VIDEO.md).
// Si hay FAL_KEY, manda fal; si no, MiniMax; sin ninguna key, modo mock.
const FAL_KEY = process.env.FAL_KEY || '';
const FAL_BASE = process.env.FAL_BASE || 'https://queue.fal.run';
const PROVIDER = FAL_KEY ? 'fal' : (KEY ? 'minimax' : 'mock');
const MOCK = process.env.MINIMAX_MOCK === '1' || PROVIDER === 'mock';
const MODEL_NAME = PROVIDER === 'fal' ? 'PixVerse V6 (fal.ai)' : 'MiniMax H3';

// Precio lista MiniMax H3 (USD por segundo, pay-as-you-go, oct 2026)
const PRICE = { '768P': 0.08, '2K': 0.13 };
// PixVerse V6 en fal (USD por segundo, [sin audio, con audio], página oficial de fal, nov 2026)
const FAL_PRICE = { '360p': [0.025, 0.035], '540p': [0.035, 0.045], '720p': [0.045, 0.06], '1080p': [0.09, 0.115] };

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.md': 'text/plain; charset=utf-8', '.json': 'application/json', '.mp4': 'video/mp4',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};

const jobs = new Map(); // jobId -> {kind:'mock'|'real', taskId, createdAt, meta}
let seq = 0;

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', c => { size += c.length; if (size > 70 * 1024 * 1024) reject(new Error('body demasiado grande')); chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
const auth = () => ({ Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' });

async function mm(pathname, options = {}) {
  const r = await fetch(API + pathname, { ...options, headers: { ...(options.headers || auth()) } });
  const text = await r.text();
  let json = null; try { json = JSON.parse(text); } catch (e) { /* respuesta no-JSON */ }
  return { status: r.status, json, text };
}

// Sube una imagen (data URL) a MiniMax y devuelve una URL utilizable en content[].
// Si la subida falla, devuelve la propia data URL (la API la acepta en algunos casos).
async function uploadImage(dataUrl, name) {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl || '');
  if (!m) return dataUrl;
  const buf = Buffer.from(m[2], 'base64');
  const ext = (m[1].split('/')[1] || 'png').replace('jpeg', 'jpg');
  const boundary = '----lumen' + Date.now().toString(36);
  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="purpose"\r\n\r\nvideo_generation\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${name || 'ref'}.${ext}"\r\nContent-Type: ${m[1]}\r\n\r\n`);
  const body = Buffer.concat([head, buf, Buffer.from(`\r\n--${boundary}--\r\n`)]);
  try {
    const r = await fetch(API + '/v1/files/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body
    });
    const j = await r.json();
    const url = j && j.file && (j.file.url || j.file.download_url);
    if (url) return url;
    console.error('upload sin URL, uso data URL:', JSON.stringify(j).slice(0, 200));
  } catch (e) { console.error('upload falló, uso data URL:', e.message); }
  return dataUrl;
}

function mapRequest(b) {
  // UI → MiniMax H3 (acepta la resolución cruda de la UI: 720p/1080p/4K)
  const duration = Math.max(4, Math.min(15, Math.round(b.duration || 5)));
  let resolution = (b.resolution === '2K' || b.resolution === '1080p' || b.resolution === '4K') ? '2K' : '768P';
  if (b.uiModel === 'fast') resolution = '768P';
  if (b.uiModel === 'cine') resolution = '2K';
  const ratios = ['16:9', '9:16', '1:1', '4:3', '21:9', '3:4'];
  const ratio = ratios.includes(b.ratio) ? b.ratio : '16:9';
  return { duration, resolution, ratio };
}

function mapFal(b) {
  // UI → PixVerse V6 en fal.ai
  const duration = Math.max(1, Math.min(15, Math.round(b.duration || 5)));
  let resolution = ['720p', '1080p'].includes(b.resolution) ? b.resolution : '720p';
  if (b.resolution === '4K') resolution = '1080p';
  if (b.uiModel === 'fast') resolution = '720p';
  if (b.uiModel === 'cine') resolution = '1080p';
  const sound = b.sound !== false;
  const rate = FAL_PRICE[resolution][sound ? 1 : 0];
  const ratios = ['16:9', '9:16', '1:1', '4:3', '3:4']; // PixVerse no lista 21:9
  return { duration, resolution, sound, cost: +(rate * duration).toFixed(3), ratio: ratios.includes(b.ratio) ? b.ratio : null };
}

async function falSubmit(b, mapped) {
  const images = (Array.isArray(b.images) ? b.images : []).filter(i => i && i.dataUrl);
  const first = images.find(i => i.role === 'first_frame') || images[0];
  const input = {
    prompt: String(b.prompt).slice(0, 2000),
    resolution: mapped.resolution,
    duration: mapped.duration,
    generate_audio_switch: mapped.sound
  };
  if (mapped.ratio) input.aspect_ratio = mapped.ratio;
  let endpoint = 'fal-ai/pixverse/v6/text-to-video';
  if ((b.mode === 'image' || b.mode === 'frames') && first) {
    endpoint = 'fal-ai/pixverse/v6/image-to-video';
    input.image_url = first.dataUrl;
  }
  const r = await fetch(`${FAL_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j || !j.status_url) {
    throw new Error(`fal (${r.status}): ${JSON.stringify(j).slice(0, 300)}`);
  }
  return j; // {request_id, status_url, response_url}
}

async function handleGenerar(req, res) {
  let b;
  try { b = JSON.parse(await readBody(req)); } catch (e) { return sendJSON(res, 400, { error: 'JSON inválido' }); }
  if (!b.prompt || !String(b.prompt).trim()) return sendJSON(res, 400, { error: 'Falta el prompt' });
  const jobId = 'job_' + Date.now().toString(36) + '_' + (++seq);

  if (MOCK) {
    const mapped = PROVIDER === 'fal' ? mapFal(b) : mapRequest(b);
    const cost = PROVIDER === 'fal' ? mapped.cost : +(PRICE[mapped.resolution] * mapped.duration).toFixed(2);
    jobs.set(jobId, { kind: 'mock', createdAt: Date.now(), meta: { ...mapped, cost } });
    return sendJSON(res, 202, { jobId, mock: true, estimate: cost, ...mapped });
  }

  if (PROVIDER === 'fal') {
    const mapped = mapFal(b);
    try {
      const sub = await falSubmit(b, mapped);
      jobs.set(jobId, { kind: 'fal', statusUrl: sub.status_url, responseUrl: sub.response_url, createdAt: Date.now(), meta: { ...mapped, modelName: MODEL_NAME } });
      return sendJSON(res, 202, { jobId, estimate: mapped.cost, duration: mapped.duration, resolution: mapped.resolution, ratio: mapped.ratio });
    } catch (e) {
      console.error('fal submit:', e.message);
      return sendJSON(res, 502, { error: e.message });
    }
  }

  const mapped = mapRequest(b);
  const cost = +(PRICE[mapped.resolution] * mapped.duration).toFixed(2);

  // Contenido multimodal
  const content = [{ type: 'text', text: String(b.prompt).slice(0, 7000) }];
  const images = Array.isArray(b.images) ? b.images.slice(0, 9) : [];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (!img || !img.dataUrl) continue;
    const url = await uploadImage(img.dataUrl, 'ref' + i);
    const role = ['first_frame', 'last_frame', 'reference_image'].includes(img.role) ? img.role : 'reference_image';
    content.push({ type: 'image_url', image_url: { url }, role });
  }

  const r = await mm('/v2/video_generation', {
    method: 'POST',
    body: JSON.stringify({ model: 'MiniMax-H3', content, ...mapped })
  });
  const taskId = r.json && (r.json.task_id || (r.json.data && r.json.data.task_id));
  if (!taskId) {
    const msg = (r.json && r.json.error && r.json.error.message) || r.text.slice(0, 300);
    console.error('MiniMax crear tarea:', r.status, msg);
    return sendJSON(res, 502, { error: `MiniMax (${r.status}): ${msg}` });
  }
  jobs.set(jobId, { kind: 'real', taskId, createdAt: Date.now(), meta: { ...mapped, cost } });
  return sendJSON(res, 202, { jobId, estimate: cost, ...mapped });
}

async function handleEstado(res, jobId) {
  const job = jobs.get(jobId);
  if (!job) return sendJSON(res, 404, { error: 'Trabajo no encontrado (el servidor se reinició o ya expiró)' });

  if (job.kind === 'mock') {
    const elapsed = Date.now() - job.createdAt;
    if (elapsed < 3500) return sendJSON(res, 200, { status: 'processing', progress: Math.min(90, Math.round(elapsed / 40)) });
    return sendJSON(res, 200, { status: 'done', videoUrl: '/mock/sample.mp4', mock: true, modelName: MODEL_NAME + ' (mock)', ...job.meta });
  }

  if (job.kind === 'fal') {
    const headers = { Authorization: `Key ${FAL_KEY}` };
    const s = await fetch(job.statusUrl, { headers }).then(r => r.json()).catch(() => ({}));
    if (s.status === 'COMPLETED') {
      const out = await fetch(job.responseUrl, { headers }).then(r => r.json()).catch(() => ({}));
      const url = (out.video && out.video.url) || (out.data && out.data.video && out.data.video.url);
      if (!url) return sendJSON(res, 502, { error: 'fal terminó pero no devolvió URL de video' });
      return sendJSON(res, 200, { status: 'done', videoUrl: url, ...job.meta });
    }
    if (s.status === 'FAILED') return sendJSON(res, 200, { status: 'failed', error: 'Generación fallida en fal/PixVerse' });
    return sendJSON(res, 200, { status: 'processing', falStatus: s.status || 'IN_QUEUE' });
  }

  const q = await mm(`/v1/query/video_generation?task_id=${encodeURIComponent(job.taskId)}`, { method: 'GET' });
  const j = q.json || {};
  const st = j.status || (j.data && j.data.status);
  if (st === 'Success' || st === 'success') {
    let url = (j.content && j.content.url) || j.video_url || (j.data && j.data.content && j.data.content.url);
    const fileId = j.file_id || (j.data && j.data.file_id);
    if (!url && fileId) {
      const f = await mm(`/v1/files/retrieve?file_id=${encodeURIComponent(fileId)}`, { method: 'GET' });
      url = f.json && f.json.file && f.json.file.download_url;
    }
    if (!url) return sendJSON(res, 502, { error: 'MiniMax terminó pero no devolvió URL de video' });
    return sendJSON(res, 200, { status: 'done', videoUrl: url, modelName: MODEL_NAME, ...job.meta });
  }
  if (st === 'Failed' || st === 'failed') {
    return sendJSON(res, 200, { status: 'failed', error: (j.base_resp && j.base_resp.status_msg) || 'Generación fallida en MiniMax' });
  }
  return sendJSON(res, 200, { status: 'processing', minimaxStatus: st || 'Preparing' });
}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://localhost');
    if (u.pathname === '/api/health') {
      return sendJSON(res, 200, { ok: true, provider: PROVIDER, model: MODEL_NAME, hasKey: !!(KEY || FAL_KEY), mock: MOCK });
    }
    if (u.pathname === '/api/generar' && req.method === 'POST') return await handleGenerar(req, res);
    if (u.pathname.startsWith('/api/estado/') && req.method === 'GET') {
      return await handleEstado(res, decodeURIComponent(u.pathname.slice('/api/estado/'.length)));
    }
    if (u.pathname === '/mock/sample.mp4') {
      const file = path.join(__dirname, 'sample.mp4');
      res.writeHead(200, { 'Content-Type': 'video/mp4' });
      return fs.createReadStream(file).pipe(res);
    }
    // Estáticos (la app)
    let p = u.pathname === '/' ? '/index.html' : u.pathname;
    const file = path.join(ROOT, decodeURIComponent(p));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) sendJSON(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`Estudio Lumen → http://localhost:${PORT}  (proveedor: ${PROVIDER}, modelo: ${MODEL_NAME}${MOCK ? ', MOCK' : ''})`);
});
