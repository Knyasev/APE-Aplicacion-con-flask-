'use client'
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from "next/link";
import Menu from "@/app/components/menu";
import { get_productos_id } from "@/hooks/Services_product";
import { get_inventario_by_bodega, get_inventory_by_fecha } from "@/hooks/Services_inventory";
import { get_bodega_by_usuario } from "@/hooks/Services_bodega";
import { get_sucursal_by_id } from "@/hooks/Services_sucursal";
import { get_person } from "@/hooks/Services_person";
import swal from 'sweetalert';
import '../inventario.css';
import mildware from '@/app/components/mildware';

function Historial() {
    const [inventario, setInventario] = useState([]);
    const [inventarioDetallado, setInventarioDetallado] = useState([]);
    const [inventarioFiltrado, setInventarioFiltrado] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [bodegaId, setBodegaId] = useState(null);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [busquedaGeneral, setBusquedaGeneral] = useState('');
    const [loading, setLoading] = useState(false);
    const token = Cookies.get('token');
    const external_id = Cookies.get('external_id');

    useEffect(() => {
        if (!isLoaded && token && external_id) {
            get_person(token, external_id).then(response => {
                if (response.code === 200) {
                    const personaId = response.datos.id;
                    return get_bodega_by_usuario(personaId, token);
                }
            }).then(bodegaResponse => {
                if (bodegaResponse?.code === 200) {
                    setBodegaId(bodegaResponse.datos.id);
                    return cargarInventario(bodegaResponse.datos.id);
                }
            }).catch(error => {
                console.error('Error cargando datos iniciales:', error);
                setIsLoaded(true);
            });
        }
    }, [isLoaded, token, external_id]);

    useEffect(() => {
        if (busquedaGeneral) {
            const termino = busquedaGeneral.toLowerCase();
            const resultados = inventarioDetallado.filter(item => {
                return (
                    item.producto.nombre.toLowerCase().includes(termino) ||
                    item.producto.codigo.toLowerCase().includes(termino) ||
                    (item.proveedor && item.proveedor.toLowerCase().includes(termino)) ||
                    (item.tipo_comprobante && item.tipo_comprobante.toLowerCase().includes(termino)) ||
                    (item.sucursal_nombre && item.sucursal_nombre.toLowerCase().includes(termino)) ||
                    (item.numero_comprobante && item.numero_comprobante.toLowerCase().includes(termino))
                );
            });
            setInventarioFiltrado(resultados);
        } else {
            setInventarioFiltrado(inventarioDetallado);
        }
    }, [busquedaGeneral, inventarioDetallado]);

    const cargarDetallesAdicionales = async (inventarioData) => {
        const inventarioConDetalles = await Promise.all(
            inventarioData.map(async (item) => {
                try {
                    const productoResponse = await get_productos_id(item.producto_id, token);
                    const producto = productoResponse.code === 200 ? productoResponse.datos : null;
                    
                    let sucursalNombre = 'N/A';
                    if (item.sucursal_id) {
                        const sucursalResponse = await get_sucursal_by_id(item.sucursal_id, token);
                        if (sucursalResponse.code === 200) {
                            sucursalNombre = sucursalResponse.datos.nombre;
                        }
                    }
                    
                    return {
                        ...item,
                        producto: {
                            nombre: producto?.nombre || 'N/A',
                            codigo: producto?.codigo || 'N/A'
                        },
                        sucursal_nombre: sucursalNombre,
                        precio_total: item.precio_total,
                        precio_unitario: item.precio_unitario,
                        proveedor: item.proveedor,
                        tipo_comprobante: item.tipo_comprobante
                    };
                } catch (error) {
                    console.error('Error cargando detalles adicionales:', error);
                    return {
                        ...item,
                        producto: {
                            nombre: 'N/A',
                            codigo: 'N/A'
                        },
                        sucursal_nombre: 'N/A'
                    };
                }
            })
        );
        
        setInventarioDetallado(inventarioConDetalles);
        setInventarioFiltrado(inventarioConDetalles);
    };

    const cargarInventario = async (bodegaId, fechaInicio = '', fechaFin = '') => {
        setLoading(true);
        try {
            let response;
            if (fechaInicio && fechaFin) {
                response = await get_inventory_by_fecha(
                    `fecha?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, 
                    token
                );
            } else {
                response = await get_inventario_by_bodega(bodegaId, token);
            }

            if (response.code === 200) {
                setInventario(response.datos);
                await cargarDetallesAdicionales(response.datos);
            } else {
                swal({
                    title: "Error",
                    text: response.datos.error || "Error al cargar el inventario",
                    icon: "error"
                });
            }
        } catch (error) {
            console.error('Error cargando inventario:', error);
            swal({
                title: "Error",
                text: "Error al cargar el inventario",
                icon: "error"
            });
        } finally {
            setLoading(false);
            setIsLoaded(true);
        }
    };

    const handleFiltrar = (e) => {
        e.preventDefault();
        if (bodegaId) {
            cargarInventario(bodegaId, fechaInicio, fechaFin);
        }
    };

    const handleLimpiarFiltros = () => {
        setFechaInicio('');
        setFechaFin('');
        setBusquedaGeneral('');
        if (bodegaId) {
            cargarInventario(bodegaId);
        }
    };

    return (
        <div>
            <Menu />
            <main className="container text-center mt-5" style={{paddingLeft:"300px"}}>
                <div className="card mb-4">
                    <div className="card-header">
                        <h4>Filtros de Inventario</h4>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleFiltrar}>
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <div className="input-group">
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Buscar por producto, código, proveedor, comprobante, sucursal..."
                                            value={busquedaGeneral}
                                            onChange={(e) => setBusquedaGeneral(e.target.value)}
                                        />
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary"
                                            onClick={() => setBusquedaGeneral('')}
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <label className="form-label">Fecha Inicio</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Fecha Fin</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-4 d-flex align-items-end">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary me-2"
                                        disabled={loading}
                                    >
                                        {loading ? 'Filtrando...' : 'Filtrar por fecha'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={handleLimpiarFiltros}
                                        disabled={loading}
                                    >
                                        Limpiar todo
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="container-fluid">
                    <table className="table table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Nro</th>
                                <th>Producto</th>
                                <th>Código</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Precio Total</th>
                                <th>Tipo Movimiento</th>
                                <th>Proveedor</th>
                                <th>Tipo Comprobante</th>
                                <th>Sucursal</th>
                                <th>Fecha</th>
                                <th>Comprobante</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoaded ? (
                                inventarioFiltrado.length > 0 ? (
                                    inventarioFiltrado.map((item, i) => (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td>{item.producto.nombre}</td>
                                            <td>{item.producto.codigo}</td>
                                            <td>{item.cantidad}</td>
                                            <td>${item.precio_unitario}</td>
                                            <td>${item.precio_total}</td>
                                            <td>
                                                <span className={`badge ${
                                                    item.tipo === 'ENTRADA' ? 'bg-success' : 'bg-danger'
                                                }`}>
                                                    {item.tipo}
                                                </span>
                                            </td>
                                            <td>{item.proveedor || 'N/A'}</td>
                                            <td>{item.tipo_comprobante || 'N/A'}</td>
                                            <td>{item.sucursal_nombre}</td>
                                            <td>{new Date(item.fecha).toLocaleDateString()}</td>
                                            <td>{item.numero_comprobante || 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="12" className="text-center py-4">
                                            {busquedaGeneral ? "No hay resultados para tu búsqueda" : "No hay registros de inventario"}
                                        </td>
                                    </tr>
                                )
                            ) : (
                                <tr>
                                    <td colSpan="12" className="text-center py-4">
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

export default mildware(Historial);