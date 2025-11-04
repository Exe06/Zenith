document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchForm = document.getElementById("search-form");

  const tabs = document.querySelectorAll(".tabs .tab");
  const baseUrl = window.location.origin + window.location.pathname;

  const filtroEstadoUsuario = document.getElementById("filtroEstadoUsuario");
  const btnExport = document.getElementById('btn-export');

  // --- Lógica de Pestañas (Tabs) ---
  tabs.forEach((t) => {
    t.addEventListener("click", () => {
      const newTab = t.dataset.tab; // 'usuarios' o 'inmuebles'

      // Recarga la página, manteniendo el término de búsqueda (q)
      const params = new URLSearchParams(window.location.search);
      params.set("tab", newTab); // Cambia la pestaña
      params.delete("page");

      window.location.href = baseUrl + "?" + params.toString();
    });
  });

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      // Obtenemos los parámetros de la URL actual (esto incluye 'tab' y 'q')
      const currentUrl = new URL(window.location.href); 
      
      // 1. Nos aseguramos de eliminar la paginación (queremos todos los datos)
      currentUrl.searchParams.delete('page');
      
      // 2. Agregamos el parámetro de formato
      currentUrl.searchParams.set('format', 'csv'); 
      
      // 3. Creamos un elemento <a> temporal
      const downloadLink = document.createElement('a');
      
      // 4. Asignamos la URL completa al href (ej: /admin?tab=usuarios&q=Admin&format=csv)
      downloadLink.href = currentUrl.toString();
      
      // 5. Nombramos el archivo dinámicamente
      const tabName = currentUrl.searchParams.get('tab') || 'datos';
      downloadLink.download = `${tabName}_exportados.csv`; 
      
      // 6. Forzamos la descarga
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  }

  // --- Lógica de Búsqueda (Input) ---
  if (searchInput && searchForm) {
    // Listener para el input de búsqueda
    searchInput.addEventListener("change", () => {
      const params = new URLSearchParams(window.location.search);

      if (searchInput.value.trim()) {
        params.set("q", searchInput.value.trim());
      } else {
        params.delete("q");
      }

      params.delete("page");

      window.location.href = baseUrl + "?" + params.toString();
    });
  }

  if (filtroEstadoUsuario) {
    // 1. Añadimos un listener al cambio del <select>
    filtroEstadoUsuario.addEventListener("change", () => {
      const estadoSeleccionado = filtroEstadoUsuario.value; // 'activo', 'pendiente', etc.
      console.log("MENSAJE:", estadoSeleccionado);
      
      // 2. Leemos la URL actual y los parámetros existentes
      const params = new URLSearchParams(window.location.search);

      // 3. Establecemos el nuevo filtro de estado (ej: fEstado=activo)
      if (estadoSeleccionado === "") { 
        params.delete("fEstado"); // <-- ¡Eliminamos el parámetro de la URL!
      } else {
        // Si hay un valor real, lo establecemos
        params.set("fEstado", estadoSeleccionado);
      }

      params.delete("page");

      // 5. Recargamos la página con los nuevos filtros
      window.location.href = baseUrl + "?" + params.toString();
    });
  }
});