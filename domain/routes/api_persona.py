from flask import Blueprint, jsonify, make_response, request
# Importacion de los modelos de tablas de la base de datos
from controllers.personaController import PersonaController
from controllers.utils.errors import Error
from flask_expects_json import expects_json
from controllers.authenticate import token_required
api_persona = Blueprint('api_persona', __name__)

personaC= PersonaController()
schema_sesion = {
    "type": "object",
    'properties': {
        "username": {"type": "string"},
        "clave": {"type": "string"},
    },
    'required': ["username", "clave"]
}
schema = {
    'type': 'object',
    'properties': {
        'nombre': {'type': 'string'},
        'apellido': {'type': 'string'},
        'fecha_nacimiento': {'type': 'string'},
        'id_rol': {'type': 'integer'},
        
    },
    'required': ['nombre', 'apellido', 'fecha_nacimiento', 'id_rol']}

schema_usuario= {
    'type': 'object',
    'properties': {
        'nombre': {'type': 'string'},
        'apellido': {'type': 'string'},
        'username  ': {'type': 'string',
                   "pattern": "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"},
        'clave': {'type': 'string'},
    },
    'required': ['nombre', 'apellido', 'username', 'clave']
}
@api_persona.route("/persona")
@token_required
def listar():
    return make_response(
        jsonify({"msg": "OK", "code": 200, "datos": ([i.serialize for i in personaC.listar()])}),
        200
    )


    
@api_persona.route(("/persona/guardar/admin"), methods=["POST"])
@expects_json(schema_usuario)
def guardar_usuario():
    data = request.get_json()
    id = personaC.guardar_usuario(data)
    print(str(id))
    if (id >=0):
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag":"Datos Guardados"}}),
            200
        )
    else:
        return make_response(
           jsonify({"msg" : "ERROR", "code" : 400, "datos" :{"error" : Error.error[str(id)]}}), 
            400
        )

@api_persona.route(("/persona/guardar/bodeguero"), methods=["POST"])
@expects_json(schema_usuario)
def guardar_usuario_bodeguero():
    data = request.get_json()
    id = personaC.guardar_usuario_bodeguero(data)
    print(str(id))
    if (id >=0):
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag":"Datos Guardados"}}),
            200
        )
    else:
        return make_response(
           jsonify({"msg" : "ERROR", "code" : 400, "datos" :{"error" : Error.error[str(id)]}}), 
            400
        )

@api_persona.route(("/persona/guardar/personal"), methods=["POST"])
@expects_json(schema_usuario)
def guardar_usuario_personal():
    data = request.get_json()
    id = personaC.guardar_usuario_personal(data)
    print(str(id))
    if (id >=0):
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag":"Datos Guardados"}}),
            200
        )
    else:
        return make_response(
           jsonify({"msg" : "ERROR", "code" : 400, "datos" :{"error" : Error.error[str(id)]}}), 
            400
        )
            
    
@api_persona.route('/modificar_cuenta/<external_id>', methods=['POST'])
def modificar_cuenta_api(external_id):
    data = request.json
    result = personaC.modificar_cuenta(data,external_id)
    
    if result == -1:
        return jsonify({"error": "Role not found"}), 404
    elif result == -2:
        return jsonify({"error": "Account already exists"}), 409
    else:
        return jsonify({"msg": "OK", "code": 200, "datos": {"tag":"Datos Guardados"}}), 200
    

@api_persona.route("/persona/<external>")
def buscar_external(external):
    search = personaC.buscar_external(external)
    if search is not None:
        search = search.serialize
    return make_response(
        jsonify({"msg": "OK", "code": 200, "datos": [] if search is None else search}),
        200
    )


# Ruta para modificar un censo
@api_persona.route("/persona/<external_id>", methods=['POST'])
def modificar(external_id):
    data = request.get_json()  # Obtiene los datos del cuerpo de la solicitud HTTP
    if data is None:
        return make_response(jsonify({"msg": "Bad Request", "code": 400}), 400)

    persona = personaC.modificar(external_id, data)
    if persona is None:
        return make_response(jsonify({"msg": "Not Found", "code": 404}), 404)

    search = persona.serialize()
    return make_response(jsonify({"msg": "OK", "code": 200, "datos": search}), 200)


@api_persona.route("/persona/<external_id>", methods=['POST'])
def api_modificar_censador(external_id):
    data = request.get_json()  # Obtiene los datos del cuerpo de la solicitud HTTP
    if data is None:
        return make_response(jsonify({"msg" : "ERROR", "code" : 400, "datos" :{"error" : Error.error[str(id)]}}), 
            400
        )

    persona = personaC.modificar_censador(external_id, data)
    search = persona.serialize()

    if persona is None or persona == -1:
        return make_response(jsonify({"msg" : "ERROR", "code" : 400, "datos" :{"error" : Error.error[str(id)]}}), 
            400
        )
    return make_response(jsonify({"msg": "OK", "code": 200, "datos": search}), 200)


@api_persona.route("/persona/<external_id>/desactivar", methods=['GET'])
def desactivar(external_id):
    persona = personaC.desactivar(external_id)
    if persona is None or persona == -1:
        return make_response(jsonify({"msg" : "ERROR", "code" : 400, "datos" :{"error" : "Error desconocido"}}), 
        400
    )
    persona = personaC.buscar_external(external_id)
    search = persona.serialize()
    return make_response(jsonify({"msg": "OK", "code": 200, "datos": search}), 200)



# API para iniciar sesion
@api_persona.route("/sesion", methods=['POST'])
@expects_json(schema_sesion)
def session():
    data = request.json
    print("los datos son: " + str(data))
    id = personaC.inicio_sesion(data)
    print("el id es: "+ str(id))

    if type(id) == int:
        return make_response(
            jsonify({"msg" : "ERROR", "code" : 400, "datos" :{"error" : Error.error[str(id)]}}), 
            400
        )
    else:
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": id}),
            200
        )