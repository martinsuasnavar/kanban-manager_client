"use client";
import CreateButton from "@/components/create-button";
import Button from "@/components/button";
import { useParams, useRouter } from "next/navigation";
import { serverUrl } from "../../../global-variables";
import { useState, useEffect } from "react";
import { callApi } from "@/components/call-api";

export default function Members() {
  const router = useRouter();
  const [associatedUsers, setAssociatedUsers] = useState([]);
  const { id } = useParams();

  const permissionLabels = {
    read: "Solo lectura",
    write: "Escritura"
  };

  const getAssociatedUsers = async () => {
    try {
      const response = await fetch(`${serverUrl}/get-project-users/${id}`);
      const data = await response.json();
      setAssociatedUsers(data);
    } catch (error) {
      console.error("Error al obtener los usuarios del proyecto:", error);
    }
  };

  const updateAssociatedUser = async (e, permissionId, newPermissionType) => {
    e.preventDefault();
    try {
      await callApi(`${serverUrl}/update-permission-type/${permissionId}`, "PUT", {
        type: newPermissionType,
      });
      getAssociatedUsers();
    } catch (error) {
      console.error("Error updating permission:", error);
    }
  };

  const deleteAssociatedUser = async (permissionId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar a este miembro?")) return;
    try {
      await callApi(`${serverUrl}/delete-permission/${permissionId}`, "DELETE");
      getAssociatedUsers();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
    }
  };

  useEffect(() => {
    getAssociatedUsers();
  }, [id]);

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20 bg-gray-900 text-white">
      <main className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-bold">Miembros</h1>
          <CreateButton onClick={() => router.push(`/members/${id}/add-member`)}>
            Agregar miembro
          </CreateButton>
        </div>

        <div className="space-y-4">
          {associatedUsers.length > 0 ? (
            associatedUsers.map((user) => (
              <div key={user.permission_id} className="flex items-center gap-2">
                {/* ... tu código del map actual ... */}
                <div className="flex flex-1 items-center bg-gray-800 p-4 rounded-lg shadow-md">
                  <div className="font-medium text-lg">{user.username}</div>
                  
                  <div className="ml-auto relative group">
                    <button className={`text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 min-w-[140px] justify-between ${
                      user.permission_type === "write" 
                        ? "bg-orange-500 hover:bg-orange-600" 
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}>
                      {permissionLabels[user.permission_type] || user.permission_type}
                      <span className="text-xs">▼</span>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                      <div className="px-4 py-2 text-xs text-gray-400 border-b">Cambiar permiso</div>
                      {user.permission_type !== "read" && (
                        <button 
                          onClick={(e) => updateAssociatedUser(e, user.permission_id, "read")}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                        >
                          Solo lectura
                        </button>
                      )}
                      {user.permission_type !== "write" && (
                        <button 
                          onClick={(e) => updateAssociatedUser(e, user.permission_id, "write")}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                        >
                          Escritura
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => deleteAssociatedUser(user.permission_id)}
                  className="p-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-bold"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            /* MENSAJE CUANDO NO HAY MIEMBROS */
            <div className="flex flex-col items-center justify-center p-20 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700 text-gray-400">
              <span className="text-5xl mb-4">👥</span>
              <p className="text-xl font-medium">No hay miembros disponibles</p>
              <p className="text-sm">Aún no has añadido colaboradores a este proyecto.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}