import { fetchAllResults, clasificarEventosDelDia } from './result.js';

function imageToDataURL(imgElement) {
  const canvas = document.createElement("canvas");
  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgElement, 0, 0);
  return canvas.toDataURL("image/png");
}

function formatHora(dateTimeISO) {
  return dateTimeISO.split("T")[1].split(":").slice(0, 2).join(":");
}

function formatFechaCorta(fechaYMD) {
  return new Date(`${fechaYMD}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

document.getElementById('download_pdf_button').addEventListener('click', async function () {
  const btn = this;
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Generando…";

  try {
    const allResults = await fetchAllResults();

    if (!allResults.length) {
      return;
    }

    const matricula = document.getElementById("matricula").value.trim();
    const start_date = document.getElementById("start_date").value;
    const end_date = document.getElementById("end_date").value;

    const rows = [];
    let totalEntradas = 0, totalSalidas = 0, totalAdicionales = 0, totalUnicos = 0;

    allResults.forEach(grupo => {
      const { unico, entrada, salida, adicionales } = clasificarEventosDelDia(grupo.eventos);
      const fechaFmt = formatFechaCorta(grupo.fecha);

      if (unico) {
        rows.push([fechaFmt, formatHora(unico.dateTime), "Único registro", unico.name, unico.employeeNoString]);
        totalUnicos++;
      } else {
        rows.push([fechaFmt, formatHora(entrada.dateTime), "Entrada", entrada.name, entrada.employeeNoString]);
        rows.push([fechaFmt, formatHora(salida.dateTime), "Salida", salida.name, salida.employeeNoString]);
        totalEntradas++;
        totalSalidas++;
        adicionales.forEach(ev => {
          rows.push([fechaFmt, formatHora(ev.dateTime), "Adicional", ev.name, ev.employeeNoString]);
          totalAdicionales++;
        });
      }
    });

    const pdf = new jspdf.jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Encabezado con logos institucionales (si se pueden leer del DOM)
    try {
      const logo1 = document.getElementById("logo1");
      const logo2 = document.getElementById("logo2");
      pdf.addImage(imageToDataURL(logo1), "PNG", 14, 8, 38, 8);
      pdf.addImage(imageToDataURL(logo2), "PNG", pageWidth - 14 - 16, 7, 16, 9);
    } catch (e) {
      // si los logos no están disponibles por CORS u otro motivo, se continúa sin ellos
    }

    pdf.setTextColor(30, 91, 79);
    pdf.setFontSize(16);
    pdf.setFont(undefined, "bold");
    pdf.text("Reporte de Asistencia Escolar", pageWidth / 2, 24, { align: "center" });

    pdf.setFont(undefined, "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(90, 90, 90);
    const filtroTexto = [
      matricula ? `Matrícula: ${matricula}` : "Todas las matrículas",
      (start_date || end_date) ? `Periodo: ${start_date || "…"} a ${end_date || "…"}` : "Periodo: todos los registros"
    ].join("   |   ");
    pdf.text(filtroTexto, pageWidth / 2, 30, { align: "center" });

    pdf.setFontSize(8);
    pdf.text(`Generado el ${new Date().toLocaleString("es-MX")}`, pageWidth / 2, 35, { align: "center" });

    pdf.autoTable({
      startY: 40,
      head: [["Fecha", "Hora", "Tipo", "Nombre", "Matrícula"]],
      body: rows,
      styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 91, 79], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 242, 232] },
      columnStyles: { 2: { fontStyle: "bold" } },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 2) {
          const valor = data.cell.raw;
          if (valor === "Entrada") data.cell.styles.textColor = [30, 91, 79];
          else if (valor === "Salida") data.cell.styles.textColor = [47, 111, 167];
          else if (valor === "Adicional" || valor === "Único registro") data.cell.styles.textColor = [179, 120, 28];
        }
      }
    });

    // Pie de página con numeración, agregado tras conocer el total de páginas
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }

    // Resumen al final de la última página
    pdf.setPage(totalPages);
    const finalY = pdf.lastAutoTable.finalY + 8;
    pdf.setFontSize(9);
    pdf.setTextColor(60, 60, 60);
    pdf.text(
      `Resumen: ${totalEntradas} entrada(s)  ·  ${totalSalidas} salida(s)  ·  ${totalAdicionales} registro(s) adicional(es)  ·  ${totalUnicos} registro(s) único(s)`,
      14,
      finalY
    );

    const dateString = new Date().toISOString().split("T")[0];
    const filename = matricula ? `Asistencia_${matricula}_${dateString}.pdf` : `Asistencia_${dateString}.pdf`;
    pdf.save(filename);

  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
});
