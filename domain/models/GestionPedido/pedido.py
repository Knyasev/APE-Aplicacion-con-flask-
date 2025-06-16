from app import db
import uuid

class Pedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    fecha = db.Column(db.Date)
    estado = db.Column(db.Boolean)
    productos = db.relationship('Producto', backref='pedido', lazy=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    usuario = db.relationship('Usuario', back_populates='pedidos')
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    def serialize(self):
        return {
            'id': self.id,
            'fecha': self.fecha,
            'estado': self.estado,
            'external_id': self.external_id
        }
    def copy(self, value):
        self.fecha = value.get('fecha')
        self.estado = value.get('estado')
        self.id = value.get('id')
        self.external_id = str(uuid.uuid4())
        return self