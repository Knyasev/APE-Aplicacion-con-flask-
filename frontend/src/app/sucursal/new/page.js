'use client';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { get_sucursal_by_external, create_sucursal } from "@/hooks/Services_sucursal";
import { get_person } from "@/hooks/Services_person";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { useRouter } from 'next/navigation';
import Menu from "@/app/components/menu";

export default function NewSucursal() {
    const router = useRouter();
    const [usuario, setUsuario] = useState(null);
    const token = Cookies.get('token');
    const external_id = Cookies.get('external_id');

    useEffect(() => {
        // Cargar información del usuario/admin
        if (external_id) {
            get_person(token, external_id).then((info) => {
                if (info.code == '200') {
                    setUsuario(info.datos);
                }
            });
        }
    }, [token, external_id]);

    const validationSchema = Yup.object().shape({
        nombre: Yup.string().required('El nombre es requerido'),
        ubicacion: Yup.string().required('La ubicación es requerida'),
        estado: Yup.boolean().default(true)
    });

    const formOptions = { resolver: yupResolver(validationSchema) };
    const { register, handleSubmit, formState: { errors } } = useForm(formOptions);

    const sendInfo = async (data) => {
        const sucursalData = {
            nombre: data.nombre,
            ubicacion: data.ubicacion,
            estado: data.estado,
            admin_id: usuario?.id
        };

        const info = await create_sucursal(sucursalData, token);
        
        if (info && info.status == '200') {
            swal({
                title: "Registro exitoso",
                text: "Sucursal registrada correctamente",
                icon: "success",
                button: "Aceptar",
                timer: 4000,
                closeOnEsc: true,
            });
            router.push('/sucursal');
        } else {
            swal({
                title: "Error",
                text: info ? info.datos.error : "Error al registrar la sucursal",
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
                <h2>Nueva Sucursal</h2>
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
                            placeholder="Dirección completa de la sucursal" 
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
                            defaultChecked
                        />
                        <label className="form-check-label">Activo</label>
                    </div>
                    
                    
                    
                    <button type="submit" className="w-100 btn btn-lg btn-primary">Registrar Sucursal</button>
                </form>
            </div>
        </div>
    );
}