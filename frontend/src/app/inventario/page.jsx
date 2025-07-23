'use client'
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from "next/link";
import Menu from "../components/menu";
import { get_product,get_stock_by_producto } from "@/hooks/Services_product";
import {get_inventory_by_producto } from "@/hooks/Services_inventory";
import { get_bodega_by_id } from "@/hooks/Services_bodega";
import swal from 'sweetalert';
import './inventario.css';
import mildware from '../components/mildware';
import MovimientosModal from '../components/MovimientosModal';

function Inventario() {
    const [productos, setProductos] = useState(null);
    const [stockData, setStockData] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [inventoryData, setInventoryData] = useState([]);
    const [bodegasInfo, setBodegasInfo] = useState({});
    const token = Cookies.get('token');

    useEffect(() => {
        if (!isLoaded && token) {
            get_product(token).then((info) => {
                if (info.code === 200) {
                    setProductos(info.datos);
                    cargarStocks(info.datos).finally(() => {
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

    const cargarStocks = async (productos) => {
        const stockMap = {};
        const promises = productos.map(producto => {
            return get_stock_by_producto( producto.id,token)
                .then(response => {
                    if (response.code === 200) {
                        stockMap[producto.id] = {
                            cantidad: response.datos.cantidad,
                            pvp: response.datos.pvp
                        };
                    }
                })
                .catch(error => {
                    console.error(`Error cargando stock para producto ${producto.id}:`, error);
                });
        });

        await Promise.all(promises);
        setStockData(stockMap);
    };

    const verMovimientos = async (productoId) => {
        setSelectedProductId(productoId);
        setShowModal(true);
        
        try {
            // Obtener movimientos de inventario
            const inventoryResponse = await get_inventory_by_producto( productoId,token);

            if (inventoryResponse.code === 200) {
                setInventoryData(inventoryResponse.datos);
                //console.log("Movimientos de inventario:", inventoryResponse.datos);
                // Obtener información de bodegas
                const bodegaIds = [...new Set(inventoryResponse.datos.map(item => item.bodega_id))];
                const bodegasMap = {};
                
                await Promise.all(bodegaIds.map(async bodegaId => {
                    const bodegaResponse = await get_bodega_by_id(bodegaId, token);
                    if (bodegaResponse.code === 200) {
                        bodegasMap[bodegaId] = bodegaResponse.datos.nombre;
                    }
                }));
                
                setBodegasInfo(bodegasMap);
            }
        } catch (error) {
            console.error('Error cargando movimientos:', error);
            swal({
                title: "Error",
                text: "No se pudieron cargar los movimientos",
                icon: "error"
            });
        }
    };

    return (
        <div>
            <Menu />
            <main className="container text-center mt-5" style={{paddingLeft:"300px"}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <Link href="/inventario/entry" className="btn btn-info">Registrar Entrada</Link>
                    <Link href="/inventario/exit" className="btn btn-info">Registrar Salida</Link>
                </div>
                <div className="container-fluid">
                    <table className="table table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Nro</th>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Stock</th>
                                <th>Precio Venta</th>
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
                                            <td>{stockData[producto.id]?.cantidad || 'N/A'}</td>
                                            <td>${stockData[producto.id]?.pvp || 'N/A'}</td>
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
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                                                    <Link href={`/producto/edit/${producto.external_id}`} className="btn btn-primary">Editar</Link>
                                                    <button 
                                                        onClick={() => verMovimientos(producto.id)} 
                                                        className="btn btn-secondary"
                                                    >
                                                        Ver Movimientos
                                                    </button>
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

            {showModal && (
                <MovimientosModal 
                    productoId={selectedProductId}
                    onClose={() => setShowModal(false)}
                    movimientos={inventoryData}
                    bodegas={bodegasInfo}
                />
            )}
        </div>
    );
}

export default mildware(Inventario);