from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

event_data = []

@app.route("/")
def main():
    return render_template("index.html")

@app.route('/lectura', methods=['POST'])
def recibir_eventos():
    try:
        raw_event = request.form.get("event_log")
        if raw_event:
            parsed_event = json.loads(raw_event.encode().decode("utf-8-sig"))
            evento = parsed_event.get("AccessControllerEvent", {})
            if (
                parsed_event.get("eventType") == "AccessControllerEvent" and
                evento.get("majorEventType") == 5 and
                evento.get("subEventType") == 75
            ):
                event_data.append({
                    "dateTime": parsed_event.get("dateTime"),
                    "name": evento.get("name"),
                    "employeeNoString": evento.get("employeeNoString")
                })
                return jsonify({'status': 'evento filtrado y almacenado'}), 200
            return jsonify({'status': 'evento ignorado por no cumplir criterios'}), 200
        return jsonify({"error": "No se recibió el campo event_log"}), 400
    except Exception as e:
        return jsonify({"error": "Error al procesar la solicitud", "detalle": str(e)}), 400

@app.route('/lectura', methods=['GET'])
def mostrar_eventos():
    return jsonify(event_data if event_data else {"mensaje": "No se han recibido datos"}), 200

if __name__ == "__main__":
    app.run(debug=True)