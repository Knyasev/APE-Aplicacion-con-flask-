'use client';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { get_product } from '@/hooks/Services_product';
import { get_bodega } from '@/hooks/Services_bodega';
import { registrar_salida_inventario } from '@/hooks/Services_inventory';
import Menu from "@/app/components/menu";

export default function NewInventoryRecord() {
    const router = useRouter();
    const [productos, setProductos] = useState([]);
    const [bodegas, setBodegas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [selectedBodega, setSelectedBodega] = useState(null);
    const token = Cookies.get('token');
    
    // Schema de validación
    const validationSchema = Yup.object().shape({
        producto_id: Yup.number().required('El producto es requerido'),
        cantidad: Yup.number()
            .required('La cantidad es requerida')
            .min(1, 'La cantidad debe ser mayor a 0'),
        bodega_id: Yup.number().required('La bodega es requerida')
    });

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        resolver: yupResolver(validationSchema)
    });

    // Cargar lista de productos al iniciar
    useEffect(() => {
        get_product(token).then((response) => {
            if (response.code === 200) {
                setProductos(response.datos);
            }
        });
    }, [token]);

    // Cargar lista de bodegas al iniciar
    useEffect(() => {
        get_bodega(token).then((response) => {
            if (response.code === 200) {
                setBodegas(response.datos);
            }
        });
    }, [token]);

    // Manejar selección de producto
    const handleProductoChange = (e) => {
        const productoId = Number(e.target.value);
        setValue('producto_id', productoId);
        const producto = productos.find(p => p.id === productoId);
        setSelectedProducto(producto || null);
    };

    // Manejar selección de bodega
    const handleBodegaChange = (e) => {
        const bodegaId = Number(e.target.value);
        setValue('bodega_id', bodegaId);
        const bodega = bodegas.find(b => b.id === bodegaId);
        setSelectedBodega(bodega || null);
    };

    const sendInfo = async (data) => {
        setLoading(true);
        
        const inventoryData = {
            producto_id: data.producto_id,
            cantidad: data.cantidad,
            bodega_id: data.bodega_id
        };

        try {
            const info = await registrar_salida_inventario(inventoryData, token);
            
            if (info && (info.code == '200' || info.status == '200')) {
                swal({
                    title: "Registro exitoso",
                    text: "Registro de inventario creado correctamente",
                    icon: "success",
                    button: "Aceptar",
                    timer: 4000,
                    closeOnEsc: true,
                });
                router.push('/inventario');
            } else {
                const errorMsg = info?.datos?.error || info?.message || "Error al registrar el inventario";
                swal({
                    title: "Error",
                    text: errorMsg,
                    icon: "error",
                    button: "Aceptar",
                    timer: 4000,    
                    closeOnEsc: true,
                });
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            swal({
                title: "Error",
                text: "Error al conectar con el servidor",
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
            <div className="container text-center mt-5" style={{width: "60%", border: "2px solid black", padding: "20px", borderRadius: "15px", margin: "auto", marginLeft: "300px"}}>
                <h2>Nuevo Registro de Inventario</h2>
                <form onSubmit={handleSubmit(sendInfo)} className="form-signin">
                    <div className="mb-3">
                        <label className="form-label">Producto:</label>
                        <select 
                            {...register('producto_id')} 
                            name="producto_id" 
                            className="form-control"
                            onChange={handleProductoChange}
                        >
                            <option value="">Seleccione un producto</option>
                            {productos.map((producto) => (
                                <option key={producto.id} value={producto.id}>
                                    {producto.nombre} - {producto.descripcion}
                                </option>
                            ))}
                        </select>
                        {errors.producto_id && <div className="text-danger">{errors.producto_id?.message}</div>}
                        {selectedProducto && (
                            <div className="mt-2 p-2 bg-light rounded">
                                <p><strong>Producto seleccionado:</strong> {selectedProducto.nombre}</p>
                                <p><strong>Descripción:</strong> {selectedProducto.descripcion}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">Bodega:</label>
                        <select 
                            {...register('bodega_id')} 
                            name="bodega_id" 
                            className="form-control"
                            onChange={handleBodegaChange}
                        >
                            <option value="">Seleccione una bodega</option>
                            {bodegas.map((bodega) => (
                                <option key={bodega.id} value={bodega.id}>
                                    {bodega.nombre} - {bodega.ubicacion}
                                </option>
                            ))}
                        </select>
                        {errors.bodega_id && <div className="text-danger">{errors.bodega_id?.message}</div>}
                        {selectedBodega && (
                            <div className="mt-2 p-2 bg-light rounded">
                                <p><strong>Bodega seleccionada:</strong> {selectedBodega.nombre}</p>
                                <p><strong>Ubicación:</strong> {selectedBodega.ubicacion}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">Cantidad:</label>
                        <input 
                            type="number" 
                            {...register('cantidad')} 
                            name="cantidad" 
                            placeholder="Cantidad" 
                            className="form-control"
                            step="1"
                            min="1"
                        />
                        {errors.cantidad && <div className="text-danger">{errors.cantidad?.message}</div>}
                    </div>
                    
                    <button type="submit" className="w-100 btn btn-lg btn-primary" disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrar Inventario'}
                    </button>
                </form>
            </div>
        </div>
    );
}