from app import db
import uuid
class Persona(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    apellido = db.Column(db.String(100))
    fecha_nacimiento = db.Column(db.Date)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()),nullable=False)
    rol_id = db.Column(db.Integer, db.ForeignKey('rol.id'), unique=False)
    rol = db.relationship('Rol', back_populates='persona')
    usuario = db.relationship('Usuario', back_populates='persona')
    #relacion de 1 a muchos 
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), server_onupdate=db.func.now())
    @property
    def serialize(self):
        return {
        'nombre': self.nombre,
        'apellido': self.apellido,
        'external_id': self.external_id,
        'cuenta': [cuenta.serialize() for cuenta in self.cuenta if cuenta.estado == 1],
        'rol': self.rol.serialize() if self.rol else None,
    }


 