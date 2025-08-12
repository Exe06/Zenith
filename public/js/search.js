const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const norm = s => (s||'').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');

// controles
const selUbic = $('#fUbicacion'), selTipo = $('#fTipo'), selOp = $('#fOperacion'),
    selGarantia = $('#fGarantia'), selPrecio = $('#fPrecio'),
    selAmb = $('#fAmb'), selDorm = $('#fDorm'),
    chkMasc = $('#fMascotas'), chkCoch = $('#fCochera'), chkBal = $('#fBalcon'),
    searchBox = $('#searchbox'), btnSearch = $('#btnSearch'), q = $('#q');

// abrir/cerrar búsqueda
btnSearch.addEventListener('click', ()=>{ searchBox.classList.toggle('open'); if(searchBox.classList.contains('open')) q.focus(); applyFilters(); });
q.addEventListener('input', applyFilters);
[selUbic, selTipo, selOp, selGarantia, selPrecio, selAmb, selDorm].forEach(s=>s.addEventListener('change', applyFilters));
[chkMasc, chkCoch, chkBal].forEach(c=>c.addEventListener('change', applyFilters));
$$('.srv').forEach(c=>c.addEventListener('change', applyFilters));

// poblar selects dinámicamente (ubicación/tipo)
function populateSelects(){
const ubic = new Set(), tipo = new Set();
$$('.card-propiedad').forEach(c=>{
    const u=c.dataset.ubicacion?.trim(); if(u) ubic.add(u);
    const t=c.dataset.tipo?.trim(); if(t) tipo.add(t);
});

[...ubic].sort().forEach(v=>{ const o=document.createElement('option'); o.value=v;o.textContent=v; selUbic.appendChild(o); });

[...tipo].sort().forEach(v=>{ const o=document.createElement('option'); o.value=v;o.textContent=v; selTipo.appendChild(o); });
}

// verificación de servicios (tildados ⊆ data-servicios)
function matchesServicios(card){
    const needed = $$('.srv:checked').map(x=>x.value);
    if(!needed.length) return true;
    const have = (card.dataset.servicios||'').split(',').map(s=>s.trim());
    return needed.every(s => have.includes(s));
}

// filtros principales
function applyFilters(){
const text = norm(q.value);
const ub = selUbic.value, tp = selTipo.value, op = selOp.value, gar = selGarantia.value;
const pmax = selPrecio.value ? Number(selPrecio.value) : null;
const ambMin = selAmb.value ? Number(selAmb.value) : null;
const dormMin = selDorm.value ? Number(selDorm.value) : null;

$$('.card-propiedad').forEach(card=>{
    const ubic = card.dataset.ubicacion || '';
    const tipo = card.dataset.tipo || '';
    const oper = card.dataset.operacion || '';
    const garantia = card.dataset.garantia || '';
    const precio = Number(card.dataset.precio || 0);
    const amb = Number(card.dataset.ambientes || 0);
    const dorm = Number(card.dataset.dormitorios || 0);
    const mascotas = card.dataset.mascotas === 'si';
    const cochera = card.dataset.cochera === 'si';
    const balcon = card.dataset.balcon === 'si';
    const content = norm(card.innerText);

    const okText = !text || content.includes(text);
    const okUb = !ub || ub===ubic;
    const okTipo = !tp || tp===tipo;
    const okOp = !op || op===oper;
    const okGar = !gar || gar===garantia;
    const okPrecio = !pmax || (precio && precio<=pmax);
    const okAmb = !ambMin || amb>=ambMin;
    const okDorm = !dormMin || dorm>=dormMin;
    const okMasc = !chkMasc.checked || mascotas;
    const okCoch = !chkCoch.checked || cochera;
    const okBal = !chkBal.checked || balcon;
    const okSrv = matchesServicios(card);

    const show = okText && okUb && okTipo && okOp && okGar && okPrecio && okAmb && okDorm && okMasc && okCoch && okBal && okSrv;
    card.style.display = show ? '' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', ()=>{ populateSelects(); applyFilters(); });