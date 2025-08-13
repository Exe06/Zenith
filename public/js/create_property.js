const provincias = [
    'Buenos Aires','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán'
];
const provinceSel = document.getElementById('province');
provinceSel.innerHTML = '<option value="">Seleccionar</option>' + provincias.map(p=>`<option>${p}</option>`).join('');

// Contadores
const title = document.getElementById('title');
const titleCount = document.getElementById('titleCount');
const desc = document.getElementById('description');
const descCount = document.getElementById('descCount');
const price = document.getElementById('baseAmount');
const sidePrice = document.getElementById('sidePrice');

function fmt(n){
    if(!n) return '$ 0';
    return '$ ' + Number(n).toLocaleString('es-AR');
}

function updateSide(){
    document.getElementById('sideTitle').textContent = title.value || 'Título de la publicación';
    document.getElementById('sideLocation').textContent = `${provinceSel.value || 'Provincia'}, ${document.getElementById('city').value || 'Ciudad'}`;
    document.getElementById('sideOp').textContent = (document.getElementById('operationType').value || 'Operación').replace(/^./, s=>s.toUpperCase());
    sidePrice.textContent = fmt(price.value);
    const pf = document.getElementById('paymentFrequency');
    document.getElementById('sideFreq').textContent = pf ? `Pago: ${pf.value}` : 'Pago: -';

    const chips = document.getElementById('sideChips');
    const am = Array.from(document.querySelectorAll('#amenities .chip[data-active="true"]')).slice(0,4).map(e=>e.textContent);
    chips.innerHTML = am.map(t=>`<span class="chip">${t}</span>`).join('');
}

title.addEventListener('input',()=>{titleCount.textContent = `${title.value.length}/80`; updateSide();});
desc.addEventListener('input',()=>{descCount.textContent = `${desc.value.length}/500`;});
['city','operationType','paymentFrequency','province','baseAmount'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.addEventListener('input', updateSide);
    if(el) el.addEventListener('change', updateSide);
});

// Amenities toggle
document.getElementById('amenities').addEventListener('click', (e)=>{
    if(e.target.classList.contains('chip')){
    e.target.dataset.active = e.target.dataset.active === 'true' ? 'false' : 'true';
    updateSide();
    }
});

// Uploader
const drop = document.getElementById('drop');
const input = document.getElementById('files');
const previews = document.getElementById('previews');

function renderPreview(file){
    const url = URL.createObjectURL(file);
    const box = document.createElement('div');
    box.className = 'ph';
    box.innerHTML = `<img src="${url}" alt="imagen">\n<button title="Eliminar">✕</button>`;
    box.querySelector('button').onclick = ()=>{box.remove(); if(!previews.children.length){document.getElementById('sideImg').src='https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=600&auto=format&fit=crop'} };
    previews.appendChild(box);
    if(previews.children.length === 1){ document.getElementById('sideImg').src = url; }
}

input.addEventListener('change', ()=>{[...input.files].slice(0,10).forEach(renderPreview)});
;['dragover','drop'].forEach(ev=>drop.addEventListener(ev, e=>{e.preventDefault()}));
drop.addEventListener('drop', (e)=>{
    const files = [...e.dataTransfer.files].filter(f=>f.type.startsWith('image/')).slice(0,10);
    files.forEach(renderPreview);
});

// Submit / draft
const form = document.getElementById('listingForm');
const errors = document.getElementById('formErrors');

document.getElementById('draftBtn').addEventListener('click', ()=>{
    alert('Borrador guardado localmente (simulado).');
});

form.addEventListener('submit', (e)=>{
    e.preventDefault();
    errors.textContent = '';
    if(!form.checkValidity()){
    errors.textContent = 'Revisá los datos: hay campos obligatorios sin completar.';
    return;
    }
    const payload = {
    title: title.value,
    operation_type: op.value,
    property_type: document.getElementById('propertyType').value,
    address: document.getElementById('address').value,
    province: provinceSel.value,
    city: document.getElementById('city').value,
    neighborhood: document.getElementById('neighborhood').value,
    description: desc.value,
    details: {
        rooms: +document.getElementById('rooms').value,
        bedrooms: +document.getElementById('bedrooms').value,
        bathrooms: +document.getElementById('bathrooms').value,
        area: +document.getElementById('area').value,
        garage: document.getElementById('garage').value === 'si',
        outdoor: document.getElementById('outdoor').value,
        pets: document.getElementById('pets').value === 'si',
        age: +document.getElementById('age').value || 0,
    },
    amenities: Array.from(document.querySelectorAll('#amenities .chip[data-active="true"]')).map(el=>el.dataset.key),
    pricing: {
        base_amount: +document.getElementById('baseAmount').value,
        payment_frequency: (document.getElementById('paymentFrequency')||{}).value || null,
        deposit: +document.getElementById('deposit').value || 0,
        expenses: +document.getElementById('expenses').value || 0,
        guarantee: document.getElementById('guarantee').value || null,
        active: document.getElementById('active').checked
    },
    rules: {
        smoke: document.getElementById('smoke').value,
        events: document.getElementById('events').value,
        min_stay: +document.getElementById('minStay').value || 0,
        max_guests: +document.getElementById('maxGuests').value || 0,
    },
    location: {
        lat: parseFloat(document.getElementById('lat').value),
        lng: parseFloat(document.getElementById('lng').value),
        maps: document.getElementById('maps').value
    }};

    console.log('Payload listo para API:', payload);
    alert('Publicación creada (simulación). Mirá la consola para ver el payload.');
});

updateSide();