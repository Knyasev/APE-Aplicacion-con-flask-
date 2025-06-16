from models.GestionAcceso.rol import Rol
from app import db
import uuid

class RolController:
    def listarRol(self):
        return Rol.query.all()
    
    def save(self, data):
        rol = Rol()
        rol.nombre = data.get("nombre")
        rol.descripcion = data.get("descripcion")
        rol.estado = data.get("estado")
        rol.external_id = uuid.uuid4()
        db.session.add(rol)
        db.session.commit()
        return rol.id
    