from controllers.utils.observer import Observer
from models.GestionInventario.producto import Producto
from models.GestionInventario.categoriaproducto import CategoriaProducto
import uuid
from app import db
class ProductoController():

    _observers: list[Observer] = []

    def listar_productos(self):
        return Producto.query.all()

    def subscribe(self, observer: Observer):
        print("Subject: Suscribiendo un observador.")
        self._observers.append(observer)

    def unsubscribe(self, observer: Observer):
        self._observers.remove(observer)

    def notify(self, producto: Producto = None):
        print("Subject: Notificando a los observadores...")
        for observer in self._observers:
            observer.update(self, producto)

    def buscar_producto(self,external_id):
        return Producto.query.filter_by(external_id=external_id).first()


    def registrar_salida_producto(self, data):
        producto = Producto()
        producto.codigo = data.get("codigo")
        producto.nombre = data.get("nombre")
        producto.tipo = data.get("tipo")
        producto.descripcion = data.get("descripcion", '')
        producto.estado = data.get("estado")
        producto.stock_actual = data.get("stock_actual", 0)
        producto.categoria_id = data.get("categoria_id", None)
        producto.admin_id  = data.get("admin_id")
        producto.external_id = str(uuid.uuid4())
        db.session.add(producto)
        db.session.commit()
        self.notify(producto=producto)
        return producto.id
        

    def actualizar_producto(self, external_id, data):
        producto = self.buscar_producto(external_id)
        if producto:
            producto.copy(data)
            db.session.commit()
            self.notify(producto=producto)
            return producto.id
        else:
            raise Exception("Producto no encontrado")

    def registar_categoria(self,data):
        categoria = CategoriaProducto()
        categoria.nombre= data.get("nombre")
        categoria.descripcion=data.get("descripcion")
        categoria.external_id = str(uuid.uuid4())
        db.session.add(categoria)
        db.session.commit()
        return categoria.id

    def obtener_nombre_producto(self, producto_id):
        producto = Producto.query.get(producto_id)
        if not producto:
            raise Exception("Producto no encontrado")
        return producto.nombre

