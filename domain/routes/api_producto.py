from flask import Blueprint, jsonify, make_response, request
from controllers.productoController import ProductoController
api_producto = Blueprint('api_producto', __name__)
from controllers.authenticate import token_required
productoC = ProductoController()

@api_producto.route("/producto", methods=["GET"])
def listar_productos():
    return make_response(
        jsonify({"msg": "OK", "code": 200, "datos": ([i.serialize for i in productoC.listar_productos()])}),
        200
    )


@api_producto.route("/producto/guardar",methods=["POST"])
def registrar_salida_producto():
    data = request.get_json()
    producto = productoC.registrar_salida_producto(data)
    if producto >= 0:
            return make_response(
                jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Datos Guardados"}}),
                200
        )
    else:
        return make_response(
            jsonify({"msg": "ERROR", "code": 400, "datos": {"error": Error.error[str(producto)]}}),
            400
        )


@api_producto.route("/producto/actualizar/<external_id>", methods=["POST"])
def actualizar_producto(external_id):
    data = request.get_json()
    try:
        id = productoC.actualizar_producto(external_id, data)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Datos Actualizados"}}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 500, "datos": {"error": str(e)}}),
            500
        )

@api_producto.route("/producto/<external_id>", methods=["GET"])
def buscar_producto(external_id):
    producto = productoC.buscar_producto(external_id)
    if producto:
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": producto.serialize}),
            200
        )
    else:
        return make_response(
            jsonify({"msg": "ERROR", "code": 404, "datos": {"error": "Producto no encontrado"}}),
            404
        )

@api_producto.route("/producto/categoria/<categoria_id>", methods=["GET"])
def obtener_categoria_id(categoria_id):
    try:
        categoria = productoC.obtener_categoria_id(categoria_id)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": categoria.serialize}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 500, "datos": {"error": str(e)}}),
            500
        )

@api_producto.route("/categoria/guardar", methods=["POST"])
def registrar_categoria():
    data = request.get_json()
    id = productoC.registar_categoria(data)
    if id >= 0:
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Categoria Guardada"}}),
            200
        )
    else:
        return make_response(
            jsonify({"msg": "ERROR", "code": 400, "datos": {"error": "Error al guardar la categoria"}}),
            400
        )

@api_producto.route("/categoria")
def obtener_categoria():
    return make_response(
        jsonify({"msg": "OK", "code": 200, "datos": ([i.serialize for i in productoC.obtener_categoria()])}),
        200
    )


@api_producto.route("/categoria/<external_id>", methods=["GET"])
def buscar_categoria(external_id):
    categoria = productoC.buscar_categoria(external_id)
    if categoria:
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": categoria.serialize}),
            200
        )
    else:
        return make_response(
            jsonify({"msg": "ERROR", "code": 404, "datos": {"error": "Categoria no encontrada"}}),
            404
        )

@api_producto.route("/categoria/actualizar/<external_id>", methods=["POST"])
def actualizar_categoria(external_id):
    data = request.get_json()
    try:
        id = productoC.actualizar_categoria(external_id, data)
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": {"tag": "Categoria Actualizada"}}),
            200
        )
    except Exception as e:
        return make_response(
            jsonify({"msg": "ERROR", "code": 500, "datos": {"error": str(e)}}),
            500
        )




@api_producto.route("/producto/nombre/<producto_id>", methods=["GET"])
def obtener_nombre_producto(producto_id):
    try:
        nombre_producto = productoC.obtener_nombre_producto(producto_id)
        return jsonify({"msg": "OK", "code": 200, "nombre": nombre_producto}), 200
    except Exception as e:
        return jsonify({"msg": "ERROR", "code": 500, "error": str(e)}), 500