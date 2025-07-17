from app import db
import uuid
from models.GestionPedido.Enums.EstadoPedido import EstadoPedido
class Pedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    fecha = db.Column(db.Date)
    estado = db.Column(db.Enum(EstadoPedido), default=EstadoPedido.CREADO)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    usuario = db.relationship('Usuario', back_populates='pedidos')
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    detalles = db.relationship('DetallePedido', backref='pedido', lazy=True)
    def serialize(self):
        return {
            'id': self.id,
            'fecha': self.fecha.isoformat() if self.fecha else None,
            'estado': self.estado,
            'usuario_id': self.usuario_id,
            'external_id': self.external_id
        }
        
    def copy(self, value):
        self.fecha = value.get('fecha')
        self.estado = value.get('estado', True)
        self.usuario_id = value.get('usuario_id')
        self.external_id = str(uuid.uuid4())
        return self