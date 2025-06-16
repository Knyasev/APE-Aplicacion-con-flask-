from flask import Blueprint, jsonify, make_response, request
# Importacion de los modelos de tablas de la base de datos
from controllers.rolController import RolController
api_rol = Blueprint('api_rol', __name__)


rol = RolController()

@api_rol.route('/rol', methods=["GET"])
def listarRol():
    return make_response(
        jsonify({"msg":"OK", "code":200, "data":([i.serialize() for i in rol.listarRol()])}),
        200
    )


@api_rol.route('/rol/guardar', methods=["POST"])
def save():
    data = request.json
    rol_id = rol.save(data)
    return make_response(
        jsonify({"msg":"OK", "code":200, "data": rol_id}),
        200
    )       
