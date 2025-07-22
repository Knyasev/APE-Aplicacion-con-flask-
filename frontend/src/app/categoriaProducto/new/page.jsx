'use client';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { create_categoria } from '@/hooks/Services_product';
import { get_person } from '@/hooks/Services_person';
import Menu from "@/app/components/menu";

export default function NewCategoria() {
    const router = useRouter();
    const [usuario, setUsuario] = useState(null);
    const token = Cookies.get('token');
    const external_id = Cookies.get('external_id');
    
    // Schema de validación para categoría
    const validationSchema = Yup.object().shape({
        nombre: Yup.string().required('El nombre es requerido'),
        descripcion: Yup.string().required('La descripción es requerida')
    });

    const formOptions = { resolver: yupResolver(validationSchema) };
    const { register, handleSubmit, formState: { errors } } = useForm(formOptions);

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
    }, [token, external_id]);

    const sendInfo = async (data) => {
        console.log("Datos del formulario:", data);
        
        const categoriaData = {
            nombre: data.nombre,
            descripcion: data.descripcion,
        };

        console.log("Datos a enviar:", categoriaData);

        try {
            const info = await create_categoria(categoriaData, token);
            console.log("Respuesta del servidor:", info);
            
            if (info && (info.code == '200' || info.status == '200')) {
                swal({
                    title: "Registro exitoso",
                    text: "Categoría registrada correctamente",
                    icon: "success",
                    button: "Aceptar",
                    timer: 4000,
                    closeOnEsc: true,
                });
                router.push('/categoriaProducto');
            } else {
                const errorMsg = info?.datos?.error || info?.message || "Error al registrar la categoría";
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
        }
    };

    return (
        <div>
            <Menu />
            <div className="container text-center mt-5" style={{width: "60%", border: "2px solid black", padding: "20px", borderRadius: "15px", margin: "auto", marginLeft: "300px"}}>
                <h2>Nueva Categoría</h2>
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
                            placeholder="Descripción de la categoría" 
                            className="form-control" 
                            rows="3"
                        ></textarea>
                        {errors.descripcion && <div className="text-danger">{errors.descripcion?.message}</div>}
                    </div>
                    
                    
                    
                    <button type="submit" className="w-100 btn btn-lg btn-primary">Registrar Categoría</button>
                </form>
            </div>
        </div>
    );
}