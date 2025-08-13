// ======= Datos de ejemplo (in-memory) =======
let usuarios = [
    { id:1, nombre:'Juan', apellido:'Pérez', email:'juan@zenit.com',  rol:'Inquilino', estado:'Activo' },
    { id:2, nombre:'Ana', apellido:'Gómez', email:'ana@zenit.com',   rol:'Propietario', estado:'Pendiente' },
    { id:3, nombre:'Lucía', apellido:'Díaz', email:'lucia@zenit.com', rol:'Admin', estado:'Suspendido' },
];
let inmuebles = [
    { id:101, titulo:'Estilo cálido', tipo:'Departamento', ciudad:'CABA', precio:320000, estado:'Publicado' },
    { id:102, titulo:'Departamento céntrico', tipo:'Departamento', ciudad:'Córdoba', precio:210000, estado:'Borrador' },
    { id:103, titulo:'Casa moderna', tipo:'Casa', ciudad:'Rosario', precio:180000, estado:'Pausado' },
];

// ======= Estado UI =======
let currentTab = 'usuarios';
let editId = null;

const $ = sel => document.querySelector(sel);
const elUsuarios = $('#table-usuarios tbody');
const elInmuebles = $('#table-inmuebles tbody');
const search = $('#search');
const backdrop = $('#backdrop');
const modalTitle = $('#modal-title');
const modalBody = $('#modal-body');

const money = n => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
const pill = (text) => {
    const t = (text || '').toLowerCase();
    let cls = 'gray';
    if (['activo','publicado'].includes(t)) cls='green';
    else if (['pendiente','borrador'].includes(t)) cls='orange';
    else if (['suspendido','pausado'].includes(t)) cls='red';
    return `<span class="pill ${cls}">${text}</span>`;
}

function render(){
    const q = search.value.trim().toLowerCase();

    if(currentTab==='usuarios'){
    $('#table-usuarios').style.display='';
    $('#table-inmuebles').style.display='none';

    elUsuarios.innerHTML = usuarios
        .filter(u => [u.nombre,u.apellido,u.email,u.rol,u.estado].join(' ').toLowerCase().includes(q))
        .map(u => `
        <tr>
            <td>${u.nombre}</td>
            <td>${u.apellido}</td>
            <td>${u.email}</td>
            <td>${u.rol}</td>
            <td>${pill(u.estado)}</td>
            <td class="row-actions">
            <button class="btn btn-outline btn-sm" onclick="verUsuario(${u.id})"><i class="fa-regular fa-eye"></i> Ver</button>
            <button class="btn btn-outline btn-sm" onclick="editarUsuario(${u.id})"><i class="fa-regular fa-pen-to-square"></i> Editar</button>
            <button class="btn btn-outline btn-sm" onclick="eliminarUsuario(${u.id})"><i class="fa-regular fa-trash-can"></i> Eliminar</button>
            </td>
        </tr>`).join('');
    } else {
    $('#table-usuarios').style.display='none';
    $('#table-inmuebles').style.display='';

    elInmuebles.innerHTML = inmuebles
        .filter(i => [i.titulo,i.tipo,i.ciudad, String(i.precio), i.estado].join(' ').toLowerCase().includes(q))
        .map(i => `
        <tr>
            <td>${i.titulo}</td>
            <td>${i.tipo}</td>
            <td>${i.ciudad}</td>
            <td>${money(i.precio)}</td>
            <td>${pill(i.estado)}</td>
            <td class="row-actions">
            <button class="btn btn-outline btn-sm" onclick="verInmueble(${i.id})"><i class="fa-regular fa-eye"></i> Ver</button>
            <button class="btn btn-outline btn-sm" onclick="editarInmueble(${i.id})"><i class="fa-regular fa-pen-to-square"></i> Editar</button>
            <button class="btn btn-outline btn-sm" onclick="eliminarInmueble(${i.id})"><i class="fa-regular fa-trash-can"></i> Eliminar</button>
            </td>
        </tr>`).join('');
    }
}

document.querySelectorAll('.tab').forEach(t=>{
    t.addEventListener('click', ()=>{
        document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
        t.classList.add('active');
        currentTab = t.dataset.tab;
        render();
    });
});

search.addEventListener('input', render);

function openModal(title, bodyHtml){
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    backdrop.classList.add('show');
}
function closeModal(){ backdrop.classList.remove('show'); editId=null; }
$('#btn-cancelar').addEventListener('click', closeModal);
backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) closeModal(); });

