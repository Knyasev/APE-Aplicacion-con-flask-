'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import Link from "next/link"
import Menu from "../components/menu"
import { get_categoria } from "@/hooks/Services_product"
import swal from 'sweetalert'
import './categoria.css'
import mildware from '../components/mildware'

function CategoriaProducto() {
    const [categorias, setCategorias] = useState([])
    const [categoriasFiltradas, setCategoriasFiltradas] = useState([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const token = Cookies.get('token')

    useEffect(() => {
        if (!isLoaded && token) {
            cargarCategorias()
        }
    }, [isLoaded, token])

    useEffect(() => {
        // Filtrar categorías cuando cambia la búsqueda
        if (busqueda) {
            const filtradas = categorias.filter(categoria =>
                categoria.nombre.toLowerCase().includes(busqueda.toLowerCase())
            );
            setCategoriasFiltradas(filtradas)
        } else {
            setCategoriasFiltradas(categorias)
        }
    }, [busqueda, categorias])

    const cargarCategorias = async () => {
        try {
            const info = await get_categoria(token)
            if (info.code === 200) {
                setCategorias(info.datos || [])
                setCategoriasFiltradas(info.datos || [])
            } else {
                console.error("Error al obtener categorías:", info.datos?.error)
                swal("Error", "No se pudieron cargar las categorías", "error")
            }
        } catch (error) {
            console.error("Error en la petición de categorías:", error)
            swal("Error", "Error al conectar con el servidor", "error")
        } finally {
            setIsLoaded(true)
        }
    }

    const handleBusquedaChange = (e) => {
        setBusqueda(e.target.value)
    }

    return (
        <div>
            <Menu />
            <main className="container text-center mt-5" style={{paddingLeft:"300px"}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Link href="/categoriaProducto/new" className="btn btn-info">Nueva Categoría</Link>
                        <div className="input-group" style={{ width: '300px' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por nombre..."
                                value={busqueda}
                                onChange={handleBusquedaChange}
                            />
                            <button className="btn btn-outline-secondary" type="button">
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="container-fluid">
                    <table className="table table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Nro</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoaded ? (
                                categoriasFiltradas.length > 0 ? (
                                    categoriasFiltradas.map((categoria, i) => (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td>{categoria.nombre}</td>
                                            <td>{categoria.descripcion || 'N/A'}</td>
                                            <td>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                                                    <Link href={`/categoriaProducto/edit/${categoria.external_id}`} className="btn btn-primary btn-sm">Editar</Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            {busqueda ? "No se encontraron categorías con ese nombre" : "No hay categorías registradas"}
                                        </td>
                                    </tr>
                                )
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">
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

export default mildware(CategoriaProducto)