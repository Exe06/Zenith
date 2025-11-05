(() => {
  // Definiciones básicas
  const $ = (s) => document.querySelector(s);
  const form = $("#contractForm");

  // Referencias de la cabecera
  const propertySelect = $("#property_id");
  const contractTypeInput = $("#contract_type");

  // Referencias de Partes
  const tenantDniInput = $("#tenant_dni");
  const boxGuarantee = $("#box_guarantee");

  // Referencias de Fechas y Frecuencia
  const startDateInput = $("#start_date");
  const endDateInput = $("#end_date");
  const boxFrequency = $("#box_frequency");
  const payFrequencySelect = $("#pay_frequency");
  const payFrequencyHidden = $("#pay_frequency_hidden"); // Hidden input

  // Referencias de Importes
  // Wrappers
  const baseAmountWrap = document.getElementById('baseAmountWrap');
  const depositWrap = document.getElementById('depositWrap');
  const dailyWrap = document.getElementById('dailyWrap');
  
  // Inputs
  const baseAmountInput = document.getElementById('baseAmount'); // Pago Inicial (Monto Base)
  const depositoInput = document.getElementById('deposit'); // Depósito Mensual (CUOTA recurrente)
  const dailyPriceInput = document.getElementById('dailyPrice'); // Precio Diario (TEMP)

  // Referencias de Total/Ayudas
  const calcSpan = $("#calc_span");
  const discountWeeklyWrap = $("#discountWeeklyWrap");
  const discountMonthlyWrap = $("#discountMonthlyWrap");
  const discountWeeklySpan = $("#discount_weekly");
  const discountMonthlySpan = $("#discount_monthly");
  const cuotaInput = document.getElementById('cuota'); // Campo calculado
  const totalInput = document.getElementById('total'); // Campo calculado
  
  // Almacena los datos de la propiedad activa (data-attributes)
  let currentPropertyData = null;
  const ID_LARGO_PLAZO = "Alquiler Largo Plazo";

  const elementsToListen = [
    startDateInput, 
    endDateInput, 
    baseAmountInput, 
    depositoInput, 
    dailyPriceInput, 
    payFrequencySelect
  ].filter(el => el !== null && el !== undefined); // Filtramos cualquier null/undefined

  // --- HELPERS ---
  const fmtARS = (n) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }).format(n || 0);

  function nightsBetween(start, end) {
    // Comprueba que ambas fechas existan antes de calcular
    if (!start || !end) return 0;
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = new Date(end) - new Date(start);
    return Math.max(0, Math.round(diff / msPerDay));
  }

  // --- FUNCIÓN show (necesaria para los wrappers) ---
  function show(elWrap, visible) {
    if (!elWrap) return;
    elWrap.style.display = visible ? 'block' : 'none';
  }

  // --- FUNCIÓN PRINCIPAL: MANEJO DEL MODO (LP vs TEMP) ---
  function applyContractMode() {
    if (!propertySelect.value) {
      currentPropertyData = null;
      contractTypeInput.value = "";
      // Limpieza de campos de precio
      baseAmountInput.value = '';
      depositoInput.value = '';
      dailyPriceInput.value = '';
      startDateInput.value = '';
      endDateInput.value = '';
      discountWeeklySpan.textContent = '–';
      discountMonthlySpan.textContent = '–';

      // Ocultar todos los wrappers (Volver al estado inicial limpio)
      show(baseAmountWrap, false);
      show(depositWrap, false);
      show(dailyWrap, false);
      show(boxGuarantee, false);
      show(discountWeeklyWrap, false);
      show(discountMonthlyWrap, false);
      boxFrequency.style.display = "none";

      // Limpiar Ayudas y Cálculos
      document.querySelector('#calc_span').textContent = '–';
      document.querySelector('#cuota').value = '0.00';
      document.querySelector('#total').value = '0.00';
      
      return;
    }

    const selectedOption = propertySelect.options[propertySelect.selectedIndex];

    // Cargar datos de la propiedad (data-attributes)
    currentPropertyData = {
      id: selectedOption.value,
      type: selectedOption.dataset.contractType,
      monthlyPrice: parseFloat(selectedOption.dataset.monthlyPrice || 0), // Este es el valor del DEPÓSITO/Cuota Mensual
      dailyPrice: parseFloat(selectedOption.dataset.dailyPrice || 0),
      title: selectedOption.dataset.title,
      // Descuentos vienen como string, los parseamos
      weeklyDiscount: parseFloat(selectedOption.dataset.weeklyDiscount || 0) / 100,
      monthlyDiscount: parseFloat(selectedOption.dataset.monthlyDiscount || 0) / 100,
    };
    
    const isLargoPlazo = currentPropertyData.type === ID_LARGO_PLAZO;

    // A. SETEAR VALORES Y VISIBILIDAD
    contractTypeInput.value = currentPropertyData.type;

    baseAmountInput.value = isLargoPlazo ? currentPropertyData.monthlyPrice.toFixed(2) : ''; // Pago Inicial
    depositoInput.value = isLargoPlazo ? currentPropertyData.monthlyPrice.toFixed(2) : ''; // Cuota Mensual
    dailyPriceInput.value = isLargoPlazo ? '' : currentPropertyData.dailyPrice.toFixed(2); // Precio Diario

    // B. LARGO PLAZO (LP)
    if (isLargoPlazo) {
      // VISIBILIDAD
      show(baseAmountWrap, true);
      show(depositWrap, true);
      show(dailyWrap, false);
      show(boxGuarantee, true);
      show(discountWeeklyWrap, false);
      show(discountMonthlyWrap, false);

      // INICIALIZACIÓN DE VALORES
      baseAmountInput.value = currentPropertyData.monthlyPrice.toFixed(2); 
      depositoInput.value = currentPropertyData.monthlyPrice.toFixed(2);
      discountWeeklySpan.textContent = '–';
      discountMonthlySpan.textContent = '–';

      // Frecuencia: Fija a Mensual
      boxFrequency.style.display = "none";
      payFrequencyHidden.disabled = false;
    }

    // C. TEMPORAL
    else {
      // VISIBILIDAD
      show(baseAmountWrap, false);
      show(depositWrap, false);
      show(dailyWrap, true); // Mostrar Precio Diario
      show(boxGuarantee, false); // Ocultar Garantía
      show(discountWeeklyWrap, true);
      show(discountMonthlyWrap, true);

      // INICIALIZACIÓN DE VALORES
      dailyPriceInput.value = currentPropertyData.dailyPrice.toFixed(2);
      discountWeeklySpan.textContent = `${(currentPropertyData.weeklyDiscount * 100).toFixed(0)}%`;
      discountMonthlySpan.textContent = `${(currentPropertyData.monthlyDiscount * 100).toFixed(0)}%`;
      
      // Frecuencia: Mostrar select de opciones
      populateTemporalFrequency(); 
      boxFrequency.style.display = "block";
      payFrequencyHidden.disabled = true;
    }

    updateCalculations();
  }

  // Llenar el <select> de frecuencia para alquileres temporales
  function populateTemporalFrequency() {
    // (Esta función es correcta y queda igual)
    const options = [
      { val: "un_pago", text: "Total único" },
      { val: "diario", text: "Diario" },
      { val: "semanal", text: "Semanal" },
      { val: "mensual", text: "Mensual" },
    ];
    payFrequencySelect.innerHTML = options
      .map((o) => `<option value="${o.val}">${o.text}</option>`)
      .join("");
  }

  // --- FUNCIÓN DE CÁLCULO (Limpiada) ---
  function updateCalculations() {
    if (!currentPropertyData) return;

    const start = startDateInput.value;
    const end = endDateInput.value;
    const nights = nightsBetween(start, end);
    let durationText = '–';

    const isLargoPlazo = currentPropertyData.type === ID_LARGO_PLAZO;

    if (nights > 0) {
      durationText = `${nights} día(s)`

      if (isLargoPlazo && nights < 1095) { 
        durationText += ` <span style="color: var(--err); font-weight: 600;">(Mínimo 3 años)</span>`;
      }
    }
    calcSpan.innerHTML = durationText;

    if (!isLargoPlazo) {
      // Buscamos las opciones DENTRO del select
      const optSemanal = payFrequencySelect.querySelector('option[value="semanal"]');
      const optMensual = payFrequencySelect.querySelector('option[value="mensual"]');

      // 1. Deshabilitar 'semanal' si la estadía es menor a 7 días
      if (optSemanal) {
        optSemanal.disabled = (nights < 7);
      }
      // 2. Deshabilitar 'mensual' si la estadía es menor a 30 días
      if (optMensual) {
        optMensual.disabled = (nights < 30);
      }

      if (payFrequencySelect.options[payFrequencySelect.selectedIndex].disabled) {
        if (nights < 7) {
          payFrequencySelect.value = 'un_pago';
        } else if (nights < 30) {
          payFrequencySelect.value = 'semanal';
        }
      }
    }

    // Valores de los inputs (aseguramos que sean números válidos)
    const montoBaseInicial = parseFloat(baseAmountInput?.value || 0); 
    const depositoMensual = parseFloat(depositoInput?.value || 0); 
    const dailyPriceTEMP = parseFloat(dailyPriceInput?.value || 0);
    const months = Math.ceil(nights / 30); 

    let finalTotal = 0;
    let calculatedCuota = 0; 

    // Cálculos para LARGO PLAZO
    if (isLargoPlazo) {        
      // Cuota Recurrente = Depósito Mensual
      calculatedCuota = depositoMensual;
      // Total = Pago Inicial Único + (Cuota Mensual * Meses del Contrato)
      finalTotal = montoBaseInicial + (depositoMensual * months); 

    } else {
      // Obtenemos los descuentos de la propiedad
      const propWeeklyDiscount = currentPropertyData.weeklyDiscount;
      const propMonthlyDiscount = currentPropertyData.monthlyDiscount;
      
      const pricePerNight = dailyPriceTEMP;
      let effectiveDailyPrice = pricePerNight;
      
      // Aplicación del descuento
      if (nights >= 30) {
        effectiveDailyPrice = pricePerNight * (1 - propMonthlyDiscount);
      } else if (nights >= 7) {
        effectiveDailyPrice = pricePerNight * (1 - propWeeklyDiscount);
      }
      
      // Total y Cuota Recurrente
      finalTotal = effectiveDailyPrice * nights;
      calculatedCuota = effectiveDailyPrice; 
    }

    // Actualizar Totales (Solo lectura)
    // Usamos toFixed(2) para asegurar el formato decimal
    cuotaInput.value = calculatedCuota.toFixed(2);
    totalInput.value = finalTotal.toFixed(2);
  }


  // --- EVENT LISTENERS Y INIT ---
  // Escuchamos la selección de la propiedad
  propertySelect.addEventListener("change", applyContractMode);

  // Escuchamos cambios en fechas y precio (Añadimos los nuevos inputs)
  // 2. Escuchamos cambios en esos elementos
  elementsToListen.forEach(
    (el) => el.addEventListener("change", updateCalculations)
  );

  // Llamada inicial
  applyContractMode();
})();