// Usuarios
window.verUsuario = (id)=>{
    const u = usuarios.find(x=>x.id===id);
    openModal('Usuario', `
        <div class="body">
            <div><strong>${u.nombre}</strong></div>
            <div>${u.email}</div>
            <div>Rol: ${u.rol}</div>
            <div>Estado: ${u.estado}</div>
        </div>
    `);
}
function formUsuario(u={}){
    return `
    <div class="grid">
        <div class="field"><label>Rol</label>
        <select id="f-rol">
            ${['Inquilino','Propietario','Admin'].map(r=>`<option ${u.rol===r?'selected':''}>${r}</option>`).join('')}
        </select></div>
        <div class="field"><label>Estado</label>
        <select id="f-estado">
            ${['Activo','Pendiente','Suspendido'].map(s=>`<option ${u.estado===s?'selected':''}>${s}</option>`).join('')}
        </select></div>
    </div>`;
}
window.editarUsuario = (id)=>{
    const u = usuarios.find(x=>x.id===id);
    editId = id;
    openModal('Editar usuario', formUsuario(u));
    $('#btn-guardar').onclick = ()=>{
        u.nombre = $('#f-nombre').value.trim();
        u.email  = $('#f-email').value.trim();
        u.rol    = $('#f-rol').value;
        u.estado = $('#f-estado').value;
        closeModal(); render();
    }
}
window.eliminarUsuario = (id)=>{
    openModal('Eliminar usuario', `<p>¿Seguro que querés eliminar este usuario?</p>`);
    $('#btn-guardar').textContent='Eliminar';
    $('#btn-guardar').onclick = ()=>{
        usuarios = usuarios.filter(x=>x.id!==id);
        closeModal(); render();
    }
}

// Inmuebles
window.verInmueble = (id)=>{
    const i = inmuebles.find(x=>x.id===id);
    openModal('Inmueble', `
        <div class="body">
            <div><strong>${i.titulo}</strong></div>
            <div>Tipo: ${i.tipo}</div>
            <div>Ciudad: ${i.ciudad}</div>
            <div>Precio: ${money(i.precio)}</div>
            <div>Estado: ${i.estado}</div>
        </div>
    `);
}
function formInmueble(i={}){
    return `
    <div class="grid">
        <div class="field"><label>Título</label><input id="f-titulo" value="${i.titulo||''}" /></div>
        <div class="field"><label>Tipo</label>
        <select id="f-tipo">
            ${['Departamento','Casa','PH','Loft'].map(t=>`<option ${i.tipo===t?'selected':''}>${t}</option>`).join('')}
        </select></div>
        <div class="field"><label>Ciudad</label><input id="f-ciudad" value="${i.ciudad||''}" /></div>
        <div class="field"><label>Precio (ARS)</label><input id="f-precio" type="number" min="0" step="1000" value="${i.precio||''}" /></div>
        <div class="field"><label>Estado</label>
        <select id="f-estado-i">
            ${['Publicado','Borrador','Pausado'].map(s=>`<option ${i.estado===s?'selected':''}>${s}</option>`).join('')}
        </select></div>
    </div>`;
}
window.editarInmueble = (id)=>{
    const i = inmuebles.find(x=>x.id===id);
    editId = id;
    openModal('Editar inmueble', formInmueble(i));
    $('#btn-guardar').onclick = ()=>{
        i.titulo = $('#f-titulo').value.trim();
        i.tipo   = $('#f-tipo').value;
        i.ciudad = $('#f-ciudad').value.trim();
        i.precio = Number($('#f-precio').value||0);
        i.estado = $('#f-estado-i').value;
        closeModal(); render();
    }
}
//esto es editar jo//
window.eliminarInmueble = (id)=>{
    openModal('Eliminar inmueble', `<p>¿Seguro que querés eliminar este inmueble?</p>`);
    $('#btn-guardar').textContent='Guardar';
    $('#btn-guardar').onclick = ()=>{
        inmuebles = inmuebles.filter(x=>x.id!==id);
        closeModal(); render();
    }
}

// Nuevo
$('#btn-new').addEventListener('click', ()=>{
    if(currentTab==='usuarios'){
        openModal('Nuevo usuario', formUsuario({rol:'Inquilino',estado:'Activo'}));
        $('#btn-guardar').onclick = ()=>{
            const u = {
                id: Date.now(),
                nombre: $('#f-nombre').value.trim(),
                email: $('#f-email').value.trim(),
                rol: $('#f-rol').value,
                estado: $('#f-estado').value
            };
            usuarios.unshift(u); closeModal(); render();
        }
    } else {
        openModal('Nuevo inmueble', formInmueble({tipo:'Departamento',estado:'Publicado'}));
        $('#btn-guardar').onclick = ()=>{
            const i = {
                id: Date.now(),
                titulo: $('#f-titulo').value.trim(),
                tipo: $('#f-tipo').value,
                ciudad: $('#f-ciudad').value.trim(),
                precio: Number($('#f-precio').value||0),
                estado: $('#f-estado-i').value
            };
            inmuebles.unshift(i); closeModal(); render();
        }
    }
});

// Exportar CSV
$('#btn-export').addEventListener('click', ()=>{
    let csv = '';
    if(currentTab==='usuarios'){
        csv += 'Nombre,Email,Rol,Estado\n';
        usuarios.forEach(u=> csv += `"${u.nombre}","${u.email}",${u.rol},${u.estado}\n`);
    }else{
        csv += 'Título,Tipo,Ciudad,Precio,Estado\n';
        inmuebles.forEach(i=> csv += `"${i.titulo}",${i.tipo},${i.ciudad},${i.precio},${i.estado}\n`);
    }
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = currentTab + '.csv';
    a.click();
});

render();