"use client";
import { loggedUserId, serverUrl } from "@/global-variables";
import { useState, useEffect } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${serverUrl}/get-user/${loggedUserId.value}`);
      const data = await response.json();
      setUser(Array.isArray(data) ? data[0] : data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedUserId.value) {
      fetchUser();
    }
  }, [loggedUserId.value]);

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl transition-all dark:bg-gray-800">
        
        {/* Banner superior estético */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />

        <div className="px-6 pb-8 pt-4">
          {/* Avatar circular con inicial */}
          <div className="relative -mt-20 mb-4 flex justify-center">
            <div className="h-24 w-24 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-md dark:border-gray-800">
              {loading ? "..." : user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>

          {/* Bloque de información / Carga */}
          {loading ? (
            /* Esqueleto de carga animado (Skeleton) */
            <div className="animate-pulse space-y-4 text-center">
              <div className="mx-auto h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mx-auto h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ) : user ? (
            /* Vista de datos reales del usuario */
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {user.username}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Perfil de Usuario
              </p>

              <hr className="my-6 border-gray-100 dark:border-gray-700" />

              {/* Detalles en filas limpias */}
              <div className="space-y-3 text-left">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
                    Nombre de usuario
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user.username}
                  </span>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
                    Correo Electrónico
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 break-all">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Estado de error o usuario no encontrado */
            <p className="text-center text-sm text-red-500">
              No se pudo cargar la información del usuario.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}