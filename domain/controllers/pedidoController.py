from models.GestionPedido.pedido import Pedido
from models.GestionPedido.detallePedido import DetallePedido
from controllers.utils.errors import Error
import uuid
from app import db
class PedidoController:

    def listar(self):
       return Pedido.query.all()

    def listar_porSucursal(self, sucursal_id, usuario_id):
        return  Pedido.query.filter_by(sucursal_id=sucursal_id, usuario_id=usuario_id).all()
      

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


    def modificar_pedido(self, pedido_id, data):
        pedido = Pedido.query.get(pedido_id)
        if not pedido:
            raise Error("Pedido no encontrado")
        
        # Actualizar los campos del pedido
        pedido.fecha = data.get('fecha', pedido.fecha)
        pedido.estado = data.get('estado', pedido.estado)
        pedido.usuario_id = data.get('usuario_id', pedido.usuario_id)
        pedido.sucursal_id = data.get('sucursal_id', pedido.sucursal_id)
        
        db.session.commit()
        detalles = data.get('detalles', [])
        for detalle_data in detalles:
            detalle = DetallePedido.query.filter_by(pedido_id=pedido_id, producto_id=detalle_data.get('producto_id')).first()
            if detalle:
                detalle.cantidad_solicitada = detalle_data.get('cantidad_solicitada', detalle.cantidad_solicitada)
                detalle.cantidad_entregada = detalle_data.get('cantidad_entregada', detalle.cantidad_entregada)
            else:
                # Si el detalle no existe, crearlo
                nuevo_detalle = DetallePedido()
                nuevo_detalle.cantidad_solicitada = detalle_data.get('cantidad_solicitada')
                nuevo_detalle.cantidad_entregada = detalle_data.get('cantidad_entregada', 0)
                nuevo_detalle.pedido_id = pedido.id
                nuevo_detalle.producto_id = detalle_data.get('producto_id')
                nuevo_detalle.external_id = str(uuid.uuid4())
                db.session.add(nuevo_detalle)

        db.session.commit()
        return pedido.id


    def obtener_pedido(self, pedido_id):
        pedido = Pedido.query.get(pedido_id)
        if not pedido:
            raise Error("Pedido no encontrado")
        return pedido

    def cancelar_pedido(self, pedido_id):
        pedido = Pedido.query.get(pedido_id)
        if not pedido:
            raise Error("Pedido no encontrado")
        
        # Cambiar el estado del pedido a CANCELADO
        pedido.estado = EstadoPedido.CANCELADO
        db.session.commit()
        return pedido.id

    def eliminar_pedido(self, pedido_id):
        pedido = Pedido.query.get(pedido_id)
        if not pedido:
            raise Error("Pedido no encontrado")
        
        # Eliminar el pedido y sus detalles
        db.session.delete(pedido)
        db.session.commit()
        return pedido.id

    def buscar_external(self, external_id):
        pedido = Pedido.query.filter_by(external_id=external_id).first()
        if not pedido:
            raise Error("Pedido no encontrado")
        return pedido
    
    def get_detalles_pedido(self, pedido_id):
        pedido = Pedido.query.get(pedido_id)
        if not pedido:
            raise Error("Pedido no encontrado")
        
        detalles = DetallePedido.query.filter_by(pedido_id=pedido_id).all()
        return [detalle.serialize() for detalle in detalles]

    