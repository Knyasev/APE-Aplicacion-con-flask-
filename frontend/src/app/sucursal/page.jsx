'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import Link from "next/link"
import Menu from "../components/menu"
import { get_sucursal, deactivate_sucursal, activate_sucursal } from "@/hooks/Services_sucursal"
import swal from 'sweetalert'
import './sucursal.css'
import mildware from '../components/mildware'

function Sucursal() {
    const [sucursales, setSucursales] = useState([])
    const [isLoaded, setIsLoaded] = useState(false)
    const token = Cookies.get('token')

    useEffect(() => {
        if (!isLoaded && token) {
            cargarSucursales()
        }
    }, [isLoaded, token])

    const cargarSucursales = async () => {
        try {
            const info = await get_sucursal(token)
            if (info.code === 200) {
                setSucursales(info.datos || [])
                console
            } else {
                console.error("Error al obtener sucursales:", info.datos?.error)
                swal("Error", "No se pudieron cargar las sucursales", "error")
            }
        } catch (error) {
            console.error("Error en la petición de sucursales:", error)
            swal("Error", "Error al conectar con el servidor", "error")
        } finally {
            setIsLoaded(true)
        }
    }

    const handleToggleEstado = async (external_id, estadoActual) => {
        const confirmacion = await swal({
            title: "¿Estás seguro?",
            text: `¿Quieres ${estadoActual ? "desactivar" : "activar"} esta sucursal?`,
            icon: "warning",
            buttons: ["Cancelar", "Confirmar"],
            dangerMode: true,
        })

        if (confirmacion) {
            try {
                // Cambiamos el orden de los parámetros según tus métodos
                const response = estadoActual 
                    ? await deactivate_sucursal(external_id)
                    : await activate_sucursal(external_id)
                // Verificamos response.code ya que tus métodos devuelven el objeto data directamente
                if (response?.code === 200) {
                    swal("Éxito", `Sucursal ${estadoActual ? "desactivada" : "activada"} correctamente`, "success")
                    setSucursales(prev => prev.map(suc => 
                        suc.external_id === external_id 
                            ? {...suc, estado: !estadoActual} 
                            : suc
                    ))
                } else {
                    const errorMsg = response?.datos?.error || response?.message || "Operación fallida"
                    swal("Error", errorMsg, "error")
                }
            } catch (error) {
                console.error("Error al cambiar estado:", error)
                swal("Error", "No se pudo completar la operación", "error")
            }
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

    const obtenerNombreAdmin = (sucursal) => {
        if (sucursal.admin?.nombre) return sucursal.admin.nombre
        if (sucursal.usuario?.nombre) return sucursal.usuario.nombre
        return 'N/A'
    }

    return (
        <div>
            <Menu />
            <main className="container text-center mt-5" style={{paddingLeft:"300px"}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <Link href="/sucursal/new" className="btn btn-info">Nueva Sucursal</Link>
                </div>
                <div className="container-fluid">
                    <table className="table table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Nro</th>
                                <th>Nombre</th>
                                <th>Ubicación</th>
                                <th>Fecha Registro</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoaded ? (
                                sucursales.length > 0 ? (
                                    sucursales.map((sucursal, i) => (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td>{sucursal.nombre}</td>
                                            <td>{sucursal.ubicacion || 'N/A'}</td>
                                            <td>{formatFecha(sucursal.fecha_registro)}</td>
                                            <td>
                                                <span className={`badge ${
                                                    sucursal.estado ? 'bg-success' : 'bg-danger'
                                                }`}>
                                                    {sucursal.estado ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                                                    <Link href={`/sucursal/edit/${sucursal.external_id}`} className="btn btn-primary btn-sm">Editar</Link>
                                                    <button 
                                                        onClick={() => handleToggleEstado(sucursal.external_id, sucursal.estado)}
                                                        className={`btn btn-sm ${
                                                            sucursal.estado ? 'btn-warning' : 'btn-success'
                                                        }`}
                                                    >
                                                        {sucursal.estado ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">No hay sucursales registradas</td>
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
        </div>
    )
}

export default mildware(Sucursal)