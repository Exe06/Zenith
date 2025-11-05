// (Añadir a tu script de admin)
document.addEventListener('DOMContentLoaded', () => {

  // --- LÓGICA DEL MODAL DE RECHAZO ---
  const openModalBtn = document.getElementById('btn-open-reject-modal');
  const rejectModal = document.getElementById('reject-modal');
  const cancelBtn1 = document.getElementById('btn-cancel-reject-modal');
  const cancelBtn2 = document.getElementById('btn-cancel-reject-modal-2');

  if (openModalBtn && rejectModal) {
    // Abrir el modal
    openModalBtn.addEventListener('click', () => {
      rejectModal.showModal();
    });

    // Cerrar con el botón 'X'
    cancelBtn1?.addEventListener('click', () => {
      rejectModal.close();
    });

    // Cerrar con el botón 'Cancelar'
    cancelBtn2?.addEventListener('click', () => {
      rejectModal.close();
    });

    // Opcional: Cerrar si se hace clic fuera del modal (en el fondo)
    rejectModal.addEventListener('click', (e) => {
      if (e.target === rejectModal) {
        rejectModal.close();
      }
    });
  }
});