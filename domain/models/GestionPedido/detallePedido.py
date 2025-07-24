import uuid
from app import db

class DetallePedido(db.Model):
    __tablename__ = 'detalle_pedidos'

    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    cantidad= db.Column(db.Integer, nullable=False)
    subtotal= db.Column(db.Float, nullable=False)
    # Relaciones
    # Pedido y Producto
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    productos = db.relationship('Producto', backref='pedido', lazy=True)


    def serialize(self):
        return {
            'id': self.id,
            'cantidad': self.cantidad,
            'external_id': self.external_id,
            'subtotal': self.subtotal,
            'pedido_id': self.pedido_id,
            'producto_id': self.producto_id
        }
