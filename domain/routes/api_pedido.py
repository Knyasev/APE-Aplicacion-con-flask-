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


