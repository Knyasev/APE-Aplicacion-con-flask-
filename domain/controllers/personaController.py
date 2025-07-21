from models.GestionAcceso.persona import Persona
from models.GestionAcceso.rol import Rol
from models.GestionAcceso.usuario import Usuario
from app import db
from datetime import datetime, timedelta,timezone
from flask import current_app
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash

import jwt
import uuid

class PersonaController:
    def listar(self):
        return Persona.query.all()
    
    def save(self, data):
        persona = Persona()
        persona.apellido = data.get("apellido")
        persona.nombre = data.get("nombre")
        persona.external_id = uuid.uuid4()
        persona.rol_id = data.get("rol_id")
        db.session.add(persona)
        db.session.commit()
        return persona.id
    
    def guardar_Bodeguero(self,data):
        rol = Rol.query.filter_by(nombre="BODEGUERO").first()
        persona = Persona()
        if rol:
            persona.external_id = uuid.uuid4()
            persona.apellido = data.get("apellido")
            persona.nombre = data.get("nombre")
            persona.rol_id = rol.id
            db.session.add(persona)
            db.session.commit()
            return  persona.id
        else:
            return -1
        
    
    
    def guardar_usuario(self,data):
        rol = Rol.query.filter_by(nombre="ADMINISTRADOR").first()
        persona = Persona()
        if rol:
            usuario_existente = Usuario.query.filter_by(username=data.get("correo")).first()
            if usuario_existente:
                return -2
            else:
                persona.external_id = uuid.uuid4()
                persona.apellido = data.get("apellido")
                persona.nombre = data.get("nombre")
                persona.rol_id = rol.id
                db.session.add(persona)
                db.session.commit()
                usuario = Usuario()
                usuario.username = data.get("username")
                # Encriptar la clave
                usuario.clave = generate_password_hash(data.get("clave"))
                usuario.persona_id = persona.id
                usuario.external_id = str(uuid.uuid4())
                db.session.add(usuario)
                db.session.commit()
            return  usuario.id
        else:
            return -1

    def guardar_usuario_bodeguero(self, data):
        rol = Rol.query.filter_by(nombre="BODEGUERO").first()
        persona = Persona()
        if rol:
            usuario = Usuario.query.filter_by(username=data.get("correo")).first()
            if usuario:
                return -2
            else:
                persona.external_id = uuid.uuid4()
                persona.apellido = data.get("apellido")
                persona.nombre = data.get("nombre")
                persona.rol_id = rol.id
                db.session.add(persona)
                db.session.commit()
                usuario = Usuario()
                usuario.username = data.get("username")
                # Encriptar la clave
                usuario.clave = generate_password_hash(data.get("clave"))
                usuario.persona_id = persona.id
                usuario.external_id = str(uuid.uuid4())
                db.session.add(usuario)
                db.session.commit()
            return usuario.id
        else:
            return -1

    def guardar_usuario_personal(self, data):
        rol = Rol.query.filter_by(nombre="PERSONAL").first()
        persona = Persona()
        if rol:
            usuario = Usuario.query.filter_by(username=data.get("correo")).first()
            if usuario:
                return -2
            else:
                persona.external_id = uuid.uuid4()
                persona.apellido = data.get("apellido")
                persona.nombre = data.get("nombre")
                persona.rol_id = rol.id
                db.session.add(persona)
                db.session.commit()
                usuario = Usuario()
                usuario.username = data.get("username")
                # Encriptar la clave
                usuario.clave = generate_password_hash(data.get("clave"))
                usuario.persona_id = persona.id
                usuario.external_id = str(uuid.uuid4())
                db.session.add(usuario)
                db.session.commit()
            return usuario.id
        else:
            return -1

        
    
        
    

    def buscar_external(self, external_id):
        return Persona.query.filter_by(external_id=external_id).first()
    
    
    def modificar_usuario(self, data,external_id):
        usuario = Usuario.query.filter_by(external_id=external_id).first()
        if usuario:
            persona = Persona.query.filter_by(id=usuario.persona_id).first()
            if persona:
                persona.apellido = data.get("apellido", persona.apellido)
                persona.nombre = data.get("nombre", persona.nombre)
                usuario.username = data.get("correo", usuario.username)
                usuario.clave = generate_password_hash(data.get("clave")) if data.get("clave") else usuario.clave
                db.session.commit()
                return usuario.id
            else:
                return -3  # Persona no encontrada
        else:
            return -2  # usuario no encontrada

        
    def copiar(self, external_id):
            persona = self.buscar_external(external_id)
            if persona:
                nueva_persona = Persona()
                nueva_persona.apellido = persona.apellido
                nueva_persona.nombre = persona.nombre
                nueva_persona.fecha_nacimiento = persona.fecha_nacimiento
                nueva_persona.rol_id = persona.rol_id
                db.session.add(nueva_persona)
                db.session.commit()
                return nueva_persona
            else:
                return -1
        

    def desactivar(self, external_id):
        persona = self.buscar_external(external_id)
        if persona and persona.rol.nombre == 'ADMINISTRADOR':                
                usuario = usuario.query.filter_by(persona_id=persona.id).first()
                if usuario:
                    usuario.estado = 0  # Cambia el estado de la usuario a 0 (desactivado)
                    db.session.add(usuario)
                    db.session.commit()
                return usuario
        return False
    

    def activar_usuario(self, external_id):
        persona = self.buscar_external(external_id)
        if persona and persona.rol.nombre == 'ADMINISTRADOR':                
                usuario = usuario.query.filter_by(persona_id=persona.id).first()
                if usuario:
                    usuario.estado = 1  # Cambia el estado de la usuario a 1 (activado)
                    db.session.add(usuario)
                    db.session.commit()
                return usuario
        return False
        

    def inicio_sesion(self, data):
        usuarioA = Usuario.query.filter_by(username = data.get('username')).first()
        if usuarioA:
            # Verificar la clave
            if check_password_hash(usuarioA.clave, data["clave"]):
                token = jwt.encode(
                    {
                        "external": usuarioA.external_id,
                        "expiracion": (datetime.now(timezone.utc)+ timedelta(minutes=30)).isoformat()
                    }, 
                    key = current_app.config["SECRET_KEY"],
                    algorithm="HS512"
                )
                usuario = Usuario.query.get(usuarioA.id)
                persona = usuario.getPersona(usuarioA.persona_id)
                info = {
                    "token": token,
                    "user": persona.apellido + " " + persona.nombre,
                    "external_id": persona.external_id
                    
                }
                print(persona.external_id)
                return info
            else:
                return -5
        else:
            return -5



        