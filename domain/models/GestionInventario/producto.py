from app import db
import uuid
from models.GestionInventario.Enums.EstadoProducto import EstadoProducto
class Producto(db.Model):
    __tablename__ = 'producto'
    
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    codigo = db.Column(db.String(50), unique=True)
    nombre = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50))
    descripcion = db.Column(db.Text)
    estado = db.Column(db.Enum(EstadoProducto), default=EstadoProducto.BUENO)    
    stock_actual = db.Column(db.Numeric(10, 2), default=0)
    
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoriaproducto.id'))
    categoria = db.relationship('CategoriaProducto', back_populates='productos')
    
    admin_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    admin = db.relationship('Usuario', back_populates='productos_creados')

    movimientos = db.relationship('ItemInventario', back_populates='producto')

    def serialize(self):
        return {
            'id': self.id,
            'codigo': self.codigo,
            'nombre': self.nombre,
            'tipo': self.tipo,
            'descripcion': self.descripcion,
            'estado': self.estado.value,
            'stock_actual': str(self.stock_actual) if self.stock_actual else None,
            'categoria_id': self.categoria_id,
            'bodega_id': self.bodega_id,
            'external_id': self.external_id
        }
    def copy(self, value):
        self.codigo = value.get('codigo')
        self.nombre = value.get('nombre')
        self.tipo = value.get('tipo')
        self.descripcion = value.get('descripcion', '')
        self.estado = EstadoProducto(value.get('estado', EstadoProducto.ACTIVO).upper())
        self.stock_actual = value.get('stock_actual', 0)
        self.categoria_id = value.get('categoria_id', None)
        self.bodega_id = value.get('bodega_id', None)
        self.external_id = str(uuid.uuid4())
        
        return self