import uuid
from app import db

class DetallePedido(db.Model):
    __tablename__ = 'detalle_pedidos'

    id = db.Column(db.Integer, primary_key=True)
    cantidad_solicitada = db.Column(db.Integer, nullable=False)
    cantidad_entregada = db.Column(db.Integer, default=0)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)

    # Relaciones
    # Pedido y Producto
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    productos = db.relationship('Producto', backref='pedido', lazy=True)


    def serialize(self):
        return {
            'id': self.id,
            'cantidad_solicitada': self.cantidad_solicitada,
            'cantidad_entregada': self.cantidad_entregada,
            'pedido_id': self.pedido_id,
            'producto_id': self.producto_id,
            'external_id': str(uuid.uuid4())
        }
    def copy(self, value):
        self.cantidad_solicitada = value.get('cantidad_solicitada', 0)
        self.cantidad_entregada = value.get('cantidad_entregada', 0)
        self.pedido_id = value.get('pedido_id')
        self.producto_id = value.get('producto_id')
        self.external_id = str(uuid.uuid4())
        return self
