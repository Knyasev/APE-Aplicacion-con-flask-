from app import db
import uuid

class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    descripcion = db.Column(db.String(200))
    estado = db.Column(db.Boolean, default=True)
    fecha_elab = db.Column(db.Date)
    fecha_vec = db.Column(db.Date)
    bodega_id = db.Column(db.Integer, db.ForeignKey('bodega.id'))
    bodega = db.relationship('Bodega', back_populates='productos')
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.id'))
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoriaproducto.id'))
    categoria = db.relationship('CategoriaProducto', back_populates='productos')
    alertas = db.relationship('AlertaStock', back_populates='producto')

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'tipo': self.tipo,
            'descripcion': self.descripcion,
            'estado': self.estado,
            'fecha_elab': self.fecha_elab.isoformat() if self.fecha_elab else None,
            'fecha_vec': self.fecha_vec.isoformat() if self.fecha_vec else None,
            'pedido_id': self.pedido_id
        }
    def copy(self, value):
        self.nombre = value.get('nombre')
        self.tipo = value.get('tipo')
        self.descripcion = value.get('descripcion')
        self.estado = value.get('estado')
        self.fecha_elab = value.get('fecha_elab')
        self.fecha_vec = value.get('fecha_vec')
        self.id = value.get('id')
        return self

