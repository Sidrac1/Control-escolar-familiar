document.getElementById('attendance_form').addEventListener('submit', async (event) =>{
    event.preventDefault();

    const matricula = document.getElementById('matricula').value.trim();
    const start_date = document.getElementById('start_date').value;
    const end_date = document.getElementById('end_date').value;

    const params =new URLSearchParams();
    if(matricula) params.append('matricula', matricula);
    if(start_date) params.append('start', start_date);
    if(end_date) params.append('end', end_date);

    try{
        const response = await fetch(`http://localhost:5000/lectura?${params.toString()}`);
        const data = await response.json();

        const container = document.getElementById('resultado');
        container.innerHTML="";

        if (data.length === 0 || data.message){
            container.textContent = ("No se encontraron resultados para la búsqueda")
            return;
        }

    data.forEach((evento, index) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <p><strong>Nombre:</strong> ${evento.name}</p>
        <p><strong>Matrícula:</strong> ${evento.employeeNoString}</p>
        <p><strong>Fecha:</strong> ${evento.dateTime?.split("T")[0]}</p>
        <hr>`;
      container.appendChild(div);
    });
    }
    catch(error){
        document.getElementById('resultado').textContent = "Error "+ error.message;
    }
});

/*async function cargarDatos() {
    const domain = "https://control-escolar-familiar.onrender.com"
    try{
        const response = await fetch (`${domain}/lectura`);
        
        if(!response.ok) throw new Error("Error al obtener los datos");
        const data = await response.json();
        document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);
    }
    catch (error){
        document.getElementById('resultado').textContent = "Error: " + error.message;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.getElementById('test_button');
    if (testButton) {
        testButton.addEventListener('click', cargarDatos);
    }
});

/* 
async function cargarDatosConFiltros(event) {
    if (event) event.preventDefault(); // Solo si viene de un submit

    const domain = "https://control-escolar-familiar.onrender.com";
    const matricula = document.getElementById("matricula")?.value.trim();
    const startDate = document.getElementById("start_date")?.value;
    const endDate = document.getElementById("end_date")?.value;

    try {
        const response = await fetch(`${domain}/lectura`);
        const container = document.getElementById("resultado");
        container.innerHTML = "";

        if (!response.ok) {
            container.textContent = "Error al obtener los datos.";
            return;
        }

        const data = await response.json();

        // Si el backend devuelve un objeto con "mensaje", no hay datos
        if (!data || typeof data !== "object") {
            container.textContent = "Respuesta inválida del servidor.";
            return;
        }

        if ("mensaje" in data) {
            container.textContent = data.mensaje;
            return;
        }

        const eventos = Array.isArray(data) ? data : [data];

        const filtrados = eventos.filter(evento => {
            const fechaEvento = evento.dateTime?.split("T")[0];
            const coincideMatricula = !matricula || evento.employeeNoString === matricula;
            const dentroDeRango =
                (!startDate || fechaEvento >= startDate) &&
                (!endDate || fechaEvento <= endDate);
            return coincideMatricula && dentroDeRango;
        });

        if (filtrados.length === 0) {
            container.textContent = "No se encontraron coincidencias.";
            return;
        }

        filtrados.forEach((evento, index) => {
            const div = document.createElement("div");
            div.classList.add("evento");

            div.innerHTML = `
                <p><strong>#${index + 1}</strong></p>
                <p><strong>Nombre:</strong> ${evento.name}</p>
                <p><strong>Matrícula:</strong> ${evento.employeeNoString}</p>
                <p><strong>Fecha:</strong> ${evento.dateTime?.split("T")[0]}</p>
                <hr>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        document.getElementById("resultado").textContent = "Error: " + error.message;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("attendance_form");
    if (form) {
        form.addEventListener("submit", cargarDatosConFiltros);
    }

    const testButton = document.getElementById("test_button");
    if (testButton) {
        testButton.addEventListener("click", cargarDatosConFiltros);
    }

    // Carga inicial sin filtros
    cargarDatosConFiltros();
});
*/