// ========== Fuente de datos ==========
const DATA = (window.__PROFILE_DATA || {});
const TENANT_ID = DATA.tenantId || 999;

let contratosTenant = Array.isArray(DATA.contratos) ? DATA.contratos : [
  { id: 101, owner_name:'Juan Pérez', owner_id: 11, property_id: 1, property_title:'Estilo cálido',
    contract_type:'long_term', pay_frequency:'mensual', start_date:'2025-03-01', end_date:'2026-01-31',
    unit_price:320000, estado:'activo'
  },
  { id: 102, owner_name:'Lucas González', owner_id: 12, property_id: 3, property_title:'Loft moderno',
    contract_type:'temporary', pay_frequency:'mensual', start_date:'2024-03-01', end_date:'2025-02-28',
    unit_price:180000, estado:'completado'
  },
];

let pagosTenant = Array.isArray(DATA.pagos) ? DATA.pagos : [
  { id:'p1', contratoId:101, fecha:'10/07/2025', prop:'Estilo cálido', mes:'Julio', anio:2025, monto:320000, estado:'pagado' },
  { id:'p2', contratoId:101, fecha:'15/08/2025', prop:'Estilo cálido', mes:'Agosto', anio:2025, monto:320000, estado:'pendiente' },
  { id:'p3', contratoId:102, fecha:'02/08/2025', prop:'Loft moderno', mes:'Agosto', anio:2025, monto:180000, estado:'atrasado' },
];

let mensajesTenant = Array.isArray(DATA.mensajes) ? DATA.mensajes : [
  { id:'m1', ts:'2025-08-03T12:10:00Z', owner:'Juan Pérez', prop:'Estilo cálido',
    asunto:'Visita programada', preview:'Recordá que mañana…',
    hilo:[ {from:'propietario', text:'Recordá que mañana a las 10hs.', ts:'2025-08-03T12:10:00Z'} ]
  },
  { id:'m2', ts:'2025-08-04T09:15:00Z', owner:'Lucas González', prop:'Loft moderno',
    asunto:'Nota expensas', preview:'Se acreditó el pago…',
    hilo:[ {from:'propietario', text:'Se acreditó el pago de expensas.', ts:'2025-08-04T09:15:00Z'} ]
  },
];

// ========== Helpers UI ==========
const $ = s => document.querySelector(s);
const el = (t,o={}) => Object.assign(document.createElement(t),o);
const money = n => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(+n||0);

const statusPill = (txt) => {
  const key = (txt||'').toLowerCase();
  const map = {
    pagado:'chip chip-ok', pendiente:'chip chip-warn', atrasado:'chip chip-bad',
    activo:'chip chip-ok', finalizado:'chip', completado:'chip', canceledo:'chip chip-bad'
  };
  const label = key.charAt(0).toUpperCase()+key.slice(1);
  return el('span',{className: map[key]||'chip', textContent: label});
};

function formatDMY(iso){
  if(!iso) return '';
  const d = new Date(iso+'T00:00:00Z');
  const dd = String(d.getUTCDate()).padStart(2,'0');
  const mm = String(d.getUTCMonth()+1).padStart(2,'0');
  const yy = d.getUTCFullYear();
  return `${dd}/${mm}/${yy}`;
}

