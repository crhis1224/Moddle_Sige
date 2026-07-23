import type { IStudent } from "@/api/api";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Student {
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

interface StudentState {
  selectedStudent: IStudent | null;
  // 'table' muestra la lista, 'form' muestra el formulario (ya sea para crear o editar)
  view: 'table' | 'form'; 
}

const initialState: StudentState = {
  selectedStudent: null,
  view: 'table',
};

export const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    // Acción para editar: guarda al alumno y cambia a la vista de formulario
    setSelectedStudent: (state, action: PayloadAction<IStudent>) => {
      state.selectedStudent = action.payload;
      state.view = 'form';
    },
    // Acción para inscripción nueva: limpia datos y cambia a la vista de formulario
    setNewStudentView: (state) => {
      state.selectedStudent = null;
      state.view = 'form';
    },
    // Acción para volver a la tabla y limpiar selección
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
      state.view = 'table';
    },
  },
});

export const { setSelectedStudent, setNewStudentView, clearSelectedStudent } = studentSlice.actions;
export default studentSlice.reducer;