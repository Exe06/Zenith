(() => {
  // ----- refs -----
  const form = document.getElementById('listingForm');
  const title = document.getElementById('title');
  const titleCount = document.getElementById('titleCount');
  const desc = document.getElementById('description');
  const descCount = document.getElementById('descCount');

  const opSel = document.getElementById('operationType');
  const baseAmount = document.getElementById('baseAmount');
  const deposit = document.getElementById('deposit');
  const guarantee = document.getElementById('guarantee');

  const dailyPrice       = document.getElementById('dailyPrice');
  const weeklyDiscount   = document.getElementById('weeklyDiscount');
  const monthlyDiscount  = document.getElementById('monthlyDiscount');

  const provinceSel = document.getElementById('province');
  const city = document.getElementById('city');

  const sideOp = document.getElementById('sideOp');
  const sidePrice = document.getElementById('sidePrice');
  const sideTitle = document.getElementById('sideTitle');
  const sideLocation = document.getElementById('sideLocation');
  const sideChips = document.getElementById('sideChips');
  const sideImg = document.getElementById('sideImg');

  const chipsWrap = document.getElementById('amenities');
  const drop = document.getElementById('drop');
  const inputFiles = document.getElementById('files');
  const previews = document.getElementById('previews');

  // wrappers (los .field que contienen a cada input)
  const baseAmountWrap   = baseAmount?.closest('.field');
  const depositWrap      = deposit?.closest('.field');
  const guaranteeWrap    = guarantee?.closest('.field');

  const dailyWrap        = dailyPrice?.closest('.field');
  const weeklyWrap       = weeklyDiscount?.closest('.field');
  const monthlyWrap      = monthlyDiscount?.closest('.field');

  const DEFAULT_IMG = 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=600&auto=format&fit=crop';

  // ----- helpers -----
  const fmtARS = n => '$ ' + (Number(n || 0)).toLocaleString('es-AR');

  function updateSide() {
    sideTitle.textContent = title.value || 'Título de la publicación';
    const opText = opSel?.options[opSel.selectedIndex]?.text || 'Operación';
    sideOp.textContent = opText;

    const isTemporal = opSel?.value === '2';
    let priceToShow = 0;
    
    if (isTemporal) {
      priceToShow = dailyPrice?.value;
    } else {
      priceToShow = deposit?.value; 
    }
    sidePrice.textContent = fmtARS(priceToShow);
    sideLocation.textContent = `${provinceSel?.value || 'Provincia'}, ${city?.value || 'Ciudad'}`;

    const actives = Array.from(chipsWrap.querySelectorAll('.chip[data-active="true"]'))
      .slice(0, 4).map(el => el.textContent.trim());
    sideChips.innerHTML = actives.map(t => `<span class="chip">${t}</span>`).join('');
  }

  function setEnabled(el, enabled) {
    if (!el) return;
    el.disabled = !enabled;
    if (!enabled) {
      el.dataset.wasRequired = el.required ? '1' : '';
      el.required = false;
    } else if (el.dataset.wasRequired === '1') {
      el.required = true;
    }
  }

  function show(elWrap, visible) {
    if (!elWrap) return;
    elWrap.hidden = !visible;
  }

  // ----- contadores -----
  title?.addEventListener('input', () => {
    titleCount.textContent = `${title.value.length}/80`;
    updateSide();
  });
  desc?.addEventListener('input', () => {
    descCount.textContent = `${desc.value.length}/500`;
  });

  // ----- actualizaciones al cambiar campos clave -----
  ['city','operationType','province','dailyPrice','propertyType','address', 'deposit']
    .forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', updateSide);
      el.addEventListener('change', updateSide);
    });

  // crear inputs ocultos según chips activos
  function syncAmenities() {
    // limpiar anteriores
    form.querySelectorAll('input[name="servicios"]').forEach(el => el.remove());
    // agregar uno por cada chip activo
    chipsWrap.querySelectorAll('.chip.active').forEach(chip => {
      const inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = 'servicios';
      inp.value = chip.dataset.key;
      form.appendChild(inp);
    });
  }

  // ----- amenities toggle (solo visual + preview derecha) -----
  chipsWrap.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const active = chip.dataset.active === 'true' ? 'false' : 'true';
    chip.dataset.active = active;
    chip.classList.toggle('active', active === 'true');
    updateSide();
    syncAmenities();
  });

  form.addEventListener('submit', syncAmenities);

  // ----- mostrar/ocultar según operación -----
  function applyOperationMode() {
    const isTemporal = opSel?.value === '2';

    // Largo plazo: mostrar y habilitar
    show(baseAmountWrap,   !isTemporal);
    show(depositWrap,      !isTemporal);
    show(guaranteeWrap,    !isTemporal);
    setEnabled(baseAmount,       !isTemporal);
    setEnabled(deposit,          !isTemporal);
    setEnabled(guarantee,        !isTemporal);

    // Temporal: mostrar y habilitar
    show(dailyWrap,   isTemporal);
    show(weeklyWrap,  isTemporal);
    show(monthlyWrap, isTemporal);
    setEnabled(dailyPrice,      isTemporal);
    setEnabled(weeklyDiscount,  isTemporal);
    setEnabled(monthlyDiscount, isTemporal);

    updateSide();
  }

  opSel?.addEventListener('change', applyOperationMode);
  applyOperationMode();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyOperationMode);
  } else {
    applyOperationMode();
  }

  // ----- uploader y previews -----
  function renderPreview(file) {
    const url = URL.createObjectURL(file);
    const box = document.createElement('div');
    box.className = 'ph';
    box.innerHTML = `<img src="${url}" alt="imagen"><button type="button" title="Eliminar">✕</button>`;

    box.querySelector('button').onclick = () => {
      // si era la portada, volver a default o a la siguiente
      if (sideImg.src === url) {
        // si hay otra preview, usar su img; si no, default
        const next = box.nextElementSibling?.querySelector('img') || previews.querySelector('.ph img');
        sideImg.src = next ? next.src : DEFAULT_IMG;
      }
      URL.revokeObjectURL(url);
      box.remove();
    };

    previews.appendChild(box);
    if (previews.children.length === 1) sideImg.src = url; // primera imagen => portada
  }

  inputFiles.addEventListener('change', () => {
    [...inputFiles.files].filter(f => f.type.startsWith('image/')).slice(0, 10).forEach(renderPreview);
  });

  ['dragover','drop'].forEach(ev => drop.addEventListener(ev, e => e.preventDefault()));
  drop.addEventListener('drop', (e) => {
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/')).slice(0, 10);
    files.forEach(renderPreview);
  });

  // ----- init -----
  titleCount.textContent = `${title?.value.length || 0}/80`;
  descCount.textContent = `${desc?.value.length || 0}/500`;
  updateSide();
})();