// ========== Tabs ==========
function bindTabs(){
  document.querySelectorAll('.panel-header .tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.panel-header .tab').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=true);
      btn.classList.add('active');
      const pane = document.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`);
      if (pane) pane.hidden=false;
    });
  });
}

// ========== Render: Pagos ==========
function renderTPagos(){
  const tb = $('#tbTPagos'); if(!tb) return;
  tb.innerHTML = '';

  const rows = pagosTenant.map(p=>{
    const [d,m,y] = p.fecha.split('/').map(Number);
    const due = new Date(y, m-1, d);
    const today = new Date(); today.setHours(0,0,0,0);
    const dd = new Date(due.getFullYear(),due.getMonth(),due.getDate());
    const est = (p.estado==='pagado') ? 'pagado' : (today > dd ? 'atrasado' : 'pendiente');
    return {...p, _estado: est, _due: dd.getTime()};
  }).sort((a,b)=> a._due - b._due);

  function makePayButton(p){
    const btn = Object.assign(el('button',{className:'btn pay', type:'button'}),{textContent:'Pagar'});
    btn.addEventListener('click', ()=> openPayModal(p));
    return btn;
  }

  rows.forEach(p=>{
    const tr = el('tr');
    tr.append(
      el('td',{textContent:p.fecha}),
      el('td',{textContent:p.prop}),
      el('td',{textContent:`${p.mes} ${p.anio}`}),
      el('td',{textContent:money(p.monto)}),
      el('td',{}),
      el('td',{className:'text-right actions'})
    );
    tr.children[4].appendChild(statusPill(p._estado));

    if (p._estado==='pagado'){
      const btnComp = Object.assign(el('a',{className:'btn ghost', href:'#'}),{textContent:'Comprobante'});
      btnComp.addEventListener('click', e=>{ e.preventDefault(); alert(`Comprobante\n${p.prop} · ${p.fecha} · ${money(p.monto)}`); });
      tr.children[5].append(btnComp);
    } else {
      tr.children[5].append(makePayButton(p));
    }

    tb.appendChild(tr);
  });
}

// ========== Render: Contratos ==========
function renderTContratos(){
  const tb = $('#tbTContratos'); if(!tb) return;
  tb.innerHTML = '';
  contratosTenant.forEach(c=>{
    const tr = el('tr');
    tr.append(
      el('td',{textContent:c.owner_name || ('#'+c.owner_id)}),
      el('td',{textContent:c.property_title || ('#'+c.property_id)}),
      el('td',{textContent:formatDMY(c.start_date)}),
      el('td',{textContent:formatDMY(c.end_date)}),
      el('td',{textContent:(c.contract_type==='long_term'?'Mensual':c.pay_frequency)}),
      el('td',{textContent:money(c.unit_price)}),
      el('td',{}),
      el('td',{className:'text-right actions'})
    );
    tr.children[6].appendChild(statusPill(c.estado));
    const btnPDF = Object.assign(el('a',{className:'btn ghost', href:'#'}),{textContent:'Ver PDF'});
    btnPDF.addEventListener('click', e=>{ e.preventDefault(); alert('Descarga PDF del contrato (demo)'); });
    tr.children[7].append(btnPDF);
    tb.appendChild(tr);
  });
}

// ========== Mensajes: tabla + modal ==========
let dlgMsg, msgList, msgInfo, msgTextarea, msgSendBtn, mensajeActual=null;

function buildMsgDialog(){
  if (dlgMsg) return;
  dlgMsg = document.createElement('dialog');
  dlgMsg.innerHTML = `
    <form method="dialog" class="modal-surface">
      <div class="modal-header">
        <strong>Mensajes</strong>
        <button class="btn ghost" value="cancel" style="margin-left:auto">Cerrar</button>
      </div>
      <div class="modal-body">
        <div id="msgInfo" class="muted"></div>
        <div id="msgList" class="chat-box"></div>
        <textarea id="msgTxt" class="input-area" placeholder="Escribí tu respuesta…"></textarea>
        <div style="display:flex; gap:8px; justify-content:flex-end">
          <button class="btn ghost" value="cancel">Cancelar</button>
          <button class="btn pay" id="msgSend" value="default" type="button">Enviar</button>
        </div>
      </div>
    </form>`;
  document.body.appendChild(dlgMsg);
  msgList = dlgMsg.querySelector('#msgList');
  msgInfo = dlgMsg.querySelector('#msgInfo');
  msgTextarea = dlgMsg.querySelector('#msgTxt');
  msgSendBtn = dlgMsg.querySelector('#msgSend');
  msgSendBtn.addEventListener('click', ()=>{
    const txt = (msgTextarea.value||'').trim();
    if(!txt || !mensajeActual) return;
    mensajeActual.hilo = mensajeActual.hilo || [];
    mensajeActual.hilo.push({from:'inquilino', text: txt, ts: new Date().toISOString()});
    msgTextarea.value='';
    openMsgById(mensajeActual.id); // refresca
  });
}

function openMsgById(id){
  buildMsgDialog();
  mensajeActual = mensajesTenant.find(x=>x.id===id);
  if(!mensajeActual){ alert('Mensaje no encontrado'); return; }
  msgInfo.textContent = `${mensajeActual.owner} · ${mensajeActual.prop} · ${new Date(mensajeActual.ts).toLocaleString('es-AR')}`;
  msgList.innerHTML = (mensajeActual.hilo||[]).map(m => `
    <div class="bubble ${m.from==='propietario'?'them':'me'}">
      <small class="muted">${m.from} · ${new Date(m.ts).toLocaleString('es-AR')}</small>
      <div>${m.text}</div>
    </div>
  `).join('');
  msgTextarea.value = '';
  dlgMsg.showModal();
}

function renderTMsgs(){
  const tb = $('#tbTMsgs'); if(!tb) return;
  tb.innerHTML = '';
  const rows = [...mensajesTenant].sort((a,b)=> new Date(b.ts)-new Date(a.ts));
  rows.forEach(m=>{
    const tr = el('tr');
    tr.append(
      el('td',{textContent: new Date(m.ts).toLocaleDateString('es-AR')}),
      el('td',{textContent: m.owner}),
      el('td',{textContent: m.prop}),
      el('td',{textContent: m.asunto || m.preview}),
      el('td',{className:'text-right actions'})
    );
    const btnVer = Object.assign(el('button',{className:'btn ghost',type:'button'}),{textContent:'Abrir'});
    btnVer.addEventListener('click', ()=> openMsgById(m.id));
    tr.children[4].append(btnVer);
    tb.appendChild(tr);
  });
}

// ====== Modal de Pago ======
let dlgPay, payInfo, payBody;
const PAY = (window.__PAY_CONFIG || { bank:{}, mp:{} });

function buildPayDialog(){
  if (dlgPay) return;
  dlgPay = document.createElement('dialog');
  dlgPay.innerHTML = `
    <form method="dialog" class="modal-surface pay-modal">
      <div class="modal-header">
        <strong>Pago</strong>
        <button class="btn ghost" value="cancel" style="margin-left:auto">Cerrar</button>
      </div>
      <div class="modal-body">
        <div id="payInfo" class="muted"></div>

        <div class="method-switch" role="tablist" aria-label="método de pago">
          <button type="button" class="pill active" data-method="bank">Transferencia bancaria</button>
          <button type="button" class="pill" data-method="mp">Mercado Pago</button>
        </div>

        <div id="payBody"></div>

        <div class="pay-actions">
          <button class="btn ghost" value="cancel">Cancelar</button>
          <button class="btn pay" id="payConfirm" type="button">Confirmar pago</button>
        </div>
      </div>
    </form>`;
  document.body.appendChild(dlgPay);
  payInfo = dlgPay.querySelector('#payInfo');
  payBody = dlgPay.querySelector('#payBody');

  // switch de métodos
  dlgPay.querySelectorAll('.method-switch .pill').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      dlgPay.querySelectorAll('.method-switch .pill').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderMethodView(btn.dataset.method);
    });
  });

  // Confirmar (mock): marca como pagado y refresca
  dlgPay.querySelector('#payConfirm').addEventListener('click', ()=>{
    if(!pagoActual){ dlgPay.close(); return; }

    const method = dlgPay.querySelector('.method-switch .pill.active')?.dataset.method;

    if(method==='bank'){
      // Podés leer campos de confirmación:
      const last4 = (dlgPay.querySelector('#p-last4')?.value||'').trim();
      const comp  = dlgPay.querySelector('#p-comp')?.files?.[0];
      // TODO: subir comprobante al servidor y dejar estado "pendiente de verificación"
      // Por demo, lo marcamos pagado:
    } else if (method==='mp'){
      // Si tenés callback de MP, acá no marcarías; esperarías el webhook.
      // En la demo, marcamos pagado directo:
    }

    const ref = pagosTenant.find(x=>x.id===pagoActual.id);
    if(ref){ ref.estado = 'pagado'; }
    renderTPagos();
    dlgPay.close();
  });
}

function renderMethodView(which){
  const amt = money(pagoActual?.monto || 0);
  if(which==='bank'){
    payBody.innerHTML = `
      <div class="pay-grid">
        <div class="pay-box">
          <div class="kv"><div>Banco</div><div>${PAY.bank.banco||'-'}</div></div>
          <div class="kv"><div>Titular</div><div>${PAY.bank.titular||'-'}</div></div>
          <div class="kv"><div>CUIT</div><div>${PAY.bank.cuit||'-'}</div></div>
          <div class="kv"><div>CBU</div><div><code id="cbu">${PAY.bank.cbu||'-'}</code> <button type="button" class="copy" data-copy="cbu">Copiar</button></div></div>
          <div class="kv"><div>Alias</div><div><code id="alias">${PAY.bank.alias||'-'}</code> <button type="button" class="copy" data-copy="alias">Copiar</button></div></div>
          <div class="kv"><div>Importe</div><div><code>${amt}</code></div></div>
          <div class="kv"><div>Concepto</div><div><code>${(pagoActual?.prop||'')+' · '+(pagoActual?.mes||'')}</code></div></div>
        </div>
        <div class="pay-box">
          <label class="hint">Últimos 4 del comprobante</label>
          <input id="p-last4" class="input" maxlength="4" placeholder="1234" />

          <label class="hint" style="margin-top:8px">Adjuntar comprobante (opcional)</label>
          <input id="p-comp" class="input" type="file" accept="image/*,application/pdf" />

          <p class="hint" style="margin-top:8px">Subimos tu comprobante y confirmamos el pago. Si preferís, podés confirmar y enviarlo luego desde “Comprobante”.</p>
        </div>
      </div>
    `;
    payBody.querySelectorAll('.copy').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.copy;
        const val = payBody.querySelector('#'+id)?.textContent || '';
        navigator.clipboard.writeText(val);
        btn.textContent = 'Copiado';
        setTimeout(()=> btn.textContent='Copiar', 1200);
      });
    });
  } else {
    payBody.innerHTML = `
      <div class="pay-grid">
        <div class="pay-box" style="display:grid; place-items:center; gap:8px">
          <img src="${PAY.mp.qr_img||'/img/qr/mp-demo.png'}" alt="QR Mercado Pago" style="width:220px; height:220px; object-fit:contain; border-radius:12px; border:1px solid var(--line); background:#fff">
          <div class="hint">Escaneá el QR con Mercado Pago</div>
        </div>
        <div class="pay-box">
          <div class="kv"><div>Importe</div><div><code>${amt}</code></div></div>
          <div class="kv"><div>Concepto</div><div><code>${(pagoActual?.prop||'')+' · '+(pagoActual?.mes||'')}</code></div></div>
          <a class="btn pay" href="${PAY.mp.checkout_url||'#'}" target="_blank" rel="noopener" style="margin-top:8px; display:inline-block">Pagar ahora</a>
          <p class="hint" style="margin-top:8px">Al finalizar el pago, volver a esta página. (En producción, marcamos como pagado con el webhook de MP).</p>
        </div>
      </div>
    `;
  }
}

let pagoActual = null;
function openPayModal(pago){
  buildPayDialog();
  pagoActual = pago;
  payInfo.textContent = `${pago.prop} · ${pago.fecha} · ${money(pago.monto)}`;

  // por defecto, banco
  dlgPay.querySelectorAll('.method-switch .pill').forEach(b=>b.classList.remove('active'));
  const first = dlgPay.querySelector('.method-switch .pill[data-method="bank"]');
  first.classList.add('active');
  renderMethodView('bank');

  dlgPay.showModal();
}


// ========== Bootstrap ==========
document.addEventListener('DOMContentLoaded', ()=>{
  bindTabs();
  renderTPagos();
  renderTContratos();
  renderTMsgs();
});
