'use client';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { get_estados, create_producto, get_productos ,create_producton} from "@/hooks/Services_producto";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { useRouter } from 'next/navigation'; // Corrected from 'next/navigation'
import { get_lote, get_lotes } from '@/hooks/Services_lote';
export default function New(params) {
    const router = useRouter();
    const [estados, setEstados] = useState([]);
    const [productos, setProductos] = useState(null);
    const token = Cookies.get('token');
    const[lote, setLote] = useState(null);
    const [lotes,setLotes] = useState(null);
    const lote_external = params.searchParams.lote; // Aquí obtienes el valor de lote

    useEffect(() => {
    get_estados(token).then((info) => {
        if (info.code == '200') {
            setEstados(info.datos);
        } else {
            console.log(info.error);
            setEstados([]);
        }
    });
    if (!productos) {
        get_productos(token).then((info) => {
            if (info.code == '200') {
                setProductos(info.datos);
            } else {
                setProductos([]);
            }
        });
    }
        // Solo intenta obtener el lote si lote_external está definido
    if (!lote && lote_external) {
        get_lote(token, lote_external).then((info) => {
            if (info.code == '200') {
                setLote(info.datos);
                console.log(info.datos);
            }
        });
    }
    if (!lotes) {
        get_lotes(token).then((info) => {
            if (info.code == '200') {
                setLotes(info.datos);
                console.log(info.datos);
            } else {
                setLotes([]);
            }
        });
    }
}, [token, productos, lote_external, lote, lotes]);

    const validationSchema = Yup.object().shape({
        precio: Yup.number().required('El precio es requerido'),
        estado: Yup.string().trim().required('El estado es requerido'),
        fecha_prod: Yup.date().required('La fecha de producción es requerida'),
        fecha_venc: Yup.date().required('La fecha de vencimiento es requerida'),
    });

    const formOptions = { resolver: yupResolver(validationSchema) };
    const { register, handleSubmit, formState: { errors } } = useForm(formOptions);
    const sendInfo = async (data) => {
        const formatDate = (date) => {
            let newDate = new Date(date);
            let year = newDate.getFullYear();
            let month = ('0' + (newDate.getMonth() + 1)).slice(-2);
            let day = ('0' + newDate.getDate()).slice(-2);
            return `${year}-${month}-${day}`;
        };


        const productoData = {
            precio: data.precio,
            estado: data.estado,
            fecha_prod: formatDate(data.fecha_prod),
            fecha_venc: formatDate(data.fecha_venc),
        };
        if (!lote_external) {
            productoData.lote = data.lote;
            console.log("ProductoData:", productoData);
    // Asegúrate de pasar el external_id correctamente    const info = await create_producton(productoData, token, lote);
}
        const info = await create_producton(productoData, token,{lote:lote_external});
        if (info && info.status == '200') {
            swal({
                title: "Registro exitoso",
                text: "Producto registrado correctamente",
                icon: "success",
                button: "Aceptar",
                timer: 4000,
                closeOnEsc: true,
            });
            router.push('/producto');
        } else {
            swal({
                title: "Error",
                text: info ? info.datos.error : "No se puede guardar producto ha alzancado el tamaño maximo del lote",
                icon: "error",
                button: "Aceptar",
                timer: 4000,    
                closeOnEsc: true,
            });
        }
    };

return (
    <div className="container text-center mt-5" style={{width: "40%", border: "2px solid black", padding: "20px", borderRadius: "15px", margin: "auto"}}>
        <form onSubmit={handleSubmit(sendInfo)} className="form-signin">
        {!lote_external && (
                    <div className="mb-3">
                        <label className="form-label">Lote:</label>
                        <select {...register('lote')} name="lote" className="form-control">
                            <option value="">Selecciona un lote...</option>
                            {lotes && lotes.map((lote, index) => (
                                <option key={index} value={lote.external_id}>{lote.nombre}</option>
                            ))}
                        </select>
                        {errors.lote && <div>{errors.lote?.message}</div>}
                    </div>
                )}
            <div className="mb-3">
                <label className="form-label">Precio:</label>
                <input type="number" {...register('precio')} name="precio" placeholder="Precio" className="form-control" step="0.01"/>                {errors.precio && <div>{errors.precio?.message}</div>}
            </div>
            <div className="mb-3">
                <label className="form-label">Estado:</label>
                <select name="estado" {...register('estado')} className="form-control">
                    <option value="">Selecciona...</option>
                    {/* Suponiendo que tienes una lista de estados posibles para el producto */}
                    {estados && estados.map((estado, index) => (
                        <option key={index} value={estado.toLowerCase()}>{estado}</option>
                    ))}
                </select>
                {errors.estado && <div>{errors.estado?.message}</div>}
            </div>
  
            <div className="mb-3">
                <label className="form-label">Fecha de Producción:</label>
                <input type="date" {...register('fecha_prod')} name="fecha_prod" className="form-control"/>
                {errors.fecha_prod && <div>{errors.fecha_prod?.message}</div>}
            </div>
            <div className="mb-3">
                <label className="form-label">Fecha de Vencimiento:</label>
                <input type="date" {...register('fecha_venc')} name="fecha_venc" className="form-control"/>
                {errors.fecha_venc && <div>{errors.fecha_venc?.message}</div>}
            </div>
            <button type="submit" className="w-100 btn btn-sm btn-primary">Registrar Producto</button>
        </form>
    </div>
);
}