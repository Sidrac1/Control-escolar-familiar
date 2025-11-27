from flask import Flask, request, jsonify, render_template,redirect, url_for
from flask_cors import CORS
import json
from flask_pymongo import PyMongo
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
from collections import defaultdict


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
            parsed_event = json.loads(raw_json) if raw_json else dict(request.form)
        else:
            parsed_event = request.get_json(force=True, silent=True)

        if not parsed_event:
            return jsonify({"message": "registro vacío"}), 400

        # Intentar extraer AccessControllerEvent
        evento_raw = parsed_event.get("AccessControllerEvent")
        if isinstance(evento_raw, str):
            try:
                evento = json.loads(evento_raw)
                parsed_event["AccessControllerEvent"] = evento
            except Exception:
                mongo.db.logsOtros.insert_one(parsed_event)
                return jsonify({"message": "evento recibido sin formato válido"}), 200
        elif isinstance(evento_raw, dict):
            evento = evento_raw
        else:
            mongo.db.logsOtros.insert_one(parsed_event)
            return jsonify({"message": "evento recibido sin AccessControllerEvent válido"}), 200

        # Intentar acceder al subobjeto interno
        evento_interno = evento.get("AccessControllerEvent")
        if not isinstance(evento_interno, dict):
            mongo.db.logsOtros.insert_one(parsed_event)
            return jsonify({"message": "evento recibido sin AccessControllerEvent interno"}), 200

        # Verificar fecha
        fecha_evento = evento.get("dateTime")
        if not fecha_evento:
            mongo.db.logsOtros.insert_one(parsed_event)
            return jsonify({"message": "evento recibido sin fecha"}), 200

        try:
            fecha_evento_dt = datetime.fromisoformat(fecha_evento.replace("Z", "+00:00"))
        except Exception:
            mongo.db.logsOtros.insert_one(parsed_event)
            return jsonify({"message": "evento recibido con fecha inválida"}), 200

        hace_seis_meses = datetime.now(tz=fecha_evento_dt.tzinfo) - timedelta(days=180)
        if fecha_evento_dt < hace_seis_meses:
            mongo.db.logsOtros.insert_one(parsed_event)
            return jsonify({"message": "evento descartado por antigüedad"}), 200

        # Verificar tipo de evento
        try:
            major = int(evento_interno.get("majorEventType", -1))
            sub = int(evento_interno.get("subEventType", -1))
        except (ValueError, TypeError):
            mongo.db.logsOtros.insert_one(parsed_event)
            return jsonify({"message": "evento recibido con tipo inválido"}), 200

        # Clasificar evento
        if major == 5 and sub == 75:
            mongo.db.logsAcceso.insert_one(parsed_event)
            return jsonify({"message": "evento de acceso correcto"}), 200
        else:
            mongo.db.logsOtros.insert_one(parsed_event)
            return jsonify({"message": "evento recibido pero filtrado a otros eventos"}), 200

    except Exception as e:
        # En caso de error inesperado, guardar en logsOtros
        try:
            mongo.db.logsOtros.insert_one(parsed_event or {"error": str(e)})
        except:
            pass
        return jsonify({"error": str(e)}), 400


@app.route('/lectura', methods=['GET'])
def mostrar_evento():
    query = {
        "AccessControllerEvent.AccessControllerEvent": {"$exists": True}
    }

    matricula = request.args.get("matricula")
    start = request.args.get("start")
    end = request.args.get("end")
    limit = int(request.args.get("limit", 10000))
    skip = int(request.args.get("skip", 0))

    # Convertir fechas
    start_date = datetime.strptime(start, "%Y-%m-%d").date() if start else None
    end_date = datetime.strptime(end, "%Y-%m-%d").date() if end else None

    if matricula:
        query["AccessControllerEvent.AccessControllerEvent.employeeNoString"] = matricula

    if start_date or end_date:
        rango = {}
        if start_date:
            rango["$gte"] = start_date.isoformat()
        if end_date:
            rango["$lte"] = end_date.isoformat()
        query["AccessControllerEvent.dateTime"] = rango

    projection = {
        "_id": 0,
        "AccessControllerEvent.dateTime": 1,
        "AccessControllerEvent.AccessControllerEvent.name": 1,
        "AccessControllerEvent.AccessControllerEvent.employeeNoString": 1
    }

    #conteo de documentos que se encontraron con el query:
    total= mongo.db.logsAcceso.count_documents(query)

    #paginación
    eventos = mongo.db.logsAcceso.find(query, projection).skip(skip).limit(limit)
    agrupados = defaultdict(list)

    for e in eventos:
        externo = e.get("AccessControllerEvent", {})
        interno = externo.get("AccessControllerEvent")
        if not isinstance(interno, dict):
            continue

        fecha_completa = externo.get("dateTime")
        try:
            fecha_dt = datetime.fromisoformat(fecha_completa.replace("Z", "+00:00"))
        except Exception:
            continue

        fecha_sola = fecha_dt.date()
        agrupados[str(fecha_sola)].append({
            "dateTime": fecha_completa,
            "name": interno.get("name"),
            "employeeNoString": interno.get("employeeNoString")
        })

    resultados = [
        {
            "fecha": fecha,
            "eventos": sorted(eventos, key=lambda ev: ev["dateTime"])
        }
        for fecha, eventos in sorted(agrupados.items())
    ]

    return jsonify({
        "data": resultados,
        "total": total
    }), 200

if __name__ == "__main__":
    app.run(debug=True)