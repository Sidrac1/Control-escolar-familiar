from flask import Flask, request, jsonify, render_template,redirect, url_for
from controladorbd import consultarAsistencia
from datetime import date, timedelta

def format_data(data):
    formatted_data = []
    for row in data:
        new_row = {}
        for key, value in row.items():
            if isinstance(value, date):
                new_row[key] = value.isoformat()
            elif isinstance(value, timedelta):
                total_seconds = int(value.total_seconds())
                hours, remainder = divmod(total_seconds, 3600)
                minutes, seconds = divmod(remainder, 60)
                new_row[key] = f"{hours:02}:{minutes:02}:{seconds:02}"
            else:
                new_row[key] = value
        formatted_data.append(new_row)
    return formatted_data


app = Flask(__name__)

@app.route("/")
def main():
    return render_template("index.html")

@app.route ("/post/formulary", methods=["POST", "GET"])
def sendRequest():
    try:
        req_json = request.get_json()
        matricula = req_json["matricula"]
        start_date = req_json["start_date"]
        end_date = req_json["end_date"]

        consult = consultarAsistencia(matricula,start_date,end_date)
        
        # Check if an error was returned from the database function
        if "error" in consult:
            return jsonify(consult), 400

        # Format the data before sending it
        formatted_consult = format_data(consult)
        
        return jsonify(formatted_consult)
    except Exception as e:
        return jsonify({"error":"Error al ingresar los datos al servidor","detalle:": str(e)}),400
    
app.run(port=3690, debug=True)