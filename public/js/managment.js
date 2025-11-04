document.addEventListener('DOMContentLoaded', () => {
  
  // ----- 1. LÓGICA DE TABS -----
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => {
      const tabId = b.dataset.tab;

      document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      document.querySelectorAll('.local-filter').forEach(f => {
        f.style.display = 'none';
      });

      b.classList.add('active');
      const targetPane = document.getElementById(tabId);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      const targetFilter = document.querySelector(`.local-filter[data-tab="${tabId}"]`);
      if (targetFilter) {
        targetFilter.style.display = 'block'; 
      }
    });
  });

  // ----- 2. LÓGICA DE FILTROS -----
  const filterInputs = ['q', 'fOperacion', 'fPropEstado'];
  const btnLimpiar = document.getElementById('btnLimpiar');

  function applyFiltersAndReload() {
    // Obtenemos la URL base (sin queries)
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    
    filterInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value) {
        params.set(id, el.value);
      }
    });

    window.location.href = baseUrl + '?' + params.toString();
  }

  // Asignamos el evento 'change' a todos los inputs de filtro
  filterInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', applyFiltersAndReload);
    }
  });

  // El botón "Limpiar" simplemente recarga la página sin filtros
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      window.location.href = window.location.origin + window.location.pathname;
    });
  }

  // ----- 3. LÓGICA DE FILTROS LOCALES (SIN RECARGA) -----
  // Filtro para la tabla de Contratos
  const filtroContratos = document.getElementById('filtroEstadoContrato');
  const tablaContratos = document.getElementById('tablaContratos');

  if (filtroContratos && tablaContratos) {
    const filasDeDatos = tablaContratos.querySelectorAll('tbody tr.data-row');
    const filaSinResultados = tablaContratos.querySelector('tbody tr.no-results-row');

    filtroContratos.addEventListener('change', () => {
      const estadoSeleccionado = filtroContratos.value;
      let visibleRowCount = 0;

      filasDeDatos.forEach(fila => {
        // Si no se selecciona nada (value=""), o si el estado coincide,
        // se muestra la fila. Si no, se oculta.
        const estadoFila = fila.dataset.estado;
        if (estadoSeleccionado === "" || estadoFila === estadoSeleccionado) {
          fila.style.display = "";
          visibleRowCount++;
        } else {
          fila.style.display = "none";
        }
      });

      if (filaSinResultados) {
        filaSinResultados.style.display = (visibleRowCount === 0) ? "" : "none";
      }
    });
  }

  // Filtro para la tabla de Pagos
  const filtroPagos = document.getElementById('filtroEstadoPago');
  const tablaPagos = document.getElementById('tablaPagos');

  if (filtroPagos && tablaPagosBody) {
    const filasDeDatos = tablaPagos.querySelectorAll('tbody tr.data-row');
    const filaSinResultados = tablaPagos.querySelector('tbody tr.no-results-row');
    
    filtroPagos.addEventListener('change', () => {
      const estadoSeleccionado = filtroPagos.value;
      let visibleRowCount = 0;

      filasDeDatos.forEach(fila => {
        const estadoFila = fila.dataset.estado;
        if (estadoSeleccionado === "" || estadoFila === estadoSeleccionado) {
          fila.style.display = "";
          visibleRowCount++;
        } else {
          fila.style.display = "none";
        }
      });

      if (filaSinResultados) {
        filaSinResultados.style.display = (visibleRowCount === 0) ? "" : "none";
      }
    });
  }

});