from models.GestionPedido.pedido import Pedido
from models.GestionPedido.detallePedido import DetallePedido
from controllers.utils.errors import Error
import uuid
from app import db
class PedidoController:

    def listar(self):
       return Pedido.query.all()

    def listar_porSucursal(self, sucursal_id, usuario_id):
        pedidos = Pedido.query.filter_by(sucursal_id=sucursal_id, usuario_id=usuario_id).all()
        if not pedidos:
            raise Error("No se encontraron pedidos para la sucursal y usuario especificados")
        return [pedido.serialize() for pedido in pedidos]

    def registrar_pedido(self, data):
        # Crear el pedido
        pedido = Pedido()
        pedido.fecha = data.get('fecha')
        pedido.estado = data.get('estado')
        pedido.usuario_id = data.get('usuario_id')
        pedido.sucursal_id = data.get('sucursal_id')
        pedido.external_id = str(uuid.uuid4())
        db.session.add(pedido)
        db.session.commit()
    
        # Crear los detalles del pedido
        detalles = data.get('detalles', [])
        for detalle_data in detalles:
            detalle = DetallePedido()
            detalle.cantidad_solicitada = detalle_data.get('cantidad_solicitada')
            detalle.cantidad_entregada = detalle_data.get('cantidad_entregada', 0)
            detalle.pedido_id = pedido.id
            detalle.producto_id = detalle_data.get('producto_id')
            detalle.external_id = str(uuid.uuid4())
            db.session.add(detalle)
    
        db.session.commit()
        return pedido.id

    def obtener_pedido(self, pedido_id):
        pedido = Pedido.query.get(pedido_id)
        if not pedido:
            raise Error("Pedido no encontrado")
        return pedido

