"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loggedUserName, loggedUserId, loggedIn, serverUrl } from "@/global-variables";
import { useState, useEffect, useCallback } from "react"; 
import Image from "next/image";
import Cookies from "js-cookie";
import LoadingAnimation from "./loading-animation";

export default function Navbar() {
  const router = useRouter();
  const [admin, isAdmin] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(0);

  // useCallback evita que la función se recree innecesariamente
  const getAdmin = useCallback(async (userId) => {
    if (!userId) {
      isAdmin(false);
      return;
    }
    try {
      const response = await fetch(`${serverUrl}/check-admin/${userId}`); 
      isAdmin(response.status === 200);
    } catch (error) {
      console.error("Couldn't fetch admin status: ", error);
      isAdmin(false);
    }
  }, []);

  const logOut = () => {
    Cookies.remove("session_key");
    loggedIn.value = false;
    loggedUserId.value = 0;
    loggedUserName.value = "";
    router.push("/login");
  };

  useEffect(() => {
    // Función para leer los valores globales actuales y guardarlos en el estado de React
    const syncAuthState = () => {
      setIsAuth(loggedIn.value);
      setCurrentUserId(loggedUserId.value);
      console.log(loggedUserId.value + " changed and synchronized!");
    };

    // Sincronizamos la primera vez que se monta el componente
    syncAuthState();

    // Escuchamos el evento personalizado que creamos en el Paso 1
    window.addEventListener("auth-change", syncAuthState);

    // Limpiamos el evento cuando el componente se destruye para evitar fugas de memoria
    return () => window.removeEventListener("auth-change", syncAuthState);
  }, []);

  // Este efecto corre únicamente cuando el ID del usuario realmente cambia en el estado
  useEffect(() => {
    if (currentUserId !== 0) {
      getAdmin(currentUserId);
    }
  }, [currentUserId, getAdmin]);

  // GUARD CLAUSE: Si no está autenticado o el ID es 0, no muestra nada
  if (!isAuth || currentUserId === 0) return null; // Usar null es mejor práctica que <div></div> para ocultar

  return (
    <nav className="top-0 left-0 w-full flex items-center justify-between p-6 bg-gray-900/95 backdrop-blur-sm text-white shadow-lg z-[100] border-b border-gray-800">
      <div 
        className="text-2xl font-bold cursor-pointer hover:text-blue-400 transition-colors"
        onClick={() => router.push("/")}
      >
        <Image alt="icono home" src="/home-icon.webp" width={20} height={20} /> 
      </div>
      
      <div className="flex gap-6 items-center">
        <div className="relative group">
          <button 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer text-sm"
          >
            <Image alt="icono de usuario" src="/user-icon.webp" width={20} height={20} /> 
            {loggedUserName.value || <LoadingAnimation height="15" width="15" />}
          </button>

          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
            <div className="py-2 text-sm">
              <Link href="/profile" className="block px-4 py-2 hover:bg-gray-700 transition-colors">
                Mi Perfil
              </Link>
              {admin && (
                <Link href="/admin-panel" className="block px-4 py-2 hover:bg-gray-700 transition-colors text-blue-400">
                  Portal Administrador
                </Link>
              )}
              <hr className="border-gray-700 my-1" />
              <button
                onClick={logOut}
                className="w-full text-left px-4 py-2 hover:bg-red-900/40 text-red-400 transition-colors font-medium cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}