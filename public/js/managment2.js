/************* CONFIG *************/
const USE_LOCALSTORAGE = false; // poné true si querés persistir demo en el navegador
const SHOW_ONLY_NEXT = false;

/************* PERSISTENCIA *************/
const loadLS = (k, d) => USE_LOCALSTORAGE ? (JSON.parse(localStorage.getItem(k) || 'null') ?? d) : d;
const saveLS = (k, v) => { if (USE_LOCALSTORAGE) localStorage.setItem(k, JSON.stringify(v)); };

/************* MOCKS (tus originales + esquema DB) *************/
// Cards de propiedades (visual)
let propiedades = loadLS('propiedades', [
  {id:1,titulo:'Estilo cálido',ubic:'Santiago del Estero',amb:'3 amb',img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800',estado:'Activo',operacion:'Alquiler'},
  {id:2,titulo:'Departamento céntrico',ubic:'Centro',amb:'2 amb',img:'/img/properties/property1.avif',estado:'Inactivo',operacion:'Alquiler'},
  {id:3,titulo:'Loft moderno',ubic:'Norte',amb:'1 amb',img:'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=800',estado:'Activo',operacion:'Temporario'},
]);

// Contratos segun esquema DB (estos son los que usan el plan de pagos)
let contratosDB = loadLS('contratosDB', [
  {
    id: 1001, property_id: 1, owner_id: 11, tenant_id: 201, guarantee_id: null,
    contract_type: 'Largo Plazo',
    start_date: '2025-08-01', end_date: '2025-11-01',
    pay_frequency: 'Mensual', // LP obligado
    unit_price: 320000.00, total: 0.00, deposito: 320000.00,
    estado: 'activo', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null
  },
  {
    id: 1003, property_id: 3, owner_id: 12, tenant_id: 203, guarantee_id: null,
    contract_type: 'Temporal',
    start_date: '2025-08-01', end_date: '2025-08-15', // fin EXCLUSIVO
    pay_frequency: 'Semanal', // {un_pago, diario, semanal, mensual}
    unit_price: 20000.00, // por día
    total: 0.00, deposito: 0.00, // temporales sin depósito
    estado: 'activo', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null
  }
]);

// Diccionario de inquilinos para mostrar nombre (en real: join)
let tenantsDict = loadLS('tenantsDict', { 201: 'Juan Pérez', 203: 'Lucía Díaz', 202: 'Ana Gómez' });

// Tus tablas de ejemplo para que no se vean vacías al cargar
let pagos = loadLS('pagos', [
  // se sobreescriben al generar plan; estos son solo de arranque visual
  {id:'p1',fecha:'10/07/2025',inq:'Juan Pérez',prop:'Estilo cálido',mes:'jul',año:'2025',monto:320000,estado:'pagado'},
  {id:'p2',fecha:'15/07/2025',inq:'Ana Gómez',prop:'Departamento céntrico',mes:'jul',año:'2025',monto:210000,estado:'pendiente'},
  {id:'p3',fecha:'02/08/2025',inq:'Lucía Díaz',prop:'Loft moderno',mes:'ago',año:'2025',monto:180000,estado:'atrasado'},
]);

let solicitudes = loadLS('solicitudes', [
  {fecha:'2025-08-03',nombre:'Marcos R.',prop:'Loft moderno',msg:'¿Se aceptan mascotas?'},
  {fecha:'2025-08-04',nombre:'Sofía P.',prop:'Estilo cálido',msg:'Quiero visitar este fin de semana.'},
]);

let vencimientos = loadLS('vencimientos', [
  {prop:'Loft moderno',fecha:'30/08',estado:'Renovación en curso'},
]);

/************* HELPERS *************/
const $ = s => document.querySelector(s);
const el = (t,o={}) => Object.assign(document.createElement(t),o);

function money(n){ return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(+n||0); }
function parseYMD(ymd){ const [y,m,d]=ymd.split('-').map(Number); return new Date(Date.UTC(y,m-1,d)); }
function formatDMYUTC(dateUTC){
  const d = String(dateUTC.getUTCDate()).padStart(2,'0');
  const m = String(dateUTC.getUTCMonth()+1).padStart(2,'0');
  const y = dateUTC.getUTCFullYear();
  return `${d}/${m}/${y}`;
}
function addDaysUTC(d, n){ const x=new Date(d); x.setUTCDate(x.getUTCDate()+n); return x; }
function addMonthsUTC(d, n){ const x=new Date(d); x.setUTCMonth(x.getUTCMonth()+n); return x; }
function monthNameUTC(d){ return d.toLocaleString('es-AR', { month: 'short', timeZone: 'UTC' }).replace('.', ''); }

function normalizeSolicitudes(){
  solicitudes = (solicitudes || []).map((s, i) => ({
    id: s.id || ('sol-'+(i+1)),
    fecha: s.fecha,              // 'YYYY-MM-DD'
    nombre: s.nombre,
    prop: s.prop,
    msg: s.msg,
    hilo: Array.isArray(s.hilo) ? s.hilo : [],
    estado: s.estado || 'pendiente'  // 'pendiente' | 'respondido'
  }));
  saveLS('solicitudes', solicitudes);
}

let dlgSol, solMsgList, solInfoTxt, solTextarea, solSendBtn;
let solicitudActual = null;

function buildResponderDialog(){
  if (dlgSol) return; // ya creado
  dlgSol = document.createElement('dialog');
  dlgSol.id = 'dlgResponder';
  dlgSol.style.padding = '0';
  dlgSol.innerHTML = `
    <form method="dialog" class="modal-surface">
        <div class="modal-header">
        <strong>Responder solicitud</strong>
        <span id="solInfo" class="muted" style="margin-left:auto"></span>
        <button class="btn btn-ghost" value="cancel">Cerrar</button>
        </div>
        <div class="modal-body">
        <div id="solMsgs" class="chat-box"></div>
        <textarea id="solTxt" class="input-area" placeholder="Escribí tu respuesta..."></textarea>
        <div style="display:flex; gap:8px; justify-content:flex-end">
            <button class="btn btn-ghost" value="cancel">Cancelar</button>
            <button class="btn btn-primary" id="solSend" value="default">Enviar</button>
        </div>
        </div>
    </form>
  `;
  document.body.appendChild(dlgSol);
  solMsgList = dlgSol.querySelector('#solMsgs');
  solInfoTxt = dlgSol.querySelector('#solInfo');
  solTextarea = dlgSol.querySelector('#solTxt');
  solSendBtn  = dlgSol.querySelector('#solSend');

  solSendBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    if(!solicitudActual) { dlgSol.close(); return; }
    const texto = (solTextarea.value || '').trim();
    if(!texto) return;
    // push mensaje
    solicitudActual.hilo.push({ from:'propietario', text:texto, ts:new Date().toISOString() });
    solicitudActual.estado = 'respondido';
    saveLS('solicitudes', solicitudes);
    paintSolicitudHilo(solicitudActual);
    solTextarea.value = '';
    // si querés cerrar al enviar: dlgSol.close();
    renderSolicitudes(); // refresca la tabla para ver “respondido”
  });
}

