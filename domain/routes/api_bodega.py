from flask import Blueprint, jsonify, make_response, request
from controllers.bodegaController import BodegaController
api_bodega = Blueprint('api_bodega', __name__)
from controllers.authenticate import token_required
bodegaC = BodegaController()

@api_bodega.route("/bodega")
def listar_bodegas():
    return make_response(
        jsonify({"msg": "OK", "code": 200, "datos": ([i.serialize for i in bodegaC.listar_bodegas()])}),
        200
    )
    
@token_required
@api_bodega.route("/bodega/guardar", methods=["POST"])
def guardar_bodega():
    data = request.get_json()
    id = bodegaC.registrar_bodega(data)
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


@api_bodega.route("/bodega/actualizar/<external_id>", methods=["POST"])
def actualizar_bodega(external_id):
    data = request.get_json()
    try:
        id = bodegaC.actualizar_bodega(external_id, data)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Datos Actualizados"}}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 500, "datos": {"error": str(e)}}),
            500
        )

@api_bodega.route("/bodega/desactivar/<external_id>", methods=["GET"])
def desactivar_bodega(external_id):
    try:
        bodega = bodegaC.desactivar_bodega(external_id)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Bodega Desactivada"}}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 404, "datos": {"error": str(e)}}),
            404
        )
@api_bodega.route("/bodega/activar/<external_id>", methods=["GET"])
def activar_bodega(external_id):
    try:
        bodega = bodegaC.activar_bodega(external_id)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Bodega Activada"}}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 404, "datos": {"error": str(e)}}),
            404
        )


@api_bodega.route("/bodega/<external_id>", methods=["GET"])
def get_bodega(external_id):
    bodega = bodegaC.buscar_bodega(external_id)
    if bodega:
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": bodega.serialize}),
            200
        )
    else:
        return make_response(
            jsonify({"msg": "ERROR", "code": 404, "datos": {"error": "Bodega no encontrada"}}),
            404
        )

@api_bodega.route("/bodega/nombre/<bodega_id>", methods=["GET"])
def get_bodega_by_id(bodega_id):
    bodega = bodegaC.obtener_bodega_por_id(bodega_id)
    if bodega:
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": bodega.serialize}),
            200
        )
    else:
        return make_response(
            jsonify({"msg": "ERROR", "code": 404, "datos": {"error": "Bodega no encontrada"}}),
            404
        )