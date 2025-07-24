'use client';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { create_pedido } from "@/hooks/Services_pedido";
import { get_person } from "@/hooks/Services_person";
import { get_sucursal_by_usuario } from "@/hooks/Services_sucursal";
import { get_product, get_stock_by_producto } from "@/hooks/Services_product";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { useRouter } from 'next/navigation';

export default function NewPedido() {
    const router = useRouter();
    const [sucursales, setSucursales] = useState([]);
    const [productos, setProductos] = useState([]);
    const [detalles, setDetalles] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [precioTotal, setPrecioTotal] = useState(0);
    const token = Cookies.get('token');
    const external_id = Cookies.get('external_id');

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setIsLoading(true);
                
                // 1. Cargar información del usuario
                const userInfo = await get_person(token, external_id);
                if (userInfo.code !== 200) {
                    throw new Error("Error al cargar datos del usuario");
                }
                setUsuario(userInfo.datos);

                // 2. Cargar sucursales del usuario
                const sucursalesInfo = await get_sucursal_by_usuario(userInfo.datos.id, token);
                if (sucursalesInfo.code === 200) {
                    const sucursalesData = Array.isArray(sucursalesInfo.datos) 
                        ? sucursalesInfo.datos 
                        : [sucursalesInfo.datos];
                    setSucursales(sucursalesData);
                } else {
                    setSucursales([]);
                }

                // 3. Cargar productos disponibles
                const productosInfo = await get_product(token);
                if (productosInfo.code === 200) {
                    setProductos(productosInfo.datos || []);
                } else {
                    setProductos([]);
                }
            } catch (error) {
                console.error("Error al cargar datos:", error);
                swal("Error", "No se pudieron cargar los datos necesarios", "error");
            } finally {
                setIsLoading(false);
            }
        };

        if (token && external_id) {
            cargarDatos();
        }
    }, [token, external_id]);

    // Calcular precio total cuando cambian los detalles
    useEffect(() => {
        const total = detalles.reduce((sum, detalle) => sum + (detalle.subtotal || 0), 0);
        setPrecioTotal(total);
    }, [detalles]);

    const validationSchema = Yup.object().shape({
        fecha: Yup.date()
            .required('La fecha es requerida')
            .default(() => new Date()),
        sucursal_id: Yup.number()
            .required('La sucursal es requerida')
            .typeError('Debe seleccionar una sucursal'),
        detalles: Yup.array()
            .of(
                Yup.object().shape({
                    producto_id: Yup.number().required('Producto es requerido'),
                    cantidad_solicitada: Yup.number()
                        .min(1, 'La cantidad debe ser al menos 1')
                        .required('Cantidad es requerida')
                })
            )
            .min(1, 'Debe agregar al menos un producto')
            .required('Debe agregar al menos un producto')
    });

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            fecha: new Date().toISOString().slice(0, 16),
            sucursal_id: '',
            detalles: []
        }
    });

    const [nuevoDetalle, setNuevoDetalle] = useState({
        producto_id: '',
        cantidad_solicitada: 1
    });

    const agregarDetalle = async () => {
        if (!nuevoDetalle.producto_id) {
            swal("Error", "Seleccione un producto", "error");
            return;
        }

        const productoId = parseInt(nuevoDetalle.producto_id);
        const cantidad = parseInt(nuevoDetalle.cantidad_solicitada) || 1;

        const productoSeleccionado = productos.find(p => p.id === productoId);
        if (!productoSeleccionado) {
            swal("Error", "Producto no encontrado", "error");
            return;
        }

        try {
            // Obtener información del stock para el producto (incluye PVP)
            const stockInfo = await get_stock_by_producto(productoId, token);
            if (stockInfo.code !== 200) {
                throw new Error("Error al obtener información del producto");
            }

            const pvp = parseFloat(stockInfo.datos.pvp);
            const subtotal = pvp * cantidad;

            setDetalles(prevDetalles => {
                // Buscar si el producto ya existe en los detalles
                const detalleExistenteIndex = prevDetalles.findIndex(d => d.producto_id === productoId);
                
                let nuevosDetalles;
                
                if (detalleExistenteIndex >= 0) {
                    // Si existe, actualizar la cantidad y subtotal
                    nuevosDetalles = [...prevDetalles];
                    nuevosDetalles[detalleExistenteIndex] = {
                        ...nuevosDetalles[detalleExistenteIndex],
                        cantidad_solicitada: nuevosDetalles[detalleExistenteIndex].cantidad_solicitada + cantidad,
                        subtotal: nuevosDetalles[detalleExistenteIndex].subtotal + subtotal
                    };
                } else {
                    // Si no existe, agregar nuevo detalle
                    nuevosDetalles = [
                        ...prevDetalles,
                        {
                            producto_id: productoId,
                            producto_nombre: productoSeleccionado.nombre,
                            cantidad_solicitada: cantidad,
                            pvp: pvp,
                            subtotal: subtotal
                        }
                    ];
                }
                
                // Actualizar el valor del formulario react-hook-form
                setValue('detalles', nuevosDetalles.map(d => ({
                    producto_id: d.producto_id,
                    cantidad_solicitada: d.cantidad_solicitada
                })), { shouldValidate: true });
                
                return nuevosDetalles;
            });

            // Resetear el formulario de nuevo detalle
            setNuevoDetalle({
                producto_id: '',
                cantidad_solicitada: 1
            });

        } catch (error) {
            swal("Error", error.message, "error");
        }
    };

    const eliminarDetalle = (index) => {
        setDetalles(prevDetalles => {
            const nuevosDetalles = prevDetalles.filter((_, i) => i !== index);
            
            // Actualizar el valor del formulario react-hook-form
            setValue('detalles', nuevosDetalles.map(d => ({
                producto_id: d.producto_id,
                cantidad_solicitada: d.cantidad_solicitada
            })), { shouldValidate: true });
            
            return nuevosDetalles;
        });
    };

    const sendInfo = async (data) => {
        if (!usuario || detalles.length === 0) {
            swal("Error", "Datos incompletos", "error");
            return;
        }

        let fechaFormateada;
    
        if (data.fecha instanceof Date) {
            const año = data.fecha.getFullYear();
            const mes = String(data.fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(data.fecha.getDate()).padStart(2, '0');
            fechaFormateada = `${año}-${mes}-${dia}`;
        } else if (typeof data.fecha === 'string') {
            fechaFormateada = data.fecha.split('T')[0];
        } else {
            const hoy = new Date();
            fechaFormateada = hoy.toISOString().split('T')[0];
            swal("Advertencia", "Formato de fecha no reconocido, usando fecha actual", "warning");
        }

        const pedidoData = {
            fecha: fechaFormateada,
            estado: "CREADO",
            usuario_id: usuario.id,
            sucursal_id: parseInt(data.sucursal_id),
            metodo_de_pago: metodoPago,
            precio_total: precioTotal,
            detalles: detalles.map(d => ({
                producto_id: d.producto_id,
                cantidad: d.cantidad_solicitada,
                subtotal: d.subtotal
            }))
        };

        try {
            const info = await create_pedido(pedidoData, token);
            
            if (info && info.code === 200) {
                swal({
                    title: "Éxito",
                    text: "Pedido creado correctamente",
                    icon: "success",
                    button: "Aceptar"
                });
                router.push('/pedido');
            } else {
                const errorMsg = info?.datos?.error || "Error al crear el pedido";
                throw new Error(errorMsg);
            }
        } catch (error) {
            swal({
                title: "Error",
                text: error.message,
                icon: "error",
                button: "Aceptar"
            });
        }
    };

    if (isLoading) {
        return (
            <div className="container text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p>Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="container text-center mt-5" style={{width: "60%", border: "2px solid black", padding: "20px", borderRadius: "15px", margin: "auto"}}>
            <h2>Nuevo Pedido</h2>
            <form onSubmit={handleSubmit(sendInfo)} className="form-signin">
                <div className="mb-3">
                    <label className="form-label">Sucursal:</label>
                    <select 
                        {...register('sucursal_id')} 
                        name="sucursal_id" 
                        className={`form-control ${errors.sucursal_id ? 'is-invalid' : ''}`}
                        disabled={sucursales.length === 0}
                    >
                        <option value="">Selecciona una sucursal...</option>
                        {sucursales.map((sucursal, index) => (
                            <option key={index} value={sucursal.id}>
                                {sucursal.nombre} - {sucursal.ubicacion}
                            </option>
                        ))}
                    </select>
                    {errors.sucursal_id && (
                        <div className="invalid-feedback">{errors.sucursal_id.message}</div>
                    )}
                    {sucursales.length === 0 && (
                        <small className="text-danger">No tienes sucursales asignadas</small>
                    )}
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Fecha:</label>
                    <input 
                        type="datetime-local" 
                        {...register('fecha')} 
                        name="fecha" 
                        className={`form-control ${errors.fecha ? 'is-invalid' : ''}`}
                    />
                    {errors.fecha && (
                        <div className="invalid-feedback">{errors.fecha.message}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Método de Pago:</label>
                    <select
                        className="form-control"
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                    >
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">DEUNA</option>
                        <option value="PayPal">Ahorita</option>
                    </select>
                </div>

                <div className="mb-3">
                    <h4>Detalles del Pedido</h4>
                    <div className="row g-2 mb-3">
                        <div className="col-md-6">
                            <select
                                className="form-control"
                                value={nuevoDetalle.producto_id}
                                onChange={(e) => setNuevoDetalle({...nuevoDetalle, producto_id: e.target.value})}
                            >
                                <option value="">Seleccione un producto</option>
                                {productos.map((producto) => (
                                    <option key={producto.id} value={producto.id}>
                                        {producto.nombre} (Stock: {producto.stock_actual})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <input
                                type="number"
                                className="form-control"
                                min="1"
                                value={nuevoDetalle.cantidad_solicitada}
                                onChange={(e) => setNuevoDetalle({
                                    ...nuevoDetalle, 
                                    cantidad_solicitada: Math.max(1, parseInt(e.target.value) || 1)
                                })}
                            />
                        </div>
                        <div className="col-md-3">
                            <button 
                                type="button" 
                                className="btn btn-primary w-100"
                                onClick={agregarDetalle}
                                disabled={!nuevoDetalle.producto_id}
                            >
                                Agregar
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-3">
                        {detalles.length > 0 ? (
                            <>
                                <table className="table table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Producto</th>
                                            <th>Precio Unitario</th>
                                            <th>Cantidad</th>
                                            <th>Subtotal</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detalles.map((detalle, index) => (
                                            <tr key={index}>
                                                <td>{detalle.producto_nombre}</td>
                                                <td>${detalle.pvp?.toFixed(2) || '0.00'}</td>
                                                <td>{detalle.cantidad_solicitada}</td>
                                                <td>${detalle.subtotal?.toFixed(2) || '0.00'}</td>
                                                <td>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => eliminarDetalle(index)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="text-end">
                                    <h5>Total: ${precioTotal.toFixed(2)}</h5>
                                </div>
                            </>
                        ) : (
                            <div className="alert alert-warning">
                                No hay productos agregados al pedido
                            </div>
                        )}
                        {errors.detalles && (
                            <div className="text-danger">{errors.detalles.message}</div>
                        )}
                    </div>
                </div>
                
                <div className="d-grid gap-2">
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-lg"
                        disabled={detalles.length === 0 || sucursales.length === 0}
                    >
                        Crear Pedido
                    </button>
                </div>
            </form>
        </div>
    );
}