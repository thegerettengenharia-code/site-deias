/* ============================================================
   The-Gerett-Studio — gerador de fotos e vídeos via OpenRouter
   Imagens: POST /api/v1/images  (flux/zimage grátis; premium com créditos)
   Vídeos:  POST /api/v1/videos  (assíncrono: 202 + polling_url)
   Fallback: 402 -> tenta flux automaticamente.
   (chaves do navegador permanecem em arca.* para compatibilidade)
   ============================================================ */
(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const OR_IMG = 'https://openrouter.ai/api/v1/images';
  const OR_VID = 'https://openrouter.ai/api/v1/videos';
  const FALLBACK_MODEL = 'flux';
  const DEFAULT_KEY = '__ARCA_OPENROUTER_KEY__';

  /* ---------------- modelos: fotos ---------------- */
  const PHOTO_MODELS = [
    { id: 'flux',    name: 'FLUX',               provider: 'Black Forest Labs', color: '#a855f7', letter: 'F',  api: 'flux',                          free: true,  tags: ['Grátis', 'Rápido', 'Fotorrealismo'],   desc: 'O clássico: rápido, gratuito e ótimo para quase tudo.' },
    { id: 'zimage',  name: 'Z-Image',            provider: 'Alibaba',            color: '#f87171', letter: 'Z',  api: 'zimage',                        free: true,  tags: ['Grátis', 'Turbo', 'Detalhe'],          desc: 'Turbo da Alibaba: muita qualidade em segundos.' },
    { id: 'gpt5',    name: 'GPT-5 Image',        provider: 'OpenAI',             color: '#10a37f', letter: '5',  api: 'openai/gpt-5-image',             free: false, tags: ['Premium', 'Top quality'],            desc: 'O estado da arte da OpenAI em geração de imagem.' },
    { id: 'gpt54',   name: 'GPT-5.4 Image 2',    provider: 'OpenAI',             color: '#0d9488', letter: '5',  api: 'openai/gpt-5.4-image-2',         free: false, tags: ['Premium', 'Fidelidade'],             desc: 'A geração mais nova do GPT Image, com mais fidelidade.' },
    { id: 'gptimg2', name: 'GPT Image 2',        provider: 'OpenAI',             color: '#14b8a6', letter: 'G',  api: 'openai/gpt-image-2',             free: false, tags: ['Premium', 'Rápido'],                 desc: 'Versão clássica do GPT Image: rápida e confiável.' },
    { id: 'nano2',   name: 'Nano Banana 2',      provider: 'Google',             color: '#4b8bf5', letter: 'N',  api: 'google/gemini-3.1-flash-image',  free: false, tags: ['Premium', 'Multimodal'],             desc: 'Gemini 3.1 Flash Image: criativo e preciso.' },
    { id: 'nanopro', name: 'Nano Banana Pro',    provider: 'Google',             color: '#3b82f6', letter: 'P',  api: 'google/gemini-3-pro-image',     free: false, tags: ['Premium', 'Máxima qualidade'],       desc: 'A versão Pro do Nano Banana, para o que importa.' },
    { id: 'nano1',   name: 'Nano Banana',        provider: 'Google',             color: '#60a5fa', letter: 'N',  api: 'google/gemini-2.5-flash-image', free: false, tags: ['Premium', 'Rápido'],                desc: 'A geração anterior: rápida e confiável.' },
    { id: 'klein',   name: 'FLUX.2 Klein',       provider: 'Black Forest Labs',  color: '#7c3aed', letter: 'K',  api: 'black-forest-labs/flux.2-klein-4b', free: false, tags: ['Premium', 'Arte', 'Estiloso'],       desc: 'A linha nova da BFL: estética refinada e controle.' },
    { id: 'seedream',name: 'Seedream 4.5',       provider: 'ByteDance',          color: '#22d3ee', letter: 'S',  api: 'bytedance-seed/seedream-4.5',   free: false, tags: ['Premium', 'Cenários', 'Realismo'],    desc: 'Da ByteDance: ótimo para cenários e fotos realistas.' }
  ];

  /* ---------------- modelos: vídeos ---------------- */
  const VIDEO_MODELS = [
    { id: 'veo31',   name: 'Veo 3.1',      provider: 'Google',     color: '#4b8bf5', letter: 'V', api: 'google/veo-3.1',          free: false, tags: ['5–10s', 'Realista', 'Fotorrealista'],    desc: 'O líder em vídeo do Google: movimento natural e HQ.' },
    { id: 'veo31f',  name: 'Veo 3.1 Fast', provider: 'Google',     color: '#60a5fa', letter: 'V', api: 'google/veo-3.1-fast',      free: false, tags: ['Rápido', 'Realista'],                   desc: 'A versão veloz do Veo 3.1 para resultados imediatos.' },
    { id: 'sora2',   name: 'Sora 2 Pro',   provider: 'OpenAI',     color: '#10a37f', letter: 'S', api: 'openai/sora-2-pro',        free: false, tags: ['Cenas longas', 'Fotorrealista'],         desc: 'O gerador de vídeo da OpenAI: cenas longas e coerentes.' },
    { id: 'kling',   name: 'Kling v3.0',   provider: 'Kling',      color: '#38bdf8', letter: 'K', api: 'kwaivgi/kling-v3.0-pro',   free: false, tags: ['Ação', 'Detalhe'],                     desc: 'Referência em movimento humano e expressão.' },
    { id: 'hailuo',  name: 'Hailuo 2.3',   provider: 'MiniMax',    color: '#f97316', letter: 'H', api: 'minimax/hailuo-2.3',       free: false, tags: ['Ação', 'Rápido'],                      desc: 'O queridinho da MiniMax: bom em movimento.' },
    { id: 'seedance',name: 'Seedance 2.0', provider: 'ByteDance',  color: '#22d3ee', letter: 'S', api: 'bytedance/seedance-2.0',   free: false, tags: ['Cenas longas', 'Direção'],             desc: 'Da ByteDance: forte em narrativa e controle.' },
    { id: 'wan',     name: 'Wan 2.7',      provider: 'Alibaba',    color: '#2f7cff', letter: 'W', api: 'alibaba/wan-2.7',          free: false, tags: ['Ação', 'Equilíbrio'],                  desc: 'O equilibrado da Alibaba: qualidade com custo baixo.' },
    { id: 'gen45',   name: 'Gen-4.5',      provider: 'Runway',     color: '#f43f5e', letter: 'R', api: 'runway/gen-4.5',           free: false, tags: ['Arte', 'Estiloso'],                    desc: 'O criativo da Runway: estilo cinematográfico.' }
  ];

  const MODELS = [...PHOTO_MODELS, ...VIDEO_MODELS];
  const getModel = (id) => MODELS.find((m) => m.id === id) ?? PHOTO_MODELS[0];

  /* ---------------- estado ---------------- */
  const store = {
    get(k, fb) { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  let settings = store.get('arca.settings', { key: DEFAULT_KEY });
  let state = store.get('arca.state', { mode: 'foto', model: 'flux' });
  let gallery = store.get('arca.galeria', []);
  let active = getModel(state.model);
  let mode = state.mode;
  let busy = false;
  let attached = null;

  /* ---------------- refs ---------------- */
  const modelGrid = $('#modelGrid');
  const genModelList = $('#genModelList');
  const genBody = $('#genBody');
  const genForm = $('#genForm');
  const promptInput = $('#promptInput');
  const attachBtn = $('#attachBtn');
  const imageInput = $('#imageInput');
  const imgPreview = $('#imgPreview');
  const imgPreviewImg = $('#imgPreviewImg');
  const imgRemove = $('#imgRemove');
  const attachNote = $('#attachNote');
  const sendBtn = $('#sendBtn');
  const aspectSel = $('#aspect');
  const durationSel = $('#duration');
  const modelSel = $('#modelSel');
  const genHint = $('#genHint');
  const keyStatus = $('#keyStatus');
  const headAvatar = $('#headAvatar');
  const headName = $('#headName');
  const headProvider = $('#headProvider');
  const settingsEl = $('#settings');
  const settingsStatus = $('#settingsStatus');

  /* ---------------- render: catálogo ---------------- */
  function renderModelGrid() {
    modelGrid.innerHTML = MODELS.map((m) => `
      <article class="model-card reveal" style="--model-c:${m.color}" data-id="${m.id}">
        <div class="model-top">
          <span class="model-badge" style="background:${m.color}">${m.letter}</span>
          <div class="model-flags">
            <span class="model-flag type">${isVideo(m) ? 'VÍDEO' : 'FOTO'}</span>
            <span class="model-flag ${m.free ? 'free' : 'premium'}">${m.free ? 'GRÁTIS' : 'PREMIUM'}</span>
          </div>
        </div>
        <div>
          <h3 class="model-name">${m.name}</h3>
          <span class="model-provider">por ${m.provider}</span>
        </div>
        <p class="model-desc">${m.desc}</p>
        <div class="model-tags">${m.tags.map((t) => `<span>${t}</span>`).join('')}</div>
        <button class="btn ${m.id === active.id ? 'btn-primary' : 'btn-ghost'} btn-sm model-use">Usar</button>
      </article>`).join('');
    $$('.model-card').forEach((card) => {
      const use = () => selectModel(card.dataset.id);
      card.addEventListener('click', use);
      card.querySelector('.model-use').addEventListener('click', (e) => { e.stopPropagation(); use(); });
    });
  }

  const isVideo = (m) => VIDEO_MODELS.some((v) => v.id === m.id);

  /* ---------------- render: lista lateral ---------------- */
  function renderModelList() {
    const q = $('#modelSearch').value.toLowerCase();
    const list = MODELS.filter((m) => isVideo(m) ? mode === 'video' : mode === 'foto');
    const filtered = list.filter((m) => !q || m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q));
    genModelList.innerHTML = filtered.map((m) => `
      <button class="gen-model ${m.id === active.id ? 'is-active' : ''}" data-id="${m.id}">
        <span class="avatar" style="--c:${m.color}">${m.letter}</span>
        <span class="gen-model-info">
          <span class="gen-model-name">${m.name}</span>
          <span class="gen-model-provider">${m.free ? 'grátis · ' : 'premium · '}${m.provider}</span>
        </span>
      </button>`).join('');
    $$('.gen-model').forEach((b) => b.addEventListener('click', () => selectModel(b.dataset.id)));
  }

  /* ---------------- render: seletor no formulário ---------------- */
  function renderModelSel() {
    const list = MODELS.filter((m) => isVideo(m) ? mode === 'video' : mode === 'foto');
    modelSel.innerHTML = list.map((m) =>
      `<option value="${m.id}">${m.name}${m.free ? '' : ' · premium'}</option>`).join('');
    modelSel.value = active.id;
  }

  /* ---------------- seleção ---------------- */
  function selectModel(id) {
    const next = getModel(id);
    const targetMode = isVideo(next) ? 'video' : 'foto';
    if (targetMode !== mode) setMode(targetMode, false);
    active = next;
    state.model = id;
    state.mode = mode;
    store.set('arca.state', state);
    updateHead();
    renderModelList();
    renderModelSel();
    durationSel.hidden = mode !== 'video';
    if (window.innerWidth <= 1024) $('#gerador').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setMode(next, keepActive = true) {
    mode = next;
    state.mode = next;
    store.set('arca.state', state);
    $$('.mode-btn').forEach((b) => {
      const on = b.dataset.mode === next;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on);
    });
    if (!keepActive || !MODELS.some((m) => m.id === active.id && (next === 'video' ? isVideo(m) : !isVideo(m)))) {
      const first = (next === 'video' ? VIDEO_MODELS : PHOTO_MODELS)[0];
      active = first;
      state.model = first.id;
      store.set('arca.state', state);
    }
    promptInput.placeholder = mode === 'video'
      ? 'Descreva o vídeo que você quer. Ex.: um drone sobrevoando a Patagônia ao amanhecer'
      : 'Descreva a cena que você quer criar. Ex.: um dragão de origami sobre templos japoneses ao pôr do sol';
    durationSel.hidden = mode !== 'video';
    attachBtn.disabled = mode === 'video';
    if (attached && mode === 'video') attachNote.textContent = 'Imagem anexada — vale só para fotos';
    renderModelList();
    renderModelSel();
    updateHead();
  }

  function updateHead() {
    headAvatar.style.setProperty('--c', active.color);
    headAvatar.textContent = active.letter;
    headName.textContent = active.name;
    headProvider.textContent = isVideo(active) ? 'Vídeo · créditos' : (active.free ? 'Foto · grátis' : 'Foto · premium');
    $$('.model-card').forEach((c) => {
      const is = c.dataset.id === active.id;
      c.style.borderColor = is ? active.color : '';
      c.querySelector('.model-use').className = 'btn ' + (is ? 'btn-primary' : 'btn-ghost') + ' btn-sm model-use';
    });
  }

  /* ---------------- galeria ---------------- */
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function mediaMarkup(it) {
    const src = it.url || it.data;
    return it.mode === 'video'
      ? `<video src="${src}" controls autoplay muted loop playsinline></video>`
      : `<img src="${src}" alt="${esc(it.prompt)}" loading="lazy">`;
  }

  function renderGallery() {
    if (!gallery.length) {
      genBody.innerHTML = `
        <div class="gen-empty">
          <div class="gen-empty-icon">✦</div>
          <p>Sua galeria aparece aqui.<br>Escolha um modelo e descreva a cena para começar.</p>
        </div>`;
      return;
    }
    genBody.innerHTML = `<div class="gen-gallery">${
      gallery.map((it) => {
        const m = getModel(it.modelid);
        const tag = it.mode === 'video' ? 'vídeo' : (it.fallback ? 'fallback grátis' : 'foto');
        return `
          <div class="gen-item">
            <div class="gen-item-media">${mediaMarkup(it)}</div>
            <div class="gen-item-cap">
              <span class="cap-model">${m.name}</span>
              <span class="cap-tag">${tag}</span>
            </div>
            <div class="gen-item-actions">
              <a href="${it.url || it.data}" target="_blank" rel="noopener">abrir</a>
              <a href="${it.url || it.data}" download="${m.id}.${it.mode === 'video' ? 'mp4' : 'png'}">baixar</a>
            </div>
          </div>`;
      }).join('')
    }</div>`;
  }

  function persistGallery() {
    gallery = gallery.slice(-12);
    store.set('arca.galeria', gallery);
    renderGallery();
  }

  function addLoadingItem(m) {
    const galleryWrap = genBody.querySelector('.gen-gallery') || document.createElement('div');
    if (!galleryWrap.parentNode) {
      galleryWrap.className = 'gen-gallery';
      genBody.innerHTML = '';
      genBody.appendChild(galleryWrap);
    }
    const item = document.createElement('div');
    item.className = 'gen-item loading';
    item.dataset.model = 'gerando com ' + m.name + '…';
    item.innerHTML = `
      <div class="gen-item-media"></div>
      <div class="gen-item-cap">
        <span class="cap-model">${m.name}</span>
        <span class="cap-tag">gerando…</span>
      </div>`;
    galleryWrap.appendChild(item);
    genBody.scrollTop = genBody.scrollHeight;
    return item;
  }

  function finalizeItem(item, data) {
    const m = getModel(data.modelid);
    const url = data.url || data.data;
    item.classList.remove('loading');
    item.querySelector('.gen-item-media').innerHTML = data.mode === 'video'
      ? `<video src="${url}" controls autoplay muted loop playsinline></video>`
      : `<img src="${url}" alt="${esc(data.prompt)}" loading="lazy">`;
    item.querySelector('.cap-model').textContent = m.name;
    item.querySelector('.cap-tag').textContent = data.mode === 'video' ? 'vídeo' : (data.fallback ? 'fallback grátis' : 'foto');
    const actions = document.createElement('div');
    actions.className = 'gen-item-actions';
    actions.innerHTML = `<a href="${url}" target="_blank" rel="noopener">abrir</a><a href="${url}" download="${m.id}.${data.mode === 'video' ? 'mp4' : 'png'}">baixar</a>`;
    item.appendChild(actions);
    gallery.push({ url, modelid: data.modelid, prompt: data.prompt, mode: data.mode, fallback: !!data.fallback });
    persistGallery();
  }

  function failItem(item, msg) {
    item.classList.remove('loading');
    item.classList.add('error');
    const media = item.querySelector('.gen-item-media');
    media.innerHTML = msg;
    item.querySelector('.cap-tag').textContent = 'erro';
  }

  /* ---------------- imagem anexada ---------------- */
  function readImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1024;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > max || h > max) {
          const scale = max / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        attached = canvas.toDataURL('image/jpeg', 0.82);
        imgPreviewImg.src = attached;
        imgPreview.hidden = false;
        attachNote.textContent = mode === 'video'
          ? 'Imagem anexada — vale só para fotos'
          : 'Imagem anexada — a IA edita ou cria a partir dela';
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function clearAttach() {
    attached = null;
    imgPreview.hidden = true;
    imgPreviewImg.removeAttribute('src');
    attachNote.textContent = 'Anexe uma foto para a IA editar ou criar a partir dela';
  }

  attachBtn.addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', () => {
    readImageFile(imageInput.files && imageInput.files[0]);
    imageInput.value = '';
  });
  imgRemove.addEventListener('click', clearAttach);
  promptInput.addEventListener('paste', (e) => {
    const item = Array.from(e.clipboardData.items || []).find((i) => i.type.startsWith('image/'));
    if (item && item.getAsFile) readImageFile(item.getAsFile());
  });

  /* ---------------- geração ---------------- */
  genForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (busy) return;
    const text = promptInput.value.trim();
    if (!text) { promptInput.focus(); return; }
    busy = true;
    sendBtn.disabled = true;
    sendBtn.querySelector('.send-arrow').textContent = '…';
    generate(text).catch(() => {}).finally(() => {
      busy = false;
      sendBtn.disabled = false;
      sendBtn.querySelector('.send-arrow').textContent = '✦';
    });
  });

  async function generate(text) {
    const m = active;
    const isVid = isVideo(m);
    const item = addLoadingItem(m);
    try {
      const out = isVid
        ? await generateVideo(m.api, text)
        : await generateImage(m.api, text);
      finalizeItem(item, { url: out, modelid: m.id, prompt: text, mode: isVid ? 'video' : 'foto' });
    } catch (err) {
      const code = err && err.code;
      if (code === 402 && !isVid && m.api !== FALLBACK_MODEL) {
        try {
          const out = await generateImage(FALLBACK_MODEL, text);          finalizeItem(item, { url: out, modelid: 'flux', prompt: text, mode: 'foto', fallback: true });
        } catch (fbErr) {
          failItem(item, 'Sem créditos no OpenRouter — o fallback (FLUX) também falhou. Adicione créditos ou use um modelo grátis.');
        }
        return;
      }
      if (code === 402) {
        failItem(item, isVid
          ? 'Vídeos exigem créditos no OpenRouter. Adicione em openrouter.ai/settings/credits e tente de novo.'
          : 'Este modelo premium exige créditos no OpenRouter — o fallback grátis também falhou. Adicione créditos em openrouter.ai/settings/credits.');
      } else if (code === 401) {
        failItem(item, 'Chave OpenRouter inválida. Abra “Chave OpenRouter” e cole uma chave válida (fotos grátis FLUX/Z-Image ainda funcionam).');
      } else if (code === 429) {
        failItem(item, 'Limite de requisições atingido. Espere alguns segundos e tente de novo.');
      } else {
        failItem(item, 'Erro ao gerar: ' + (err.message || 'tente novamente') + '.');
      }
    }
  }

  const isFree = (model) => model === 'flux' || model === 'zimage';

  function sizeToDim(sizeStr) {
    const [w, h] = String(sizeStr || '1024x1024').split('x').map(Number);
    return { width: w || 1024, height: h || 1024 };
  }

  async function freeImage(model, prompt, image) {
    const { width, height } = sizeToDim(aspectSel.value);
    let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model}&width=${width}&height=${height}&seed=${Math.floor(Math.random() * 1e6)}&nologo=true&referrer=the-gerett-studio.app`;
    if (image) url += '&image=' + encodeURIComponent(image);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 190000);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { Referer: 'https://the-gerett-studio.app' } });
      if (!res.ok) throw { code: res.status, message: 'Pollinations: ' + res.status };
      const blob = await res.blob();
      const dataUrl = await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = () => reject(new Error('não consegui ler a imagem'));
        fr.readAsDataURL(blob);
      });
      return dataUrl;
    } finally {
      clearTimeout(timer);
    }
  }

  async function generateImage(model, prompt) {
    if (isFree(model)) return freeImage(model, prompt, attached);
    const body = { model, prompt, n: 1, nologo: true, size: aspectSel.value };
    if (attached) body.input_references = [{ type: 'image_url', image_url: { url: attached } }];
    const res = await callOpenRouter(OR_IMG, body);
    const d = res.data && res.data[0];
    if (d && d.url) return d.url;
    if (d && d.b64_json) return 'data:image/' + (d.media_type ? d.media_type.replace('image/', '') : 'png') + ';base64,' + d.b64_json;
    throw new Error('resposta sem imagem');
  }

  async function generateVideo(model, prompt) {
    const body = { model, prompt, n: 1 };
    if (aspectSel.value) body.size = aspectSel.value;
    if (model.indexOf('veo-3.1') !== -1) body.duration = Number(durationSel.value) || 5;
    const res = await callOpenRouter(OR_VID, body);
    if (!res.id || !res.polling_url) {
      if (res.unsigned_urls && res.unsigned_urls.length) return res.unsigned_urls[0];
      throw new Error('resposta sem job de vídeo');
    }
    const deadline = Date.now() + 300000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 4000));
      const poll = await callOpenRouter(res.polling_url, null, 'GET');
      if (poll.status === 'completed' || poll.status === 'succeeded') {
        const u = (poll.unsigned_urls && poll.unsigned_urls[0]) || (poll.data && poll.data[0] && (poll.data[0].url || poll.data[0].signed_url));
        if (u) return u;
        throw new Error('vídeo concluído sem URL');
      }
      if (poll.status === 'failed' || poll.status === 'error' || poll.status === 'canceled') {
        throw new Error('geração de vídeo falhou');
      }
    }
    throw new Error('tempo de geração excedido (5 min)');
  }

  async function callOpenRouter(url, body, method = 'POST') {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 190000);
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + settings.key,
          'HTTP-Referer': 'https://the-gerett-studio.app',
          'X-Title': 'The-Gerett-Studio'
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal
      });
      if (!res.ok) {
        let detail = '';
        try {
          const j = await res.json();
          detail = (j.error && j.error.message) || '';
        } catch {}
        throw { code: res.status, message: detail || res.statusText };
      }
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  /* ---------------- chave / settings ---------------- */
  function refreshKeyStatus() {
    const on = !!settings.key;
    keyStatus.classList.toggle('off', !on);
    keyStatus.querySelector('span').textContent = on ? 'Chave OpenRouter ativa' : 'Sem chave — só fotos grátis';
    genHint.textContent = on
      ? 'Fotos grátis (FLUX/Z-Image) via Pollinations. Premium e vídeos usam a chave + créditos — se faltar crédito, cai para FLUX automaticamente.'
      : 'Sem chave: fotos grátis (FLUX/Z-Image) funcionam. Vídeos e premium precisam de uma chave com créditos (botão abaixo).';
  }
  $('#openSettings').addEventListener('click', () => {
    $('#apiKey').value = settings.key;
    settingsStatus.textContent = '';
    settingsEl.hidden = false;
    $('#apiKey').focus();
  });
  $('#closeSettings').addEventListener('click', () => { settingsEl.hidden = true; });
  settingsEl.addEventListener('click', (e) => { if (e.target === settingsEl) settingsEl.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') settingsEl.hidden = true; });
  $('#saveSettings').addEventListener('click', () => {
    const key = $('#apiKey').value.trim();
    settings = { key };
    store.set('arca.settings', settings);
    settingsStatus.textContent = key ? 'Chave salva. Fotos grátis e seus créditos disponíveis.' : 'Chave removida. Só fotos grátis.';
    refreshKeyStatus();
  });
  $('#clearKey').addEventListener('click', () => {
    settings = { key: '' };
    store.set('arca.settings', settings);
    $('#apiKey').value = '';
    settingsStatus.textContent = 'Chave removida. Só fotos grátis.';
    refreshKeyStatus();
  });
  $('#clearGallery').addEventListener('click', () => {
    gallery = [];
    store.set('arca.galeria', gallery);
    renderGallery();
  });
  $('#modelSearch').addEventListener('input', renderModelList);
  $$('.mode-btn').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  modelSel.addEventListener('change', () => selectModel(modelSel.value));

  /* ---------------- hero: imagens reais ciclando ---------------- */
  const heroPrompts = [
    { t: 'cidade futurista neon à noite, chuva e reflexos', seed: 111 },
    { t: 'tartaruga mecânica em uma floresta digital, impressionismo', seed: 222 },
    { t: 'astronauta flutuando em um mar de nuvens rosas', seed: 333 },
    { t: 'dragão de origami voando sobre templos japoneses', seed: 444 }
  ];
  const heroImg = $('#heroImg');
  const heroPrompt = $('#heroPrompt');
  let heroIdx = 0;
  function heroCycle() {
    const p = heroPrompts[heroIdx];
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p.t)}?model=flux&width=512&height=512&seed=${p.seed}&nologo=true`;
    const img = new Image();
    img.onload = () => {
      heroImg.src = url;
      heroImg.classList.add('loaded');
      heroImg.parentElement.classList.add('has-img');
    };
    img.src = url;
    heroPrompt.textContent = p.t;
    heroIdx = (heroIdx + 1) % heroPrompts.length;
    setTimeout(heroCycle, 9000);
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const first = heroPrompts[0];
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(first.t)}?model=flux&width=512&height=512&seed=${first.seed}&nologo=true`;
    heroImg.src = url;
    heroImg.classList.add('loaded');
    heroImg.parentElement.classList.add('has-img');
    heroPrompt.textContent = first.t;
  } else {
    heroCycle();
  }

  /* ---------------- marquee ---------------- */
  const track = $('#marqueeTrack');
  track.innerHTML += track.innerHTML;

  /* ---------------- nav ---------------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  const burger = $('#navBurger');
  const navLinks = $('#navLinks');
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  $$('#navLinks a').forEach((a) => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
  }));

  /* ---------------- scroll reveal ---------------- */
  const revealEls = $$('.model-card, .section-head, .bento-cell, .steps li, .faq-item, .hero-copy, .hero-gen');
  revealEls.forEach((el) => el.classList.add('reveal'));
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------------- init ---------------- */
  renderModelGrid();
  setMode(mode, false);
  selectModel(state.model);
  renderGallery();
  refreshKeyStatus();
})();
