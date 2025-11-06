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

@app.route ('/lectura', methods=['POST'])
def recibir_eventos():
    try:
        data = request.json or request.form
        if 'AccessControllerEvent' in data:
            global event_data
            event_data = data['AccessControllerEvent']
            return jsonify({'status': 'evento recibido y almacenado'}),200
        return jsonify({"error":"no se encontró el campo AccessControllerEvent"}),400
    except Exception as e:
        return jsonify({"error": "Error al procesar la solicitud", "detalle":str(e)}),400

@app.route ('/lectura', methods=['GET'])
def mostrar_evento():
    if event_data:
        return jsonify(event_data)
    else:
        return jsonify({"mensaje": "No se han recibido datos"}),404
