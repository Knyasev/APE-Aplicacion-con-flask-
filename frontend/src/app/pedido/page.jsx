'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import Link from "next/link"
import Menu from "../components/menu"
import { get_person } from "@/hooks/Services_person"
import { get_sucursal_by_usuario } from "@/hooks/Services_sucursal"
import { get_pedido_by_usuario_sucursal } from "@/hooks/Services_pedido"
import { get_detalles_pedido } from "@/hooks/Services_pedido"
import { get_product_by_id } from "@/hooks/Services_product"
import swal from 'sweetalert'
import './pedido.css'
import mildware from '../components/mildware'

function Pedidos() {
    const [pedidos, setPedidos] = useState([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [sucursal, setSucursal] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [detallesPedido, setDetallesPedido] = useState([])
    const [loadingDetalles, setLoadingDetalles] = useState(false)
    const token = Cookies.get('token')
    const external_id = Cookies.get('external_id')

    useEffect(() => {
        if (!isLoaded && token && external_id) {
            cargarPedidos()
        }
    }, [isLoaded, token, external_id])

    const cargarPedidos = async () => {
        try {
            // 1. Obtener información de la persona
            const personaInfo = await get_person(token, external_id)
            console.log("Información de la persona:", personaInfo)
            if (personaInfo.code !== 200) {
                throw new Error("Error al obtener información de la persona")
            }
            
            const admin_id = personaInfo.datos.id
            
            // 2. Obtener sucursal del usuario
            const sucursalInfo = await get_sucursal_by_usuario(admin_id, token)
            console.log("Información de la sucursal:", sucursalInfo)
            if (sucursalInfo.code !== 200) {
                throw new Error("Error al obtener sucursal del usuario")
            }
            
            setSucursal(sucursalInfo.datos)
            const sucursal_id = sucursalInfo.datos.id
            
            // 3. Obtener pedidos de la sucursal
            const pedidosInfo = await get_pedido_by_usuario_sucursal(admin_id, sucursal_id, token)
            console.log("Información de los pedidos:", pedidosInfo)
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

    const cargarDetallesPedido = async (pedido_id) => {
    setLoadingDetalles(true)
    try {
        // 1. Obtener detalles del pedido
        const detallesResponse = await get_detalles_pedido(pedido_id, token)
        if (detallesResponse.code !== 200) {
            throw new Error("Error al obtener detalles del pedido")
        }

        // 2. Para cada detalle, obtener información del producto
        const detallesConProductos = await Promise.all(
            detallesResponse.datos.map(async (detalle) => {
                try {

                    const productoResponse = await get_product_by_id(detalle.producto_id, token)
                    //console.log(`Producto ${detalle.producto_id} cargado:`, productoResponse)
                    return {
                        ...detalle,
                        productoNombre: productoResponse.nombre || `Producto ID: ${detalle.producto_id}`,
                        precio_unitario: detalle.precio_unitario || 0
                    }
                } catch (error) {
                    console.error(`Error al obtener producto ${detalle.producto_id}:`, error)
                    return {
                        ...detalle,
                        productoNombre: `Producto ID: ${detalle.producto_id} (no disponible)`,
                        precio_unitario: detalle.precio_unitario || 0
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
                                <th>Productos</th>
                                <th>Total Solicitado</th>
                                <th>Total Entregado</th>
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
                                            <td>
                                                {pedido.detalles?.length || 0} productos
                                            </td>
                                            <td>
                                                {pedido.detalles?.reduce((sum, detalle) => sum + detalle.cantidad_solicitada, 0) || 0}
                                            </td>
                                            <td>
                                                {pedido.detalles?.reduce((sum, detalle) => sum + detalle.cantidad_entregada, 0) || 0}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                                                    <button 
                                                        onClick={() => cargarDetallesPedido(pedido.id)} 
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        Detalles
                                                    </button>
                                                    {pedido.estado === 'CREADO' && (
                                                        <button className="btn btn-warning btn-sm">Procesar</button>
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

            {/* Modal para mostrar detalles del pedido */}
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
                            <h3>Detalles del Pedido</h3>
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
                        
                        {loadingDetalles ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando detalles...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="modal-body">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad Solicitada</th>
                                            <th>Cantidad Entregada</th>
                                            <th>Precio Unitario</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detallesPedido.map((detalle, index) => (
                                            <tr key={index}>
                                                <td>{detalle.productoNombre}</td>
                                                <td>{detalle.cantidad_solicitada}</td>
                                                <td>{detalle.cantidad_entregada}</td>
                                                <td>${detalle.precio_unitario?.toFixed(2) || '0.00'}</td>
                                                <td>${((detalle.cantidad_entregada || 0) * (detalle.precio_unitario || 0)).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default mildware(Pedidos)