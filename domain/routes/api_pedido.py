from flask import Blueprint, jsonify, make_response, request
from controllers.pedidoController import PedidoController
api_pedido = Blueprint('api_pedido', __name__)

pedidoC = PedidoController()

@api_pedido.route("/pedido")
def listar_pedidos():
    return make_response(
        jsonify({"msg": "OK", "code": 200, "datos": ([i.serialize for i in pedidoC.listar()])}),
        200
    )

@api_pedido.route("/pedido/guardar", methods=["POST"])
def guardar_pedido():
    data = request.get_json()
    id = pedidoC.registrar_pedido(data)
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

@api_pedido.route('/pedido/sucursal/<sucursal_id>/usuario/<usuario_id>', methods=['GET'])
def listar_porSucursal(sucursal_id, usuario_id):

    id = pedidoC.listar_porSucursal(sucursal_id, usuario_id)
    if id:
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": ([i.serialize for i in id])}),
            200
        )
    else:
        return make_response(
            jsonify({"msg": "ERROR", "code": 400, "datos": {"error": "No se encontraron pedidos"}}),
            400
        )

@api_pedido.route("/pedido/modificar/<external_id>", methods=["POST"])
def modificar_pedido(external_id):
    data = request.get_json()
    try:
        pedido_id = pedidoC.modificar_pedido(external_id, data)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Pedido Modificado"}}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 400, "datos": {"error": str(e)}}),
            400
        )

@api_pedido.route("/pedido/eliminar/<external_id>", methods=["DELETE"])
def eliminar_pedido(external_id):
    try:
        pedidoC.eliminar_pedido(external_id)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Pedido Eliminado"}}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 400, "datos": {"error": str(e)}}),
            400
        )

@api_pedido.route("/pedido/<external_id>", methods=["GET"])
def obtener_pedido(external_id):
    try:
        pedido = pedidoC.buscar_external(external_id)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": pedido.serialize}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 400, "datos": {"error": str(e)}}),
            400
        )


@api_pedido.route("/pedido/detalle/<pedido_id>", methods=["GET"])
def obtener_detalle_pedido(pedido_id):
    try:
        detalles = pedidoC.get_detalles_pedido(pedido_id)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": detalles}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 400, "datos": {"error": str(e)}}),
            400
        )


@api_pedido.route("/pedido/cancelar/<external_id>", methods=["GET"])
def cancelar_pedido(external_id):
    try:
        pedido_id = pedidoC.cancelar_pedido(external_id)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Pedido Cancelado"}}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 400, "datos": {"error": str(e)}}),
            400
        )

@api_pedido.route("/pedido/entregado/<external_id>", methods=["GET"])
def cambiar_estado_entregado(external_id):
    try:
        pedido_id = pedidoC.cambiar_estado_entregado(external_id)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Pedido Entregado"}}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 400, "datos": {"error": str(e)}}),
            400
        )