'use client'
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from "next/link";
import Menu from "../components/menu";
import { get_product, listar_categorias } from "@/hooks/Services_product"; 
import swal from 'sweetalert';
import './producto.css';
import mildware from '../components/mildware';


function Producto() {
    const [productos, setProductos] = useState(null);
    const [categorias, setCategorias] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const token = Cookies.get('token');

    // Función optimizada para cargar categorías
    const cargarCategorias = async (productos) => {
        const categoriasMap = {};
        const promises = [];
        
        // Creamos promesas para todas las categorías únicas
        productos.forEach(producto => {
            if (producto.categoria_id && !categoriasMap[producto.categoria_id]) {
                promises.push(
                    listar_categorias(token, producto.categoria_id)
                        .then(response => {
                            if (response.code === 200) {
                                // Usamos response.datos.nombre según la estructura de respuesta
                                categoriasMap[producto.categoria_id] = response.datos.nombre;
                            } else {
                                console.warn(`Respuesta inesperada para categoría ${producto.categoria_id}:`, response);
                            }
                        })
                        .catch(error => {
                            console.error(`Error cargando categoría ${producto.categoria_id}:`, error);
                            categoriasMap[producto.categoria_id] = 'Error al cargar';
                        })
                );
                // Marcamos para no repetir
                categoriasMap[producto.categoria_id] = 'Cargando...'; 
            }
        });

        // Esperamos a que todas las promesas se completen
        await Promise.all(promises);
        setCategorias(categoriasMap);
    };

    useEffect(() => {
        if (!isLoaded && token) {
            get_product(token).then((info) => {
                if (info.code === 200) {
                    setProductos(info.datos);
                    cargarCategorias(info.datos).finally(() => {
                        setIsLoaded(true);
                        
                    });
                } else {
                    console.error("Error al obtener productos:", info.datos.error);
                    setIsLoaded(true);
                }
            }).catch(error => {
                console.error("Error en la petición de productos:", error);
                setIsLoaded(true);
            });
        }
    }, [isLoaded, token]);

    // Función para obtener el nombre de la categoría
    const obtenerNombreCategoria = (categoria_id) => {
        return categorias[categoria_id] || 'Sin categoría';
    };

    return (
        <div>
            <Menu />
            <main className="container text-center mt-5" style={{paddingLeft:"300px"}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <Link href="/producto/new" className="btn btn-info">Nuevo Producto</Link>
                </div>
                <div className="container-fluid">
                    <table className="table table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Nro</th>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Stock Actual</th>
                                <th>Categoría</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoaded ? (
                                productos?.length > 0 ? (
                                    productos.map((producto, i) => (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td>{producto.codigo}</td>
                                            <td>{producto.nombre}</td>
                                            <td>{producto.descripcion}</td>
                                            <td>{producto.stock_actual}</td>
                                            <td>{obtenerNombreCategoria(producto.categoria_id)}</td>
                                            <td>
                                                <span className={`badge ${
                                                    producto.estado === 'BUENO' ? 'bg-success' : 
                                                    producto.estado === 'POR_CADUCAR' ? 'bg-warning' : 
                                                    'bg-danger'
                                                }`}>
                                                    {producto.estado}
                                                </span>
                                            </td>
                                            
                                            <td>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Link href={`/producto/edit/${producto.external_id}`} className="btn btn-primary">Editar</Link>
                                                    
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="text-center py-4">No hay productos registrados</td>
                                    </tr>
                                )
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

export default mildware(Producto);