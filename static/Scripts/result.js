let currentPage = 1;
const limit = 10;

document.getElementById('test_button').disabled = true;

document.getElementById("attendance_form").addEventListener("submit", (event) => {
  event.preventDefault();
  currentPage = 1;
  cargarPagina(currentPage);
});

document.getElementById("load-container").style.display = "flex";

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

async function cargarPagina(page = 1) {
  document.getElementById("results_container").style.display = "flex";
  document.getElementById("load-container").style.display = "block";

  const matricula = document.getElementById("matricula").value.trim();
  // Validaciones para la matrícula
  if (
    matricula.toString().length < 10 ||
    matricula.toString().length > 10 ||
    matricula.length > 10 ||
    isNaN(matricula) ||
    Number(matricula) < 0
  ) {
    verifyMatricula();
  } else {
    const existingWarning = document.querySelector(".matricula-warning");
    if (existingWarning) existingWarning.remove();
  }

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
    if (response) {
      document.getElementById("pagination_controls").style.display = "flex";
      document.getElementById('test_button').disabled = false;
    }

    const result = await response.json();
    const data = result.data;
    const total = result.total;

    document.getElementById("load-container").style.display = "none";
    document.getElementById("results_container").style.display = "flex";
    document.getElementById("resultado").style.display = "flex";
    document.getElementById("resultado").style.flexDirection = "column";

    const container = document.getElementById("resultado");
    container.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0 || result.message) {
      container.textContent = "No se encontraron resultados para la búsqueda";
      document.getElementById("pagination_controls").style.display = "none";
      document.getElementById('test_button').disabled = true;
      return;
    }

    data.forEach((grupo) => {
      const div = document.createElement("div");
      div.classList.add("result-card");

      div.innerHTML = `
        <div class="card-header">
          <span class="card-date">${grupo.fecha}</span>
        </div>
        <div class="card-body">
          ${grupo.eventos.map(ev => `
            <p><strong>Hora:</strong> ${ev.dateTime.split("T")[1].split(":").slice(0, 2).join(":")}</p>
            <p><strong>Nombre:</strong> ${ev.name}</p>
            <p><strong>Matrícula:</strong> ${ev.employeeNoString}</p>
            <hr>
          `).join("")}
        </div>
      `;
      container.appendChild(div);
    });

    // Calcular total de páginas
    const totalPages = Math.ceil(total / limit);
    document.getElementById("page_info").textContent = `Página ${page} de ${totalPages}`;

    // Control de botones
    document.getElementById("prev_page").disabled = page <= 1;
    document.getElementById("next_page").disabled = page >= totalPages;

  } catch (error) {
    document.getElementById("resultado").textContent = "Error: " + error.message;
  }
}

function verifyMatricula() {
  document.getElementById("matricula").value = ""; // vaciamos el campo de matrícula
  const divisionMatricula = document.getElementById("matricula_group"); // división donde está el campo

  // Verificar si ya existe un mensaje de advertencia
  const existingWarning = divisionMatricula.querySelector(".matricula-warning");
  if (existingWarning) return; // ya existe, no duplicar

  const warningMatricula = document.createElement("p");
  warningMatricula.textContent = "Matrícula inválida. ingrese una matrícula de al menos 10 caracteres";
  warningMatricula.classList.add("matricula-warning");
  divisionMatricula.appendChild(warningMatricula);
}


  export async function fetchAllResults(){ //función para mandar los resultados a el PDF
  const matricula = document.getElementById("matricula").value.trim();
  const start_date = document.getElementById("start_date").value;
  const end_date = document.getElementById("end_date").value;

  let url = "https://control-escolar-familiar.onrender.com/lectura";
  const params = new URLSearchParams();

  if (matricula) params.append("matricula", matricula);
  if (start_date) params.append("start", start_date);
  if (end_date) params.append("end", end_date);

  // pedir todos los resultados (sin paginación)
  params.append("limit", 10000); // o un número suficientemente grande
  params.append("skip", 0);

  url+= `?${params.toString()}`;
  const response = await fetch(url);
  const result = await response.json();
  return result.data || [];
}