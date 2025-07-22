'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import Link from "next/link"
import Menu from "../components/menu"
import { get_bodega, activate_bodega, deactivate_bodega } from "@/hooks/Services_bodega"
import swal from 'sweetalert'
import './bodega.css'
import mildware from '../components/mildware'

function Bodega() {
    const [bodegas, setBodegas] = useState([])
    const [isLoaded, setIsLoaded] = useState(false)
    const token = Cookies.get('token')

    useEffect(() => {
        if (!isLoaded && token) {
            cargarBodegas()
        }
    }, [isLoaded, token])

    const cargarBodegas = async () => {
        try {
            const info = await get_bodega(token)
            if (info.code === 200) {
                setBodegas(info.datos || [])
            } else {
                console.error("Error al obtener bodegas:", info.datos?.error)
                swal("Error", "No se pudieron cargar las bodegas", "error")
            }
        } catch (error) {
            console.error("Error en la petición de bodegas:", error)
            swal("Error", "Error al conectar con el servidor", "error")
        } finally {
            setIsLoaded(true)
        }
    }

    const handleToggleEstado = async (external_id, estadoActual) => {
        const confirmacion = await swal({
            title: "¿Estás seguro?",
            text: `¿Quieres ${estadoActual ? "desactivar" : "activar"} esta bodega?`,
            icon: "warning",
            buttons: ["Cancelar", "Confirmar"],
            dangerMode: true,
        })

        if (confirmacion) {
            try {
                const response = estadoActual 
                    ? await deactivate_bodega(external_id, token)
                    : await activate_bodega(external_id, token)

                if (response?.code === 200) {
                    swal("Éxito", `Bodega ${estadoActual ? "desactivada" : "activada"} correctamente`, "success")
                    setBodegas(prev => prev.map(bodega => 
                        bodega.external_id === external_id 
                            ? { ...bodega, estado: !estadoActual } 
                            : bodega
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


    const formatCapacidad = (capacidad) => {
        if (!capacidad) return 'N/A'
        return `${capacidad} `
    }

    return (
        <div>
            <Menu />
            <main className="container text-center mt-5" style={{paddingLeft:"300px"}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <Link href="/bodega/new" className="btn btn-info">Nueva Bodega</Link>
                </div>
                <div className="container-fluid">
                    <table className="table table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Nro</th>
                                <th>Nombre</th>
                                <th>Ubicación</th>
                                <th>Capacidad Máxima</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoaded ? (
                                bodegas.length > 0 ? (
                                    bodegas.map((bodega, i) => (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td>{bodega.nombre}</td>
                                            <td>{bodega.ubicacion || 'N/A'}</td>
                                            <td>{formatCapacidad(bodega.capacidad_maxima)}</td>
                                            <td>
                                                <span className={`badge ${
                                                    bodega.estado ? 'bg-success' : 'bg-danger'
                                                }`}>
                                                    {bodega.estado ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                                                    <Link href={`/bodega/edit/${bodega.external_id}`} className="btn btn-primary btn-sm">Editar</Link>
                                                    <button 
                                                        onClick={() => handleToggleEstado(bodega.external_id, bodega.estado)}
                                                        className={`btn btn-sm ${
                                                            bodega.estado ? 'btn-warning' : 'btn-success'
                                                        }`}
                                                    >
                                                        {bodega.estado ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">No hay bodegas registradas</td>
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

export default mildware(Bodega)