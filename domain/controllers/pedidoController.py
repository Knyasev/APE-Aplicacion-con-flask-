from models.GestionPedido.pedido import Pedido
from models.GestionPedido.detallePedido import DetallePedido
from controllers.utils.errors import Error
from models.GestionPedido.Enums.EstadoPedido import EstadoPedido
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
        pedido.precio_total=data.get('precio_total')
        pedido.metodo_de_pago = data.get('metodo_de_pago')
        # Generar un UUID único para el pedido
        pedido.external_id = str(uuid.uuid4())
        db.session.add(pedido)
        db.session.commit()
    
        # Crear los detalles del pedido
        detalles = data.get('detalles', [])
        for detalle_data in detalles:
            detalle = DetallePedido()
            detalle.cantidad = detalle_data.get('cantidad')
            detalle.pedido_id = pedido.id
            detalle.producto_id = detalle_data.get('producto_id')
            detalle.subtotal = detalle_data.get('subtotal')
            detalle.external_id = str(uuid.uuid4())
            db.session.add(detalle)
        db.session.commit()
        return pedido.id



    def modificar_pedido(self, external_id, data):
        pedido = self.buscar_external(external_id)
        if not pedido:
            raise Error("Pedido no encontrado")
        
        # Actualizar los campos del pedido
        pedido.fecha = data.get('fecha', pedido.fecha)
        pedido.estado = data.get('estado', pedido.estado)
        pedido.usuario_id = data.get('usuario_id', pedido.usuario_id)
        pedido.sucursal_id = data.get('sucursal_id', pedido.sucursal_id)
        pedido.precio_total = data.get('precio_total', pedido.precio_total)
        pedido.metodo_de_pago = data.get('metodo_de_pago', pedido.metodo_de_pago)
        
        db.session.commit()
        detalles = data.get('detalles', [])
        for detalle_data in detalles:
            detalle = DetallePedido.query.filter_by(pedido_id=pedido.id, producto_id=detalle_data.get('producto_id')).first()
            if detalle:
                detalle.cantidad = detalle_data.get('cantidad', detalle.cantidad)
                detalle.subtotal = detalle_data.get('subtotal', detalle.subtotal)
            else:
                nuevo_detalle = DetallePedido()
                nuevo_detalle.cantidad = detalle_data.get('cantidad', 0)
                nuevo_detalle.pedido_id = pedido.id
                nuevo_detalle.producto_id = detalle_data.get('producto_id')
                nuevo_detalle.subtotal = detalle_data.get('subtotal', 0)
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


    def cancelar_pedido(self, external_id):
        pedido = self.buscar_external(external_id)
        if not pedido:
            raise Error("Pedido no encontrado")
        # Cambiar el estado del pedido a CANCELADO
        pedido.estado = EstadoPedido.CANCELADO
        db.session.commit()
        return pedido.id

    def cambiar_estado_entregado(self, external_id):
        pedido = self.buscar_external(external_id)
        if not pedido:
            raise Error("Pedido no encontrado")
        # Cambiar el estado del pedido a ENTREGADO
        pedido.estado = EstadoPedido.ENTREGADO
        db.session.commit()
        return pedido.id


    def realizar_caja_cierre(self, sucursal_id, fecha):
        """
        Realiza el cierre de caja para una sucursal específica.
        """
        pedidos = Pedido.query.filter_by(sucursal_id=sucursal_id, fecha=fecha, estado=EstadoPedido.ENTREGADO).all()
        if not pedidos:
            raise Error("No se encontraron pedidos para la sucursal y fecha especificadas")
        
        total_ventas = sum(pedido.precio_total for pedido in pedidos)
        # Aquí podrías agregar lógica adicional para registrar el cierre de caja
        return total_ventas

    def get_pedidos_por_fecha(self, sucursal_id, fecha):
        """
        Obtiene los pedidos realizados en una sucursal en una fecha específica.
        """
        pedidos = Pedido.query.filter_by(sucursal_id=sucursal_id, fecha=fecha).all()
        if not pedidos:
            raise Error("No se encontraron pedidos para la sucursal y fecha especificadas")
        
        return pedidos