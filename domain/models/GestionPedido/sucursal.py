from app import db
import uuid
from datetime import datetime  # Cambiar la importación aquí

class Sucursal(db.Model):
    __tablename__ = 'sucursales'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    ubicacion = db.Column(db.String(150))
    estado = db.Column(db.Boolean, default=True)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))  # Clave foránea
    admin = db.relationship('Usuario', back_populates='sucursales')  # Relación
    pedidos = db.relationship('Pedido', back_populates='sucursal')  # Relación
    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'ubicacion': self.ubicacion,
            'estado': self.estado,
            'fecha_registro': self.fecha_registro.isoformat(),
            'external_id': str(uuid.uuid4())
        }

    def copy(self, value):
        self.nombre = value.get('nombre')
        self.ubicacion = value.get('ubicacion')
        self.estado = value.get('estado', True)
        self.fecha_registro = datetime.utcnow()
        self.external_id = str(uuid.uuid4())

        return self