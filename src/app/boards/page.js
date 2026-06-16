"use client";
import Button from "@/components/button";
import CreateButton from "@/components/create-button";
import { callApi } from "@/components/call-api";
import { useState, useEffect, useCallback } from "react";
import { serverUrl, loggedIn, loggedUserId, loggedUserName, loadingState } from "@/global-variables";
import { useRouter } from "next/navigation";
import RedButton from "@/components/red-button";
import BoardList from "@/components/board-list";
import Cookies from "js-cookie";
import Image from "next/image";
import LoadingAnimation from "@/components/loading-animation";

export default function UserBoardsAccess() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admin, isAdmin] = useState(false);
  const [isAuth, setIsAuth] = useState(false); // Estado local para escuchar la sesión

  // Mapeador de etiquetas
  const permissionLabels = {
    read: "Solo lectura",
    write: "Escritura"
  };

  const getAdmin = async () => {
    try {
      const response = await fetch(`${serverUrl}/check-admin/${loggedUserId.value}`); 
      if(response.status==200){
        isAdmin(true);
      }else{
        isAdmin(false);
      }
    } catch (error) {
      console.error("Couldn't fetch users: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = useCallback(async () => {
    if (!loggedUserId.value || loggedUserId.value === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [projectsRes, permissionsRes] = await Promise.all([
        fetch(`${serverUrl}/users/${loggedUserId.value}/projects`),
        fetch(`${serverUrl}/users/${loggedUserId.value}/permissions`)
      ]);

      const projectsData = await projectsRes.json();
      const permissionsData = await permissionsRes.json();

      setProjects(projectsData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

// 1. Escuchar el evento global de autenticación (igual que haces en la Navbar)
  useEffect(() => {
    const syncAuth = () => {
      setIsAuth(loggedIn.value);
    };
    
    syncAuth(); // Sincroniza estado inicial
    window.addEventListener("auth-change", syncAuth);
    return () => window.removeEventListener("auth-change", syncAuth);
  }, []);

  // 2. Controlar la redirección y carga de datos basándonos en si la sesión terminó de cargar
  useEffect(() => {
    // Si las variables globales todavía están buscando la sesión en el backend, no hacemos nada.
    if (loadingState.value) return;

    // Una vez que terminó de cargar la sesión global:
    if (!loggedIn.value || loggedUserName.value === "no_user_found") {
      router.push("/login");
    } else {
      // Si el usuario existe y está autenticado, buscamos sus proyectos
      fetchUserData();
      getAdmin().finally(() => setLoading(false));
    }
  }, [isAuth, router, fetchUserData]);

  // Si la sesión global está cargando O el componente local está procesando los proyectos
  if (loadingState.value || loading) {
    return (
      <div className="p-20 text-white flex justify-center">
        <LoadingAnimation height="40" width="40"/>
      </div>
    );
  }

  const logOut = () => {
    Cookies.remove("session_key");
    loggedIn.value = false;
    loggedUserId.value = 0;
    router.push("/login");
  };

  const createBoard = async (linked_project_id) => {
    const res = await callApi(`${serverUrl}/create-board`, "POST", {
      linked_project_id,
    });

    if (res.status === 201 || !res?.message) {
      fetchUserData();
    }
  };

  const navigateTo = (path) => router.push("/" + path);

  if (loading) return <div className="p-20 text-white flex justify-center"><LoadingAnimation height="40" width="40"/></div>;

  return (
    <div className="bg-[url('/bg.png')] bg-no-repeat bg-fixed bg-cover bg-center font-sans min-h-screen p-8 sm:p-20 text-white">
      <main className="max-w-6xl mx-auto">
        
      
        <div className="project-container">
          <div className="flex gap-6 items-center mb-8">
            <h1 className="text-5xl font-bold">Proyectos</h1>
            <button
              className="bg-green-500 hover:bg-green-400 transition-colors rounded-full px-4 py-2 text-black font-bold shadow-lg cursor-pointer"
              onClick={() => navigateTo("create-project")}
            >
              + Nuevo proyecto
            </button>
          </div>

          {/* SECTION: My Projects */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/20 pb-2">📂 Mis proyectos</h2>
            <div className="grid gap-8">
              {projects.length > 0 ? projects.map((project) => (
                <div key={project.id} className="bg-white/10 p-6 rounded-xl backdrop-blur-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-3xl font-semibold">{project.name}</h3>
                    <div className="flex gap-2">
                      <Button onClick={() => navigateTo(`members/${project.id}`)}>Miembros</Button>
                      <Button onClick={() => navigateTo(`settings/${project.id}`)}>Propiedades</Button>
                    </div>
                  </div>

                  <div className="flex gap-4 flex-wrap items-center">
                    <BoardList linked_project_id={project.id} />
                    <CreateButton onClick={() => createBoard(project.id)} />
                  </div>
                </div>
              )) : <p className="text-gray-400 italic">No has creado proyectos aún.</p>}
            </div>
          </section>

          {/* SECTION: Shared Projects */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b border-white/20 pb-2">🤝 Compartidos conmigo</h2>
            <div className="grid gap-6">
              {permissions.length > 0 ? permissions.map((perm) => (
                <div key={perm.linked_project_id} className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/30">
                  <div className="flex items-baseline gap-3 mb-4">
                    <h3 className="text-2xl font-bold text-blue-100">{perm.project_name}</h3>
                    <span className="text-blue-400 text-sm">por {perm.user_name}</span>
                    
                    {/* Badge con traducción y color dinámico */}
                    <span className={`text-xs px-2 py-1 rounded uppercase tracking-wider font-bold shadow-sm ${
                      perm.type === "write" 
                        ? "bg-orange-500 text-white" 
                        : "bg-blue-600 text-white"
                    }`}>
                      {permissionLabels[perm.type] || perm.type}
                    </span>
                  </div>
                  <BoardList linked_project_id={perm.linked_project_id} />
                </div>
              )) : <p className="text-gray-400 italic">No hay proyectos compartidos contigo.</p>}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}