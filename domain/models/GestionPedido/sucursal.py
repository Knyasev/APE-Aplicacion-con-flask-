from app import db
import uuid
class Sucursal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    nombre = db.Column(db.String(100))
    direccion = db.Column(db.String(150))
    telefono = db.Column(db.String(20))
    bodegas = db.relationship('Bodega', back_populates='sucursal')
