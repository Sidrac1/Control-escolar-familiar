from flask import Flask, request, jsonify, render_template,redirect, url_for
from flask_cors import CORS
import json
from flask_pymongo import PyMongo
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

#configure mongo URI
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
#Initialize PyMongo:
mongo = PyMongo(app)

if mongo.db is None:
    print("Error: No se pudo conectar a MongoDB.")
else:
    print("Conexión con Base de datos exitosa :D")


@app.route("/")
def main():
    return render_template("index.html")


@app.route('/lectura', methods=['POST'])
def recibir_evento():
    try:
        parsed_event = None

        # Detectar si viene como multipart/form-data
        if request.content_type.startswith("multipart/form-data"):
            raw_json = request.form.get("data")
            if raw_json:
                parsed_event = json.loads(raw_json)
            else:
                parsed_event = dict(request.form)
        else:
            parsed_event = request.get_json(force=True, silent=True)

        if not parsed_event:
            return jsonify({"message": "registro vacío"}), 400

        # Convertir AccessControllerEvent si viene como string
        evento_raw = parsed_event.get("AccessControllerEvent")
        if isinstance(evento_raw, str):
            evento = json.loads(evento_raw)
            parsed_event["AccessControllerEvent"] = evento
        elif isinstance(evento_raw, dict):
            evento = evento_raw
        else:
            return jsonify({"error": "AccessControllerEvent no tiene formato válido"}), 400

        # Acceder al subobjeto AccessControllerEvent
        evento_interno = evento.get("AccessControllerEvent")
        if not isinstance(evento_interno, dict):
            return jsonify({"error": "AccessControllerEvent interno no encontrado"}), 400

        # Extraer y convertir los tipos de evento
        try:
            major = int(evento_interno.get("majorEventType", -1))
            sub = int(evento_interno.get("subEventType", -1))
        except (ValueError, TypeError):
            major, sub = -1, -1

        # Insertar en la colección correspondiente
        if major == 5 and sub == 75:
            mongo.db.logsAcceso.insert_one(parsed_event)
            return jsonify({"message": "evento de acceso correcto"}), 200
        else:
            mongo.db.logsOtros.insert_one(parsed_event)
            return jsonify({"message": "evento recibido pero filtrado a otros eventos"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400




@app.route('/lectura', methods=['GET'])
def mostrar_evento():
    query = {
        "AccessControllerEvent.majorEventType": 5,
        "AccessControllerEvent.subEventType": 75
    }

    matricula = request.args.get("matricula") #este dato lo toma del JS que envía la matricula com URL parameter
    start = request.args.get("start")
    end = request.args.get("end")

    if matricula:
        query["AccessControllerEvent.employeeNoString"] = matricula

    if start or end:
        rango = {}
        if start:
            rango["$gte"] = start
        if end:
            rango["$lte"] = end
        query["dateTime"] = rango

    eventos = mongo.db.logsAcceso.find(query, {"_id": 0})
    resultados = []
    for e in eventos:
        ac = e.get("AccessControllerEvent", {})
        resultados.append({
            "dateTime": e.get("dateTime"),
            "name": ac.get("name"),
            "employeeNoString": ac.get("employeeNoString")
        })
    print("Consulta Mongo:", query)
    return jsonify(resultados), 200


if __name__ == "__main__":
    app.run(debug=True)