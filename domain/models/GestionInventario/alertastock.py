from app import db
import uuid


class AlertaStock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    cantidad_actual = db.Column(db.Integer)
    estado = db.Column(db.Boolean)

    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'))
    producto = db.relationship('Producto', back_populates='alertas')    