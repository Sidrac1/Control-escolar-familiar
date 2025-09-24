import { validData } from "./validateForm.js";
import { renderResults } from "./result.js";


document.getElementById("attendance_form").addEventListener("submit",async (e)=>{ //seleccionamos el elemento form
    e.preventDefault(); //evitamos el envío normal del formulario

    if(!validData()){
        return; //detener la ejecución de envio del formulario
    }
    //construcción del objeto que guarda la información del formulario
    const data ={
        matricula: e.target.matricula.value,
        start_date: e.target.start_date.value,
        end_date: e.target.end_date.value
    };
    //método que envía la información a Flask
    const res = await fetch("/post/formulary",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data) //convertimos el objeto data a json para enviarlo
    });
    const result = await res.json(); //esperamos respuesta del servidor
    console.log(result); //validar el envío del formulario en consola
    renderResults(result)
});
