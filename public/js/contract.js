// /public/js/contract-form.js

// Helpers
const $ = (s, ctx=document) => ctx.querySelector(s);
const money = n => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(+n||0);

function daysBetweenExclusive(startISO, endISO){
  if(!startISO || !endISO) return 0;
  const s = new Date(startISO+'T00:00:00Z');
  const e = new Date(endISO+'T00:00:00Z'); // fin EXCLUSIVO
  const ms = e - s;
  return Math.max(0, Math.round(ms / 86400000));
}
function monthsBetween(startISO, endISO){
  if(!startISO || !endISO) return 0;
  const s = new Date(startISO+'T00:00:00Z');
  const e = new Date(endISO+'T00:00:00Z');
  let m = (e.getUTCFullYear()-s.getUTCFullYear())*12 + (e.getUTCMonth()-s.getUTCMonth());
  if (e.getUTCDate() < s.getUTCDate()) m -= 1;
  return Math.max(0, m);
}

// Nodos
const form = $('#contractForm');
const selProp = $('#property_id');
const inpType = $('#contract_type');
const hiddenOwner = $('#owner_id');

const boxGuarantee = $('#box_guarantee');
const selGuarantee = $('#guarantee_id');

const start = $('#start_date');
const end = $('#end_date');

const boxFreq = $('#box_frequency');
const selFreq = $('#pay_frequency');
const freqHiddenLP = $('#pay_frequency_hidden');

const unit = $('#unit_price');
const lblUnit = $('#lbl_unit_price');
const helpUnit = $('#help_unit_price');

const boxDepo = $('#box_deposito');
const depo = $('#deposito');

const boxExp = $('#box_expensas');
const expensas = $('#expensas');

const boxCuota = $('#box_cuota');
const cuotaInp = $('#cuota');

const total = $('#total');

const calcSpan = $('#calc_span');
const calcSuggest = $('#calc_suggest');
const propTitle = $('#prop_title');

const estadoHidden = $('#estado');

// reglas por tipo
const FREQS_TEMP = ['un_pago','diario','semanal','mensual'];

// init
init();

function init(){
  // set min hoy por UX
  const today = new Date().toISOString().slice(0,10);
  start.min = today;

  onPropertyChange(); // por si viene preseleccionada

  selProp.addEventListener('change', onPropertyChange);
  [start, end, unit, depo, expensas].forEach(el=> el.addEventListener('input', recalcTotal));
  if (selFreq) selFreq.addEventListener('input', recalcTotal);
  form.addEventListener('submit', onSubmit);
}

function onPropertyChange(){
  const opt = selProp.selectedOptions[0];
  if(!opt || !opt.value){
    inpType.value='';
    propTitle.textContent='–';
    selFreq.innerHTML='';
    unit.value=''; helpUnit.textContent='';
    toggleLP(false);
    total.value='';
    hideCuota();
    return;
  }

  // Datos de la propiedad
  const type = opt.dataset.contractType;            // "Temporal" | "Largo Plazo"
  const ownerIdFromProp = opt.dataset.ownerId;
  const monthly = parseFloat(opt.dataset.monthlyPrice||0);
  const daily = parseFloat(opt.dataset.dailyPrice||0);

  // Seteo de campos derivados
  inpType.value = type || '';
  propTitle.textContent = opt.dataset.title || `#${opt.value}`;

  // Owner: si no viene desde servidor, tomamos de la propiedad
  if(!hiddenOwner.value && ownerIdFromProp){
    hiddenOwner.value = ownerIdFromProp;
  }

  // Mostrar/ocultar secciones según tipo
  const isLP = (type === 'Largo Plazo');
  toggleLP(isLP);

  // Frecuencia
  if(isLP){
    // LP ⇒ fijo mensual (oculta select, habilita hidden)
    boxFreq.style.display = 'none';
    if (selFreq){
      selFreq.required = false;
      selFreq.innerHTML = '';
      selFreq.value = '';
    }
    freqHiddenLP.disabled = false;
    freqHiddenLP.value = 'mensual';
  } else {
    // TEMP ⇒ muestra select
    boxFreq.style.display = 'block';
    if (selFreq){
      selFreq.required = true;
      freqHiddenLP.disabled = true;
      selFreq.innerHTML = '';
      FREQS_TEMP.forEach(v=>{
        const o = document.createElement('option');
        o.value = o.textContent = v;
        selFreq.appendChild(o);
      });
      selFreq.value = selFreq.value || 'un_pago';
    }
    freqHiddenLP.disabled = true;
  }

  // Unit price + hints
  if(isLP){
    lblUnit.textContent = 'Precio mensual';
    helpUnit.textContent = monthly ? `Sugerido: ${money(monthly)}` : 'Precio por mes';
    unit.value = monthly || '';
  } else {
    lblUnit.textContent = 'Precio por día';
    helpUnit.textContent = daily ? `Sugerido: ${money(daily)}` : 'Precio por día';
    unit.value = daily || '';
  }

  recalcTotal();
}

