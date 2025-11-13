from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Almacena todos los eventos recibidos
todos_los_eventos = []

@app.route("/")
def main():
    return render_template("index.html")

@app.route('/lectura', methods=['POST'])
def recibir_eventos():
    try:
        raw_event = request.form.get("event_log")
        if raw_event:
            parsed_event = json.loads(raw_event.encode().decode("utf-8-sig"))
            todos_los_eventos.append(parsed_event)
            return jsonify({'status': 'evento recibido'}), 200
        return jsonify({"error": "No se recibió el campo event_log"}), 400
    except Exception as e:
        return jsonify({"error": "Error al procesar la solicitud", "detalle": str(e)}), 400

@app.route('/lectura', methods=['GET'])
def mostrar_eventos_filtrados():
    filtrados = []
    for evento in todos_los_eventos:
        e = evento.get("AccessControllerEvent", {})
        if evento.get("eventType") == "AccessControllerEvent" and e.get("majorEventType") == 5 and e.get("subEventType") == 75:
            filtrados.append({
                "dateTime": evento.get("dateTime"),
                "name": e.get("name"),
                "employeeNoString": e.get("employeeNoString")
            })
    return jsonify(filtrados if filtrados else {"mensaje": "No hay eventos filtrados"}), 200

if __name__ == "__main__":
    app.run(debug=True)