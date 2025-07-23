from models.GestionInventario.inventario import Inventario
from controllers.inventarioController import InventarioController
from flask import Blueprint, jsonify, make_response, request
from controllers.authenticate import token_required
api_inventario = Blueprint('api_inventario', __name__)
inventarioC = InventarioController()


@api_inventario.route('/inventario/entrada', methods=['POST'])
@token_required()
def registrar_entrada():
    data = request.get_json()
    try:
        Inventario.registrar_entrada(
            producto_id=data['producto_id'],
            cantidad=data['cantidad'],
            precio_unitario=data['precio_unitario'],
            bodega_id=data['bodega_id'],
            numero_comprobante=data.get('numero_comprobante'),
            tipo_comprobante=data.get('tipo_comprobante'),
            proveedor=data.get('proveedor')
        )
        return jsonify({"msg": "Entrada registrada correctamente", "code": 200}), 200
    except Exception as e:
        return jsonify({"msg": "ERROR", "code": 500, "error": str(e)}), 500


@api_inventario.route('/inventario/salida', methods=['POST'])
def registrar_salida():
    data = request.get_json()
    try:
        Inventario.registrar_salida(
            producto_id=data['producto_id'],
            cantidad=data['cantidad'],
            sucursal_id=data['sucursal_id'],
            bodega_id=data.get('bodega_id', None)  # bodega_id is optional
        )
        return jsonify({"msg": "Salida registrada correctamente", "code": 200}), 200
    except Exception as e:
        return jsonify({"msg": "ERROR", "code": 500, "error": str(e)}), 500

@api_inventario.route('/inventario')
def listar_Movimiento():
    try:
        movimientos = inventarioC.listar_Movimiento()
        datos = [i.serialize() for i in movimientos]  
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": datos}),
            200
        )
    except Exception as e:
        return jsonify({"msg": "ERROR", "code": 500, "error": str(e)}), 500


@api_inventario.route('/inventario/producto/<producto_id>')
def listar_Movimiento_producto(producto_id):
    try:
        movimientos = inventarioC.listar_Movimiento_producto(producto_id)
        datos = [i.serialize() for i in movimientos]
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": datos}),
            200
        )
    except Exception as e:
        return jsonify({"msg": "ERROR", "code": 500, "error": str(e)}), 500 


@api_inventario.route('/inventario/producto/<producto_id>/fecha', methods=['GET'])
def listar_Movimiento_producto_por_fecha(producto_id):
    try:
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')

        movimientos = inventarioC.listar_Movimiento_producto_por_fecha(producto_id, fecha_inicio, fecha_fin)
        datos = [i.serialize() for i in movimientos]
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": datos}),
            200
        )
    except Exception as e:
        return jsonify({"msg": "ERROR", "code": 500, "error": str(e)}), 500


@api_inventario.route('/inventario/fecha', methods=['GET'])
def listar_Movimiento_por_fecha():
    try:
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')

        movimientos = inventarioC.listar_Movimiento_por_fecha(fecha_inicio, fecha_fin)
        datos = [i.serialize() for i in movimientos]
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": datos}),
            200
        )
    except Exception as e:
        return jsonify({"msg": "ERROR", "code": 500, "error": str(e)}), 500



@api_inventario.route('/inventario/stock/<int:producto_id>', methods=['GET'])
def listar_stock_producto(producto_id):
    try:
        stock = inventarioC.listar_stock_producto(producto_id)
        if stock is not None:
            return jsonify({"msg": "OK", "code": 200, "datos": {"stock": stock}}), 200
        else:
            return jsonify({"msg": "ERROR", "code": 404, "error": "Producto no encontrado"}), 404
    except Exception as e:
        return jsonify({"msg": "ERROR", "code": 500, "error": str(e)}), 500
        

@api_inventario.route('/inventario/tipos_documento', methods=['GET'])
def listar_tipos_comprobante():
    try:
        tipos_comprobante = inventarioC.listar_tipos_comprobante()
        return make_response(
            jsonify({"msg": "OK", "code": 200, "datos": tipos_comprobante}),
            200
        )
    except Exception as e:
        return jsonify({"msg": "ERROR", "code": 500, "error": str(e)}), 500


