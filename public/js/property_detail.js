// Pequeña galería: cambiar imagen principal desde thumbnails
const main = document.querySelector('#mainPhoto img');
const label = document.getElementById('imgLabel');
document.querySelectorAll('.thumb img').forEach((el)=>{
    el.addEventListener('click', ()=>{
    const all = Array.from(document.querySelectorAll('.thumb img'));
    const idx = all.indexOf(el) + 1;
    main.src = el.src.replace('w=1200','w=1780');
    main.alt = el.alt;
    label.innerHTML = label.innerHTML.replace(/\d+\s\/\s\d+/, `${idx} / 8`);
    })
})

// Favorito
document.getElementById('favBtn').addEventListener('click', function(){
    this.classList.toggle('active');
    this.title = this.classList.contains('active') ? 'Quitar de favoritos' : 'Agregar a favoritos';
})

// Compartir
document.getElementById('shareBtn').addEventListener('click', async ()=>{
    const data = {title:'Estilo cálido', text:'Mirá esta propiedad que encontré', url: location.href};
    try{
    if(navigator.share){
        await navigator.share(data);
    }else{
        await navigator.clipboard.writeText(data.url);
        alert('Enlace copiado al portapapeles');
    }
    } catch(e) {
    console.log(e);
    }
})