from flask import Flask, request, jsonify, render_template,redirect, url_for
from datetime import date, timedelta
from flask_cors import CORS
import json

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
CORS(app)

event_data = {}

@app.route("/")
def main():
    return render_template("index.html")

@app.route('/lectura', methods=['POST'])
def recibir_evento():
    raw_json = request.form.get('AccessControllerEvent')
    if raw_json:
        try:
            global event_data
            event_data = json.loads(raw_json)
            return jsonify({"status": "recibido"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    return jsonify({"error": "No se encontró el campo AccessControllerEvent"}), 400

@app.route('/lectura', methods=['GET'])
def mostrar_evento():
    if event_data:
        return jsonify(event_data)
    else:
        return jsonify({"mensaje": "No hay datos disponibles"}), 404

if __name__ == "__main__":
    app.run(debug=True)