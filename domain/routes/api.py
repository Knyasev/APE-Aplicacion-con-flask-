from flask import Blueprint, jsonify, make_response, request
# Importacion de los modelos de tablas de la base de datos
from models.GestionAcceso.persona import Persona
from models.GestionAcceso.usuario import Usuario
from models.GestionAcceso.rol import Rol
from models.GestionInventario.producto import Producto
from models.GestionPedido.pedido import Pedido
from models.GestionPedido.sucursal import Sucursal
from models.GestionInventario.bodega import Bodega
from models.GestionInventario.categoriaproducto import CategoriaProducto
from models.GestionInventario.alertastock import AlertaStock
from models.GestionInventario.itemInventario import ItemInventario
from models.GestionPedido.detallePedido import DetallePedido
from models.GestionInventario.stock import Stock
from models.GestionInventario.inventario import Inventario

api = Blueprint('api', __name__)
