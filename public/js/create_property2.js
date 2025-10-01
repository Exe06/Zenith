(() => {
  'use strict';

  // ---------------------------
  // Provincias
  // ---------------------------
  const provincias = [
    'Buenos Aires','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy',
    'La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis',
    'Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán'
  ];
  const provinceSel = document.getElementById('province');
  provinceSel.innerHTML = '<option value="">Seleccionar</option>' +
    provincias.map(p => `<option value="${p}">${p}</option>`).join('');

  // ---------------------------
  // Elementos base
  // ---------------------------
  const form = document.getElementById('listingForm');
  const errors = document.getElementById('formErrors');

  const title = document.getElementById('title');
  const titleCount = document.getElementById('titleCount');
  const desc = document.getElementById('description');
  const descCount = document.getElementById('descCount');

  const opSel = document.getElementById('operationType');
  const propertyTypeSel = document.getElementById('propertyType');
  const address = document.getElementById('address');
  const city = document.getElementById('city');
  const neighborhood = document.getElementById('neighborhood');

  const baseAmount = document.getElementById('baseAmount');
  const paymentFrequency = document.getElementById('paymentFrequency');
  const deposit = document.getElementById('deposit');
  const expenses = document.getElementById('expenses');
  const guarantee = document.getElementById('guarantee');

  const rooms = document.getElementById('rooms');
  const bedrooms = document.getElementById('bedrooms');
  const bathrooms = document.getElementById('bathrooms');
  const area = document.getElementById('area');
  const coveredArea = document.getElementById('covered-area');
  const floors = document.getElementById('floors');

  // Side preview
  const sideOp = document.getElementById('sideOp');
  const sidePrice = document.getElementById('sidePrice');
  const sideFreq = document.getElementById('sideFreq');
  const sideTitle = document.getElementById('sideTitle');
  const sideLocation = document.getElementById('sideLocation');
  const sideChips = document.getElementById('sideChips');
  const sideImg = document.getElementById('sideImg');

  // Uploader
  const drop = document.getElementById('drop');
  const inputFiles = document.getElementById('files');
  const previews = document.getElementById('previews');

  // ---------------------------
  // Helpers
  // ---------------------------
  const fmtARS = n => '$ ' + (Number(n || 0)).toLocaleString('es-AR');

  function getFieldLabel(el) {
    if (el.id) {
      const lab = document.querySelector(`label[for="${el.id}"]`);
      if (lab) return lab.textContent.trim();
    }
    const wrap = el.closest('label');
    if (wrap) return wrap.textContent.trim();
    return el.getAttribute('placeholder') || el.name || el.id || 'Campo';
  }

  function getValidityReason(el) {
    const v = el.validity;
    if (v.valueMissing) return 'es obligatorio';
    if (v.typeMismatch) return 'tiene un formato inválido';
    if (v.patternMismatch) return 'no cumple el formato requerido';
    if (v.tooShort) return `debe tener al menos ${el.minLength} caracteres`;
    if (v.tooLong) return `no puede superar ${el.maxLength} caracteres`;
    if (v.rangeUnderflow) return `debe ser ≥ ${el.min}`;
    if (v.rangeOverflow) return `debe ser ≤ ${el.max}`;
    if (v.stepMismatch) return 'no coincide con el incremento permitido';
    return el.validationMessage || 'no es válido';
  }

  // ---------------------------
  // Side preview live
  // ---------------------------
  function updateSide() {
    sideTitle.textContent = title.value || 'Título de la publicación';
    const opText = opSel.options[opSel.selectedIndex]?.text || 'Operación';
    sideOp.textContent = opText;
    sidePrice.textContent = fmtARS(baseAmount.value);
    sideFreq.textContent = paymentFrequency ? `Pago: ${paymentFrequency.value || '-'}` : 'Pago: -';
    sideLocation.textContent = `${provinceSel.value || 'Provincia'}, ${city.value || 'Ciudad'}`;

    const am = Array.from(document.querySelectorAll('#amenities .chip[data-active="true"]'))
      .slice(0, 4)
      .map(e => e.textContent.trim());
    sideChips.innerHTML = am.map(t => `<span class="chip">${t}</span>`).join('');
  }

  title.addEventListener('input', () => {
    titleCount.textContent = `${title.value.length}/80`;
    updateSide();
  });
  desc.addEventListener('input', () => {
    descCount.textContent = `${desc.value.length}/500`;
  });

  ['city','operationType','paymentFrequency','province','baseAmount','propertyType','address']
    .forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', updateSide);
      el.addEventListener('change', updateSide);
    });

  // Reglas según tipo de operación
  function applyOperationRules() {
    const isTemporal = opSel.value === 'temporal';
    // Garantía requerida solo en largo plazo
    guarantee.disabled = isTemporal;
    if (isTemporal) {
      guarantee.value = '';
      guarantee.classList.remove('invalid');
    }
    // Frecuencia no se oculta, pero podría ajustarse por defecto:
    if (!paymentFrequency.value) {
      paymentFrequency.value = isTemporal ? 'diaria' : 'mensual';
    }
    updateSide();
  }
  opSel.addEventListener('change', applyOperationRules);

  // ---------------------------
  // Amenities toggle
  // ---------------------------
  document.getElementById('amenities').addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      const now = e.target.dataset.active === 'true' ? 'false' : 'true';
      e.target.dataset.active = now;
      e.target.classList.toggle('active', now === 'true');
      updateSide();
    }
  });

  // ---------------------------
  // Uploader
  // ---------------------------
  function renderPreview(file) {
    const url = URL.createObjectURL(file);
    const box = document.createElement('div');
    box.className = 'ph';
    box.innerHTML = `<img src="${url}" alt="imagen">
                     <button type="button" title="Eliminar">✕</button>`;
    box.querySelector('button').onclick = () => {
      if (sideImg.src === url) {
        sideImg.src = 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=600&auto=format&fit=crop';
      }
      URL.revokeObjectURL(url);
      box.remove();
    };
    previews.appendChild(box);
    if (previews.children.length === 1) sideImg.src = url;
  }

  inputFiles.addEventListener('change', () => {
    [...inputFiles.files].filter(f => f.type.startsWith('image/')).slice(0, 10).forEach(renderPreview);
  });
  ['dragover','drop'].forEach(ev => drop.addEventListener(ev, e => e.preventDefault()));
  drop.addEventListener('drop', (e) => {
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/')).slice(0, 10);
    files.forEach(renderPreview);
  });

  // ---------------------------
  // Draft (simulado)
  // ---------------------------
  document.getElementById('draftBtn').addEventListener('click', () => {
    alert('Borrador guardado localmente (simulado).');
  });

  // ---------------------------
  // Validación y submit
  // ---------------------------
  // Quita marca al corregir
  form.addEventListener('input', (e) => {
    if (e.target.classList.contains('invalid') && e.target.checkValidity()) {
      e.target.classList.remove('invalid');
      if (!form.querySelector(':invalid')) errors.innerHTML = '';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errors.innerHTML = '';
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

    // Aplico reglas antes de validar
    applyOperationRules();

    // Recolecto inválidos por constraints HTML5
    const invalidEls = Array.from(form.querySelectorAll('input,select,textarea'))
      .filter(el => !el.disabled && !el.checkValidity());

    // Regla de negocio: garantía obligatoria si largo plazo
    const manualErrors = [];
    if (opSel.value === 'largo-plazo' && !guarantee.value) {
      manualErrors.push({ el: guarantee, msg: 'Para alquiler a largo plazo, la garantía es obligatoria.' });
    }

    if (invalidEls.length || manualErrors.length) {
      const items = [
        ...invalidEls.map(el => `<li><strong>${getFieldLabel(el)}</strong> ${getValidityReason(el)}.</li>`),
        ...manualErrors.map(m => `<li><strong>${getFieldLabel(m.el)}</strong> ${m.msg}</li>`)
      ].join('');
      errors.innerHTML = `<ul class="error-list">${items}</ul>`;

      // marcar y enfocar el primero
      [...invalidEls, ...manualErrors.map(m => m.el)].forEach(el => el.classList.add('invalid'));
      const first = invalidEls[0] || (manualErrors[0] && manualErrors[0].el);
      if (first) {
        first.focus({ preventScroll: true });
        first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // ✅ válido: armo payload
    const amenities = Array.from(document.querySelectorAll('#amenities .chip[data-active="true"]'))
      .map(el => el.dataset.key);

    const payload = {
      title: title.value,
      operation_type: opSel.value,
      property_type: propertyTypeSel.value,
      address: address.value,
      province: provinceSel.value,
      city: city.value,
      neighborhood: neighborhood.value,
      description: desc.value,
      details: {
        rooms: +rooms.value,
        bedrooms: +bedrooms.value,
        bathrooms: +bathrooms.value,
        area: +area.value,
        covered_area: +coveredArea.value,
        floors: +floors.value
      },
      amenities,
      pricing: {
        base_amount: +baseAmount.value,
        payment_frequency: paymentFrequency.value || null,
        deposit: +deposit.value || 0,
        expenses: +expenses.value || 0,
        guarantee: guarantee.value || null
      },
      location: {
        maps: document.getElementById('maps').value || null
      }
    };

    console.log('Payload listo para API:', payload);
    alert('Publicación creada (simulación). Mirá la consola.');
    form.submit();
  });

  // Init
  titleCount.textContent = `${title.value.length}/80`;
  descCount.textContent = `${desc.value.length}/500`;
  applyOperationRules();
  updateSide();

})();
