'use client';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { set, useForm } from 'react-hook-form';
import { POST } from '@/hooks/connection.js';
import swal from 'sweetalert';
import Cookies from 'js-cookie';
import Menu from '@/app/components/menu';
import { create_lote, get_lote, get_tiposP, update_lote } from '@/hooks/Services_lote';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Edit(params) {
    const router = useRouter();
    let [estado, setEstado] = useState(null);
    let [tiposProducto, settiposProducto] = useState(null);
    let token = Cookies.get('token');
    let [lote, setLote] = useState(null);

    useEffect(() => {
        if (!estado) {
            get_tiposP(token).then((info) => {
                if (info.code == '200') {
                    settiposProducto(info.datos);
                } else {
                    settiposProducto([]);
                }
            });
            setEstado(true);
        }
    }, [estado, token]);

    useEffect(() => {
        if (!lote) {
            get_lote(token, params.params).then((info) => {
                if (info.code == '200') {
                    setLote(info.datos);
                }
                setEstado(true);
            });
        }
    }, [lote, token, params.params]);

    const validationSchema = Yup.object().shape({
        codigo: Yup.string().trim().required('El nombre es requerido'),
        nombre: Yup.string().trim().required('El apellido es requerido'),
        fecha_entrada: Yup.date().required('La fecha de nacimiento es requerida'),
        tipo_prdt: Yup.string().trim().required('El estado civil es requerido'),
        cantidad: Yup.number().required('La cantidad es requerida')
    });
    const formOptions = { resolver: yupResolver(validationSchema) };
    const { register, handleSubmit, formState, setValue } = useForm(formOptions);
    let { errors } = formState;
useEffect(() => {
    if (!lote && params.params) {
        get_lote(token, params.params).then((info) => {
            if (info.code == '200') {
                setLote(info.datos);
                // Convertir la fecha a formato yyyy-MM-dd antes de establecer el valor
                const formattedDate = convertDateToISO(info.datos.fecha_entrada);
                setValue('codigo', info.datos.codigo);
                setValue('nombre', info.datos.nombre);
                setValue('fecha_entrada', formattedDate); // Usar la fecha convertida
                setValue('tipo_prdt', info.datos.tipo_prdt.toLowerCase());
                setValue('cantidad', info.datos.cantidad);
            }
            setEstado(true);
        });
    }
}, [params.params, lote, setValue, token]);

// Función para convertir la fecha a formato yyyy-MM-dd
function convertDateToISO(stringDate) {
    const date = new Date(stringDate);
    return date.toISOString().split('T')[0];
}
    const sendInfo = async (data) => {
       
        let date = new Date(data.fecha_entrada);
        let year = date.getFullYear();
        let month = ('0' + (date.getMonth() + 1)).slice(-2); 
        let day = ('0' + date.getDate()).slice(-2);
        data.fecha_entrada = `${year}-${month}-${day}`;

        
        const info = await update_lote(data,params.params, token);
        if (info.status == '200') {
            swal({
                title: "Registro exitoso",
                text: "Lote actualizado correctamente",
                icon: "success",
                button: "Aceptar",
                timer: 4000,
                closeOnEsc: true,
            });
            router.push('/lote');
        } else {
            swal({
                title: "Error",
                text: "Nose pudo actulizar el lote",
                icon: "error",
                button: "Aceptar",
                timer: 4000,
                closeOnEsc: true,
            });
        }
    };

    return (
        <div className="container text-center mt-5" style={{ width: "40%", border: "2px solid black", padding: "20px", borderRadius: "15px", margin: "auto" }}>
            <form onSubmit={handleSubmit(sendInfo)} className="form-signin">
                <div className="mb-3">
                    <label className="form-label">Código:</label>
                    <input type="text" {...register('codigo')} name="codigo" placeholder="Código del lote" className="form-control" />
                    {errors.codigo && <div>{errors.codigo?.message}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Nombre:</label>
                    <input type="text" {...register('nombre')} name="nombre" placeholder="Nombre del lote" className="form-control" />
                    {errors.nombre && <div>{errors.nombre?.message}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Fecha de Entrada:</label>
                    <input type="date" {...register('fecha_entrada')} name="fecha_entrada" className="form-control" />
                    {errors.fecha_entrada && <div>{errors.fecha_entrada?.message}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Tipo de Producto:</label>
                    <select name="tipo_prdt" {...register('tipo_prdt')} className="form-control">
                        <option value="">Selecciona...</option>
                        {tiposProducto && tiposProducto.map((tipo, index) => (
                            <option key={index} value={tipo.toLowerCase()}>{tipo}</option>
                        ))}
                    </select>
                    {errors.tipo_prdt && <div>{errors.tipo_prdt?.message}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Cantidad:</label>
                    <input type="number" {...register('cantidad')} name="cantidad" placeholder="Cantidad" className="form-control" />
                    {errors.cantidad && <div>{errors.cantidad?.message}</div>}
                </div>
                <button type="submit" className="w-100 btn btn-sm btn-primary">Actualizar Lote</button>
            </form>
        </div>
    )
}