from models.GestionPedido.pedido import Pedido
from controllers.utils.errors import Error
import uuid
from app import db
class PedidoController:

    def listar(self):
       return Pedido.query.all()

    def registrar_pedido(self, data):
            pedido = Pedido()
            pedido.fecha = data.get("fecha")
            pedido.estado = data.get("estado")
            pedido.external_id= uuid.uuid4()
            db.session.add(pedido)
            db.session.commit()
            return pedido.id

    def obtener_pedido(self, pedido_id):
        pedido = Pedido.query.get(pedido_id)
        if not pedido:
            raise Error("Pedido no encontrado")
        return pedido
