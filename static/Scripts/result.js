// Toda esta función es para llamar a la información desde el servidor y ponerla en la web
async function cargarDatos() {
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