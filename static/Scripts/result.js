let currentPage = 1;
let lastQueryTotal = 0;
const limit = 10;

const submitButton = document.getElementById("submit_button");
const pdfButton = document.getElementById("download_pdf_button");
const excelButton = document.getElementById("download_excel_button");
const clearButton = document.getElementById("clear_button");
const summaryBar = document.getElementById("summary_bar");
const summaryText = document.getElementById("summary_text");

document.getElementById("attendance_form").addEventListener("submit", (event) => {
  event.preventDefault();
  currentPage = 1;
  cargarPagina(currentPage);
});

clearButton.addEventListener("click", () => {
  document.getElementById("matricula").value = "";
  document.getElementById("start_date").value = "";
  document.getElementById("end_date").value = "";
  clearFieldWarning();

  document.getElementById("resultado").style.display = "block";
  document.getElementById("resultado").textContent = "Esperando datos...";
  document.getElementById("results_container").querySelectorAll(".result-card").forEach(el => el.remove());
  document.getElementById("pagination_controls").style.display = "none";
  summaryBar.style.display = "none";
  pdfButton.disabled = true;
  excelButton.disabled = true;
  lastQueryTotal = 0;
});

document.getElementById("prev_page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    cargarPagina(currentPage);
  }
});

document.getElementById("next_page").addEventListener("click", () => {
  currentPage++;
  cargarPagina(currentPage);
});

function clearFieldWarning() {
  const existingWarning = document.querySelector(".field-warning");
  if (existingWarning) existingWarning.remove();
}

function verifyMatricula(matricula) {
  const soloDigitos = /^\d{10}$/.test(matricula);
  if (soloDigitos) {
    clearFieldWarning();
    return true;
  }

  const divisionMatricula = document.getElementById("matricula_group");
  clearFieldWarning();

  const warning = document.createElement("p");
  warning.classList.add("field-warning");
  warning.innerHTML = "⚠ Ingresa una matrícula válida de 10 dígitos";
  divisionMatricula.appendChild(warning);
  return false;
}

function formatHora(dateTimeISO) {
  return dateTimeISO.split("T")[1].split(":").slice(0, 2).join(":");
}

function formatFecha(fechaYMD) {
  const fecha = new Date(`${fechaYMD}T00:00:00`);
  return fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
}

// Toma los eventos de un día y decide cuál es entrada, cuál es salida,
// y cuáles son marcajes adicionales (posibles errores de registro).
export function clasificarEventosDelDia(eventos) {
  const ordenados = [...eventos].sort((a, b) => a.dateTime.localeCompare(b.dateTime));

  if (ordenados.length === 1) {
    return { unico: ordenados[0], entrada: null, salida: null, adicionales: [] };
  }

  return {
    unico: null,
    entrada: ordenados[0],
    salida: ordenados[ordenados.length - 1],
    adicionales: ordenados.slice(1, -1)
  };
}

function recordRowHtml(ev, label, badgeClass) {
  return `
    <div class="record-row">
      <span class="record-time">${formatHora(ev.dateTime)}</span>
      <div class="record-info">
        <span class="record-name">${ev.name ?? "—"}</span>
        <span class="record-matricula">Matrícula: ${ev.employeeNoString ?? "—"}</span>
      </div>
      <span class="badge ${badgeClass}">${label}</span>
    </div>
  `;
}

function renderDiaCard(grupo) {
  const div = document.createElement("div");
  div.classList.add("result-card");

  const { unico, entrada, salida, adicionales } = clasificarEventosDelDia(grupo.eventos);

  let bodyHtml = "";

  if (unico) {
    bodyHtml += recordRowHtml(unico, "Único registro", "badge-unico");
    bodyHtml += `<p class="single-record-note">⚠ Solo se registró un marcaje este día. Puede faltar la entrada o la salida.</p>`;
  } else {
    bodyHtml += recordRowHtml(entrada, "Entrada", "badge-entrada");
    bodyHtml += recordRowHtml(salida, "Salida", "badge-salida");

    if (adicionales.length > 0) {
      const plural = adicionales.length > 1;
      bodyHtml += `
        <details class="extra-records">
          <summary>${adicionales.length} registro${plural ? "s" : ""} adicional${plural ? "es" : ""} este día (posible error de marcaje)</summary>
          ${adicionales.map(ev => recordRowHtml(ev, "Adicional", "badge-adicional")).join("")}
        </details>
      `;
    }
  }

  div.innerHTML = `
    <div class="card-header">
      <span class="card-date">📆 ${formatFecha(grupo.fecha)}</span>
      <span class="card-count">${grupo.eventos.length} registro${grupo.eventos.length > 1 ? "s" : ""}</span>
    </div>
    <div class="card-body">${bodyHtml}</div>
  `;

  return div;
}

