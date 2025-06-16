from app import db
import uuid 

class CategoriaProducto(db.Model):
    __tablename__ = 'categoriaproducto' 
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    nombre = db.Column(db.String(100))
    descripcion = db.Column(db.String(200))
    productos = db.relationship('Producto', back_populates='categoria')