import axios from "axios";
import { axiosInstance } from "../api";
import type { StudyPlanData } from "@/scennes/CreateStudyPlan";
// SOLO ADMIN
export const registerStudyPlan=async(data:StudyPlanData)=>{
    try {
    const response = await axiosInstance.post("study-plans",data);
    console.log(response.data)
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        // Esto extraerá "Ya existe un plan para este periodo" enviado por NestJS
        throw new Error(error.response?.data?.message || "Error al conectar con el servidor");
    }
    throw new Error("Ocurrió un error inesperado.");
  }
}
// SOLO ADMIN
export const getAvailablePlanYears = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get("study-plans/available-years");
    return response.data;
  } catch (error) {
    console.error("Error al obtener los años de los planes:", error);
    return []; // Retornamos un array vacío como fallback
  }
};