#-*- coding: utf-8 -*-
from app import db
import uuid 
from models.GestionInventario.Enums.TipoMovimiento import TipoMovimiento
from models.GestionInventario.Enums.TipoDocumento import TipoDocumento
from datetime import datetime
class ItemInventario(db.Model):
    __tablename__ = 'item_inventario'
    
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    tipo = db.Column(db.Enum(TipoDocumento), nullable=False)
    cantidad = db.Column(db.Numeric(10, 2), nullable=False)
    precio_total = db.Column(db.Numeric(12, 2))
    precio_unitario = db.Column(db.Numeric(10, 2))
    numero_comprobante = db.Column(db.String(50))
    tipo_comprobante = db.Column(db.Enum(TipoDocumento))    
    proveedor = db.Column(db.String(100))
    
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'))
    producto = db.relationship('Producto', back_populates='movimientos')
    
    bodega_id = db.Column(db.Integer, db.ForeignKey('bodega.id'))
    bodega = db.relationship('Bodega', back_populates='movimientos')
    
