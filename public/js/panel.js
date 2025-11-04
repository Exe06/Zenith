document.addEventListener('DOMContentLoaded', () => {
  
  // Lógica para el cambio de Pestañas
  document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;

      // 1. Ocultar todos los botones y panes
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
      
      // 2. Ocultar todos los filtros locales (si los hubiese)
      document.querySelectorAll('.local-filter').forEach(f => f.style.display = 'none');

      // 3. Mostrar el activo
      button.classList.add('active');
      const targetPane = document.getElementById(tabId);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      // 4. Mostrar el filtro local correspondiente (si existe)
      const targetFilter = document.querySelector(`.local-filter[data-tab="${tabId}"]`);
      if (targetFilter) {
        targetFilter.style.display = 'block'; 
      }
    });
  });

  // Lógica de Filtros Locales (la misma que ya tenías, para Pagos y Contratos)
  // ... (Aquí iría la función que maneja el 'change' del select y oculta/muestra filas) ...

});