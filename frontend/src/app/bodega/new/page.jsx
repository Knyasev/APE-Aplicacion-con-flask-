'use client';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { create_bodega } from '@/hooks/Services_bodega';
import { get_person } from '@/hooks/Services_person';
import Menu from "@/app/components/menu";

export default function NewBodega() {
    const router = useRouter();
    const [usuario, setUsuario] = useState(null);
    const token = Cookies.get('token');
    const external_id = Cookies.get('external_id');
    
    // Schema de validación para bodega
    const validationSchema = Yup.object().shape({
        nombre: Yup.string().required('El nombre es requerido'),
        ubicacion: Yup.string().required('La ubicación es requerida'),
        capacidad_maxima: Yup.number()
            .required('La capacidad es requerida')
            .min(0, 'La capacidad no puede ser negativa')
            .typeError('Debe ser un número válido'), // Agregado para mejor validación
        estado: Yup.boolean().default(true)
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
    }, [token, external_id]);

    const sendInfo = async (data) => {
        console.log("Datos del formulario:", data); // Para depuración
        
        // Asegurarse que capacidad_maxima es número
        const capacidad_maxima = parseFloat(data.capacidad_maxima);
        if (isNaN(capacidad_maxima)) {
            swal("Error", "La capacidad debe ser un número válido", "error");
            return;
        }

        const bodegaData = {
            nombre: data.nombre,
            ubicacion: data.ubicacion,
            capacidad_maxima: capacidad_maxima, 
            estado: data.estado,
            usuario_id: usuario?.id 
        };

        console.log("Datos a enviar:", bodegaData); // Para depuración

        try {
            const info = await create_bodega(bodegaData, token);
            console.log("Respuesta del servidor:", info); // Para depuración
            
            if (info && (info.code == '200' || info.status == '200')) {
                swal({
                    title: "Registro exitoso",
                    text: "Bodega registrada correctamente",
                    icon: "success",
                    button: "Aceptar",
                    timer: 4000,
                    closeOnEsc: true,
                });
                router.push('/bodega');
            } else {
                const errorMsg = info?.datos?.error || info?.message || "Error al registrar la bodega";
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
                <h2>Nueva Bodega</h2>
                <form onSubmit={handleSubmit(sendInfo)} className="form-signin">
                    <div className="mb-3">
                        <label className="form-label">Nombre:</label>
                        <input 
                            type="text" 
                            {...register('nombre')} 
                            name="nombre" 
                            placeholder="Nombre de la bodega" 
                            className="form-control"
                        />
                        {errors.nombre && <div className="text-danger">{errors.nombre?.message}</div>}
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">Ubicación:</label>
                        <textarea 
                            {...register('ubicacion')} 
                            name="ubicacion" 
                            placeholder="Dirección completa de la bodega" 
                            className="form-control" 
                            rows="3"
                        ></textarea>
                        {errors.ubicacion && <div className="text-danger">{errors.ubicacion?.message}</div>}
                    </div>
                    
                    <div className="mb-3">
                            <label className="form-label">Capacidad Máxima :</label>
                            <input 
                                type="number" 
                                {...register('capacidad_maxima')} 
                                name="capacidad_maxima" 
                                placeholder="Capacidad " 
                                className="form-control"
                                step="0.01"
                                min="0"
                            />
                            {errors.capacidad_maxima && <div className="text-danger">{errors.capacidad_maxima?.message}</div>}
                        </div>
                    
                    <div className="mb-3 form-check">
                        <input 
                            type="checkbox" 
                            {...register('estado')} 
                            name="estado" 
                            className="form-check-input" 
                            defaultChecked
                        />
                        <label className="form-check-label">Activo</label>
                    </div>

                    
                    <button type="submit" className="w-100 btn btn-lg btn-primary">Registrar Bodega</button>
                </form>
            </div>
        </div>
    );
}