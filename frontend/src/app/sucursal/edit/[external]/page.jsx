'use client';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { get_sucursal_by_external, update_sucursal } from '@/hooks/Services_sucursal';
import { get_person } from '@/hooks/Services_person';
import Menu from "@/app/components/menu";

export default function EditSucursal({ params }) {
    const router = useRouter();
    const [usuario, setUsuario] = useState(null);
    const [sucursal, setSucursal] = useState(null);
    const token = Cookies.get('token');
    const external_id = Cookies.get('external_id');
    const sucursalExternalId = params.external;

    // Schema de validación para sucursal
    const validationSchema = Yup.object().shape({
        nombre: Yup.string().required('El nombre es requerido'),
        ubicacion: Yup.string().required('La ubicación es requerida'),
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
            
        // Cargar datos de la sucursal a editar
        if (sucursalExternalId) {
            get_sucursal_by_external({ external: sucursalExternalId}, token ).then((info) => {
                if (info.code == '200') {
                    setSucursal(info.datos);
                    console.log(info.datos);
                    // Establecer valores en el formulario
                    setValue('nombre', info.datos.nombre);
                    setValue('ubicacion', info.datos.ubicacion);
                    setValue('estado', info.datos.estado);
                }
            });
        }
    }, [token, external_id, sucursalExternalId, setValue]);

    const sendInfo = async (data) => {
        const sucursalData = {
            nombre: data.nombre,
            ubicacion: data.ubicacion,
            estado: data.estado,
            admin_id: usuario?.id
        };

        const info = await update_sucursal(sucursalData, { external: sucursalExternalId}, token );

        if (info && info.code == '200') {
            swal({
                title: "Actualización exitosa",
                text: "Sucursal actualizada correctamente",
                icon: "success",
                button: "Aceptar",
                timer: 4000,
                closeOnEsc: true,
            });
            router.push('/sucursal');
        } else {
            swal({
                title: "Error",
                text: info ? info.datos.error : "Error al actualizar la sucursal",
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
                <h2>Editar Sucursal</h2>
                {sucursal ? (
                    <form onSubmit={handleSubmit(sendInfo)} className="form-signin">
                        <div className="mb-3">
                            <label className="form-label">Nombre:</label>
                            <input 
                                type="text" 
                                {...register('nombre')} 
                                name="nombre" 
                                placeholder="Nombre de la sucursal" 
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
                        
                        <div className="mb-3 form-check">
                            <input 
                                type="checkbox" 
                                {...register('estado')} 
                                name="estado" 
                                className="form-check-input"
                            />
                            <label className="form-check-label">Activo</label>
                        </div>
                        
                       
                        
                        <button type="submit" className="w-100 btn btn-lg btn-primary">Actualizar Sucursal</button>
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