import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 1. Definir la interfaz (Type) para el estado
interface IdState {
  currentId: string;
}

// 2. Definir el estado inicial
const initialState: IdState = {
  currentId: '',
};

const idSlice = createSlice({
  name: 'id',
  initialState,
  reducers: {
    // Reducer para Guardar/Actualizar.
    // Usamos PayloadAction<string> para forzar que el payload sea un string.
    setId: (state, action: PayloadAction<string>) => {
      // No necesitamos lógica de verificación; simplemente reemplazamos el valor.
      state.currentId = action.payload; 
    },
    
    // Reducer para Eliminar. No necesita payload.
    clearId: (state) => {
      state.currentId = initialState.currentId;
    },
  },
});

// Exportar acciones y el reducer
export const { setId, clearId } = idSlice.actions;

export default idSlice.reducer;