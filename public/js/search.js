document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Identificamos el CONTENEDOR de filtros (ahora es un <div>)
  const filterContainer = document.getElementById('filters');
  const baseUrl = window.location.origin + window.location.pathname;

  // 2. Seleccionamos TODOS los inputs
  const filterInputs = filterContainer.querySelectorAll('input[name]');
  const filterSelects = filterContainer.querySelectorAll('select[name]');
  const filterCheckboxes = filterContainer.querySelectorAll('input[type="checkbox"][name="svc"]');
  
  // 3. AÑADIMOS la referencia al botón Limpiar
  const btnLimpiar = document.getElementById('btnLimpiar');

  /**
   * Esta función lee TODOS los filtros, arma la URL y recarga la página.
   */
  function applyFiltersAndReload() {
    const params = new URLSearchParams();

    filterInputs.forEach(input => {
      if (input.type === 'search' && input.value) {
        params.set(input.name, input.value);
      }
    });

    // 1. Añadimos los valores de todos los <select>
    filterSelects.forEach(select => {
      if (select.value) { 
        params.set(select.name, select.value);
      }
    });

    // 2. Añadimos los valores de los checkboxes marcados
    filterCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        params.append(checkbox.name, checkbox.value);
      }
    });

    // 3. Recargamos la página
    window.location.href = baseUrl + '?' + params.toString();
  }

  // 4. Añadimos el "detector de cambios" a todos los filtros
  filterInputs.forEach(el => el.addEventListener('change', applyFiltersAndReload));
  filterSelects.forEach(el => el.addEventListener('change', applyFiltersAndReload));
  filterCheckboxes.forEach(el => el.addEventListener('change', applyFiltersAndReload));

  // 5. AÑADIMOS la lógica para el botón Limpiar
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      window.location.href = baseUrl;
    });
  }

});