function renderEmptyState(mensaje) {
  const container = document.getElementById("resultado");
  container.style.display = "block";
  container.innerHTML = `
    <div class="empty-state">
      <span class="empty-icon">📭</span>
      <span class="empty-title">${mensaje}</span>
      <span class="empty-subtitle">Prueba con otra matrícula o un rango de fechas distinto.</span>
    </div>
  `;
}

async function cargarPagina(page = 1) {
  const matricula = document.getElementById("matricula").value.trim();

  if (!verifyMatricula(matricula)) {
    return;
  }

  document.getElementById("results_container").style.display = "flex";
  document.getElementById("load-container").style.display = "flex";
  document.getElementById("resultado").style.display = "none";
  document.getElementById("results_container").querySelectorAll(".result-card").forEach(el => el.remove());
  summaryBar.style.display = "none";

  submitButton.disabled = true;
  submitButton.textContent = "Buscando…";
  pdfButton.disabled = true;
  excelButton.disabled = true;

  const start_date = document.getElementById("start_date").value;
  const end_date = document.getElementById("end_date").value;

  let url = "https://control-escolar-familiar.onrender.com/lectura"; //"http://127.0.0.1:5000/lectura";
  const params = new URLSearchParams();

  if (matricula) params.append("matricula", matricula);
  if (start_date) params.append("start", start_date);
  if (end_date) params.append("end", end_date);

  params.append("limit", limit);
  params.append("skip", (page - 1) * limit);

  url += `?${params.toString()}`;

  try {
    const response = await fetch(url);
    const result = await response.json();
    const data = result.data;
    const total = result.total || 0;
    lastQueryTotal = total;

    document.getElementById("load-container").style.display = "none";

    submitButton.disabled = false;
    submitButton.textContent = "🔍 Buscar Asistencias";

    const container = document.getElementById("resultado");
    document.getElementById("results_container").querySelectorAll(".result-card").forEach(el => el.remove());

    if (!Array.isArray(data) || data.length === 0 || result.message) {
      renderEmptyState("No se encontraron resultados para la búsqueda");
      document.getElementById("pagination_controls").style.display = "none";
      pdfButton.disabled = true;
      excelButton.disabled = true;
      return;
    }

    container.style.display = "none";

    data.forEach((grupo) => {
      document.getElementById("results_container").appendChild(renderDiaCard(grupo));
    });

    const totalPages = Math.ceil(total / limit);
    document.getElementById("page_info").textContent = `Página ${page} de ${totalPages}`;
    document.getElementById("pagination_controls").style.display = "flex";

    document.getElementById("prev_page").disabled = page <= 1;
    document.getElementById("next_page").disabled = page >= totalPages;

    summaryBar.style.display = "flex";
    summaryText.innerHTML = `<strong>${total}</strong> registro${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""} para la matrícula <strong>${matricula}</strong>${start_date || end_date ? ` entre <strong>${start_date || "…"}</strong> y <strong>${end_date || "…"}</strong>` : ""}`;

    pdfButton.disabled = false;
    excelButton.disabled = false;

  } catch (error) {
    document.getElementById("load-container").style.display = "none";
    submitButton.disabled = false;
    submitButton.textContent = "🔍 Buscar Asistencias";
    renderEmptyState("Ocurrió un error al consultar los datos");
    pdfButton.disabled = true;
    excelButton.disabled = true;
  }
}

export async function fetchAllResults() { // función para mandar los resultados al PDF/Excel
  const matricula = document.getElementById("matricula").value.trim();
  const start_date = document.getElementById("start_date").value;
  const end_date = document.getElementById("end_date").value;

  let url = "https://control-escolar-familiar.onrender.com/lectura";
  const params = new URLSearchParams();

  if (matricula) params.append("matricula", matricula);
  if (start_date) params.append("start", start_date);
  if (end_date) params.append("end", end_date);

  // pedir todos los resultados (sin paginación)
  params.append("limit", 10000);
  params.append("skip", 0);

  url += `?${params.toString()}`;
  const response = await fetch(url);
  const result = await response.json();
  return result.data || [];
}