let dlgContratoView, cvBody, cvCloseBtn;
function buildContratoViewDialog(){
  if (dlgContratoView) return;
  dlgContratoView = document.createElement('dialog');
  dlgContratoView.id = 'dlgContratoView';
  dlgContratoView.style.padding = '0';
  dlgContratoView.innerHTML = `
    <form method="dialog" class="modal-surface">
        <div class="modal-header">
        <strong>Contrato</strong>
        <button class="btn btn-ghost" value="cancel" style="margin-left:auto">Cerrar</button>
        </div>
        <div id="cvBody" class="modal-body"></div>
    </form>
  `;
  document.body.appendChild(dlgContratoView);
  cvBody = dlgContratoView.querySelector('#cvBody');
}

function openContratoView(c){
  buildContratoViewDialog();

  const prop = propiedades.find(p=>p.id===c.property_id);
  const propName = prop?.titulo || `Propiedad #${c.property_id}`;
  const inqName = (typeof tenantsDict !== 'undefined' && tenantsDict[c.tenant_id]) ? tenantsDict[c.tenant_id] : `#${c.tenant_id}`;

  const list = (pagos || []).filter(p => p.contratoId === c.id)
    .map(p=>{
      const [d,m,y] = p.fecha.split('/').map(Number);
      const due = new Date(y, m-1, d);
      const hoy = new Date();
      const dd = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
      const hh = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
      const est = (p.estado==='pagado') ? 'pagado' : (hh > dd ? 'atrasado' : 'pendiente');
      return {...p, _estado: est, _due: dd};
    })
    .sort((a,b)=> a._due - b._due);

  const prox = list.find(x=> x._estado!=='pagado');
  const total = list.reduce((s,x)=> s + (+x.monto||0), 0);
  const pagado = list.filter(x=>x._estado==='pagado').reduce((s,x)=> s + (+x.monto||0), 0);
  const pendiente = list.filter(x=>x._estado!=='pagado').reduce((s,x)=> s + (+x.monto||0), 0);
  const atrasados = list.filter(x=>x._estado==='atrasado').length;

  cvBody.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px">
        <div class="panel-soft">
            <h4 style="margin:0 0 8px 0">Resumen</h4>
            <div><strong>Propiedad:</strong> ${propName}</div>
            <div><strong>Inquilino:</strong> ${inqName}</div>
            <div><strong>Tipo:</strong> ${c.contract_type}</div>
            <div><strong>Frecuencia:</strong> ${c.pay_frequency}</div>
            <div><strong>Inicio:</strong> ${formatDMYUTC(parseYMD(c.start_date))}</div>
            <div><strong>Fin:</strong> ${formatDMYUTC(parseYMD(c.end_date))}</div>
            ${(c.contract_type==='long_term' ? `<div><strong>Depósito:</strong> ${money(+c.deposito||0)}</div>` : '')}
            <div><strong>Estado:</strong> <span class="status st-pendiente">${c.estado}</span></div>
        </div>

        <div class="panel-soft">
            <h4 style="margin:0 0 8px 0">Totales</h4>
            <div style="display:grid; grid-template-columns: repeat(2,1fr); gap:8px">
                <div class="panel-soft" style="padding:8px">
                    <div class="muted">Facturado</div><div><strong>${money(total)}</strong></div>
                </div>
                <div class="panel-soft" style="padding:8px">
                    <div class="muted">Pagado</div><div><strong>${money(pagado)}</strong></div>
                </div>
                <div class="panel-soft" style="padding:8px">
                    <div class="muted">Pendiente</div><div><strong>${money(pendiente)}</strong></div>
                </div>
                <div class="panel-soft" style="padding:8px">
                    <div class="muted">Cuotas atrasadas</div><div><strong>${atrasados}</strong></div>
                </div>
            </div>
        </div>
    </div>

    <div class="panel-soft">
      <h4 style="margin:0 0 8px 0">Próximo pago</h4>
      ${prox ? `
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap">
          <div><strong>${prox.fecha}</strong> — ${prox.mes} ${prox.año}</div>
          <div>${money(prox.monto)}</div>
          <div>${statusPill(prox._estado).outerHTML}</div>
          <div style="margin-left:auto; display:flex; gap:8px">
            ${prox._estado==='pagado' ? `
              <button class="btn btn-ghost" id="cvBtnComp">Comprobante</button>
            ` : `
              <button class="btn btn-primary" id="cvBtnPagar">Pagar ahora</button>
            `}
          </div>
        </div>
      ` : `<div class="muted">No hay pagos pendientes.</div>`}
    </div>

    <div class="panel-soft">
      <h4 style="margin:0 0 8px 0">Pagos del contrato</h4>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th><th>Mes</th><th>Año</th><th>Monto</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody id="cvPagosBody"></tbody>
        </table>
      </div>
    </div>

    <div style="display:flex; gap:8px; justify-content:flex-end">
      <a class="btn btn-primary" href="/contract/${c.id}" target="_blank">Ir al detalle</a>
      <button class="btn btn-primary" id="cvBtnPDF">Descargar PDF</button>
      <button class="btn btn-primary" id="cvBtnMsg">Enviar mensaje</button>
      <!-- quitado: Regenerar plan -->
      <button class="btn btn-primary" id="cvBtnToggleEstado">${c.estado==='activo'?'Marcar completado':'Marcar activo'}</button>
    </div>
  `;

  const tb = cvBody.querySelector('#cvPagosBody');
  tb.innerHTML = '';
  list.forEach(p=>{
    const tr = document.createElement('tr');
    tr.append(
      el('td',{textContent:p.fecha}),
      el('td',{textContent:p.mes}),
      el('td',{textContent:String(p.año)}),
      el('td',{textContent:money(p.monto)}),
      el('td',{}),
      el('td',{})
    );
    tr.children[4].appendChild(statusPill(p._estado));
    if (p._estado === 'pagado') {
      const btn = Object.assign(el('button',{className:'btn btn-ghost'}),{textContent:'Comprobante'});
      btn.addEventListener('click', ()=> alert(`Comprobante de ${money(p.monto)} · ${p.fecha}`));
      tr.children[5].append(btn);
    } else {
      const btn = Object.assign(el('button',{className:'btn btn-primary'}),{textContent:'Pagar'});
      btn.addEventListener('click', ()=>{
        const ref = pagos.find(x=>x.id===p.id);
        if(ref){ ref.estado='pagado'; saveLS('pagos', pagos); openContratoView(c); renderPagos(); }
      });
      tr.children[5].append(btn);
    }
    tb.appendChild(tr);
  });

  // Próximo pago (acciones)
  const btnPagar = cvBody.querySelector('#cvBtnPagar');
  if (btnPagar && prox){
    btnPagar.addEventListener('click', ()=>{
      const ref = pagos.find(x=>x.id===prox.id);
      if(ref){ ref.estado='pagado'; saveLS('pagos', pagos); openContratoView(c); renderPagos(); }
    });
  }
  const btnComp = cvBody.querySelector('#cvBtnComp');
  if (btnComp && prox){
    btnComp.addEventListener('click', ()=> alert(`Comprobante de ${money(prox.monto)} · ${prox.fecha}`));
  }

  // Pie (dejamos solo “Marcar completado/activo”)
  cvBody.querySelector('#cvBtnPDF').addEventListener('click', ()=> {
    alert('Descarga PDF (demo).');
  });
  cvBody.querySelector('#cvBtnMsg').addEventListener('click', ()=> {
    alert(`Abrir hilo con ${inqName} (demo).`);
  });
  cvBody.querySelector('#cvBtnToggleEstado').addEventListener('click', ()=>{
    c.estado = (c.estado==='activo' ? 'completado' : 'activo');
    saveLS('contratosDB', contratosDB);
    openContratoView(c);
    renderContratos();
  });

  dlgContratoView.showModal();
}

function paintSolicitudHilo(s){
  solInfoTxt.textContent = `${s.nombre} · ${s.prop}`;
  solMsgList.innerHTML = `
    <div class="muted" style="margin-bottom:6px"><strong>Mensaje original:</strong> ${s.msg}</div>
    ${s.hilo.map(m => `
        <div class="bubble ${m.from==='propietario' ? 'me' : 'them'}">
        <small class="muted">${m.from} · ${new Date(m.ts).toLocaleString('es-AR')}</small>
        <div>${m.text}</div>
        </div>
    `).join('')}
  `;
  solMsgList.scrollTop = solMsgList.scrollHeight;
}

function openResponderById(id){
  buildResponderDialog();
  solicitudActual = solicitudes.find(x => String(x.id) === String(id));
  if(!solicitudActual){ alert('Solicitud no encontrada'); return; }
  paintSolicitudHilo(solicitudActual);
  solTextarea.value = '';
  dlgSol.showModal();
}

// noches con end EXCLUSIVO (check-out)
function nightsBetweenExclusiveUTC(startUTC, endUTC){
  const msPerDay = 24*60*60*1000;
  const a = new Date(Date.UTC(startUTC.getUTCFullYear(), startUTC.getUTCMonth(), startUTC.getUTCDate()));
  const b = new Date(Date.UTC(endUTC.getUTCFullYear(),   endUTC.getUTCMonth(),   endUTC.getUTCDate()));
  const diff = (b - a) / msPerDay;
  return Math.max(0, Math.round(diff));
}

// p.fecha viene como "dd/mm/yyyy" -> Date (local, a medianoche)
function parseDMYLocal(dmy){
  const [d,m,y] = dmy.split('/').map(Number);
  return new Date(y, m-1, d);
}

/************* STATUS PILLS *************/
function statusPill(txt){
  const map = {
    // contratos
    'activo':'st-activo','Activo':'st-activo',
    'completado':'st-finalizado','Finalizado':'st-finalizado',
    'pendiente':'st-pendiente','Pendiente de firma':'st-pendiente',
    'canceledo':'st-inactivo','Incumplimiento':'st-inactivo','Inactivo':'st-inactivo',
    // pagos
    'pagado':'st-activo','atrasado':'st-inactivo'
  };
  return el('span',{className:`status ${map[txt]||'st-pendiente'}`,textContent:txt});
}

/************* CARDS *************/
function renderCards(list){
  const wrap = $('#cards'); if(!wrap) return;
  wrap.innerHTML = '';
  list.forEach(p=>{
    const c = el('div',{className:'card'});
    c.innerHTML = `
      <img src="${p.img}" alt="${p.titulo}">
      <div class="title">${p.titulo}</div>
      <div class="muted">${p.ubic} · ${p.amb}</div>
    `;
    c.appendChild(statusPill(p.estado));
    const row = el('div',{className:'row'});
    row.append(
      Object.assign(el('a',{className:'btn btn-primary',href:`/property/${p.id}`}),{textContent:'Ver detalles'}),
      Object.assign(el('a',{className:'btn btn-ghost',href:`/property/edit/${p.id}`}),{textContent:'Editar'})
    );
    c.appendChild(row);
    wrap.appendChild(c);
  });
}

/************* NORMALIZACIÓN: LP siempre mensual *************/
function normalizeLP(){
  contratosDB.forEach(c=>{
    if(c.contract_type==='long_term' && c.pay_frequency!=='mensual'){
      c.pay_frequency='mensual';
    }
  });
  saveLS('contratosDB', contratosDB);
}

/************* CONTRATOS – render *************/
function renderContratos(){
  const tb = $('#tbContratos'); if(!tb) return;
  tb.innerHTML = '';

  // Preferimos contratos del esquema DB
  if (contratosDB && contratosDB.length){
    contratosDB.forEach(c=>{
      const tr = el('tr');
      const inqName = tenantsDict?.[c.tenant_id] ?? `#${c.tenant_id}`;
      const propName = propiedades.find(p=>p.id===c.property_id)?.titulo || `Propiedad #${c.property_id}`;

      tr.append(
        el('td',{textContent: inqName}),
        el('td',{textContent: propName}),
        el('td',{textContent: formatDMYUTC(parseYMD(c.start_date))}),
        el('td',{textContent: formatDMYUTC(parseYMD(c.end_date))}),
        el('td',{textContent: c.pay_frequency}), // mensual / un_pago / diario / semanal / mensual
        el('td',{textContent: money(c.unit_price || c.total)}),
        el('td'),  // estado
        el('td')   // acciones
      );

      tr.children[6].appendChild(statusPill(c.estado));

      // ✅ Solo botón VER
      const btnVer = Object.assign(el('button',{className:'btn btn-ghost'}),{textContent:'Ver'});
      btnVer.addEventListener('click', ()=> openContratoView(c));
      tr.children[7].append(btnVer);

      // (opcional) doble click en la fila abre también el modal
      tr.addEventListener('dblclick', ()=> openContratoView(c));

      tb.appendChild(tr);
    });
    return;
  }

  // Fallback a tus contratos viejos (por si no hay DB)
  (contratosViejos || []).forEach(c=>{
    const tr = el('tr');
    tr.append(
      el('td',{textContent:c.inquilino}),
      el('td',{textContent:c.prop}),
      el('td',{textContent:c.inicio}),
      el('td',{textContent:c.fin}),
      el('td',{textContent:c.payment_frequency}),
      el('td',{textContent: money(c.base_amount)}),
      el('td'), el('td')
    );
    tr.children[6].appendChild(statusPill(c.estado));

    const btnVer = Object.assign(el('button',{className:'btn btn-ghost'}),{textContent:'Ver'});
    btnVer.addEventListener('click', ()=> {
      // Si usás el modal nuevo con esquema DB, acá podrías redirigir a /contract/:id
      alert('Vista antigua: sin modal de contrato (demo).');
    });
    tr.children[7].append(btnVer);

    tb.appendChild(tr);
  });
}

