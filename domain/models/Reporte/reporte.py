from app import db
import uuid

class Reporte(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    fecha = db.Column(db.Date)
    descripcion = db.Column(db.String(300))
    estado = db.Column(db.Boolean, default=True)
    
