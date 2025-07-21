'use client';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { get_categoria, get_product_external, update_product } from '@/hooks/Services_product';
import { get_person } from '@/hooks/Services_person';

export default function Edit({ params }) {
    const router = useRouter();
    const [categorias, setCategorias] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [producto, setProducto] = useState(null);
    const token = Cookies.get('token');
    const external_id = Cookies.get('external');
    const productExternalId = params.external;

    // Schema de validación simplificado
    const validationSchema = Yup.object().shape({
        nombre: Yup.string().required('El nombre es requerido'),
        codigo: Yup.string().required('El código es requerido'),
        descripcion: Yup.string().required('La descripción es requerida'),
        categoria_id: Yup.string().required('La categoría es requerida'),
        stock_actual: Yup.number().required('El stock es requerido').min(0, 'El stock no puede ser negativo')
    });

    const formOptions = { resolver: yupResolver(validationSchema) };
    const { register, handleSubmit, formState: { errors }, setValue } = useForm(formOptions);

    useEffect(() => {
        // Cargar categorías
        get_categoria(token).then((info) => {
            if (info.code == '200') {
                setCategorias(info.datos);
            }
        });

        // Cargar información del usuario
        if (external_id) {
            get_person(token, external_id).then((info) => {
                if (info.code == '200') {
                    setUsuario(info.datos);
                }
            });
        }
            
        // Cargar datos del producto a editar
        if (productExternalId) {
            get_product_external({ external: productExternalId }, token).then((info) => {
                if (info.code == '200') {
                    setProducto(info.datos);
                    
                    // Establecer valores en el formulario (solo campos necesarios)
                    setValue('nombre', info.datos.nombre);
                    setValue('codigo', info.datos.codigo);
                    setValue('descripcion', info.datos.descripcion);
                    setValue('categoria_id', info.datos.categoria_id);
                    setValue('stock_actual', info.datos.stock_actual);
                }
            });
        }
    }, [token, external_id, productExternalId, setValue]);

    const sendInfo = async (data) => {
        const productoData = {
            nombre: data.nombre,
            codigo: data.codigo,
            descripcion: data.descripcion,
            estado: 'BUENO', // Estado fijo
            categoria_id: data.categoria_id,
            stock_actual: data.stock_actual,
            admin_id: usuario?.id
        };

        const info = await update_product(productoData, { external: productExternalId }, token);
        console.log("Respuesta de actualización:", info);
        if (info && info.code == '200') {
            swal({
                title: "Actualización exitosa",
                text: "Producto actualizado correctamente",
                icon: "success",
                button: "Aceptar",
                timer: 4000,
                closeOnEsc: true,
            });
            router.push('/producto');
        } else {
            swal({
                title: "Error",
                text: info ? info.datos.error : "Error al actualizar el producto",
                icon: "error",
                button: "Aceptar",
                timer: 4000,    
                closeOnEsc: true,
            });
        }
    };

    return (
        <div className="container text-center mt-5" style={{width: "60%", border: "2px solid black", padding: "20px", borderRadius: "15px", margin: "auto"}}>
            <h2>Editar Producto</h2>
            <form onSubmit={handleSubmit(sendInfo)} className="form-signin">
                <div className="mb-3">
                    <label className="form-label">Nombre:</label>
                    <input type="text" {...register('nombre')} name="nombre" placeholder="Nombre del producto" className="form-control"/>
                    {errors.nombre && <div className="text-danger">{errors.nombre?.message}</div>}
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Código:</label>
                    <input type="text" {...register('codigo')} name="codigo" placeholder="Código del producto" className="form-control"/>
                    {errors.codigo && <div className="text-danger">{errors.codigo?.message}</div>}
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Descripción:</label>
                    <textarea {...register('descripcion')} name="descripcion" placeholder="Descripción" className="form-control" rows="3"></textarea>
                    {errors.descripcion && <div className="text-danger">{errors.descripcion?.message}</div>}
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Categoría:</label>
                    <select {...register('categoria_id')} name="categoria_id" className="form-control">
                        <option value="">Selecciona una categoría...</option>
                        {categorias && categorias.map((categoria, index) => (
                            <option key={index} value={categoria.id}>{categoria.nombre}</option>
                        ))}
                    </select>
                    {errors.categoria_id && <div className="text-danger">{errors.categoria_id?.message}</div>}
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Stock Actual:</label>
                    <input type="number" {...register('stock_actual')} name="stock_actual" placeholder="Stock" className="form-control" min="0"/>
                    {errors.stock_actual && <div className="text-danger">{errors.stock_actual?.message}</div>}
                </div>
                
                <button type="submit" className="w-100 btn btn-lg btn-primary">Actualizar Producto</button>
            </form>
        </div>
    );
}