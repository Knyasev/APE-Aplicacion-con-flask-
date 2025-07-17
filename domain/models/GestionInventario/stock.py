import uuid
from app import db

class Stock(db.Model):
    __tablename__ = 'stock'
    
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    cantidad = db.Column(db.Numeric(10, 2), default=0)
    precio = db.Column(db.Numeric(10, 2))
    pvp = db.Column(db.Numeric(10, 2))
    
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'))
    producto = db.relationship('Producto', foreign_keys=[producto_id])

    def serialize(self):
        return {
            'id': self.id,
            'cantidad': str(self.cantidad) if self.cantidad else None,
            'precio': str(self.precio) if self.precio else None,
            'pvp': str(self.pvp) if self.pvp else None,
            'producto_id': self.producto_id,
            'external_id': self.external_id
        }
    def copy(self, value):
        self.cantidad = value.get('cantidad', 0)
        self.precio = value.get('precio', None)
        self.pvp = value.get('pvp', None)
        self.producto_id = value.get('producto_id', None)
        self.external_id = str(uuid.uuid4())
        return self