from models.GestionInventario.itemInventario import ItemInventario
from models.GestionInventario.producto import Producto
from controllers.utils.errors import Error
import uuid
from app import db
from datetime import datetime
from sqlalchemy import func

class InventarioController:

    def listar_Movimiento(self):
        return ItemInventario.query.all()


    def listar_Movimiento_producto(self, producto_id):
        movimientos = ItemInventario.query.filter_by(producto_id=producto_id).all()
        return movimientos


    def listar_Movimiento_por_fecha(self, fecha_inicio, fecha_fin):
        # Convertir las fechas proporcionadas al formato datetime
        fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
        fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d')

        # Filtrar movimientos considerando solo la parte de la fecha
        movimientos = ItemInventario.query.filter(
            func.date(ItemInventario.fecha) >= fecha_inicio.date(),
            func.date(ItemInventario.fecha) <= fecha_fin.date()
        ).all()
        return movimientos


    def listar_stock_producto(self, producto_id):
        producto = Producto.query.get(producto_id)
        if not producto:
            raise Error("Producto no encontrado")
        if not producto.stock or producto.stock.cantidad <= 0:
            return None
        return producto.stock.serialize()