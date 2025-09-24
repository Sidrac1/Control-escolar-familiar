export function validData(){
    let isValid = true;

    document.querySelectorAll(".error-message").forEach(el => el.remove());
    document.querySelectorAll(".form_field").forEach(el => el.classList.remove("error-border"));

    const data = [
        {
            inputElement: document.getElementById("matricula"),
            message: "Es necesaria la matrícula para consultar"
        },
        {
            inputElement: document.getElementById("start_date"),
            message: "Por favor introduzca la fecha de inicio de su consulta"
        },
        {
            inputElement: document.getElementById("end_date"),
            message: "Por favor introduzca la fecha de fin para su consulta"
        }
    ];

    data.forEach(field =>{
        const input = field.inputElement;
        const message = field.message

        if (input.value.trim() === ""){
            const errorMessage = document.createElement("p");
            errorMessage.textContent = message;
            errorMessage.classList.add("error-message");
        
            const errorContainer = input.parentElement.querySelector(".error-container")
            if(errorContainer){
                errorContainer.appendChild(errorMessage);
            }
            input.classList.add("error-border");

            isValid = false;
        }
    });
    return isValid;
}