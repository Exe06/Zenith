(() => {
  // ----- refs -----
  const form = document.getElementById("listingForm");
  const title = document.getElementById("title");
  const titleCount = document.getElementById("titleCount");
  const desc = document.getElementById("description");
  const descCount = document.getElementById("descCount");
  const opSel = document.getElementById("operationType");
  const baseAmount = document.getElementById("baseAmount");
  const deposit = document.getElementById("deposit");
  const guarantee = document.getElementById("guarantee");
  const dailyPrice = document.getElementById("dailyPrice");
  const weeklyDiscount = document.getElementById("weeklyDiscount");
  const monthlyDiscount = document.getElementById("monthlyDiscount");
  const provinceSel = document.getElementById("province");
  const city = document.getElementById("city");
  const sideOp = document.getElementById("sideOp");
  const sidePrice = document.getElementById("sidePrice");
  const sideTitle = document.getElementById("sideTitle");
  const sideLocation = document.getElementById("sideLocation");
  const sideChips = document.getElementById("sideChips");
  const sideImg = document.getElementById("sideImg");
  const chipsWrap = document.getElementById("amenities");
  const drop = document.getElementById("drop");
  const inputFiles = document.getElementById("files");
  const previews = document.getElementById("previews");
  const baseAmountWrap = baseAmount?.closest(".field");
  const depositWrap = deposit?.closest(".field");
  const guaranteeWrap = guarantee?.closest(".field");
  const dailyWrap = dailyPrice?.closest(".field");
  const weeklyWrap = weeklyDiscount?.closest(".field");
  const monthlyWrap = monthlyDiscount?.closest(".field");

  const DEFAULT_IMG =
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=600&auto=format&fit=crop";

  // ----- helpers -----
  const fmtARS = (n) => "$ " + Number(n || 0).toLocaleString("es-AR");

  function updateSide() {
    sideTitle.textContent = title.value || "Título de la publicación";
    const opText = opSel?.options[opSel.selectedIndex]?.text || "Operación";
    sideOp.textContent = opText;

    const isTemporal = opSel?.value === "2";
    let priceToShow = 0;

    if (isTemporal) {
      priceToShow = dailyPrice?.value;
    } else {
      priceToShow = deposit?.value;
    }
    sidePrice.textContent = fmtARS(priceToShow);
    sideLocation.textContent = `${provinceSel?.value || "Provincia"}, ${
      city?.value || "Ciudad"
    }`;

    const actives = Array.from(
      chipsWrap.querySelectorAll('.chip[data-active="true"]')
    )
      .slice(0, 4)
      .map((el) => el.textContent.trim());
    sideChips.innerHTML = actives
      .map((t) => `<span class="chip">${t}</span>`)
      .join("");
  }

  function setEnabled(el, enabled) {
    if (!el) return;
    el.disabled = !enabled;
    if (!enabled) {
      el.dataset.wasRequired = el.required ? "1" : "";
      el.required = false;
    } else if (el.dataset.wasRequired === "1") {
      el.required = true;
    }
  }

  function show(elWrap, visible) {
    if (!elWrap) return;
    elWrap.hidden = !visible;
  }

  // ----- contadores -----
  title?.addEventListener("input", () => {
    titleCount.textContent = `${title.value.length}/80`;
    updateSide();
  });
  desc?.addEventListener("input", () => {
    descCount.textContent = `${desc.value.length}/500`;
  });

  [
    "city",
    "operationType",
    "province",
    "dailyPrice",
    "propertyType",
    "address",
    "deposit",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", updateSide);
    el.addEventListener("change", updateSide);
  });

  // ----- crear inputs ocultos según chips activos -----
  function syncAmenities() {
    form
      .querySelectorAll('input[name="servicios"]')
      .forEach((el) => el.remove());
    chipsWrap.querySelectorAll(".chip.active").forEach((chip) => {
      const inp = document.createElement("input");
      inp.type = "hidden";
      inp.name = "servicios"; // (Asegurate que tu validador busque 'servicios')
      inp.value = chip.dataset.key;
      form.appendChild(inp);
    });
  }

  // ----- amenities toggle (solo visual + preview derecha) -----
  chipsWrap.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const active = chip.dataset.active === "true" ? "false" : "true";
    chip.dataset.active = active;
    chip.classList.toggle("active", active === "true");
    updateSide();
    syncAmenities();
  });

  form.addEventListener("submit", syncAmenities);

  // ----- mostrar/ocultar según operación -----
  function applyOperationMode() {
    const isTemporal = opSel?.value === "2";

    // Largo plazo: mostrar y habilitar
    show(baseAmountWrap, !isTemporal);
    show(depositWrap, !isTemporal);
    show(guaranteeWrap, !isTemporal);
    setEnabled(baseAmount, !isTemporal);
    setEnabled(deposit, !isTemporal);
    setEnabled(guarantee, !isTemporal);

    // Temporal: mostrar y habilitar
    show(dailyWrap, isTemporal);
    show(weeklyWrap, isTemporal);
    show(monthlyWrap, isTemporal);
    setEnabled(dailyPrice, isTemporal);
    setEnabled(weeklyDiscount, isTemporal);
    setEnabled(monthlyDiscount, isTemporal);

    updateSide();
  }

  opSel?.addEventListener("change", applyOperationMode);

  // ----- uploader y previews (para NUEVAS imágenes) -----
  function renderPreview(file) {
    const url = URL.createObjectURL(file);
    const box = document.createElement("div");
    box.className = "ph ph-new"; // 'ph' para preview nueva
    box.innerHTML = `<img src="${url}" alt="imagen"><button type="button" title="Eliminar">✕</button>`;

    box.querySelector("button").onclick = () => {
      if (sideImg.src === url) {
        const next =
          box.nextElementSibling?.querySelector("img") ||
          previews.querySelector(".ph img, .ph-new img");
        sideImg.src = next ? next.src : DEFAULT_IMG;
      }
      URL.revokeObjectURL(url);
      box.remove();
    };

    previews.appendChild(box);
    if (sideImg.src === DEFAULT_IMG) {
      sideImg.src = url;
    }
  }

  inputFiles.addEventListener("change", () => {
    [...inputFiles.files]
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 10)
      .forEach(renderPreview);
  });

  ["dragover", "drop"].forEach((ev) =>
    drop.addEventListener(ev, (e) => e.preventDefault())
  );
  drop.addEventListener("drop", (e) => {
    const files = [...e.dataTransfer.files]
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 10);
    files.forEach(renderPreview);
  });

  document.querySelectorAll('.btn-delete-img').forEach(button => {
    button.addEventListener('click', (e) => {
      const box = e.currentTarget.closest('.ph'); // El div 'ph' (existente)
      const imageId = e.currentTarget.dataset.imageId; 
      const imageUrl = box.querySelector('img')?.src;

      if (!box || !imageId || !imageUrl) return;

      // 1. Crear un input oculto para notificar al servidor
      const inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = 'delete_images[]'; // El backend recibirá un array de IDs a borrar
      inp.value = imageId;
      form.appendChild(inp);

      box.classList.add('deleted');

      // 2. Actualizar la imagen de portada si era esta
      if (sideImg.src === imageUrl) {
        const nextImgElement = previews.querySelector('.ph:not(.deleted) img, .ph-new img'); 
        sideImg.src = nextImgElement ? nextImgElement.src : DEFAULT_IMG;
      }
      
      box.remove();
    });
  });

  // ----- init -----
  titleCount.textContent = `${title?.value.length || 0}/80`;
  descCount.textContent = `${desc?.value.length || 0}/500`;

  syncAmenities();

  // (AÑADIDO) Sincroniza la imagen de portada del sidebar con la primera imagen existente
  const firstExistingImage = previews.querySelector(".ph img");
  if (firstExistingImage) {
    sideImg.src = firstExistingImage.src;
  }

  applyOperationMode();
  updateSide();
})();
