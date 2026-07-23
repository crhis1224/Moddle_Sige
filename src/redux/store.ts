import { configureStore } from '@reduxjs/toolkit';
import idReducer from './id/id'; 
// 1. Importas el nuevo reducer que acabamos de crear
import studentReducer from './id/studentSlice'
import authReducer from './authSlice'; 
import taskReducer from './taskSlice'
import { authExpirationMiddleware } from './authMiddleware';
import schudeleReducer from "./ScheduleSlice";
; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    idState: idReducer,
    taskState: taskReducer, 
    // 2. Lo agregas aquí. 
    // El nombre 'studentState' es el que usarás en el useAppSelector
    studentState: studentReducer,
    schudeleState:schudeleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authExpirationMiddleware), // Lo añadimos aquí

});



export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;