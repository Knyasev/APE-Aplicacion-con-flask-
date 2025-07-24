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
    sucursal_id = db.Column(db.Integer, db.ForeignKey('sucursales.id'))  
    sucursal = db.relationship('Sucursal', back_populates='pedidos')
    precio_total = db.Column(db.Float, nullable=False, default=0.0) 
    metodo_de_pago = db.Column(db.String(50), nullable=False)
 
    @property
    def serialize(self):
        return {
            'id': self.id,
            'external_id': self.external_id,
            'fecha': self.fecha.isoformat() if self.fecha else None,
            'metodo_de_pago': self.metodo_de_pago,
            'precio_total': self.precio_total,
            'estado': self.estado.value,
            'usuario_id': self.usuario_id,
            'detalles': [detalle.serialize() for detalle in self.detalles],
            'sucursal_id': self.sucursal_id
        }
    
    def copy(self, value):
        self.fecha = value.get('fecha')
        self.estado = EstadoPedido(value.get('estado').upper())
        self.usuario_id = value.get('usuario_id')
        self.sucursal_id = value.get('sucursal_id')
        self.external_id = str(uuid.uuid4())
        self.metodo_de_pago = value.get('metodo_de_pago'),
        self.precio_total = value.get('precio_total')
        return self