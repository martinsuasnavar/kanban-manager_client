import Cookies from "js-cookie";

// SERVER/SERVERLESS FUNCTIONS REFERENCE
const localHost = process.env.NEXT_PUBLIC_LOCALHOST === "true";
let customDomain = false;
const localPort = 5000;

let serverUrl = `https://fieldproject-server.vercel.app/api`;
if (localHost) {
    serverUrl = `http://localhost:${localPort}/api`;
}
if (customDomain) {
    serverUrl = `?:${localPort}/api`;
}
export { serverUrl };

// SELECTED_PROJECT_ID
let selectedProjectId = { value: 11 };
export { selectedProjectId };

var userArray = [];

// Fetch users function
const fetchUsers = async () => {
    try {
        console.log("Fetching users...");
        const response = await fetch(`${serverUrl}/users`);
        const data = await response.json();
        userArray = data;
        console.log(userArray);
    } catch (error) {
        console.log(`Couldn't fetch users: `, error);
    }
};

// Evitamos ejecutar fetches en la raíz si estamos en el servidor (SSR)
if (typeof window !== "undefined") {
    fetchUsers();
}

export { userArray };

// CURRENT_PROJECT_NAME
let currentProjectName = { value: 'undefined '};
export { currentProjectName };

// CURRENT_EDITED_NOTE_ID
let editingNoteId = { value: 0 };
export { editingNoteId };

var projectArray = [];

// ==========================================
// ESTADOS GLOBALES REACTIVOS (CON EVENTOS)
// ==========================================

// Función auxiliar para emitir el evento a la Navbar
const emitAuthChange = () => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-change"));
    }
};

export const loggedIn = {
    _value: false,
    get value() { return this._value; },
    set value(newValue) {
        this._value = newValue;
        emitAuthChange();
    }
};

export const loadingState = {
    _value: true,
    get value() { return this._value; },
    set value(newValue) {
        this._value = newValue;
        emitAuthChange();
    }
};

export const loggedUserId = {
    _value: 0,
    get value() { return this._value; },
    set value(newValue) {
        this._value = newValue;
        emitAuthChange();
    }
};

export const loggedUserName = {
    _value: "",
    get value() { return this._value; },
    set value(newValue) {
        this._value = newValue;
        emitAuthChange();
    }
};

// Función para obtener usuario logueado
const getLoggedUser = async () => {
  console.log("Obteniendo sesión del usuario...");
  loadingState.value = true;

  try {
    const response = await fetch(`${serverUrl}/sessions`);
    if (!response.ok) throw new Error("No se pudo obtener sesiones");

    const sessions = await response.json();
    const sessionKey = Cookies.get("session_key");
    
    if (!sessionKey) {
      console.warn("No hay cookie de sesión.");
      loggedIn.value = false;
      loggedUserId.value = 0;
      return;
    }

    const activeSession = sessions.find((s) => s.session_key === sessionKey);

    if (activeSession) {
      console.log("Sesión válida encontrada:", activeSession);
      
      // Asignamos el ID primero
      loggedUserId.value = activeSession.associated_user_id;
      
      const userResponse = await fetch(`${serverUrl}/get-user/${loggedUserId.value}`);
      const data = await userResponse.json();
      const user = Array.isArray(data) ? data[0] : data;
      
      // Guardamos el nombre y activamos el login
      loggedUserName.value = user?.username || "Usuario";
      loggedIn.value = true; 
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

// En Next.js, ejecutamos la inicialización de forma segura solo en el cliente
if (typeof window !== "undefined") {
    getLoggedUser();
}

export { getLoggedUser };