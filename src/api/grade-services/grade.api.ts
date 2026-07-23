import axios from "axios";
import { axiosInstance } from "../api";
import type { IReporteOficialResponse } from "@/utilities/interface";

// --- MÉTODOS EN USO ---
//DOCENTE Y ALUMNOS
export const createGrade = async (data: any) => {
  try {
    const response = await axiosInstance.post("/grades", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al crear calificación");
  }
};
//DOCENTE Y ALUMNOS
export const updateGrade = async (id: number, data: any) => {
  try {
    const response = await axiosInstance.patch(`/grades/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al actualizar calificación");
  }
};
//DOCENTE Y ALUMNOS
export const getGradeByEnrollment = async (enrollmentId: number) => {
  try {
    const response = await axiosInstance.get(`/grades/enrollment/${enrollmentId}`);
    return await response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al registar docente");
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};
//DOCENTE Y ALUMNOS
export const getReporteOficial = async (studentId: string, year?: string): Promise<IReporteOficialResponse> => {
  try {
    const url = year 
      ? `/grades/reporte-oficial/${studentId}?year=${year}` 
      : `/grades/reporte-oficial/${studentId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el reporte oficial:", error);
    throw error;
  }
};



// Lógica de Announcements (mezclada en este archivo según el código provisto)
export interface IAnnouncement {
  id: number;
  title: string;
  content: string;
  priority: 'NORMAL' | 'IMPORTANTE' | 'URGENTE';
  type: 'GENERAL' | 'SUBJECT';
  subjectId?: string;
  createdAt: string;
  priorityExpiresAt: string | null;
}
//ADMIN,DOCENTES Y ALUMNOS
export const getMyFeed = async (): Promise<IAnnouncement[]> => {
  try {
    const response = await axiosInstance.get("/announcements/my-feed");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al cargar los avisos");
  }
};

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  priority: 'NORMAL' | 'IMPORTANTE' | 'URGENTE';
  type: "GENERAL" | "SUBJECT";
  subjectId?: string | null;
  priorityDays?: number;
}
//ADMIN y DOCENTES (Users)
export const createAnnouncement = async (data: CreateAnnouncementPayload) => {
  try {
    const response = await axiosInstance.post("/announcements", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al crear el aviso");
  }
};
//ADMIN y DOCENTES (Users)
export const getMyCreatedAnnouncements = async (authorId: string): Promise<IAnnouncement[]> => {
  try {
    const response = await axiosInstance.get(`/announcements/my-creations/${authorId}`);
    return response.data;
  } catch (error: any) {
    throw new Error("Error al cargar tus avisos");
  }
};
//ADMIN y DOCENTES (Users)
export const deleteAnnouncement = async (id: number, authorId: string) => {
  try {
    await axiosInstance.delete(`/announcements/${id}/${authorId}`);
  } catch (error: any) {
    throw new Error("No tienes permiso para eliminar este aviso");
  }
};

// --- MÉTODOS SIN USO DETECTADO EN LOS COMPONENTES PROPORCIONADOS ---
//DOCENTE Y ALUMNOS
export const getGradesByStudent = async (studentId: string) => {
  try {
    const response = await axiosInstance.get(`/grades/boleta/${studentId}`);
    return response.data;
  } catch (error) {
    throw new Error("Error al obtener el historial del alumno");
  }
};