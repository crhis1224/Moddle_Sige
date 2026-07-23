import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Task {
  description: string;
  id: string;
  status: "Abierto" | "Cerrado" | "ENTREGADO";
  title: string;
  dueDate?: string; // Añadimos la fecha (como string ISO que viene del JSON)
}

interface TaskState {
  selectedTask: Task | null;
}

const initialState: TaskState = {
  selectedTask: null,
};

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    // Acción para guardar la tarea que vamos a editar
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    // Acción para limpiar la tarea (útil al terminar de editar o cancelar)
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
  },
});

export const { setSelectedTask, clearSelectedTask } = taskSlice.actions;
export default taskSlice.reducer;