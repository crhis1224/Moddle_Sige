// 1. Tipo para el archivo individual
export type TaskFile = {
  id: number;
  name: string;
  url: string;
};

// 1. Tipo para una Tarea (dentro del arreglo submittedTasks)
export type ApiTask = {
  taskId: string;
  title: string;
  description: string;
  status: string; // Estatus de la tarea/entrega
  files: TaskFile[]; // <-- Agregado
};

// 2. Tipo para un Estudiante (el objeto principal que recibes)
export type ApiStudentEntry = {
  id: string; // ID del Estudiante
  name: string; // Nombre del Estudiante
  enrollmentId: number;
  submittedTasks: ApiTask[];
};
export type FlattenedTableRow = {
  // Datos del Alumno (repetidos en cada fila)
  studentId: string;
  studentName: string;
  enrollmentId: number;

  // Datos de la Tarea
  taskId: string;
  taskTitle: string;
  taskStatus: string;
  taskDescription: string;

  files: TaskFile[]; // <-- Agregado para que el Modal pueda leerlos
};

export const getFlattenedData = (
  apiData: ApiStudentEntry[],
): FlattenedTableRow[] => {
  const flattened: FlattenedTableRow[] = [];

  apiData.forEach((student) => {
    // Si no hay tareas
    if (!student.submittedTasks || student.submittedTasks.length === 0) {
      
      flattened.push({
        studentId: student.id,
        studentName: student.name,
        enrollmentId: student.enrollmentId,
        taskId: "N/A",
        taskTitle: "Sin entregas",
        taskStatus: "N/A",
        taskDescription: "",
        files: [], // Array vacío
      });
      return;
    }


    // Por cada tarea, generamos una fila
    student.submittedTasks.forEach((task) => {
      flattened.push({
        studentId: student.id,
        studentName: student.name,
        enrollmentId: student.enrollmentId,
        taskId: task.taskId,
        taskTitle: task.title,
        taskStatus: task.status,
        taskDescription: task.description,
        files: task.files || [], // Pasamos los archivos reales de la tarea
      });
    });
  });


  return flattened;
};

/* export const data: Entrgas[] = [
  {
    id: "m5gr84i9",
    nombreAlumno: "aaron",
    status: "success",
    archivo: "ken99@example.com",
    submittedTasks: [
      {
        taskId: "T005",
        title: "Entrega 1: Normalización",
        description: "Documento con la 3FN de los esquemas.",
        status: "CALIFICADO",
      },
      {
        taskId: "T005",
        title: "Entrega 1: Normalización",
        description: "Documento con la 3FN de los esquemas.",
        status: "CALIFICADO",
      },
      // María solo ha entregado una tarea de esta materia hasta ahora.
    ],
  },
  {
    id: "3u1reuv4",
    nombreAlumno: "perez",
    status: "success",
    archivo: "Abe45@example.com",
    submittedTasks: [
      {
        taskId: "T005",
        title: "Entrega 1: Normalización",
        description: "Documento con la 3FN de los esquemas.",
        status: "CALIFICADO",
      },
      // María solo ha entregado una tarea de esta materia hasta ahora.
    ],
  },
  {
    id: "derv1ws0",
    nombreAlumno: "gomez",
    status: "processing",
    archivo: "Monserrat44@example.com",
    submittedTasks: [
      {
        taskId: "T005",
        title: "Entrega 1: Normalización",
        description: "Documento con la 3FN de los esquemas.",
        status: "CALIFICADO",
      },
      // María solo ha entregado una tarea de esta materia hasta ahora.
    ],
  },
  {
    id: "5kma53ae",
    nombreAlumno: "pascual",
    status: "success",
    archivo: "Silas22@example.com",
    submittedTasks: [
      {
        taskId: "T005",
        title: "Entrega 1: Normalización",
        description: "Documento con la 3FN de los esquemas.",
        status: "CALIFICADO",
      },
      // María solo ha entregado una tarea de esta materia hasta ahora.
    ],
  },
  {
    id: "bhqecj4p",
    nombreAlumno: "juan",
    status: "failed",
    archivo: "carmella@example.com",
    submittedTasks: [
      {
        taskId: "T005",
        title: "Entrega 1: Normalización",
        description: "Documento con la 3FN de los esquemas.",
        status: "CALIFICADO",
      },
      // María solo ha entregado una tarea de esta materia hasta ahora.
    ],
  },
]; */
