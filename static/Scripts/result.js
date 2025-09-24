export function renderResults(data) {
    const container = document.getElementById("results_container");
    container.innerHTML = ""; // Limpiar contenido previo

    if (data.error) {
        container.innerHTML = `<p class="error">⚠️ ${data.error}<br>${data["detalle:"]}</p>`;
        return;
    }

    if (Array.isArray(data) && data.length > 0) {
        data.forEach(result => {
            const card = document.createElement("div");
            card.classList.add("result-card");

            const list = document.createElement("ul");

            for (const key in result) {
                if (result.hasOwnProperty(key)) {
                    const listItem = document.createElement("li");
                    const labelSpan = document.createElement("span");
                    labelSpan.classList.add("card-label");
                    labelSpan.textContent = key.replace(/_/g, ' ') + ":"; // Reemplaza guiones bajos por espacios
                    
                    const valueSpan = document.createElement("span");
                    valueSpan.classList.add("card-value");
                    valueSpan.textContent = result[key];
                    
                    listItem.appendChild(labelSpan);
                    listItem.appendChild(valueSpan);
                    list.appendChild(listItem);
                }
            }
            card.appendChild(list);
            container.appendChild(card);
        });
    } else {
        container.innerHTML = `<p>No se encontraron registros para los filtros seleccionados.</p>`;
    }
}
