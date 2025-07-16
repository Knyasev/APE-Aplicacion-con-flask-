from app import create_app
from jsonschema import ValidationError
from flask import jsonify, make_response, request
from flask_cors import CORS

app = create_app()

# Configurar CORS para permitir solicitudes desde cualquier origen temporalmente
CORS(app, supports_credentials=True)

# Método para depurar encabezados y manejar solicitudes OPTIONS
@app.after_request
def after_request_func(response):
    origin = request.headers.get('Origin')
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', origin if origin else '*')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Access-Tokens, x-csrf-token')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    else:
        response.headers.add('Access-Control-Allow-Origin', origin if origin else '*')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.errorhandler(400)
def bad_request(error):
    if isinstance(error.description, ValidationError):
        return make_response(
            jsonify({"msg": "Error", "code": 400, "datos": {str(error.description.message): "error"}}),
            400
        )
    return make_response(
        jsonify({"msg": "Error", "code": 400, "datos": {"error": "Solicitud incorrecta"}}),
        400
    )

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")