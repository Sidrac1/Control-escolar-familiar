import { fetchAllResults, clasificarEventosDelDia } from './result.js';

function formatHora(dateTimeISO) {
  return dateTimeISO.split("T")[1].split(":").slice(0, 2).join(":");
}

document.getElementById('download_excel_button').addEventListener('click', async function () {
  const btn = this;
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Generando…";

  try {
    const allResults = await fetchAllResults();

    if (!allResults.length) {
      return;
    }

    const rows = [];
    const pushRow = (fecha, ev, tipo) => rows.push({
      Fecha: fecha,
      Hora: formatHora(ev.dateTime),
      Tipo: tipo,
      Nombre: ev.name,
      Matrícula: ev.employeeNoString
    });

    allResults.forEach(grupo => {
      const { unico, entrada, salida, adicionales } = clasificarEventosDelDia(grupo.eventos);

      if (unico) {
        pushRow(grupo.fecha, unico, "Único registro");
      } else {
        pushRow(grupo.fecha, entrada, "Entrada");
        pushRow(grupo.fecha, salida, "Salida");
        adicionales.forEach(ev => pushRow(grupo.fecha, ev, "Adicional"));
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 14 }, // Fecha
      { wch: 8 },  // Hora
      { wch: 16 }, // Tipo
      { wch: 28 }, // Nombre
      { wch: 14 }  // Matrícula
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia");

    const matricula = document.getElementById("matricula").value.trim();
    const dateString = new Date().toISOString().split("T")[0];
    const filename = matricula ? `Asistencia_${matricula}_${dateString}.xlsx` : `Asistencia_${dateString}.xlsx`;

    XLSX.writeFile(workbook, filename);

  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
});
