from app import db
import uuid

class Bodega(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    nombre = db.Column(db.String(100))
    ubicacion = db.Column(db.String(150))
    sucursal_id = db.Column(db.Integer, db.ForeignKey('sucursal.id'))
    sucursal = db.relationship('Sucursal', back_populates='bodegas')
    productos = db.relationship('Producto', back_populates='bodega')
    movimientos = db.relationship('MovimientoInventario', back_populates='bodega')
    estado = db.Column(db.Boolean, default=True)

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'ubicacion': self.ubicacion,
            'external_id': self.external_id,
            'sucursal_id': self.sucursal_id
        }

    def copy(self, value):
        self.nombre = value.get('nombre')
        self.ubicacion = value.get('ubicacion')
        self.sucursal_id = value.get('sucursal_id')
        self.estado = value.get('estado', True)
        self.external_id = str(uuid.uuid4())

        return self