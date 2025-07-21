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
        sucursal.direccion = data.get("direccion")
        sucursal.telefono = data.get("telefono")
        sucursal.estado = data.get("estado", True)  
        sucursal.admin_id = data.get("admin_id")
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
