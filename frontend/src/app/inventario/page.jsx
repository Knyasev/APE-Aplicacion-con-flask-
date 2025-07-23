'use client'
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from "next/link";
import Menu from "../components/menu";
import { get_product, get_stock_by_producto } from "@/hooks/Services_product";
import { get_inventory_by_producto } from "@/hooks/Services_inventory";
import { get_bodega_by_id, get_bodega } from "@/hooks/Services_bodega";
import { get_sucursal_by_bodega_id } from "@/hooks/Services_sucursal";
import { registrar_salida_inventario } from "@/hooks/Services_inventory";
import swal from 'sweetalert';
import './inventario.css';
import mildware from '../components/mildware';
import MovimientosModal from '../components/MovimientosModal';

function Inventario() {
    const [productos, setProductos] = useState(null);
    const [stockData, setStockData] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const [showMovimientosModal, setShowMovimientosModal] = useState(false);
    const [showSalidaModal, setShowSalidaModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [selectedProductData, setSelectedProductData] = useState(null);
    const [inventoryData, setInventoryData] = useState([]);
    const [bodegasInfo, setBodegasInfo] = useState({});
    const [bodegas, setBodegas] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [formData, setFormData] = useState({
        producto_id: '',
        cantidad: '',
        sucursal_id: '',
        bodega_id: ''
    });
    const [loading, setLoading] = useState(false);
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

            // Cargar bodegas disponibles
            get_bodega(token).then(response => {
                if (response.code === 200) {
                    setBodegas(response.datos);
                }
            });
        }
    }, [isLoaded, token]);

    const cargarStocks = async (productos) => {
        const stockMap = {};
        const promises = productos.map(producto => {
            return get_stock_by_producto(producto.id, token)
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
        setShowMovimientosModal(true);
        
        try {
            const inventoryResponse = await get_inventory_by_producto(productoId, token);
            if (inventoryResponse.code === 200) {
                setInventoryData(inventoryResponse.datos);
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

    const abrirSalidaModal = (producto) => {
        setSelectedProductId(producto.id);
        setSelectedProductData(producto);
        setFormData({
            producto_id: producto.id,
            cantidad: '',
            sucursal_id: '',
            bodega_id: ''
        });
        setShowSalidaModal(true);
    };

const handleBodegaChange = async (e) => {
    const bodegaId = e.target.value;
    setFormData({...formData, bodega_id: bodegaId, sucursal_id: ''});
    
    if (bodegaId) {
        try {
            const response = await get_sucursal_by_bodega_id(bodegaId, token);
            console.log("Respuesta sucursales:", response); // Agrega esto para debug
            
            if (response.code === 200) {
                // Asegúrate de que response.datos es un array
                const sucursalesData = Array.isArray(response.datos) ? response.datos : [response.datos];
                setSucursales(sucursalesData);
            } else {
                setSucursales([]); // Si no hay datos válidos, establece un array vacío
            }
        } catch (error) {
            console.error('Error cargando sucursales:', error);
            setSucursales([]);
        }
    } else {
        setSucursales([]);
    }
};

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleSubmitSalida = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await registrar_salida_inventario({
                producto_id: formData.producto_id,
                cantidad: Number(formData.cantidad),
                sucursal_id: Number(formData.sucursal_id),
                bodega_id: Number(formData.bodega_id)
            }, token);

            if (response.status === 200) {
                swal({
                    title: "Éxito",
                    text: "Salida registrada correctamente",
                    icon: "success",
                    button: "Aceptar"
                });
                setShowSalidaModal(false);
                // Actualizar datos
                cargarStocks(productos);
            } else {
                swal({
                    title: "Error",
                    text: response.datos.error || "Error al registrar la salida",
                    icon: "error",
                    button: "Aceptar"
                });
            }
        } catch (error) {
            console.error('Error registrando salida:', error);
            swal({
                title: "Error",
                text: "Error al registrar la salida",
                icon: "error",
                button: "Aceptar"
            });
        } finally {
            setLoading(false);
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
                                                    <button 
                                                        onClick={() => abrirSalidaModal(producto)} 
                                                        className="btn btn-danger"
                                                    >
                                                        Registrar Salida
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

            {showMovimientosModal && (
                <MovimientosModal 
                    productoId={selectedProductId}
                    onClose={() => setShowMovimientosModal(false)}
                    movimientos={inventoryData}
                    bodegas={bodegasInfo}
                />
            )}

            {showSalidaModal && (
                <div className="modal" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Registrar Salida de Producto</h5>
                                <button type="button" className="btn-close" onClick={() => setShowSalidaModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmitSalida}>
                                    <div className="mb-3">
                                        <label className="form-label">Producto:</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={selectedProductData?.nombre || ''} 
                                            readOnly 
                                        />
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label className="form-label">Bodega:</label>
                                        <select 
                                            name="bodega_id"
                                            className="form-control"
                                            value={formData.bodega_id}
                                            onChange={handleBodegaChange}
                                            required
                                        >
                                            <option value="">Seleccione una bodega</option>
                                            {bodegas.map(bodega => (
                                                <option key={bodega.id} value={bodega.id}>
                                                    {bodega.nombre} - {bodega.ubicacion}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label className="form-label">Sucursal Destino:</label>
                                        <select 
                                            name="sucursal_id"
                                            className="form-control"
                                            value={formData.sucursal_id}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.bodega_id}
                                        >
                                            <option value="">Seleccione una sucursal</option>
                                            {sucursales.map(sucursal => (
                                                <option key={sucursal.id} value={sucursal.id}>
                                                    {sucursal.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label className="form-label">Cantidad:</label>
                                        <input 
                                            type="number" 
                                            name="cantidad"
                                            className="form-control" 
                                            value={formData.cantidad}
                                            onChange={handleInputChange}
                                            min="1"
                                            max={stockData[selectedProductId]?.cantidad || ''}
                                            required
                                        />
                                        <small className="text-muted">
                                            Stock disponible: {stockData[selectedProductId]?.cantidad || 'N/A'}
                                        </small>
                                    </div>
                                    
                                    <div className="modal-footer">
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary" 
                                            onClick={() => setShowSalidaModal(false)}
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Registrando...' : 'Registrar Salida'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default mildware(Inventario);