/************* PLAN DE PAGOS (con fixes) *************/
function generarPlanDePagos(c){
  // limpia pagos previos de ese contrato
  pagos = pagos.filter(p => p.contratoId !== c.id);

  const propName = propiedades.find(p=>p.id===c.property_id)?.titulo || `Propiedad #${c.property_id}`;
  const inqName  = tenantsDict?.[c.tenant_id] ?? `#${c.tenant_id}`;
  const startUTC = parseYMD(c.start_date);
  const endUTC   = parseYMD(c.end_date);

  const pushPago = (dueUTC, concepto, monto) => {
    pagos.push({
      id: crypto.randomUUID(),
      contratoId: c.id,
      fecha: formatDMYUTC(dueUTC),
      inq: inqName,
      prop: propName,
      mes: monthNameUTC(dueUTC),
      año: dueUTC.getUTCFullYear(),
      monto: +monto||0,
      estado: 'pendiente',
      concepto
    });
  };

  if(c.contract_type === 'long_term'){
    // LP: mensual SIEMPRE (puede tener depósito)
    const monthly = +c.unit_price || 0;
    if(+c.deposito > 0){
      pushPago(startUTC, 'Depósito', +c.deposito);
    }
    let i = 0;
    while(true){
      const due = addMonthsUTC(startUTC, i);
      if(due >= endUTC) break;
      pushPago(due, `Alquiler mes ${i+1}`, monthly);
      i++;
    }
  } else {
    // TEMPORAL: NUNCA depósito
    const daily = +c.unit_price || 0;   // precio por día
    const nights = nightsBetweenExclusiveUTC(startUTC, endUTC);

    switch(c.pay_frequency){
      case 'un_pago': {
        const total = +c.total || (daily * nights);
        pushPago(startUTC, `Estadía ${nights} noche(s)`, total);
        break;
      }
      case 'diario': {
        for(let i=0;i<nights;i++){
          const due = addDaysUTC(startUTC, i);
          pushPago(due, `Día ${i+1}`, daily);
        }
        break;
      }
      case 'semanal': {
        let remaining = nights, i=0, d = new Date(startUTC);
        while(remaining > 0){
          const span = Math.min(7, remaining); // bloque de hasta 7 noches
          pushPago(new Date(d), `Semana ${i+1} (${span} noches)`, daily * span);
          d = addDaysUTC(d, span);
          remaining -= span; i++;
        }
        break;
      }
      case 'mensual': {
        // bloques de 30 noches; último prorrateado
        const months = Math.max(1, Math.ceil(nights/30));
        let d = new Date(startUTC);
        for(let i=0;i<months;i++){
          const span = (i===months-1 ? nights - (months-1)*30 : 30);
          pushPago(new Date(d), `Cuota ${i+1}`, daily * Math.max(1, span));
          d = addMonthsUTC(d, 1);
        }
        break;
      }
      default: {
        const total = +c.total || (daily * nights);
        pushPago(startUTC, `Pago`, total);
      }
    }
  }

  saveLS('pagos', pagos);
}

