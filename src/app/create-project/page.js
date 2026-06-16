"use client";
import Input from "@/components/input";
import InputDescription from "@/components/input-description";
import Button from "@/components/button";
import { useState } from "react";
import { callApi } from "@/components/call-api";
import { useRouter } from "next/navigation";
import { serverUrl, loggedUserId } from "@/global-variables";

export default function CreateProject() {
  const [name, setProjectName] = useState("");
  const [desc, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createProject = async (e) => {
    e.preventDefault();
    console.log("creando proyecto");
    
    if (name === "") {
      window.alert("Nombre de proyecto vacío");
      return;
    }

    setLoading(true);
    // Tu lógica original: navegar antes de la petición
    router.push("/boards");

    const associated_user_id = loggedUserId.value;

    try {
      const res = await callApi(`${serverUrl}/create-project`, "POST", {
        name,
        associated_user_id,
        desc
      });
      // La petición sigue en segundo plano mientras cambias de ruta
    } catch (error) {
      console.error("Error al crear:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => router.push("/boards");

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20 flex flex-col items-center">
      <main className="w-full max-w-xl">
        <h1 className="text-5xl mb-10 font-bold text-white text-center">
          Crear proyecto
        </h1>
        
        <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full">
          <div className="space-y-6">
            {/* Campo Nombre */}
            <div>
              <div className="mb-2 font-medium text-white">Nombre de proyecto*</div>
              <Input
                type="text"
                placeholder="Nombre del proyecto..."
                value={name}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            {/* Campo Descripción */}
            <div>
              <div className="mb-2 font-medium text-white">Descripción</div>
              <InputDescription 
                type="text" 
                placeholder="¿De qué trata este proyecto?" 
                value={desc}
                onChange={(e) => setDescription(e.target.value)}

              />
            </div>
          </div>

          <div className="mt-10 flex justify-start">
            <Button 
              onClick={createProject} 
              disabled={loading}
              className={loading ? "opacity-50" : ""}
            >
              {loading ? "Creando..." : "Crear proyecto"}
            </Button>
          </div>

             <div className="mt-10 flex justify-start">
            <Button 
              onClick={cancel}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}