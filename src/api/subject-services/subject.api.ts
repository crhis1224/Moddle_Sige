import axios from "axios";
import { axiosInstance } from "../api";

interface Data {
  id: string;
  title: string;
  description: string;
  dueDate?: Date | string; // Añadimos soporte para la fecha
}

// Interfaz para la inscripción masiva
interface BulkEnrollData {
  subjectId: string;
  studentIds: string[];
}
// SOLO ADMIN
export const registerSubject  = async (data: any) => {
  try {
    const response = await axiosInstance.post("/subjects", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al registar docente"
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};
// SOLO ADMIN
export const updateSubject  = async (data: any) => {
  try {
    const response = await axiosInstance.patch(`/subjects/${data.id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al registar docente"
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};
//ADMIN,DOCENTES Y ALUMNOS
export const getSubject  = async () => {
  try {
    const response = await axiosInstance.get(`/subjects`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al registar docente"
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};
//ADMIN y DOCENTES (Users)
export const registertask  = async (data: Data,idSubject:string) => {
  try {
    const response = await axiosInstance.post(`/tasks/${idSubject}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al registar tarea"
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};

//ADMIN y DOCENTES (Users)
export const updatetask  = async (data: Data) => {
  try {
    const response = await axiosInstance.patch(`/tasks/${data.id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al registar docente"
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};
//ADMIN y DOCENTES (Users)
export const findOneWithTasks  = async (idSubject: string) => {
  try {
    const response = await axiosInstance.get(`/subjects/one/${idSubject}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al buscar docente"
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};
//ADMIN y DOCENTES (Users)
export const getStudentsAndTasksBySubject  = async (idSubject: string) => {
  try {
    const response = await axiosInstance.get(`subjects/${idSubject}/enrollment-details`);
    console.log("response",response.data)
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al buscar docente"
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};
// SOLO ADMIN
export const deleteSubjectPermanent  = async (id:string) => {
  try {
    const response = await axiosInstance.delete(`/subjects/${id}/permanent`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al registar docente"
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};

//SOLO ADMIN
export const bulkEnrollStudents = async (data: BulkEnrollData) => {
  try {
    const response = await axiosInstance.post("/enrollment/bulk", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al inscribir alumnos"
      );
    }
    throw new Error("Error inesperado al procesar la inscripción.");
  }
};

//ADMIN y DOCENTES (Users)
export const deleteTask = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar la tarea"
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};
//ADMIN y DOCENTES (Users)
export const updateTaskStatus = async (id: string, status: "Abierto" | "Cerrado" ) => {
  try {
    // Enviamos solo el campo status
    const response = await axiosInstance.patch(`/tasks/${id}`, { status });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al actualizar estado");
    }
    throw new Error("Error de conexión");
  }

  
};
//ADMIN y DOCENTES (Users)
export const getTask = async (id:string)=>{
try {
    // Enviamos solo el campo status
    const response = await axiosInstance.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al actualizar estado");
    }
    throw new Error("Error de conexión");
  }
}
//SOLO ADMIN
export const getAllSubjects = async () => {
  try {
    // Usamos el mismo endpoint que getSubject pero con un nombre más descriptivo
    // para el propósito de listar en el Plan de Estudios
    const response = await axiosInstance.get("/subjects");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al obtener la lista de materias"
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
}
//DOCENTE Y ALUMNOS
export const getMySubjects = async (studentId: string) => {
  try {
    const response = await axiosInstance.get(`/subjects/student/${studentId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al obtener tus materias");
    }
    throw new Error("Error de conexión al servidor");
  }
};
//DOCENTE Y ALUMNOS
export const getSubjectDetails = async (subjectId: string, studentId: string) => {
  
  try {
    const response = await axiosInstance.get(`/subjects/${subjectId}/student/${studentId}`);

  return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al obtener tus detalles");
    }
    throw new Error("Error de conexión al servidor");
  }
};
// Frontend - subject.api.ts (o donde tengas tus APIs de tareas)


//DOCENTE Y ALUMNOS
export const submitTaskDelivery = async (studentId: string, payload: any) => {
  try {
    const response = await axiosInstance.post(`/submissions/student/${studentId}`, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al cargar la tarea");
    }
    throw new Error("Error de conexión al servidor");
  }
};

// En tu archivo de peticiones API (ej. subject.api.ts)
//DOCENTE Y ALUMNOS
export const deleteFileFromSubmission = async (fileId: number) => {
  try {
    const response = await axiosInstance.delete(`/tasks/file/${fileId}`);
  return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al eliminar la tarea");
    }
    throw new Error("Error de conexión al servidor");
  }
  
};



//METODOS SIN USO
export const submitTask = async (studentId:string, submissionData:any) => {
  // submissionData debe contener: taskId, title, description y files
  try {
    const response = await axiosInstance.post(`/submissions/student/${studentId}`, submissionData);
  return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al agregar");
    }
    throw new Error("Error de conexión al servidor");
  }
};

export const deleteSubmissionFile = async (fileId:number) => {
  try {
    const response = await axios.delete(`/submissions/file/${fileId}`);
  return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al eliminar el archivo");
    }
    throw new Error("Error de conexión al servidor");
  }
};
export const submitTaskDeliverya = async (idStudent: string, idSubject: string, data: any) => {
  try {
    // Usamos el NUEVO endpoint: /tasks/student-delivery/...
    console.log("submittask",idStudent,idSubject,data)
    const response = await axiosInstance.post(`/tasks/student-delivery/${idStudent}/${idSubject}`, data);
    return response.data;
  } catch (error) {
    
  }
};