// frontend/src/components/withAuth.jsx
import { useRouter } from 'next/navigation'; // Corrige la importación de 'next/navigation' a 'next/router'
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import swal from 'sweetalert'; // Asume que SweetAlert está disponible globalmente o ajusta según tu método de importación

const middleware = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = Cookies.get('token');
      if (!token) {
        swal({
          title: "Acceso Denegado",
          text: "Debes estar logueado para acceder a esta página.",
          icon: "warning",
          button: "Ok",
        }).then((value) => {
          router.replace('/session'); // Asume que '/session' es tu ruta de inicio de sesión
        });
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};

export default middleware;