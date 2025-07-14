import React from 'react';
import Link from "next/link";
import { FaHome, FaBox, FaProductHunt, FaDoorOpen } from 'react-icons/fa'; // Importa los iconos
import Cookies from 'js-cookie';

const Menu = ({ children }) => {
  const close = (e) => {
    //console.log("HOLA");
    Cookies.remove('token');
    Cookies.remove('user');
    
  }
  return (
    <div className="flex ">
      <div className="fixed bg-gray-800 text-white h-screen z-10 w-64">
        <div className="flex flex-col items-center">
          <div className="mt-4">
            <Link href="/Home" className="text-white hover:text-gray-300 no-underline flex items-center">
              <FaHome className="mr-2"/> Home {/* Icono de casa para Home */}
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/lote" className="text-white hover:text-gray-300 no-underline flex items-center">
              <FaBox className="mr-2"/> Lote {/* Icono de caja para Lote */}
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/producto" className="text-white hover:text-gray-300 no-underline flex items-center">
              <FaProductHunt className="mr-2"/> Producto {/* Icono de producto */}
            </Link>
          </div>
          
          <div className="mt-4" style={{marginTop: "450px", borderRadius: "2px", textDecoration: "none"}}>
            <Link href="/session" className="text-white hover:text-gray-300 no-underline flex items-center" onClick={(e) => close(e)}>
              <FaDoorOpen className="mr-2"/> Cerrar sesión {/* Icono de puerta abierta para Cerrar sesión */}
            </Link>
          </div>
          {/* Más enlaces aquí */}
        </div>
      </div>
      {/* Contenido principal */}
      <div className="flex-1 p-4">
        {children} {/* Uso de children para mostrar contenido dinámico */}
      </div>
    </div>
  );
};

export default Menu;