//nspage
'use client';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { login } from '@/hooks/Services_autheticate';
import swal from 'sweetalert';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function Session() {
  const router = useRouter();

  const validationSchema = Yup.object().shape({
    usuario: Yup.string().trim().required('El usuario es requerido'),
    clave: Yup.string().trim().required('La clave es requerida')
  });
   
 
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      router.replace('/loading'); 
      router.replace('/lote');
    }
  }, []);   

  
  
  const formOptions = { resolver: yupResolver(validationSchema) };
  const { register, handleSubmit, formState } = useForm(formOptions);
  let { errors } = formState;
  
  const sendInfo = (data) => {
    login(data).then((info) => {
      if (info.code == '200') {
        Cookies.set('token', info.datos.token, { expires: 1 });
        Cookies.set('usuario', info.datos.user, { expires: 1 });
        Cookies.set('external_id', info.datos.external_id, { expires: 1 });
        console.log(info);
        swal({
          title: "Bienvenido"+info.datos.user,
          text: "Sesion iniciada correctamente",
          icon: "success",
          button: "Accept",
          timer: 4000,
          closeOnEsc: true,
        });
        router.push('/lote');
        router.refresh();
      } else {
        swal({
          title: "Error",
          text: info.datos.error,
          icon: "error",
          button: "Accept",
          timer: 4000,
          closeOnEsc: true,
        });
        console.log(info);
        console.log("NO");
      }
    });
  };

  return (
    <>
    
    <div  style={{display:"flex",justifyContent:"center" , alignItems:"center"}}>
    <div style={{marginTop:"150px", height:"50%" ,width:"30%" ,alignItems:"center", borderRadius:"15px", border:"1px solid black",background:"white"}}> 
         <main className="form-signin text-center mt-5">
        <form onSubmit={handleSubmit(sendInfo)}>
          <h1 className="h3 mb-3 fw-normal">Inicie Sesion</h1>

          <div className="form-floating">
            <input type="text" name='usuario' {...register('usuario')} className="form-control" id="floatingInput" placeholder="name@example.com" />
            <label htmlFor="floatingInput">usuario</label>
            {errors.usuario && <div className="text-xs inline-block py-1 px-2 rounded text-red-600">{errors.usuario?.message}</div>}
          </div>
          <div className="form-floating">
            <input type="password" {...register('clave')} name='clave' className="form-control" id="floatingPassword" placeholder="Password" />
            <label htmlFor="floatingPassword">Clave</label>
            {errors.clave && <div className="text-xs inline-block py-1 px-2 rounded text-red-600">{errors.clave?.message}</div>}
          </div>

          <div className="styles.checkbox mb-3">
            <label>
              <input type="checkbox" value="remember-me" /> Remember me
            </label>
          </div>
          <button className="w-100 btn btn-lg btn-primary" type="submit">Iniciar Sesion</button>
        </form>
      </main>
      </div>
      </div>
      </>
  )
}