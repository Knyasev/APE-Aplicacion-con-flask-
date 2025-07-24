from models.GestionPedido.sucursal import Sucursal
from app import db
import uuid
from controllers.utils.errors import Error
from datetime import datetime
class SucursalController:
    def listar(self):
        return Sucursal.query.all()

    def registrar_sucursal(self, data):
        sucursal = Sucursal()
        sucursal.nombre = data.get("nombre")
        sucursal.ubicacion = data.get("ubicacion")
        sucursal.telefono = data.get("telefono")
        sucursal.estado = data.get("estado", True)  
        sucursal.admin_id = data.get("admin_id")
        sucursal.bodega_id = data.get("bodega_id")
        sucursal.fecha_registro = datetime.utcnow()
        sucursal.external_id = uuid.uuid4()
        db.session.add(sucursal)
        db.session.commit()
        return sucursal.id

    def actualizar_sucursal(self,external_id, data):
        sucursal = self.buscar_external(external_id)
        if sucursal:
            sucursal.copy(data)
            db.session.add(sucursal)
            db.session.commit()
            return sucursal.id
        else:
            raise Error("Sucursal no encontrada", 404)

 
    
    
    def buscar_external(self, external):
        return Sucursal.query.filter_by(external_id=external).first()


    def desactivar_sucursal(self, external_id):
        sucursal = self.buscar_external(external_id)
        if sucursal:
            sucursal.estado = False
            db.session.add(sucursal)
            db.session.commit()
            return sucursal
        else:
            raise Error("Sucursal no encontrada", 404)

    def activar_sucursal(self, external_id):
        sucursal = self.buscar_external(external_id)
        if sucursal:
            sucursal.estado = True
            db.session.add(sucursal)
            db.session.commit()
            return sucursal
        else:
            raise Error("Sucursal no encontrada", 404)


    def get_sucursal_by_id(self, sucursal_id):
        sucursal = Sucursal.query.get(sucursal_id)
        if not sucursal:
            raise Error("Sucursal no encontrada", 404)
        return sucursal

    def get_sucursal_by_bodega_id(self, bodega_id):
        sucursal = Sucursal.query.filter_by(bodega_id=bodega_id).first()
        if not sucursal:
            raise Error("Sucursal no encontrada para la bodega especificada", 404)
        return sucursal

    def get_sucursal_by_usuario(self, admin_id):
        sucursal = Sucursal.query.filter_by(admin_id=admin_id).first()
        if not sucursal:
            raise Error("Sucursal no encontrada para el usuario especificado", 404)
        return sucursal
    