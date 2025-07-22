from models.GestionInventario.bodega import Bodega
from controllers.utils.errors import Error
import uuid
from app import db

class BodegaController:
    def listar_bodegas(self):
        return Bodega.query.all()

    def registrar_bodega(self, data):
        bodega = Bodega()
        bodega.nombre = data.get("nombre")
        bodega.ubicacion = data.get("ubicacion")
        bodega.capacidad_maxima = data.get("capacidad_maxima")
        bodega.estado = data.get("estado", True)
        bodega.usuario_id = data.get("usuario_id")
        bodega.external_id = str(uuid.uuid4())
        db.session.add(bodega)
        db.session.commit()
        return bodega.id

    def buscar_bodega(self, external_id):
        return Bodega.query.filter_by(external_id=external_id).first()

    def actualizar_bodega(self, external_id, data):
        bodega = self.buscar_bodega(external_id)
        if bodega:
            bodega.copy(data)
            db.session.add(bodega)
            db.session.commit()
            return bodega.id
        else:
            raise Error("Bodega no encontrada", 404)

    def desactivar_bodega(self, external_id):
        bodega = self.buscar_bodega(external_id)
        if bodega:
            bodega.estado = False
            db.session.add(bodega)
            db.session.commit()
            return bodega
        else:
            raise Error("Bodega no encontrada", 404)

    def activar_bodega(self, external_id):
        bodega = self.buscar_bodega(external_id)
        if bodega:
            bodega.estado = True
            db.session.add(bodega)
            db.session.commit()
            return bodega
            
            
            
        