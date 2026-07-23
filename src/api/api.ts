import axios from "axios";

export const BASE_URL_API = import.meta.env.VITE_API_REST_ADRESS;
/* export const tuToken =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzYW50aWFnbyIsImlhdCI6MTc1Nzc5MTUwNiwiZXhwIjoxNzU3ODc3OTA2fQ.Yg58mO0dKpZHc4x12AtOZwp5RZzTerB5vuv9EM_Hrf8"; */

export const axiosInstance = axios.create({
  baseURL: BASE_URL_API,
  withCredentials:true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar el token dinámicamente
/* axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Obtenemos el token directamente (es un string, no un JSON)
    const token = sessionStorage.getItem("auth_token");

    // 2. Si existe el token, lo inyectamos
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
 */
function generarIdConfiable() {
  const fecha = new Date().toISOString().slice(2, 4); // "26"
  // Generamos un valor aleatorio de 4 bytes convertido a hex
  const randomHex = window.crypto
    .getRandomValues(new Uint32Array(1))[0]
    .toString(16)
    .slice(-6);
  return `Al${fecha}-${randomHex}`;
}
//ADMIN y DOCENTES (Users)
export const fileUpdate = async (data: any) => {
  try {
    const response = await axios.post(
      "http://localhost:4000/upload-multiple",
      data,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al registar docente",
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};
//ADMIN y DOCENTES (Users)
export const removeFileExternal = async (urlFile: string) => {
  try {
    const response = await axios.delete(`http://localhost:4000/delete`, {
      data: { 
        urlFile // Aquí enviamos el string completo "/uploads/nombre.png"
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar archivo físico",
      );
    }
    throw new Error("Ocurrió un error inesperado.");
  }
};
//ADMIN y DOCENTES (Users)
export const fileDropZone = async (a: any, b: string) => {
  try {
    const directory = await fileUpdate(a);
    if (directory.statuscode === 201 && directory.files) {
      for (let index = 0; index < directory.files.length; index++) {
        await axiosInstance.post(`/files/${b}`, directory.files[index]);
      }
      return { status: 201, message: "ok" };
    }
    return { status: 500, message: "No se pudo subir los archivos" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al subir archivos",
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};

export interface IStudent {
  id?: string;
  semestre: string;
  // Datos Personales
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  sexo: string;
  estadoCivil: string;
  fechaNacimiento: string;
  edad: number;
  nacionalidad: string;
  lugarNacimiento: string;
  // Domicilio
  municipioResidencia: string;
  localidad: string;
  calle: string;
  numero: string;
  colonia: string;
  cp: string;
  // Contacto (Nombres de la Entity)
  telCasa: string;
  celular: string;
  correo: string;
  curp: string;
  // Escuela
  escuelaMunicipio: string;
  escuelaNombre: string;
  promedioFinal: number;
  // Tutor
  tutorApellidoPaterno: string;
  tutorApellidoMaterno: string;
  tutorNombres: string;
  tutorCalle: string;
  tutorNumero: string;
  tutorColonia: string;
  tutorCP: string;
  tutorTelCasa: string;
  tutorCelular: string;
  tutorOcupacion: string;
}

//SOLO ADMIN
export const createStudent = async (data: IStudent) => {
  try {
    const id = generarIdConfiable();
    const response = await axiosInstance.post("/student", { ...data, id });
    return response.status;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al registar alumno",
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};

// SOLO ADMIN
export const getStudents = async () => {
  try {
    const response = await axiosInstance.get("student");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al obtener registros",
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};

// SOLO ADMIN
export const permanentDeleteStudent = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/student/${id}/permanent`);

    // Retornamos tanto el status como el cuerpo
    return {
      success: true,
      status: response.status,
      message: response.data?.message, // Si el backend lo envía, lo tomamos
    };
  } catch (error) {
    let errorMessage = "Error de conexión al servidor";

    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.data?.message || "Error al eliminar permanentemente";
    }

    // En lugar de solo lanzar el error, podemos retornar el fallo estructurado
    // o lanzar un error con el mensaje limpio
    throw new Error(errorMessage);
  }
};
// --- DOCENTES (TEACHERS) ---
// SOLO ADMIN
export const permanentDeleteTeacher = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/teachers/${id}/permanent`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error crítico al eliminar docente",
      );
    }
    throw new Error("Error de conexión al servidor");
  }
};


export const updateStudent = async (data: IStudent) => {
  try {
    const response = await axiosInstance.patch(`/student/${data.id}`, data);
    return response.status;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Error al actualizar alumno del sistema",
      );
    }
    throw new Error("Error de conexión al servidor");
  }
};

// Definimos el tipo para los manejadores de mensajes
type MessageHandler = (entity: string) => string;

/**
 * Manejador universal de mensajes de respuesta.
 * Soporta códigos HTTP (números) y mensajes de error personalizados (strings).
 */
//ADMIN,DOCENTES Y ALUMNOS
export const getStatusAlert = (
  codeOrMessage: number | string,
  entity: string,
): string => {
  // Diccionario de éxitos y errores controlados por código HTTP
  // Usamos Record<number, MessageHandler> para asegurar el tipado de las funciones
  const messages: Record<number, MessageHandler> = {
    // --- ÉXITOS (2xx) ---
    200: (e) => `¡Listo! El registro del ${e} se actualizó correctamente.`,
    201: (e) => `¡Éxito! El ${e} ha sido registrado en el sistema.`,
    204: (e) => `El registro del ${e} ha sido eliminado con éxito.`,

    // --- ERRORES DE CLIENTE (4xx) ---
    400: (e) =>
      `No se pudo procesar el ${e}. Por favor, revisa que los datos sean correctos.`,
    401: (e) => `No tienes permisos para realizar esta acción sobre el ${e}.`,
    403: (e) => `Acceso prohibido al registro del ${e}.`,
    404: (e) =>
      `Error: El servidor no encontró la ruta o el registro del ${e}.`,
    409: (e) =>
      `Conflicto: Ya existe un ${e} con estos datos (posible duplicado).`,

    // --- ERRORES DE SERVIDOR (5xx) ---
    500: (e) => `Hubo un fallo en el servidor al intentar procesar al ${e}.`,
    503: (e) => `El servicio de ${e} no está disponible en este momento.`,
  };

  // CASO A: Si es un número (Código de estado HTTP)
  if (typeof codeOrMessage === "number") {
    const handler = messages[codeOrMessage];
    if (handler) {
      return handler(entity);
    }
    // Mensaje genérico si el código no está mapeado (ej. 202, 418)
    return `Estado ${codeOrMessage}: Se realizó una operación en el registro de ${entity}.`;
  }

  // CASO B: Si es un string (Mensaje directo del throw Error)
  if (typeof codeOrMessage === "string") {
    // Limpieza de mensajes genéricos o vacíos
    if (
      !codeOrMessage ||
      codeOrMessage.toLowerCase() === "error" ||
      codeOrMessage === "[object Object]"
    ) {
      return `Ocurrió un problema inesperado con el registro del ${entity}.`;
    }
    return codeOrMessage;
  }

  return "Ocurrió un error desconocido al procesar la solicitud.";
};
//ADMIN,DOCENTES Y ALUMNOS
export const auth = async (data: any) => {
  try {
    const response = await axiosInstance.post("auth/login", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al obtener registros",
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};
//ADMIN,DOCENTES Y ALUMNOS
export const getAuthCredentials = async () => {
  try {
    const response = await axiosInstance.get("auth/profile");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al obtener registros",
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};
//ADMIN Y ALUMNOS
export const getStudentById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/student/${id}`);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al obtener registros",
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};
//ADMIN Y ALUMNOS
export const getStudentByIdDadhboard = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/student/${id}/myself`);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al obtener registros",
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};

export const getEnrolledStudentsIds = async (
  subjectId: string,
): Promise<string[]> => {
  try {
    // Ajusta la URL según cómo esté configurado tu backend
    const response = await axiosInstance.get(
      `/enrollment/subject/${subjectId}`,
    );

    const data = response.data;

    // Asumiendo que el backend devuelve objetos, extraemos solo los IDs para facilitar el filtro
    return data.map((item: any) => item.studentId);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al obtener registros",
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};

// src/api/api.ts (o donde tengas tus servicios de student/user)

/**
 * Actualiza los datos de contacto y domicilio del alumno
 *///ADMIN Y ALUMNOS
export const updateStudentProfile = async (data: any) => {
  try {
    const response = await axiosInstance.patch(`/student/profile/update`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al actualizar perfil");
  }
};

/**
 * Cambia la contraseña del usuario logueado
 */
////ADMIN Y ALUMNOS
export const changeUserPassword = async (data: any) => {
  try {
    const response = await axiosInstance.patch(`/users/profile/change-password`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al cambiar contraseña");
  }
};
// Endpoint para cambiar el Correo Electrónico
////ADMIN Y ALUMNOS
export const changeUserEmail = async (data: { nuevoEmail: string }) => {
  try {
    // Nota: La URL debe coincidir con la definida en el Controller de NestJS
    const response = await axiosInstance.patch(`/users/change-email`, data);
    return response.data;
  } catch (error: any) {
    // Mantenemos tu lógica de propagación de errores
    console.log(error.response?.data)
    throw new Error(error.response?.data?.message || "Error al actualizar el correo");
  }
};


// METODOS SIN USO APARENTE
// --- ESTUDIANTES ---

// Borrado lógico (Soft Delete)
export const softDeleteStudent = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/student/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Error al mover estudiante a la papelera",
      );
    }
    throw new Error("Error de conexión al servidor");
  }
};

export const softDeleteTeacher = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/teachers/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al desactivar docente",
      );
    }
    throw new Error("Error de conexión al servidor");
  }
};
// --- MATERIAS (SUBJECTS) ---

export const softDeleteSubject = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/subjects/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al archivar la materia",
      );
    }
    throw new Error("Error de conexión al servidor");
  }
};

export const permanentDeleteSubject = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/subjects/${id}/permanent`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Error al eliminar la materia permanentemente",
      );
    }
    throw new Error("Error de conexión al servidor");
  }
};

// --- TAREAS (TASKS) ---

export const softDeleteTask = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar la tarea",
      );
    }
    throw new Error("Error de conexión al servidor");
  }
};

export const permanentDeleteTask = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/tasks/${id}/permanent`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Error al eliminar la tarea físicamente",
      );
    }
    throw new Error("Error de conexión al servidor");
  }
};
// --- USUARIOS (USERS) ---

export const softDeleteUser = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al desactivar usuario",
      );
    }
    throw new Error("Error de conexión al servidor");
  }
};

export const permanentDeleteUser = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/users/${id}/permanent`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Error al eliminar usuario del sistema",
      );
    }
    throw new Error("Error de conexión al servidor");
  }
};