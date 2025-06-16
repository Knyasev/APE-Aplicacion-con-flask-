#-*- coding: utf-8 -*-
from app import db
import uuid 

class MovimientoInventario(db.Model):
    __tablename__ = 'movimientos_inventario'
    id = db.Column(db.Integer, primary_key=True)
    tipo_movimiento = db.Column(db.String(50))
    cantidad = db.Column(db.Integer)
    fecha = db.Column(db.Date)
    motivo = db.Column(db.String(200))

    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    bodega_id = db.Column(db.Integer, db.ForeignKey('bodega.id'))

    bodega = db.relationship('Bodega', back_populates='movimientos')

    def serialize(self):
        return {
            'id': self.id,
            'tipo_movimiento': self.tipo_movimiento,
            'cantidad': self.cantidad,
            'fecha': self.fecha,
            'motivo': self.motivo,
            'usuario_id': self.usuario_id,
            'bodega_id': self.bodega_id
        }
    def copy(self, value):
        self.tipo_movimiento = value.get('tipo_movimiento')
        self.cantidad = value.get('cantidad')
        self.fecha = value.get('fecha')
        self.motivo = value.get('motivo')
        self.id = value.get('id')
        return self