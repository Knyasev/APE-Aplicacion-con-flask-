'use client'
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from "next/link";
import Menu from "../components/menu";
import {  get_productos, listar_productos_buenos, listar_productos_por_caducar, listar_productos_caducados, subir_imagen,cargar_imagen } from "@/hooks/Services_producto"; // Asegúrate de importar uploadImage
import swal from 'sweetalert';
import './producto.css';
import mildware from '../components/mildware';

 function Producto() {
    const [productos, setProductos] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const token = Cookies.get('token');

    const cargarProductos = async (tipo) => {
        try {
            if (!token) {
                console.log('Token no encontrado');
                setProductos([]);
                return;
            }

            let info;
            switch (tipo) {
                case 'buenos':
                    info = await listar_productos_buenos(token);
                    break;
                case 'porCaducar':
                    info = await listar_productos_por_caducar(token);
                    break;
                case 'caducados':
                    info = await listar_productos_caducados(token);
                    break;
                default:
                    info = await get_productos(token);
            }
            if (info.status == 200) {
                let productosData;
                // Verificar si info.data es un array
                if (Array.isArray(info.data)) {
                    productosData = info.data;
                } else if (info.data && typeof info.data === 'object' && Array.isArray(info.data.datos)) {
                    // Si info.data no es un array pero info.data.datos sí lo es
                    productosData = info.data.datos;
                } else {
                    // Si no se cumple ninguna de las condiciones anteriores, registrar un error
                    console.error('Formato de datos inesperado:', typeof info.data, info.data);
                    productosData = []; // Usar un array vacío como valor predeterminado
                }
                setProductos(productosData);
            } else {
                console.log(info.error);
                setProductos([]);
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            setProductos([]);
        }
        setIsLoaded(true);
    };

    useEffect(() => {
        const token = Cookies.get('token');
        if (!isLoaded) {
            get_productos(token).then((info) => {
                if (info.code == '200') {
                    setProductos(info.datos);
                    console.log(info.datos);
                } else {
                    console.log(info.datos.error);
                }
                setIsLoaded(true);
            });
        }
    }, [isLoaded]);

    const handleUploadImage = async (e, external_id) => {
        const file = e.target.files[0];
        console.log(external_id)
        if (file) {
            const formData = new FormData();
            formData.append('imagen', file);
            formData.append('external_id', external_id); 
            console.log('external_id en FormData:', formData.get('external_id'));
            try {
                const response = await subir_imagen(formData, token); 
                if (response.status === 200) {
                    swal("Imagen subida con éxito", "", "success");
                } else {
                    swal("Error al subir la imagen", "", "error");
                }
            } catch (error) {
                console.error("Error al subir la imagen:", error);
                swal("Error al subir la imagen", "", "error");
            }
        }
    };

    return (
        <div >
            <Menu />
            <main className="container text-center mt-5" style={{paddingLeft:"300px"}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <Link href="/producto/new" className="btn btn-info">Nuevo Producto</Link>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                        <button onClick={() => cargarProductos('buenos')} className="btn btn-success">Cargar Buenos</button>
                        <button onClick={() => cargarProductos('porCaducar')} className="btn btn-warning">Por Caducar</button>
                        <button onClick={() => cargarProductos('caducados')} className="btn btn-danger">Caducados</button>
                    </div>
                </div>
                <div className="container-fluid">
                    <table className="table table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Nro</th>
                                <th>Nombre</th>
                                <th>stock</th>
                                <th>estado</th>
                                <th>Precio</th>
                                <th>Imagen</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos && productos.map((producto, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{producto.nombre}</td>
                                    <td>{producto.stock}</td>
                                    <td>{producto.estado.name}</td>
                                    <td>{producto.precio}</td>
                                    <td>
<img 
  src={producto.imagen_producto} 
  alt={producto.nombre} 
  style={{ width: '50px', height: '50px', borderRadius: '50%' }}
/>                                    </td>
                                    <td>
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <div id="editar">
      <Link href={'/producto/edit/' + producto.external_id} className="btn btn-primary">Editar</Link>
    </div>
    <div key={producto.external_id} className="upload-btn-wrapper" style={{ backgroundColor: '#007bff', padding: '8px 8px', borderRadius: '10px', marginLeft: '5px' }}>
    <label htmlFor={`file-upload-${producto.external_id}`} className="button" style={{ fontSize: '14px', borderRadius: '15px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true" style={{ marginRight: '8px', width: '16px', height: '16px' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125" stroke="#FFFFFF" strokeWidth="2"></path>
        <path d="M17 15V18M17 21V18M17 18H14M17 18H20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
      Imagen
    </label>
    <input id={`file-upload-${producto.external_id}`} type="file" onChange={(e) => handleUploadImage(e, producto.external_id)} style={{ display: 'none' }} />
  </div>
  </div>
</td>
                                    
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
export default mildware(Producto);