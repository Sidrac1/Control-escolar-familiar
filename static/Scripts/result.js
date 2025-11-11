async function cargarDatosConFiltros(event) {
    event.preventDefault(); // Evita el submit tradicional

    const domain = "https://control-escolar-familiar.onrender.com";
    const matricula = document.getElementById("matricula").value.trim();
    const startDate = document.getElementById("start_date").value;
    const endDate = document.getElementById("end_date").value;

    try {
        const response = await fetch(`${domain}/lectura`);
        if (!response.ok) throw new Error("Error al obtener los datos");

        const data = await response.json();

        if (!Array.isArray(data)) {
            document.getElementById("resultado").textContent = "No hay eventos disponibles.";
            return;
        }

        // Filtrar por matrícula y fecha
        const filtrados = data.filter(evento => {
            const fechaEvento = evento.dateTime.split("T")[0]; // Solo la fecha
            const coincideMatricula = matricula === "" || evento.employeeNoString === matricula;
            const dentroDeRango =
                (!startDate || fechaEvento >= startDate) &&
                (!endDate || fechaEvento <= endDate);
            return coincideMatricula && dentroDeRango;
        });

        const container = document.getElementById("resultado");
        container.innerHTML = "";

        if (filtrados.length === 0) {
            container.textContent = "No se encontraron coincidencias.";
            return;
        }

        filtrados.forEach(evento => {
            const div = document.createElement("div");
            div.classList.add("evento");

            div.innerHTML = `
                <p><strong>Nombre:</strong> ${evento.name}</p>
                <p><strong>Matrícula:</strong> ${evento.employeeNoString}</p>
                <p><strong>Fecha:</strong> ${evento.dateTime.split("T")[0]}</p>
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
});