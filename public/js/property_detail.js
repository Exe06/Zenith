document.addEventListener('DOMContentLoaded', () => {
  const mainFig   = document.getElementById('mainPhoto');
  const mainImg   = mainFig ? mainFig.querySelector('img') : null;
  const label     = document.getElementById('imgLabel');
  const thumbsWrap= document.getElementById('thumbs') || document.querySelector('.thumbs');
  const thumbs    = Array.from(thumbsWrap?.querySelectorAll('.thumb img') || []);
  const G         = Array.isArray(window.GALLERY) ? window.GALLERY : [];

  if (!mainImg || !label) return;

  // Helpers
  const TOTAL = G.length || (1 + thumbs.length);
  const norm = (url) => { try { return new URL(url, location.origin).pathname; } catch { return url; } };

  // Índice actual de la principal dentro de GALLERY
  let current = (() => {
    const idx = G.findIndex(u => norm(u) === norm(mainImg.src));
    return idx >= 0 ? idx : 0;
  })();

  // Proteger principal ante errores
  let lastGoodSrc = mainImg.currentSrc || mainImg.src;
  mainImg.addEventListener('load',  () => { lastGoodSrc = mainImg.currentSrc || mainImg.src; });
  mainImg.addEventListener('error', () => { mainImg.src = lastGoodSrc; });

  const setIndex = (i) => { label.textContent = `${i + 1} / ${TOTAL}`; };
  setIndex(current);

  // Marcar activa la primera thumb visible
  const firstThumb = thumbsWrap?.querySelector('.thumb');
  if (firstThumb) firstThumb.classList.add('active');

  // Swap principal <-> thumb clickeada
  thumbsWrap?.addEventListener('click', (e) => {
    const tImg = e.target.closest('.thumb img');
    if (!tImg) return;
    e.preventDefault();

    // índice real del thumbnail
    let tIdx = Number(tImg.dataset.idx);
    if (!Number.isFinite(tIdx)) {
      const found = G.findIndex(u => norm(u) === norm(tImg.src));
      tIdx = found >= 0 ? found : Math.min(current + 1, TOTAL - 1);
    }

    // Intercambio de imágenes
    const prevMainSrc = mainImg.src;
    const prevMainAlt = mainImg.alt;

    mainImg.src = tImg.src;
    mainImg.alt = tImg.alt || 'Foto';

    tImg.src = prevMainSrc;
    tImg.alt = prevMainAlt || '';

    // Actualizar índice/etiqueta y coherencia del data-idx
    const prevCurrent = current;
    current = tIdx;
    setIndex(current);
    tImg.dataset.idx = String(prevCurrent);

    // Activa visual
    thumbsWrap.querySelectorAll('.thumb.active').forEach(el => el.classList.remove('active'));
    tImg.closest('.thumb').classList.add('active');
  });

  // ----- Lightbox (usa el HTML existente) -----
  const lb       = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lbImg');
  const lbPrev   = lb?.querySelector('.lb-prev');
  const lbNext   = lb?.querySelector('.lb-next');
  const lbCount  = document.getElementById('lbCounter');
  const seeAll   = document.getElementById('seeAllBtn');

  if (lb && G.length) {
    let i = current;
    const show  = (idx) => { i = (idx + G.length) % G.length; lbImg.src = G[i]; lbCount.textContent = `${i+1} / ${G.length}`; };
    const open  = (idx=0) => { show(idx); lb.hidden = false; document.body.style.overflow='hidden'; };
    const close = () => { lb.hidden = true;  document.body.style.overflow=''; };

    lb.addEventListener('click', (e)=>{ if (e.target.dataset.close) close(); });
    lbPrev?.addEventListener('click', ()=> show(i-1));
    lbNext?.addEventListener('click', ()=> show(i+1));
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft')  show(i-1);
      if (e.key === 'ArrowRight') show(i+1);
    });

    // Abrir lightbox
    seeAll?.addEventListener('click', () => open(current));
    mainImg.addEventListener('click', () => open(current));
  }

  // Favorito
  const favBtn = document.getElementById('favBtn');
  favBtn?.addEventListener('click', function () {
    this.classList.toggle('active');
    this.title = this.classList.contains('active') ? 'Quitar de favoritos' : 'Agregar a favoritos';
  });

  // Compartir
  const shareBtn = document.getElementById('shareBtn');
  shareBtn?.addEventListener('click', async () => {
    const data = { title: document.title, text: 'Mirá esta propiedad que encontré', url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); alert('Enlace copiado al portapapeles'); }
    } catch (e) { console.log(e); }
  });
});
