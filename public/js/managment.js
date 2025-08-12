// --- Datos mock (ajustados a tus requisitos: base_amount, payment_frequency, etc.)
const propiedades = [
    {id:1,titulo:'Estilo cálido',ubic:'Santiago del Estero',amb:'3 amb',img:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800',estado:'Activo',operacion:'Alquiler'},
    {id:2,titulo:'Departamento céntrico',ubic:'Centro',amb:'2 amb',img:'/img/properties/property1.avif',estado:'Inactivo',operacion:'Alquiler'},
    {id:3,titulo:'Loft moderno',ubic:'Norte',amb:'1 amb',img:'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=800',estado:'Activo',operacion:'Temporario'},
];

const contratos = [
    {inquilino:'Juan Pérez',prop:'Estilo cálido',periodo:'2025-2027',payment_frequency:'Mensual',base_amount:320000,estado:'Activo'},
    {inquilino:'Ana Gómez',prop:'Departamento céntrico',periodo:'2024-2026',payment_frequency:'Mensual',base_amount:210000,estado:'Pendiente de firma'},
    {inquilino:'Lucía Díaz',prop:'Loft moderno',periodo:'2025-2025',payment_frequency:'Mensual',base_amount:180000,estado:'Finalizado'},
];

const pagos = [
    {fecha:'10/07/2025',inq:'Juan Pérez',prop:'Estilo cálido',periodo:'Jul 2025',monto:320000,estado:'Pagado'},
    {fecha:'15/07/2025',inq:'Ana Gómez',prop:'Departamento céntrico',periodo:'Jul 2025',monto:210000,estado:'Pendiente'},
    {fecha:'02/08/2025',inq:'Lucía Díaz',prop:'Loft moderno',periodo:'Ago 2025',monto:180000,estado:'Atrasado'},
];

const solicitudes = [
    {fecha:'03/08/2025',nombre:'Marcos R.',prop:'Loft moderno',msg:'¿Se aceptan mascotas?'},
    {fecha:'04/08/2025',nombre:'Sofía P.',prop:'Estilo cálido',msg:'Quiero visitar este fin de semana.'},
];

const vencimientos = [
    {prop:'Loft moderno',fecha:'30/08',estado:'Renovación en curso'},
];

// --- Render helpers
const $ = s => document.querySelector(s);
const el = (t,o={}) => Object.assign(document.createElement(t),o);

const statusPill = (txt) => {
    const map = {
        'Activo':'st-activo','Pagado':'st-activo','Finalizado':'st-finalizado',
        'Pendiente de firma':'st-pendiente','Pendiente':'st-pendiente',
        'Atrasado':'st-inactivo','Incumplimiento':'st-incumplimiento','Inactivo':'st-inactivo'
    };
    const span = el('span',{className:`status ${map[txt]||'st-pendiente'}`,textContent:txt});
    return span;
};

function renderCards(list){
    const wrap = $('#cards'); wrap.innerHTML = '';
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
            Object.assign(el('a',{
                className: 'btn btn-primary',
                href: `/property/${p.id}` // URL para ver detalles
            }), { textContent: 'Ver detalles' }),

            Object.assign(el('a',{
                className: 'btn btn-ghost',
                href: `/property/${p.id}/edit` // URL para editar
            }), { textContent: 'Editar' })
        );
        c.appendChild(row);
        wrap.appendChild(c);
    });
}

function money(n){ return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n); }

function renderContratos(){
    const tb = $('#tbContratos'); tb.innerHTML = '';
    contratos.forEach(c=>{
        const tr = el('tr');
        tr.append(
            el('td',{textContent:c.inquilino}),
            el('td',{textContent:c.prop}),
            el('td',{textContent:c.periodo}),
            el('td',{textContent:c.payment_frequency}),
            el('td',{textContent:money(c.base_amount)}),
            el('td'), el('td')
        );
        tr.children[5].appendChild(statusPill(c.estado));
        tr.children[6].append(
            Object.assign(el('button',{className:'btn btn-ghost'}),{textContent:'Ver'}),
        );
        tb.appendChild(tr);
    });
}

function renderPagos(){
    const tb = $('#tbPagos'); tb.innerHTML = '';
    pagos.forEach(p=>{
        const tr = el('tr');
        tr.append(
            el('td',{textContent:p.fecha}),
            el('td',{textContent:p.inq}),
            el('td',{textContent:p.prop}),
            el('td',{textContent:p.periodo}),
            el('td',{textContent:money(p.monto)}),
            el('td'),
            el('td',{className:'actions'}),
        );
        tr.children[5].appendChild(statusPill(p.estado));
        tr.children[6].append(
            Object.assign(el('button',{className:'btn btn-ghost'}),{textContent:'Comprobante'}),
        );
        tb.appendChild(tr);
    });
}

function renderSolicitudes(){
    const tb = $('#tbSolicitudes'); tb.innerHTML = '';
    solicitudes.forEach(s=>{
        const tr = el('tr');
        tr.append(
            el('td',{textContent:s.fecha}),
            el('td',{textContent:s.nombre}),
            el('td',{textContent:s.prop}),
            el('td',{textContent:s.msg}),
            el('td')
        );
        tr.lastChild.append(
            Object.assign(el('button',{className:'btn btn-ghost'}),{textContent:'Responder'}),
        );
        
        tb.appendChild(tr);
    });
}

function renderVencimientos(){
const box = $('#vxList'); box.innerHTML = '';
vencimientos.forEach(v=>{
        const line = el('div',{className:'item'});
        const left = el('div'); left.innerHTML = `<strong>${v.prop}</strong><div class="muted">${v.estado}</div>`;
        const right = el('div',{className:'chip',textContent:v.fecha});
        line.append(left,right); box.appendChild(line);
    });
}

// Filtros
function applyFilters(){
    const q = $('#q').value.toLowerCase();
    const e = $('#fEstado').value; const o=$('#fOperacion').value; const f=$('#fFrecuencia').value;
    const list = propiedades.filter(p =>
        (!q || (p.titulo+p.ubic).toLowerCase().includes(q)) &&
        (!e || p.estado===e || e==='Activo' && p.estado==='Activo') &&
        (!o || p.operacion===o)
    );
    renderCards(list);

    // (Opcional) filtrar tablas según selects
    // …
}

// Tabs
document.querySelectorAll('.tab-btn').forEach(b=>{
    b.addEventListener('click',()=>{
        document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
        b.classList.add('active'); document.getElementById(b.dataset.tab).classList.add('active');
    });
});

// Handlers
['q','fEstado','fOperacion','fFrecuencia'].forEach(id=>document.getElementById(id).addEventListener('input',applyFilters));

document.getElementById('btnLimpiar').addEventListener('click',()=>{
    ['q','fEstado','fOperacion','fFrecuencia'].forEach(id=>document.getElementById(id).value=''); applyFilters();
});

// Init
renderCards(propiedades);
renderContratos(); renderPagos(); renderSolicitudes(); renderVencimientos();