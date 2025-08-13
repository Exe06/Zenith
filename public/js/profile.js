// Tabs simples sin recargar
(function(){
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const panels = Array.from(document.querySelectorAll('.tab-panel'));

    function activate(tabName){
        tabs.forEach(b => {
            const isActive = b.dataset.tab === tabName;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        panels.forEach(p => p.hidden = (p.dataset.panel !== tabName));
    }

    tabs.forEach(b => b.addEventListener('click', () => activate(b.dataset.tab)));
    if (location.hash){
        const name = location.hash.replace('#','');
        if (tabs.some(t => t.dataset.tab === name)) activate(name);
    }
})();