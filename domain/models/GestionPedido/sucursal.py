from app import db
import uuid
class Sucursal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    nombre = db.Column(db.String(100))
    direccion = db.Column(db.String(150))
    telefono = db.Column(db.String(20))
    bodegas = db.relationship('Bodega', back_populates='sucursal')
    estado = db.Column(db.Boolean, default=True)

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'direccion': self.direccion,
            'telefono': self.telefono,
            'external_id': self.external_id
        }

    def copy(self, value):
        self.nombre = value.get('nombre')
        self.direccion = value.get('direccion')
        self.telefono = value.get('telefono')
        self.external_id = str(uuid.uuid4())
        return self




