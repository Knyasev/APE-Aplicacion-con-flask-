# Sistema de Inventario y Pedidos

Este proyecto implementa un sistema unificado para la gestión de inventario y pedidos, utilizando **Flask (Python)** para el backend y **Next.js (React)** para el frontend.  
Permite la administración de productos, pedidos y sucursales, con acceso desde navegadores web y sincronización en tiempo real.

---

## **Requisitos Previos**

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas:

- [Python 3.12+](https://www.python.org/downloads/)
- [Node.js 18+ y npm](https://nodejs.org/)
- [MySQL 8+](https://dev.mysql.com/downloads/)
- [Postman (opcional)](https://www.postman.com/)
- [Git (opcional)](https://git-scm.com/)

---

## **1. Configuración del Backend (Flask)**

### **1.1 Crear y activar un entorno virtual**
Ubícate en la carpeta `Domain` del proyecto y crea un entorno virtual:

```bash
cd Domain
python -m venv venv
```

Activa el entorno virtual según tu sistema operativo:

- **Windows**:
  ```bash
  venv\Scripts\activate
  ```
- **Linux/Mac**:
  ```bash
  source venv/bin/activate
  ```

---

### **1.2 Instalar dependencias**
Instala todas las librerías necesarias usando el archivo `requirements.txt`:

```bash
pip install -r requirements.txt
```

---

### **1.3 Configurar variables de entorno**
Crea un archivo `.env` dentro de la carpeta `Domain` con la configuración de tu base de datos y del servidor.

Ejemplo de contenido del archivo `.env`:
```plaintext
FLASK_APP="Sistema Inventario"
FLASK_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=inventario_db
```

---

### **1.4 Ejecutar el servidor Flask**
Levanta el servidor backend con el siguiente comando:

```bash
python index.py
```
O, si tienes Flask instalado globalmente:
```bash
flask run
```

Por defecto, el backend estará disponible en:
[http://127.0.0.1:5000/](http://127.0.0.1:5000/)

---

## **2. Configuración del Frontend (Next.js)**

### **2.1 Instalar dependencias**
Ubícate en la carpeta `Frontend` e instala las dependencias con:

```bash
cd Frontend
npm install
```

---

### **2.2 Ejecutar el frontend**
Para iniciar el servidor de desarrollo, usa:

```bash
npm run dev
```

Por defecto, el frontend estará disponible en:
[http://localhost:3000/](http://localhost:3000/)

---

## **3. Estructura del Proyecto**

### **Backend**
- **Domain**:
  - `models`: Contiene las definiciones de las entidades como `Producto`, `ItemInventario`, etc.
  - `controllers`: Contiene la lógica de negocio.
  - `routes`: Define los endpoints de la API.
  - `config`: Contiene la configuración del sistema.

### **Frontend**
- **src/app**:
  - `pedido`: Página para gestionar pedidos.
  - `inventario`: Página para gestionar inventario.
  - `components`: Componentes reutilizables como el menú.

---

## **4. Tecnologías Utilizadas**

- **Backend**:
  - Flask
  - SQLAlchemy
  - PyMySQL
- **Frontend**:
  - Next.js
  - React
- **Base de Datos**:
  - MySQL
