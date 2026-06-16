"use client";
import Input from "@/components/input";
import InputDescription from "@/components/input-description";
import Button from "@/components/button";
import { useEffect, useState } from "react";
import { callApi } from "@/components/call-api";
import { useRouter, useParams } from "next/navigation";
import { serverUrl, loggedUserId } from "@/global-variables";
import RedButton from "@/components/red-button";

export default function UpdateProject() {
  const [name, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  const getProject = async () => {
    try {
      const response = await fetch(`${serverUrl}/get-project/${id}`);
      const data = await response.json();
      const project = Array.isArray(data) ? data[0] : data;
      setProjectName(project?.name || "");
      setDescription(project?.desc || "");
    } catch (error) {
      console.error("Error al obtener el proyecto:", error);
    }
  };

  useEffect(() => {
    getProject();
  }, []);

  const updateProject = async (e) => {
    e.preventDefault();
    if (name === "") return window.alert("Nombre de proyecto vacío");

    setLoading(true);
    try {
      const associated_user_id = loggedUserId.value;
      await callApi(`${serverUrl}/update-project/${id}`, "PUT", {
        name,
        description,
        associated_user_id,
      });
      router.push("/boards");
    } catch (error) {
      console.error("Error actualizando proyecto:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este proyecto?")) return;
    try {
      await callApi(`${serverUrl}/delete-project/${id}`, "DELETE");
      router.push("/boards");
    } catch (error) {
      console.error("Error eliminando proyecto:", error);
    }
  };

  const cancel = () => router.push("/boards");

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20 flex flex-col items-center">
      <main className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-5xl font-bold text-white">Propiedades</h1>
          <RedButton onClick={deleteProject}>Eliminar</RedButton>
        </div>

        <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full">
          <div className="space-y-6">
            {/* Nombre */}
            <div>
              <div className="mb-2 font-medium text-white">Nombre de proyecto*</div>
              <Input
                type="text"
                value={name}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            {/* Descripción */}
            <div>
              <div className="mb-2 font-medium text-white">Descripción</div>
              <InputDescription
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-10 flex gap-4">
            <Button 
              onClick={updateProject} 
              disabled={loading}
              className={loading ? "opacity-50" : ""}
            >
              {loading ? "Aplicando..." : "Aplicar cambios"}
            </Button>
            <Button onClick={cancel} variant="secondary">
              Cancelar
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}