/************* ESTADO DE PAGO (solo pendiente/atrasado/pagado) *************/
function estadoPagoCalc(p){
  if(p.estado === 'pagado') return 'pagado';
  const [d,m,y] = p.fecha.split('/').map(Number);
  const due = new Date(y, m-1, d);
  const hoy = new Date();
  const dd = new Date(due.getFullYear(),due.getMonth(),due.getDate()).getTime();
  const hh = new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate()).getTime();
  return hh > dd ? 'atrasado' : 'pendiente';
}

/************* PAGOS – render *************/
function renderPagos(){
  const tb = $('#tbPagos'); if(!tb) return;
  tb.innerHTML = '';

  let data = [...pagos];

  // Recalcular estado simple (pendiente/atrasado/pagado)
  data = data.map(p => {
    const hoy = new Date();
    const due = parseDMYLocal(p.fecha);
    const hh = new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate()).getTime();
    const dd = new Date(due.getFullYear(),due.getMonth(),due.getDate()).getTime();
    const estadoCalc = (p.estado==='pagado') ? 'pagado' : (hh > dd ? 'atrasado' : 'pendiente');
    return {...p, _estado: estadoCalc, _due: dd};
  });

  if (SHOW_ONLY_NEXT){
    // Nos quedamos con el PRÓXIMO no-pagado por contrato
    const byContrato = {};
    data
      .filter(p => p._estado!=='pagado')
      .sort((a,b)=> a._due - b._due) // orden por fecha asc
      .forEach(p=>{
        if (!byContrato[p.contratoId]) byContrato[p.contratoId] = p;
      });
    data = Object.values(byContrato);
  }

  // Orden final por fecha
  data.sort((a,b)=> a._due - b._due);

  // Render
  data.forEach(p=>{
    const tr = el('tr');
    tr.append(
      el('td',{textContent:p.fecha}),
      el('td',{textContent:p.inq}),
      el('td',{textContent:p.prop}),
      el('td',{textContent:p.mes}),
      el('td',{textContent:String(p.año)}),
      el('td',{textContent:money(p.monto)}),
      el('td'),
      el('td',{className:'actions'}),
    );
    tr.children[6].appendChild(statusPill(p._estado));

    // Botones: Pagar / Comprobante
    if (p._estado === 'pagado') {
    const btnComp = Object.assign(el('button',{className:'btn btn-ghost'}),{textContent:'Comprobante'});
    btnComp.addEventListener('click', ()=>{
        // TODO: abrir tu modal/descarga de comprobante
        alert(`Comprobante\n\nInquilino: ${p.inq}\nPropiedad: ${p.prop}\nFecha: ${p.fecha}\nImporte: ${money(p.monto)}`);
    });
    tr.children[7].append(btnComp);
    } else {
    const btnPagar = Object.assign(el('button',{className:'btn btn-primary'}),{textContent:'Pagar'});
    btnPagar.addEventListener('click', ()=>{
        const ref = pagos.find(x=>x.id===p.id);
        if(ref){
        ref.estado = 'pagado';
        saveLS('pagos', pagos);
        renderPagos(); // refresca: cambia a “Comprobante” y muestra el próximo
        }
    });
    tr.children[7].append(btnPagar);
    }
    tb.appendChild(tr);
  });
}

