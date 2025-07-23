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
import { get_tipos_documento } from '@/hooks/Services_inventory';
import { registrar_entrada_inventario } from '@/hooks/Services_inventory';
import Menu from "@/app/components/menu";

export default function NewInventoryRecord() {
    const router = useRouter();
    const [productos, setProductos] = useState([]);
    const [bodegas, setBodegas] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = Cookies.get('token');
    
    // Schema de validación para registro de inventario
    const validationSchema = Yup.object().shape({
        producto_id: Yup.number().required('El producto es requerido'),
        cantidad: Yup.number()
            .required('La cantidad es requerida')
            .min(1, 'La cantidad debe ser mayor a 0'),
        precio_unitario: Yup.number()
            .required('El precio unitario es requerido')
            .min(0.01, 'El precio debe ser mayor a 0'),
        bodega_id: Yup.number().required('La bodega es requerida'),
        numero_comprobante: Yup.string().required('El número de comprobante es requerido'),
        tipo_comprobante: Yup.string().required('El tipo de comprobante es requerido'),
        proveedor: Yup.string().required('El proveedor es requerido')
    });

    const formOptions = { resolver: yupResolver(validationSchema) };
    const { register, handleSubmit, formState: { errors } } = useForm(formOptions);

    // Obtener lista de productos
    useEffect(() => {
        get_product(token).then((response) => {
            if (response.code === 200) {
                setProductos(response.datos);
            }
        });
    }, [token]);

    // Obtener lista de bodegas
    useEffect(() => {
        get_bodega(token).then((response) => {
            if (response.code === 200) {
                setBodegas(response.datos);
            }
        });
    }, [token]);

    // Obtener tipos de documento
    useEffect(() => {
        get_tipos_documento(token).then((response) => {
            if (response.code === 200) {
                setTiposDocumento(response.datos);
            }
        });
    }, [token]);

    const sendInfo = async (data) => {
        console.log("Datos del formulario:", data);
        setLoading(true);
        
        const inventoryData = {
            producto_id: data.producto_id,
            cantidad: data.cantidad,
            precio_unitario: data.precio_unitario,
            bodega_id: data.bodega_id,
            numero_comprobante: data.numero_comprobante,
            tipo_comprobante: data.tipo_comprobante,
            proveedor: data.proveedor
        };

        console.log("Datos a enviar:", inventoryData);

        try {
            const info = await registrar_entrada_inventario(inventoryData, token);
            console.log("Respuesta del servidor:", info);
            
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
                        >
                            <option value="">Seleccione un producto</option>
                            {productos.map((producto) => (
                                <option key={producto.id} value={producto.id}>
                                    {producto.nombre} - {producto.descripcion}
                                </option>
                            ))}
                        </select>
                        {errors.producto_id && <div className="text-danger">{errors.producto_id?.message}</div>}
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
                    
                    <div className="mb-3">
                        <label className="form-label">Precio Unitario:</label>
                        <input 
                            type="number" 
                            {...register('precio_unitario')} 
                            name="precio_unitario" 
                            placeholder="Precio unitario" 
                            className="form-control"
                            step="0.01"
                            min="0.01"
                        />
                        {errors.precio_unitario && <div className="text-danger">{errors.precio_unitario?.message}</div>}
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">Bodega:</label>
                        <select 
                            {...register('bodega_id')} 
                            name="bodega_id" 
                            className="form-control"
                        >
                            <option value="">Seleccione una bodega</option>
                            {bodegas.map((bodega) => (
                                <option key={bodega.id} value={bodega.id}>
                                    {bodega.nombre} - {bodega.ubicacion}
                                </option>
                            ))}
                        </select>
                        {errors.bodega_id && <div className="text-danger">{errors.bodega_id?.message}</div>}
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">Número de Comprobante:</label>
                        <input 
                            type="text" 
                            {...register('numero_comprobante')} 
                            name="numero_comprobante" 
                            placeholder="Número de comprobante" 
                            className="form-control"
                        />
                        {errors.numero_comprobante && <div className="text-danger">{errors.numero_comprobante?.message}</div>}
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">Tipo de Comprobante:</label>
                        <select 
                            {...register('tipo_comprobante')} 
                            name="tipo_comprobante" 
                            className="form-control"
                        >
                            <option value="">Seleccione un tipo</option>
                            {tiposDocumento.map((tipo, index) => (
                                <option key={index} value={tipo}>
                                    {tipo.replace(/_/g, ' ')} {/* Reemplaza guiones bajos por espacios */}
                                </option>
                            ))}
                        </select>
                        {errors.tipo_comprobante && <div className="text-danger">{errors.tipo_comprobante?.message}</div>}
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">Proveedor:</label>
                        <input 
                            type="text" 
                            {...register('proveedor')} 
                            name="proveedor" 
                            placeholder="Nombre del proveedor" 
                            className="form-control"
                        />
                        {errors.proveedor && <div className="text-danger">{errors.proveedor?.message}</div>}
                    </div>
                    
                    <button type="submit" className="w-100 btn btn-lg btn-primary" disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrar Inventario'}
                    </button>
                </form>
            </div>
        </div>
    );
}