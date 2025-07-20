import uuid
from app import db
from models.GestionInventario.producto import Producto
from models.GestionInventario.itemInventario import ItemInventario
from models.GestionInventario.stock import Stock
from models.GestionInventario.bodega import Bodega
from models.GestionInventario.Enums.TipoMovimiento import TipoMovimiento


class Inventario(db.Model):
    __tablename__ = 'inventario'
    
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(60), default=str(uuid.uuid4()), nullable=False)
    
    @staticmethod
    def registrar_entrada(producto_id, cantidad, precio_unitario, bodega_id, numero_comprobante=None, tipo_comprobante=None, proveedor=None):
        producto = Producto.query.get(producto_id)
        if not producto:
            raise Exception("Producto no encontrado")
        
        bodega = Bodega.query.get(bodega_id)
        if not bodega:
            raise Exception(f"La bodega con ID {bodega_id} no existe.")
        
        # Actualizar stock
        if not producto.stock:
            producto.stock = Stock(
                cantidad=cantidad,
                precio=float(precio_unitario),  
                pvp=float(precio_unitario),  
                producto_id=producto.id
            )
        else:
            producto.stock.cantidad += cantidad
            total_costo_actual = float(producto.stock.cantidad) * float(producto.stock.precio) if producto.stock.precio else 0
            total_costo_nueva_entrada = float(cantidad) * float(precio_unitario)
            producto.stock.precio = (total_costo_actual + total_costo_nueva_entrada) / float(producto.stock.cantidad)
            producto.stock.pvp = producto.stock.precio  

        # Registrar transacción
        item = ItemInventario(
            tipo=TipoMovimiento.ENTRADA,
            cantidad=cantidad,
            precio_unitario=precio_unitario,
            precio_total=cantidad * precio_unitario,
            numero_comprobante=numero_comprobante or "N/A",  
            tipo_comprobante=tipo_comprobante or "N/A",  
            proveedor=proveedor or "N/A",  
            producto_id=producto.id,
            bodega_id=bodega_id
        )
        db.session.add(item)
        db.session.commit()    
        
    @staticmethod
    def registrar_salida(producto_id, cantidad, bodega_id):
        producto = Producto.query.get(producto_id)
        if not producto:
            raise Exception("Producto no encontrado")
        
        if not producto.stock or float(producto.stock.cantidad) < float(cantidad):  
            raise Exception("Stock insuficiente")
        
        # Actualizar stock
        producto.stock.cantidad = float(producto.stock.cantidad) - float(cantidad) 

        # Registrar transacción
        item = ItemInventario(
            tipo=TipoMovimiento.SALIDA, 
            cantidad=cantidad,
            precio_unitario=float(producto.stock.pvp),  
            producto_id=producto.id,
            bodega_id=bodega_id
        )
        db.session.add(item)
        db.session.commit()
    
    @staticmethod
    def calcular_stock_actual(producto_id):
        producto = Producto.query.get(producto_id)
        return producto.stock_actual if producto else 0
    
    @staticmethod
    def generar_kardex(producto_id, fecha_inicio, fecha_fin):
        """
        Genera el Kardex de un producto en un rango de fechas.
        """
        producto = Producto.query.get(producto_id)
        if not producto:
            raise Exception("Producto no encontrado")
    
        # Obtener los movimientos del producto en el rango de fechas
        movimientos = ItemInventario.query.filter(
            ItemInventario.producto_id == producto_id,
            ItemInventario.fecha >= fecha_inicio,
            ItemInventario.fecha <= fecha_fin
        ).order_by(ItemInventario.fecha.asc()).all()
    
        if not movimientos:
            return {"msg": "No se encontraron movimientos en el rango de fechas especificado."}
    
        # Generar el Kardex
        kardex = []
        saldo = float(producto.stock.cantidad)  # Saldo inicial del producto
    
        for movimiento in movimientos:
            if movimiento.tipo == TipoMovimiento.ENTRADA:
                saldo += float(movimiento.cantidad)
            elif movimiento.tipo == TipoMovimiento.SALIDA:
                saldo -= float(movimiento.cantidad)
    
            kardex.append({
                "fecha": movimiento.fecha.isoformat(),
                "tipo": movimiento.tipo.name,
                "cantidad": float(movimiento.cantidad),
                "precio_unitario": float(movimiento.precio_unitario),
                "precio_total": float(movimiento.precio_total) if movimiento.precio_total else None,
                "saldo": saldo
            })
    
        return {
            "producto": producto.nombre,
            "codigo": producto.codigo,
            "kardex": kardex
        }