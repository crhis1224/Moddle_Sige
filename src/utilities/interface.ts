// 1. Estructura exacta de cada materia en el arreglo 'subjects'
export interface IReporteMateria {
  subjectName: string;
  parcial1: number | null;
  parcial2: number | null;
  parcial3: number | null;
  examenExtraordinario: number | null;
  isAssigned: boolean; // El campo que faltaba
}

// 2. Respuesta completa de tu API /grades/reporte-oficial/
export interface IReporteOficialResponse {
  studentName: string;
  semester: string;
  year: string;
  divisorPlan: number;
  subjects: IReporteMateria[];
  periodo:string;
}

// 3. Interfaz para el estado local del componente MisAlumnos
export interface ICurrentStudentData {
  name: string;
  grades: IReporteMateria[];
  semestre: string;
  divisor: number;
  periodo: string;
}