function toggleLP(isLP){
  // Garantía + Depósito + Expensas solo en LP
  boxGuarantee.style.display = isLP ? 'block' : 'none';
  boxDepo.style.display      = isLP ? 'block' : 'none';
  boxExp.style.display       = isLP ? 'block' : 'none';
  if(!isLP){ depo.value=''; expensas.value=''; }
}

function showCuota(val){
  if(!boxCuota || !cuotaInp) return;
  boxCuota.style.display = 'block';
  cuotaInp.value = (isFinite(val) ? +val : 0).toFixed(2);
}
function hideCuota(){
  if(!boxCuota || !cuotaInp) return;
  boxCuota.style.display = 'none';
  cuotaInp.value = '';
}

function recalcTotal(){
  const type = (inpType.value || '').trim();         // "Temporal" | "Largo Plazo"
  const freq = selFreq ? selFreq.value : '';         // 'un_pago','diario','semanal','mensual'
  const s = start.value, e = end.value;
  const u = parseFloat(unit.value || 0);

  // ---------- CUOTA (decisión SOLO por tipo/frecuencia) ----------
  if (type === 'Temporal'){
    if (freq && freq !== 'un_pago'){
      let mult = 0;
      if (freq === 'diario')  mult = 1;
      if (freq === 'semanal') mult = 7;
      if (freq === 'mensual') mult = 30;
      showCuota((+unit.value || 0) * mult); // si no hay precio aún, muestra 0.00
    } else {
      hideCuota();
    }
  } else {
    hideCuota(); // LP nunca muestra cuota
  }

  // ---------- TOTAL (requiere fechas válidas y precio) ----------
  if (s && e && e <= s){
    total.value=''; calcSpan.textContent='–'; calcSuggest.textContent='–';
    return;
  }

  if (type === 'Temporal'){
    if (!s || !e || !unit.value){
      total.value=''; calcSpan.textContent='–'; calcSuggest.textContent='–';
      return;
    }
    const nights = daysBetweenExclusive(s, e);
    calcSpan.textContent = `${nights} noche(s)`;
    const suggested = (+unit.value) * nights; // total del contrato temporal
    total.value = suggested.toFixed(2);
    calcSuggest.textContent = money(suggested);

  } else if (type === 'Largo Plazo'){
    if (!s || !e || !unit.value){
      total.value=''; calcSpan.textContent='–'; calcSuggest.textContent='–';
      return;
    }
    const months = monthsBetween(s, e);
    calcSpan.textContent = `${months} mes(es)`;
    const suggested = (+unit.value) * months; // precio mensual * meses
    total.value = suggested.toFixed(2);
    calcSuggest.textContent = money(suggested);

  } else {
    total.value=''; calcSpan.textContent='–'; calcSuggest.textContent='–';
  }
}

function onSubmit(e){
  const errs = [];

  if(!selProp.value) errs.push('Seleccioná una propiedad.');
  if(!inpType.value) errs.push('No se pudo determinar el tipo de contrato.');
  if(!hiddenOwner.value) errs.push('No se encontró el propietario (sesión).');
  if(!$('#tenant_dni').value || !/^[0-9]{6,12}$/.test($('#tenant_dni').value)) errs.push('Ingresá un DNI válido.');
  if(!start.value || !end.value) errs.push('Completá fechas de inicio y fin.');
  if(end.value && start.value && end.value <= start.value) errs.push('La fecha de fin debe ser posterior al inicio.');
  if(!unit.value || +unit.value<=0) errs.push('Ingresá un precio válido.');
  if(!total.value || +total.value<0) errs.push('Total inválido.');

  // En temporario, frecuencia es requerida
  if(inpType.value==='Temporal' && (!selFreq || !selFreq.value)) errs.push('Elegí una frecuencia.');

  if(errs.length){
    e.preventDefault();
    alert('Revisá el formulario:\n\n• ' + errs.join('\n• '));
    return;
  }

  // Estado automático: start <= hoy ⇒ activo, si no ⇒ pendiente
  const today = new Date().toISOString().slice(0,10);
  estadoHidden.value = (start.value <= today) ? 'activo' : 'pendiente';

  // Para LP, forzar frecuencia mensual en el payload:
  if(inpType.value==='Largo Plazo'){
    if (selFreq) selFreq.disabled = true; // por si el navegador lo envía
    freqHiddenLP.disabled = false;
    freqHiddenLP.value = 'mensual';
  }

  // Normalizar decimales
  unit.value  = (+unit.value||0).toFixed(2);
  total.value = (+total.value||0).toFixed(2);
  if(depo.value) depo.value = (+depo.value||0).toFixed(2);
  if(expensas.value) expensas.value = (+expensas.value||0).toFixed(2);
}