/************* SOLICITUDES – render *************/
function renderSolicitudes(){
  const tb = $('#tbSolicitudes'); if(!tb) return;
  tb.innerHTML = '';
  (solicitudes || []).forEach(s=>{
    const tr = el('tr');
    const f = new Date((s.fecha||'')+'T00:00:00Z');
    const fechaOk = isNaN(f) ? (s.fecha || '') : formatDMYUTC(f);

    tr.append(
      el('td',{textContent: fechaOk}),
      el('td',{textContent: s.nombre}),
      el('td',{textContent: s.prop}),
      el('td',{textContent: s.msg}),
      el('td')
    );

    // Acciones: Responder (abre modal) + Ver hilo (muestra cantidad)
    const btnResp = Object.assign(el('button',{className:'btn btn-ghost'}),{textContent:'Responder'});
    btnResp.addEventListener('click', ()=> openResponderById(s.id));

    const qty = (s.hilo?.length || 0);
    const btnVer = Object.assign(el('button',{className:'btn btn-ghost'}),{textContent: `Ver hilo (${qty})`});
    btnVer.addEventListener('click', ()=> openResponderById(s.id));

    // Tag de estado (pendiente / respondido)
    const estadoTag = statusPill(s.estado || 'pendiente');

    tr.lastChild.append(btnResp, btnVer, estadoTag);
    tb.appendChild(tr);
  });
}

