'use client';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { get_bodega_by_external, update_bodega } from '@/hooks/Services_bodega';
import { get_person } from '@/hooks/Services_person';
import Menu from "@/app/components/menu";

export default function EditBodega({ params }) {
    const router = useRouter();
    const [usuario, setUsuario] = useState(null);
    const [bodega, setBodega] = useState(null);
    const token = Cookies.get('token');
    const external_id = Cookies.get('external_id');
    const bodegaExternalId = params.external;

    // Schema de validación para bodega
    const validationSchema = Yup.object().shape({
        nombre: Yup.string().required('El nombre es requerido'),
        ubicacion: Yup.string().required('La ubicación es requerida'),
        capacidad_maxima: Yup.number()
            .required('La capacidad es requerida')
            .min(0, 'La capacidad no puede ser negativa'),
        estado: Yup.boolean()
    });

    const formOptions = { resolver: yupResolver(validationSchema) };
    const { register, handleSubmit, formState: { errors }, setValue } = useForm(formOptions);

    useEffect(() => {
        // Cargar información del usuario
        if (external_id) {
            get_person(token, external_id).then((info) => {
                if (info.code == '200') {
                    setUsuario(info.datos);
                    console.log(info.datos);
                }
            });
        }
            
        // Cargar datos de la bodega a editar
        if (bodegaExternalId) {
            get_bodega_by_external({ external: bodegaExternalId }, token).then((info) => {
                if (info.code == '200') {
                    setBodega(info.datos);
                    console.log(info.datos);
                    // Establecer valores en el formulario
                    setValue('nombre', info.datos.nombre);
                    setValue('ubicacion', info.datos.ubicacion);
                    setValue('capacidad_maxima', info.datos.capacidad_maxima);
                    setValue('estado', info.datos.estado);
                }
            });
        }
    }, [token, external_id, bodegaExternalId, setValue]);

    const sendInfo = async (data) => {
        const bodegaData = {
            nombre: data.nombre,
            ubicacion: data.ubicacion,
            capacidad_maxima: data.capacidad_maxima,
            estado: data.estado,
            usuario_id: usuario?.id
        };

        const info = await update_bodega(bodegaData, { external: bodegaExternalId }, token);

        if (info && info.code == '200') {
            swal({
                title: "Actualización exitosa",
                text: "Bodega actualizada correctamente",
                icon: "success",
                button: "Aceptar",
                timer: 4000,
                closeOnEsc: true,
            });
            router.push('/bodega');
        } else {
            swal({
                title: "Error",
                text: info ? info.datos.error : "Error al actualizar la bodega",
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
                <h2>Editar Bodega</h2>
                {bodega ? (
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
                                placeholder="Dirección completa" 
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
                            />
                            <label className="form-check-label">Activo</label>
                        </div>
                        
                        <button type="submit" className="w-100 btn btn-lg btn-primary">Actualizar Bodega</button>
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