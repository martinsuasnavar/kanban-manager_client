"use client";
import { useEffect, useState, useCallback } from "react";
import { serverUrl, loggedUserId, loggedIn, loadingState } from "@/global-variables";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admin, isAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const router = useRouter();

  // 1. Cargar todos los usuarios (Solo si es admin)
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${serverUrl}/users`); 
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Couldn't fetch users: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Verificar si el usuario actual es Administrador
  const checkAdminStatus = useCallback(async (userId) => {
    if (!userId || userId === 0) {
      isAdmin(false);
      setCheckingAuth(false);
      return;
    }

    try {
      const response = await fetch(`${serverUrl}/check-admin/${userId}`); 
      if (response.status === 200) {
        isAdmin(true);
        // 🔥 Cargamos los usuarios EN ESTE MOMENTO, asegurando que ya es admin
        await fetchUsers();
      } else {
        isAdmin(false);
      }
    } catch (error) {
      console.error("Couldn't verify admin status: ", error);
      isAdmin(false);
    } finally {
      setCheckingAuth(false);
    }
  }, [fetchUsers]);

  // 3. Efecto principal: Sincroniza con el estado global reactivo
  useEffect(() => {
    const verifyAndLoad = () => {
      // Si las variables globales todavía están leyendo las cookies, esperamos
      if (loadingState.value) return;

      // Si no está logueado, denegamos de inmediato
      if (!loggedIn.value || loggedUserId.value === 0) {
        isAdmin(false);
        setCheckingAuth(false);
        return;
      }

      // Si tenemos un ID válido, verificamos rango en el servidor
      checkAdminStatus(loggedUserId.value);
    };

    // Ejecutamos al cargar
    verifyAndLoad();

    // Escuchamos por si el usuario cambia de cuenta o desloguea mientras está aquí
    window.addEventListener("auth-change", verifyAndLoad);
    return () => window.removeEventListener("auth-change", verifyAndLoad);
  }, [checkAdminStatus]);

  // Mientras se decide si tiene permiso o no, mostramos pantalla de carga
  if (loadingState.value || checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="text-zinc-400 animate-pulse">Verificando credenciales...</p>
      </div>
    );
  }

  // Si no es admin, mostramos el acceso denegado estético
  if (!admin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white gap-4">
        <h2 className="text-2xl font-bold text-red-500">Acceso Denegado</h2>
        <p className="text-zinc-400 text-sm">No tienes permisos para ver el portal de administración.</p>
        <button 
          onClick={() => router.push("/boards")} 
          className="mt-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen p-8 pb-20 sm:p-20 bg-gray-950 text-white">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-5xl mb-10 font-bold">Portal administrador</h1>

        {loading ? (
          <p className="text-zinc-400">Cargando usuarios...</p>
        ) : (
          <div className="flex flex-col gap-4"> 
            {users.length > 0 ? (
              users.map((user, index) => (
                <div key={index} 
                  className={`flex items-center justify-between p-4 rounded-lg text-white transition-colors ${
                    user.deactivate ? "bg-red-900/30 border border-red-900 text-red-200" : "bg-gray-900 border border-gray-800"
                  }`}
                >
                  <span className="font-medium">{user.username}</span>
                  <div className="relative inline-block group">
                    <button 
                      className="cursor-pointer text-blue-400 hover:text-blue-300 font-medium transition-colors text-sm" 
                      onClick={() => router.push(`/admin-panel/user-manage/${user.id}`)}
                    >
                      Administrar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500">No se encontraron usuarios.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