/************* VENCIMIENTOS – aside *************/
function renderVencimientos(){
  const box = $('#vxList'); if(!box) return;
  box.innerHTML = '';
  vencimientos.forEach(v=>{
    const line = el('div',{className:'item'});
    const left = el('div'); left.innerHTML = `<strong>${v.prop}</strong><div class="muted">${v.estado}</div>`;
    const right = el('div',{className:'chip',textContent:v.fecha});
    line.append(left,right); box.appendChild(line);
  });
}

/************* FILTROS *************/
function applyFilters(){
  const q = $('#q')?.value?.toLowerCase() || '';
  const e = $('#fEstado')?.value || '';
  const o = $('#fOperacion')?.value || '';
  const list = propiedades.filter(p =>
    (!q || (p.titulo+p.ubic).toLowerCase().includes(q)) &&
    (!e || p.estado===e) &&
    (!o || (o==='Alquiler' ? p.operacion==='Alquiler' : p.operacion==='Temporario'))
  );
  renderCards(list);
}

/************* TABS *************/
document.querySelectorAll('.tab-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
    b.classList.add('active'); document.getElementById(b.dataset.tab).classList.add('active');
  });
});

/************* HANDLERS *************/
['q','fEstado','fOperacion','fFrecuencia'].forEach(id=>{
  const n = document.getElementById(id);
  if(n) n.addEventListener('input', applyFilters);
});
const btnLimpiar = document.getElementById('btnLimpiar');
if(btnLimpiar){
  btnLimpiar.addEventListener('click',()=>{
    ['q','fEstado','fOperacion','fFrecuencia'].forEach(id=>{ const n=document.getElementById(id); if(n) n.value=''; });
    applyFilters();
  });
}

function ensurePlansForActiveContracts(){
  // Genera plan SOLO si el contrato no tiene pagos aún
  const byContrato = pagos.reduce((acc,p)=>{ (acc[p.contratoId]??=[]).push(p); return acc; }, {});
  contratosDB.forEach(c=>{
    const sinPagos = !byContrato[c.id] || byContrato[c.id].length===0;
    const esActivoOPend = (c.estado==='activo' || c.estado==='pendiente');
    if (sinPagos && esActivoOPend){
      // LP => mensual, temporales según pay_frequency
      generarPlanDePagos(c);
    }
  });
  // refrescamos almacenamiento si lo usás
  saveLS('pagos', pagos);
}

/************* INIT *************/
normalizeLP();
normalizeSolicitudes();   // <— NUEVO
ensurePlansForActiveContracts && ensurePlansForActiveContracts(); // si ya lo tenías
renderCards(propiedades);
renderContratos();
renderPagos();
renderSolicitudes();      // ya usa el modal
renderVencimientos();
applyFilters();