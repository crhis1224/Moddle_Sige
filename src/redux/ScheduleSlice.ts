import { deleteSchedule, getAllSchedules, updateSchedule } from '@/api/schedule.api';
import { createSlice, createAsyncThunk, type PayloadAction,  } from '@reduxjs/toolkit';
// Interfaz que representa el objeto que viene del Backend (findAll)
export interface Schedule {
  id: number;
  day: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado";
  startTime: string;
  endTime: string;
  classroom?: string;
  subject: {
    id: string;
    subject: string;
    group: string;
    teacher?: {
      id:string,
        name: string;
        primerApellido: string;
        segundoApellido:string;
    }
  };
}

interface ScheduleState {
  allSchedules: Schedule[];
  loading: boolean;
  error: string | null;
}

const initialState: ScheduleState = {
  allSchedules: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchAllSchedulesThunk = createAsyncThunk(
  'schedules/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await getAllSchedules();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateScheduleThunk = createAsyncThunk(
  'schedules/update',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      return await updateSchedule(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteScheduleThunk = createAsyncThunk(
  'schedules/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteSchedule(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const scheduleSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    clearScheduleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllSchedulesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSchedulesThunk.fulfilled, (state, action: PayloadAction<Schedule[]>) => {
        state.loading = false;
        state.allSchedules = action.payload;
      })
      .addCase(fetchAllSchedulesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateScheduleThunk.fulfilled, (state, action) => {
        const index = state.allSchedules.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.allSchedules[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteScheduleThunk.fulfilled, (state, action) => {
        state.allSchedules = state.allSchedules.filter(s => s.id !== action.payload);
      });
  },
});

export const { clearScheduleError } = scheduleSlice.actions;
export default scheduleSlice.reducer;