'use client';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { get_categoria_by_external, update_categoria } from '@/hooks/Services_product';
import { get_person } from '@/hooks/Services_person';
import Menu from "@/app/components/menu";

export default function EditCategoria({ params }) {
    const router = useRouter();
    const [usuario, setUsuario] = useState(null);
    const [categoria, setCategoria] = useState(null);
    const token = Cookies.get('token');
    const external_id = Cookies.get('external_id');
    const categoriaExternalId = params.external;

    // Schema de validación para categoría
    const validationSchema = Yup.object().shape({
        nombre: Yup.string().required('El nombre es requerido'),
        descripcion: Yup.string().required('La descripción es requerida')
    });

    const formOptions = { resolver: yupResolver(validationSchema) };
    const { register, handleSubmit, formState: { errors }, setValue } = useForm(formOptions);

    useEffect(() => {
        // Cargar información del usuario
        if (external_id) {
            get_person(token, external_id).then((info) => {
                if (info.code == '200') {
                    setUsuario(info.datos);
                    console.log("Usuario cargado:", info.datos);
                }
            });
        }
            
        // Cargar datos de la categoría a editar
        if (categoriaExternalId) {
            get_categoria_by_external({ external: categoriaExternalId }, token).then((info) => {
                if (info.code == '200') {
                    setCategoria(info.datos);
                    console.log("Categoría cargada:", info.datos);
                    // Establecer valores en el formulario
                    setValue('nombre', info.datos.nombre);
                    setValue('descripcion', info.datos.descripcion);
                }
            });
        }
    }, [token, external_id, categoriaExternalId, setValue]);

    const sendInfo = async (data) => {
        const categoriaData = {
            nombre: data.nombre,
            descripcion: data.descripcion,
            usuario_id: usuario?.id
        };

        const info = await update_categoria(categoriaData, { external: categoriaExternalId }, token);

        if (info && info.code == '200') {
            swal({
                title: "Actualización exitosa",
                text: "Categoría actualizada correctamente",
                icon: "success",
                button: "Aceptar",
                timer: 4000,
                closeOnEsc: true,
            });
            router.push('/categoriaProducto');
        } else {
            swal({
                title: "Error",
                text: info ? info.datos.error : "Error al actualizar la categoría",
                icon: "error",
                button: "Aceptar",
                timer: 4000,    
                closeOnEsc: true,
            });
        }
    };

    return (
        <div>
            <Menu />
            <div className="container text-center mt-5" style={{width: "60%", border: "2px solid black", padding: "20px", borderRadius: "15px", margin: "auto", marginLeft: "300px"}}>
                <h2>Editar Categoría</h2>
                {categoria ? (
                    <form onSubmit={handleSubmit(sendInfo)} className="form-signin">
                        <div className="mb-3">
                            <label className="form-label">Nombre:</label>
                            <input 
                                type="text" 
                                {...register('nombre')} 
                                name="nombre" 
                                placeholder="Nombre de la categoría" 
                                className="form-control"
                            />
                            {errors.nombre && <div className="text-danger">{errors.nombre?.message}</div>}
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label">Descripción:</label>
                            <textarea 
                                {...register('descripcion')} 
                                name="descripcion" 
                                placeholder="Descripción detallada" 
                                className="form-control" 
                                rows="3"
                            ></textarea>
                            {errors.descripcion && <div className="text-danger">{errors.descripcion?.message}</div>}
                        </div>
                        
                        <button type="submit" className="w-100 btn btn-lg btn-primary">Actualizar Categoría</button>
                    </form>
                ) : (
                    <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}