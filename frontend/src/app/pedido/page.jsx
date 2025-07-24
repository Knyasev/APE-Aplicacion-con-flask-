'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import Link from "next/link"
import Menu from "../components/menu"
import { get_person } from "@/hooks/Services_person"
import { get_sucursal_by_usuario } from "@/hooks/Services_sucursal"
import { 
  get_pedido_by_usuario_sucursal, 
  get_detalles_pedido,
  cambiar_estado_entregado,
  cambiar_estado_cancelado 
} from "@/hooks/Services_pedido"
import { get_product_by_id } from "@/hooks/Services_product"
import swal from 'sweetalert'
import './pedido.css'
import mildware from '../components/mildware'
import { useRouter } from 'next/navigation'

function Pedidos() {
    const [pedidos, setPedidos] = useState([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [sucursal, setSucursal] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [detallesPedido, setDetallesPedido] = useState([])
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
    const [loadingDetalles, setLoadingDetalles] = useState(false)
    const token = Cookies.get('token')
    const external_id = Cookies.get('external_id')
    const router = useRouter()

    useEffect(() => {
        if (!isLoaded && token && external_id) {
            cargarPedidos()
        }
    }, [isLoaded, token, external_id])

    const cargarPedidos = async () => {
        try {
            const personaInfo = await get_person(token, external_id)
            if (personaInfo.code !== 200) {
                throw new Error("Error al obtener información de la persona")
            }
            
            const admin_id = personaInfo.datos.id
            const sucursalInfo = await get_sucursal_by_usuario(admin_id, token)
            if (sucursalInfo.code !== 200) {
                throw new Error("Error al obtener sucursal del usuario")
            }
            
            setSucursal(sucursalInfo.datos)
            const sucursal_id = sucursalInfo.datos.id
            const pedidosInfo = await get_pedido_by_usuario_sucursal(admin_id, sucursal_id, token)
            
            if (pedidosInfo.code === 200) {
                setPedidos(pedidosInfo.datos || [])
            } else {
                throw new Error(pedidosInfo.datos?.error || "Error al obtener pedidos")
            }
        } catch (error) {
            console.error("Error en la carga de pedidos:", error)
            swal("Error", error.message || "Error al cargar los pedidos", "error")
        } finally {
            setIsLoaded(true)
        }
    }

    const cambiarEstadoEntregado = async (pedido) => {
        try {
            const resultado = await cambiar_estado_entregado(pedido.external_id, token);
            if (resultado.code === 200) {
                swal("Éxito", "Pedido marcado como entregado", "success");
                cargarPedidos();
                setShowModal(false);
            } else {
                throw new Error(resultado.datos?.error || "Error al cambiar estado");
            }
        } catch (error) {
            swal("Error", error.message, "error");
        }
    };

    const cambiarEstadoCancelado = async (pedido) => {
        try {
            const resultado = await cambiar_estado_cancelado(pedido.external_id, token);
            if (resultado.code === 200) {
                swal("Éxito", "Pedido cancelado correctamente", "success");
                cargarPedidos();
                setShowModal(false);
            } else {
                throw new Error(resultado.datos?.error || "Error al cancelar pedido");
            }
        } catch (error) {
            swal("Error", error.message, "error");
        }
    };

    const cargarDetallesPedido = async (pedido) => {
        setLoadingDetalles(true)
        setPedidoSeleccionado(pedido)
        try {
            const detallesResponse = await get_detalles_pedido(pedido.id, token)
            if (detallesResponse.code !== 200) {
                throw new Error("Error al obtener detalles del pedido")
            }

            const detallesConProductos = await Promise.all(
                detallesResponse.datos.map(async (detalle) => {
                    try {
                        const productoResponse = await get_product_by_id(detalle.producto_id, token)
                        return {
                            ...detalle,
                            productoNombre: productoResponse.nombre || `Producto ID: ${detalle.producto_id}`,
                            precio_unitario: detalle.precio_unitario || (detalle.subtotal / detalle.cantidad)
                        }
                    } catch (error) {
                        console.error(`Error al obtener producto ${detalle.producto_id}:`, error)
                        return {
                            ...detalle,
                            productoNombre: `Producto ID: ${detalle.producto_id} (no disponible)`,
                            precio_unitario: detalle.precio_unitario || (detalle.subtotal / detalle.cantidad)
                        }
                    }
                })
            )

            setDetallesPedido(detallesConProductos)
            setShowModal(true)
        } catch (error) {
            console.error("Error al cargar detalles:", error)
            swal("Error", error.message || "Error al cargar los detalles del pedido", "error")
        } finally {
            setLoadingDetalles(false)
        }
    }

    const formatFecha = (fechaString) => {
        if (!fechaString) return 'N/A'
        const fecha = new Date(fechaString)
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getEstadoBadge = (estado) => {
        const estados = {
            'CREADO': 'bg-primary',
            'EN_PROCESO': 'bg-warning text-dark',
            'COMPLETADO': 'bg-success',
            'CANCELADO': 'bg-danger'
        }
        return estados[estado] || 'bg-secondary'
    }

    return (
        <div>
            <Menu />
            <main className="container text-center mt-5" style={{paddingLeft:"300px"}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2>Pedidos de {sucursal?.nombre || 'Sucursal'}</h2>
                    <Link href="/pedido/new" className="btn btn-info">Nuevo Pedido</Link>
                </div>
                <div className="container-fluid">
                    <table className="table table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Nro</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Método Pago</th>
                                <th>Total</th>
                                <th>Productos</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoaded ? (
                                pedidos.length > 0 ? (
                                    pedidos.map((pedido, i) => (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td>{formatFecha(pedido.fecha)}</td>
                                            <td>
                                                <span className={`badge ${getEstadoBadge(pedido.estado)}`}>
                                                    {pedido.estado}
                                                </span>
                                            </td>
                                            <td>{pedido.metodo_de_pago || 'N/A'}</td>
                                            <td>${pedido.precio_total?.toFixed(2) || '0.00'}</td>
                                            <td>
                                                {pedido.detalles?.length || 0} productos
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                                                    <button 
                                                        onClick={() => cargarDetallesPedido(pedido)} 
                                                        className="btn btn-secondary btn-sm"
                                                    >
                                                        Detalles
                                                    </button>
                                                    {pedido.estado === 'CREADO' && (
                                                        <button 
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => router.push(`/pedido/edit/${pedido.external_id}`)}
                                                        >
                                                            Editar
                                                        </button>
                                                    )}
                                                    {pedido.estado === 'CREADO' && (
                                                        <button 
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => cambiarEstadoEntregado(pedido)}
                                                        >
                                                            Entregar
                                                        </button>
                                                    )}
                                                    {pedido.estado === 'CREADO' && (
                                                        <button 
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => cambiarEstadoCancelado(pedido)}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">No hay pedidos registrados</td>
                                    </tr>
                                )
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
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
                <div className="modal-backdrop" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1040,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '5px',
                        maxWidth: '800px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <div className="modal-header" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3>Detalles del Pedido #{pedidoSeleccionado?.id}</h3>
                            <button 
                                onClick={() => setShowModal(false)} 
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className="mb-3">
                            <p><strong>Fecha:</strong> {formatFecha(pedidoSeleccionado?.fecha)}</p>
                            <p><strong>Estado:</strong> <span className={`badge ${getEstadoBadge(pedidoSeleccionado?.estado)}`}>
                                {pedidoSeleccionado?.estado}
                            </span></p>
                            <p><strong>Método de Pago:</strong> {pedidoSeleccionado?.metodo_de_pago || 'N/A'}</p>
                            <p><strong>Total:</strong> ${pedidoSeleccionado?.precio_total?.toFixed(2) || '0.00'}</p>
                        </div>
                        
                        {loadingDetalles ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando detalles...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="modal-body">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Precio Unitario</th>
                                                <th>Cantidad</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detallesPedido.map((detalle, index) => (
                                                <tr key={index}>
                                                    <td>{detalle.productoNombre}</td>
                                                    <td>${detalle.precio_unitario?.toFixed(2) || '0.00'}</td>
                                                    <td>{detalle.cantidad}</td>
                                                    <td>${detalle.subtotal?.toFixed(2) || '0.00'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                                                <td><strong>${pedidoSeleccionado?.precio_total?.toFixed(2) || '0.00'}</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <div className="modal-footer" style={{ marginTop: '20px' }}>
                                    {pedidoSeleccionado?.estado === 'CREADO' && (
                                        <>
                                            <button 
                                                className="btn btn-success me-2"
                                                onClick={() => cambiarEstadoEntregado(pedidoSeleccionado)}
                                            >
                                                Marcar como Entregado
                                            </button>
                                            <button 
                                                className="btn btn-danger"
                                                onClick={() => cambiarEstadoCancelado(pedidoSeleccionado)}
                                            >
                                                Cancelar Pedido
                                            </button>
                                        </>
                                    )}
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default mildware(Pedidos)