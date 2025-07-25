'use client'
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from "next/link";
import Menu from "../components/menu";
import { get_product, get_stock_by_producto } from "@/hooks/Services_product";
import { get_inventory_by_producto } from "@/hooks/Services_inventory";
import { get_bodega_by_id } from "@/hooks/Services_bodega";
import swal from 'sweetalert';
import './stock.css';
import mildware from '../components/mildware';

function Stock() {
    const [productos, setProductos] = useState(null);
    const [productosFiltrados, setProductosFiltrados] = useState(null);
    const [inventarios, setInventarios] = useState({});
    const [stocks, setStocks] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const token = Cookies.get('token');

    // Función para procesar y convertir los datos del stock
    const procesarDatosStock = (stockData) => {
        return {
            cantidad: parseFloat(stockData.cantidad) || 0,
            precio: parseFloat(stockData.precio) || 0,
            rawData: stockData
        };
    };

    // Función para filtrar productos
    const filtrarProductos = () => {
        if (!busqueda || !productos) {
            setProductosFiltrados(productos);
            return;
        }

        const termino = busqueda.toLowerCase();
        const resultados = productos.filter(producto => {
            // Buscar por código
            if (producto.codigo.toLowerCase().includes(termino)) {
                return true;
            }
            
            // Buscar por nombre
            if (producto.nombre.toLowerCase().includes(termino)) {
                return true;
            }
            
            // Buscar por bodega
            if (inventarios[producto.id] && inventarios[producto.id].toLowerCase().includes(termino)) {
                return true;
            }
            
            return false;
        });

        setProductosFiltrados(resultados);
    };

    // Función para cargar información de inventario y stock para un producto
    const cargarInformacionAdicional = async (producto_id) => {
        try {
            // Cargar información del inventario (bodega)
            const invResponse = await get_inventory_by_producto(producto_id, token);
            if (invResponse.code === 200 && invResponse.datos.length > 0) {
                const bodegasUnicas = [];
                const bodegasVistas = new Set();
                
                invResponse.datos.forEach(movimiento => {
                    if (!bodegasVistas.has(movimiento.bodega_id)) {
                        bodegasVistas.add(movimiento.bodega_id);
                        bodegasUnicas.push(movimiento);
                    }
                });

                const bodegasNombres = await Promise.all(
                    bodegasUnicas.map(async movimiento => {
                        const bodegaInfo = await get_bodega_by_id(movimiento.bodega_id, token);
                        return {
                            bodega_id: movimiento.bodega_id,
                            nombre: bodegaInfo.code === 200 ? bodegaInfo.datos.nombre : 'Desconocida'
                        };
                    })
                );

                const nombresBodegas = bodegasNombres.map(b => b.nombre).join(', ');
                
                setInventarios(prev => ({
                    ...prev,
                    [producto_id]: nombresBodegas || 'Sin bodega asignada'
                }));
            }

            // Cargar información del stock
            const stockResponse = await get_stock_by_producto(producto_id, token);
            if (stockResponse.code === 200 && stockResponse.datos) {
                const stockProcesado = procesarDatosStock(stockResponse.datos);
                setStocks(prev => ({
                    ...prev,
                    [producto_id]: stockProcesado
                }));
            }
        } catch (error) {
            console.error(`Error cargando información adicional para producto ${producto_id}:`, error);
        }
    };

    useEffect(() => {
        if (!isLoaded && token) {
            get_product(token).then((info) => {
                if (info.code === 200) {
                    setProductos(info.datos);
                    setProductosFiltrados(info.datos);
                    
                    const promises = info.datos.map(producto => 
                        cargarInformacionAdicional(producto.id)
                    );
                    
                    Promise.all(promises).finally(() => {
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

    useEffect(() => {
        filtrarProductos();
    }, [busqueda, productos, inventarios]);

    return (
        <div>
            <Menu />
            <main className="container text-center mt-5" style={{paddingLeft:"300px"}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div className="input-group" style={{ width: '300px' }}>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Buscar por código, nombre o bodega..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <button className="btn btn-outline-secondary" type="button" onClick={filtrarProductos}>
                            <i className="bi bi-search"></i>
                        </button>
                    </div>
                </div>
                <div className="container-fluid">
                    <table className="table table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Nro</th>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Bodega(s)</th>
                                <th>Stock</th>
                                <th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoaded ? (
                                productosFiltrados?.length > 0 ? (
                                    productosFiltrados.map((producto, i) => (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td>{producto.codigo}</td>
                                            <td>{producto.nombre}</td>
                                            <td>
                                                {inventarios[producto.id] || 
                                                 <span className="text-muted">Cargando...</span>}
                                            </td>
                                            <td>
                                                {stocks[producto.id]?.cantidad !== undefined ? 
                                                 stocks[producto.id].cantidad.toFixed(2) : 
                                                 <span className="text-muted">Cargando...</span>}
                                            </td>
                                            <td>
                                                {stocks[producto.id]?.precio !== undefined ? 
                                                 `$${stocks[producto.id].precio.toFixed(2)}` : 
                                                 <span className="text-muted">Cargando...</span>}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">
                                            {busqueda ? "No se encontraron resultados" : "No hay productos registrados"}
                                        </td>
                                    </tr>
                                )
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
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

export default mildware(Stock);