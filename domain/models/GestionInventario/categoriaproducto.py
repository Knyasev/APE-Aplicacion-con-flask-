from app import db
import uuid 

class CategoriaProducto(db.Model):
    __tablename__ = 'categoriaproducto' 
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    nombre = db.Column(db.String(100))
    descripcion = db.Column(db.String(200))
    productos = db.relationship('Producto', back_populates='categoria')

    @property
    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'external_id': self.external_id
        }

    def copy(self, value):
        self.nombre = value.get('nombre')
        self.descripcion = value.get('descripcion', '')
        self.external_id = str(uuid.uuid4())