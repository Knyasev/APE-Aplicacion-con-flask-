from app import db
import uuid

class Bodega(db.Model):
    __tablename__ = 'bodega'
    
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    ubicacion = db.Column(db.String(150))
    capacidad_maxima = db.Column(db.Numeric(10, 2))
    estado = db.Column(db.Boolean, default=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))  # Clave foránea
    usuario = db.relationship('Usuario', back_populates='bodega')  # Relación inversa
    
    movimientos = db.relationship('ItemInventario', back_populates='bodega')

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'ubicacion': self.ubicacion,
            'capacidad_maxima': str(self.capacidad_maxima) if self.capacidad_maxima else None,
            'estado': self.estado,
            'bodeguero_id': self.bodeguero_id,
            'external_id': self.external_id
        }
        
    def copy(self, value):
        self.nombre = value.get('nombre')
        self.ubicacion = value.get('ubicacion')
        self.capacidad_maxima = value.get('capacidad_maxima', None)
        self.estado = value.get('estado', True)
        self.bodeguero_id = value.get('bodeguero_id', None)
        self.external_id = str(uuid.uuid4())