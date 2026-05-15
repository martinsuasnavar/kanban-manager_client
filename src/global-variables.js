import Cookies from "js-cookie";

//BACKEND_DOMAIN_API
let localHost = false;
/*
if (window.location.href.indexOf("localhost") > -1) {
    localHost = true;
}*/
let customDomain = false;

const localPort = 5000;

let serverUrl = `https://fieldproject-server.vercel.app/api`;
if (localHost){
    serverUrl = `http://localhost:${localPort}/api`;
}
if (customDomain){
    serverUrl = `?:${localPort}/api`;
}
export { serverUrl };



//SELECTED_PROJECT_ID
let selectedProjectId = { value: 11 };
export { selectedProjectId };

var userArray = [];

// Fetch users function
const fetchUsers = async () => {
    const response = await fetch(`${serverUrl}/users`);
    const data = await response.json();
    try {
        console.log("Fetching users...");
        userArray = data;
        console.log(userArray);
    } catch (error) {
        console.log(`Couldn't fetch users: `, error);
    }
};
fetchUsers();

export { userArray };

//CURRENT_PROJECT_NAME
let currentProjectName = { value: 'undefined '};
export { currentProjectName };



//CURRENT_EDITED_NOTE_ID
let editingNoteId = { value: 0 }
export { editingNoteId };



//get data arrays, unnecessary?
var projectArray = [];
/*
const dataReferences = ['sessions', 'projects', 'panels', 'notes'];
var DATA_ARRAYS = [];
const getAllDataTypes = async () => {
    for (let i = 0; i < dataReferences.length; i++){
        const response = await callApi(`${backendDomain}/${dataReferences[i]}`, "GET");

        //console.log('new data: ' +  DATA_ARRAYS[i])
    }
    projectArray = await callApi(`${backendDomain}/projects`, "GET");
}
getAllDataTypes();
export { DATA_ARRAYS };
export { projectArray };
*/
//LOGGED IN CONDITION
// Estados globales
let loggedIn = { value: false };
let loadingState = { value: true }; // true al inicio hasta saber el estado real
let loggedUserId = { value: 0 };
let loggedUserName = { value: "" };

// Función para obtener usuario logueado
const getLoggedUser = async () => {
  console.log("Obteniendo sesión del usuario...");
  loadingState.value = true;

  try {
    // Pedimos todas las sesiones al servidor
    const response = await fetch(`${serverUrl}/sessions`);
    if (!response.ok) throw new Error("No se pudo obtener sesiones");

    const sessions = await response.json();

  

    // Buscamos cookie local
    const sessionKey = Cookies.get("session_key");
    if (!sessionKey) {
      console.warn("No hay cookie de sesión.");
      loggedIn.value = false;
      loggedUserId.value = 0;
      return;
    }

    // Buscamos sesión activa en la lista del servidor
    const activeSession = sessions.find(
      (s) => s.session_key === sessionKey
    );

    if (activeSession) {
      console.log("Sesión válida encontrada:", activeSession);
      loggedIn.value = true;
      loggedUserId.value = activeSession.associated_user_id;
        const response = await fetch(`${serverUrl}/get-user/${loggedUserId.value}`);
        const data = await response.json();
      const user = Array.isArray(data) ? data[0] : data;
        loggedUserName.value=user?.username;
     
    } else {
      console.warn("Sesión inválida o expirada.");
      loggedIn.value = false;
      loggedUserId.value = 0;
    }
  } catch (error) {
    console.error("Error al obtener sesión:", error);
    loggedIn.value = false;
    loggedUserId.value = 0;
  } finally {
    loadingState.value = false;
  }
};

// Ejecutamos al cargar el módulo
await getLoggedUser();

// Exportamos los estados y función
export { loggedIn, loggedUserId, loggedUserName, loadingState, getLoggedUser };