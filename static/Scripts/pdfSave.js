import { fetchAllResults } from './result.js';

document.getElementById('test_button').addEventListener('click', async function() {
  const allResults = await fetchAllResults();
  const currDate = new Date();
  const dateString = currDate.toDateString();

  // crear un contenedor temporal con todos los resultados
  const tempContainer = document.createElement("div"); //creamos una division
  tempContainer.classList.add("pdf-container"); //contenedor dentro del DIV

  allResults.forEach(grupo => { //un foreach para cada resultado igual al que se hace en result.js... esto bien pudo ser una función pero ya no lo hice
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
    tempContainer.appendChild(div);
  });

  // aplicar estilos PDF
  document.body.appendChild(tempContainer); //insertamos el contenedor en el html2 para que se pueda capturar
  document.body.classList.add("pdf-mode"); //añadimos una clase para que pueda tomar los elementos de css que lo referencian

  html2canvas(tempContainer).then(canvas => { 
    const imgData = canvas.toDataURL('image/png'); //convierte el canvas en un PNG para insertalo en el PDF
    const pdf = new jspdf.jsPDF("p", "mm", "a4"); //crea un PDF tamaño a4, orientación vertical, unidades en milimetros.

    const pageWidth = pdf.internal.pageSize.getWidth(); //calculo de dimensiones
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth; //igualamos el ancho de la imagen al de la página
    const imgHeight = canvas.height * imgWidth / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const matricula = document.getElementById("matricula").value.trim();
    const filename = matricula ? `Consulta-Asistencia_${dateString}_${matricula}.pdf`: "ConsultaAsistencia.per"
    pdf.save(filename);
    document.body.classList.remove("pdf-mode");
    tempContainer.remove();
  });
});
