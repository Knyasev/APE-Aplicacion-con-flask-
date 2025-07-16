from app import db
from models.GestionAcceso.rol import Rol
import uuid

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100))
    clave = db.Column(db.String(250))
    estado = db.Column(db.Boolean, default=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()),nullable=False)
    persona_id = db.Column(db.Integer, db.ForeignKey('persona.id'), nullable=False)
    persona = db.relationship('Persona', back_populates='usuario', lazy=True)
    pedidos = db.relationship('Pedido', back_populates='usuario')

    def serialize(self):
        return {
        'username': self.username,
        'external_id': self.external_id,
        'estado': self.estado,
    }
    def getPersona(self, id_p):
        from models.GestionAcceso.persona import Persona
        return Persona.query.filter_by(id = id_p).first()

    def copy(self, value):
        self.username= value.get('username')
        self.clave = value.get('clave')
        self.estado = value.get('estado')
        self.id = value.get('id')
        self.external_id = str(uuid.uuid4())
        return self