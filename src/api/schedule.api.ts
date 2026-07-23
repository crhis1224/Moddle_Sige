import axios from "axios";
import { axiosInstance } from "./api";

export interface CreateScheduleDTO {
  subjectId: string;
  day: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado";
  startTime: string; // Formato "HH:mm"
  endTime: string;   // Formato "HH:mm"
  classroom?: string;
}
// SOLO ADMIN
export const createSchedule = async (scheduleData: CreateScheduleDTO) => {
  try {
    const response = await axiosInstance.post("/schedule", scheduleData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // NestJS envía el error en error.response.data
      const serverMessage = error.response?.data?.message;
      console.log(error.response?.data)
      console.log(error.response?.data?.message)

      // Si el mensaje es un array (por validaciones de DTO), tomamos el primero.
      // Si es un string (por BadRequestException manual), lo tomamos directo.
      const messageToShow = Array.isArray(serverMessage) 
        ? serverMessage[0] 
        : serverMessage;

      throw new Error(messageToShow || "Error al registrar el horario");
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};

// Función para obtener el horario desde el backend
//DOCENTE Y ALUMNOS
export const fetchMySchedule = async () => {
  // Axios debe estar configurado con el interceptor para el token JWT
  try {
    const response = await axiosInstance.get("/schedule/my-schedule");
    console.log(response.data)
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al obtener horario",
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};// Función para que el Admin obtenga TODOS los horarios de TODOS los profesores
// SOLO ADMIN
export const getAllSchedules = async () => {
  try {
    const response = await axiosInstance.get("/schedule");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al obtener todos los horarios");
    }
    throw new Error("Error inesperado al conectar con el servidor.");
  }
};

// Función para actualizar un horario específico
//SOLO ADMIN
export const updateSchedule = async (id: number, updateData: Partial<CreateScheduleDTO>) => {
  try {
    const response = await axiosInstance.patch(`/schedule/${id}`, updateData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al actualizar el horario");
    }
    throw new Error("Error inesperado al actualizar.");
  }
};

// Función para eliminar un horario
// SOLO ADMIN
export const deleteSchedule = async (id: number) => {
  try {
    await axiosInstance.delete(`/schedule/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al eliminar el horario");
    }
    throw new Error("Error inesperado al eliminar.");
  }
};

