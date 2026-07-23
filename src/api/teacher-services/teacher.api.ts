import axios from "axios";
import { axiosInstance } from "../api";
// SOLO ADMIN
export const registerTeacher = async (data: any) => {
  try {
    const response = await axiosInstance.post("/teachers", data);
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
export const updateTeacher = async (data: any) => {
  try {
    const response = await axiosInstance.patch(`/teachers/${data.id}`, data);
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
export const assignUserToTeacher = async (data: any,idteacher:string) => {
  try {
    const response = await axiosInstance.post(`/users/${idteacher}/user`, data);
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
export const assignUserToStudent = async (data: any,idStudent:string) => {
  try {
    const response = await axiosInstance.post(`/users/assignuser/${idStudent}`, data);
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
export const updateUser = async (data: any) => {
  try {
    const response = await axiosInstance.patch(`/users/${data.id}`, data);
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
export const getTeachers = async () => {
  try {
    const response = await axiosInstance.get(`/teachers/`,);
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
export const assignSubjectToTeacher = async (idTeacher: string,idsubject: string) => {
  try {
    const response = await axiosInstance.patch(`/teachers/${idTeacher}/assign-subject/${idsubject}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error al asignar la materia al docente"
      );
    }
    throw new Error("Ocurrió un error inesperado al conectar con el servidor.");
  }
};

//ADMIN y DOCENTES (Users)
export const findTeacherAndSubjects = async (idTeacher: string) => {
  try {
    const response = await axiosInstance.get(`/teachers/${idTeacher}`);
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

export const updateFullProfile = async (teacherId: string, userId: string, data: any) => {
  // 1. Actualización de datos personales (Tabla Teacher)
  const teacherUpdate = axiosInstance.patch(`teachers/${teacherId}`, {
    name: data.name,
    primerApellido: data.primerApellido,
    segundoApellido: data.segundoApellido,
  });

  // 2. Actualización de acceso (Tabla User)
  const userPayload: any = { 
    email: data.email,
    name: data.name // Actualizamos también el nombre en User para mantener consistencia
  };

  // Solo enviamos el password si el usuario escribió algo en el campo
  if (data.password && data.password.trim() !== "") {
    userPayload.password = data.password;
  }
  
  const userUpdate = axiosInstance.patch(`users/${userId}`, userPayload);

  // Ejecutamos ambas en paralelo para mayor eficiencia
  return await Promise.all([teacherUpdate, userUpdate]);
};