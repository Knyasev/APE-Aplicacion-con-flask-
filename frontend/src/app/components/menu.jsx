import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { FaHome, FaBox, FaProductHunt, FaDoorOpen } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { get_person } from "@/hooks/Services_person";

const Menu = ({ children }) => {
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const external_id = Cookies.get('external_id');
    const token = Cookies.get('token');
    console.log("External ID:", external_id);
    if (external_id) {
      get_person(token,external_id).then(response => {
        console.log("Respuesta de get_person:", response);
        if (response.code === 200) {
          console.log("Rol del usuario:", response.datos.rol.nombre);
          setRol(response.datos.rol.nombre);
        }
      }).catch(error => {
        console.error("Error al obtener el rol del usuario:", error);
      });
    }
  }, []);

  const close = (e) => {
    Cookies.remove('token');
    Cookies.remove('user');
  };

  return (
    <div className="flex">
      <div className="fixed bg-gray-800 text-white h-screen z-10 w-64">
        <div className="flex flex-col items-center">
          <div className="mt-4">
            <Link href="/Home" className="text-white hover:text-gray-300 no-underline flex items-center">
              <FaHome className="mr-2"/> Home
            </Link>
          </div>

          {/* Enlace Producto visible para ADMINISTRADOR y BODEGUERO */}
          {(rol === "ADMINISTRADOR" || rol === "BODEGUERO") && (
            <div className="mt-4">
              <Link href="/producto" className="text-white hover:text-gray-300 no-underline flex items-center">
                <FaProductHunt className="mr-2"/> Producto
              </Link>
            </div>
          )}

          {/* Resto de enlaces específicos para ADMINISTRADOR */}
          {rol === "ADMINISTRADOR" && (
            <>
              <div className="mt-4">
                <Link href="/categoriaProducto" className="text-white hover:text-gray-300 no-underline flex items-center">
                  <FaProductHunt className="mr-2"/> Categoria Producto
                </Link>
              </div>
              <div className="mt-4">
                <Link href="/bodega" className="text-white hover:text-gray-300 no-underline flex items-center">
                  <FaProductHunt className="mr-2"/> Bodega
                </Link>
              </div>
              <div className="mt-4">
                <Link href="/sucursal" className="text-white hover:text-gray-300 no-underline flex items-center">
                  <FaBox className="mr-2"/> Sucursal
                </Link>
              </div>
            </>
          )}
          {(rol === "BODEGUERO" ||  rol === "PERSONAL") && (
            <div className="mt-4">
              <Link href="/stock" className="text-white hover:text-gray-300 no-underline flex items-center">
                <FaBox className="mr-2"/> Stock
              </Link>
            </div>
          )}
          {rol === "PERSONAL" && (
            <div className="mt-4">
              <Link href="/pedido" className="text-white hover:text-gray-300 no-underline flex items-center">
                <FaBox className="mr-2"/> Pedidos
              </Link>
            </div>
          )}

          {rol === "BODEGUERO" && (
            <> 
            <div className="mt-4">
              <Link href="/inventario" className="text-white hover:text-gray-300 no-underline flex items-center">
                <FaBox className="mr-2"/> Inventario
              </Link>
            </div>
            </>
            
          )}

          <div className="mt-4" style={{marginTop: "450px", borderRadius: "2px", textDecoration: "none"}}>
            <Link href="/session" className="text-white hover:text-gray-300 no-underline flex items-center" onClick={(e) => close(e)}>
              <FaDoorOpen className="mr-2"/> Cerrar sesión
            </Link>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4">
        {children}
      </div>
    </div>
  );
};

export default Menu;