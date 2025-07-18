from flask import Blueprint, jsonify, make_response, request
from controllers.sucursalController import SucursalController
api_sucursal = Blueprint('api_sucursal', __name__)

sucursalC = SucursalController()

@api_sucursal.route("/sucursal")
def listar_sucursales():
    return make_response(
        jsonify({"msg": "OK", "code": 200, "datos": ([i.serialize for i in sucursalC.listar()])}),
        200
    )

@api_sucursal.route("/sucursal/guardar", methods=["POST"])
def guardar_sucursal():
    data = request.get_json()
    id = sucursalC.registrar_sucursal(data)
    if id >= 0:
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Datos Guardados"}}),
            200
        )
    else:
        return make_response(
            jsonify({"msg": "ERROR", "code": 400, "datos": {"error": Error.error[str(id)]}}),
            400
        )

@api_sucursal.route("/sucursal/actualizar/<external_id>", methods=["POST"])
def actualizar_sucursal(external_id):
    data = request.get_json()
    try:
        id = sucursalC.actualizar_sucursal(external_id, data)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Datos Actualizados"}}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 500, "datos": {"error": str(e)}}),
            500
        )

@api_sucursal.route("/sucursal/desactivar/<external_id>", methods=["GET"])
def desactivar_sucursal(external_id):
    try:
        sucursal = sucursalC.desactivar_sucursal(external_id)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Sucursal Desactivada"}}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 404, "datos": {"error": str(e)}}),
            404
        )


@api_sucursal.route("/sucursal/activar/<external_id>", methods=["GET"])
def activar_sucursal(external_id):
    try:
        sucursal = sucursalC.activar_sucursal(external_id)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Sucursal Activada"}}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 404, "datos": {"error": str(e)}}),
            404
        )