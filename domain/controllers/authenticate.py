from flask import request, jsonify, make_response, current_app
from flask_sqlalchemy import SQLAlchemy
from controllers.utils.errors import Error
import uuid # for public id
import jwt
from datetime import datetime, timedelta
from functools import wraps
from models.GestionAcceso.usuario import Usuario

def token_required(roles_permitidos=None):
    def decorator(f):
        @wraps(f)
        def decored(*args, **kwargs):
            token = None
            if 'X-Access-Tokens' in request.headers:
                token = request.headers['X-Access-Tokens']
            if not token:
                return make_response(
                    jsonify({"msg": "ERROR", "code": 401, "datos": {"error": Error.error["-6"]}}),
                    401
                )
            try:
                data = jwt.decode(token, algorithms="HS512", key=current_app.config['SECRET_KEY'])
                user = Usuario.query.filter_by(external_id=data['external']).first()
                if not user:
                    return make_response(
                        jsonify({"msg": "ERROR", "code": 401, "datos": {"error": Error.error["-7"]}}),
                        401
                    )
                
                # Verificar si el usuario tiene un rol permitido
                if roles_permitidos and user.persona.rol.nombre not in roles_permitidos:
                    return make_response(
                        jsonify({"msg": "ERROR", "code": 403, "datos": {"error": "Acceso denegado"}}),
                        403
                    )
            except jwt.ExpiredSignatureError:
                return make_response(
                    jsonify({"msg": "ERROR", "code": 401, "datos": {"error": "Token expirado"}}),
                    401
                )
            except jwt.InvalidTokenError:
                return make_response(
                    jsonify({"msg": "ERROR", "code": 401, "datos": {"error": "Token inválido"}}),
                    401
                )
            except Exception as e:
                print("Error al decodificar el token:", str(e))
                return make_response(
                    jsonify({"msg": "ERROR", "code": 401, "datos": {"error": "Error desconocido"}}),
                    401
                )
            return f(*args, **kwargs)
        return decored
    return decorator