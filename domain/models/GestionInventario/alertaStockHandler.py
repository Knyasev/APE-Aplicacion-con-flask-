from domain.controllers.utils.observer import Observer
from domain.models.GestionInventario.alertaStock import AlertaStock
from domain.models.GestionInventario.producto import Producto
from app import db
import datetime

class AlertaStockHandler(Observer):
    def update(self, subject, producto: Producto):
        """
        Recibe la notificación de bajo stock y crea una alerta.
        """
        # Define tu umbral de stock bajo
        UMBRAL_STOCK_BAJO = 10

        if producto.stock_actual <= UMBRAL_STOCK_BAJO:
            # Verificar si ya existe una alerta activa para este producto para no duplicar
            alerta_existente = AlertaStock.query.filter_by(
                producto_id=producto.id, 
                resuelta=False
            ).first()

            if not alerta_existente:
                print(f"OBSERVER: Creando alerta de stock para el producto '{producto.nombre}'")
                nueva_alerta = AlertaStock(
                    producto_id=producto.id,
                    mensaje=f"Stock bajo para {producto.nombre}. Stock actual: {producto.stock_actual}",
                    fecha_generacion=datetime.datetime.now(datetime.timezone.utc),
                    resuelta=False
                )
                db.session.add(nueva_alerta)
                db.session.commit()