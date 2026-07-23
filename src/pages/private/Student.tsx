// src/pages/private/Student.tsx
import { Route, Navigate } from "react-router-dom";
import RoutesWithNotFound from "@/scennes/partials/RoutesWithNotFound";
import StudentDashboard from "./teacher/StudentDashboard";
import StudentSubjects from "@/scennes/StudentSubjects";
import StudentGrades from "@/scennes/StudentGrades";
import SubjectDetail from "@/scennes/SubjectDetail";
import AnnouncementsFeed from "@/scennes/AnnouncementsFeed";
import ProfilePage from "@/scennes/StudentProfile";
import { ScheduleCalendar } from "@/scennes/ScheduleCalendar";

const Student = () => {
  return (
    <RoutesWithNotFound>
      {/* 1. Redirigimos la raíz /student a /student/dashboard */}
      <Route path="/" element={<Navigate to="dashboard" />} />

      {/* 2. Definimos la ruta Dashboard como el Layout principal */}
      <Route path="dashboard" element={<StudentDashboard />}>
        
        {/* 3. Estas rutas se renderizan dentro del <Outlet /> de StudentDashboard */}
        <Route path="materias" element={<StudentSubjects />} /> 
        <Route path="avisos" element={<AnnouncementsFeed />} /> 
        <Route path="tareas-pendientes/:id?" element={<SubjectDetail />} /> 
        <Route path="calificaciones" element={<StudentGrades />} /> 
        <Route path="horario" element={<ScheduleCalendar />} /> 
        <Route path="perfil" element={<ProfilePage />} /> 
        
        {/* Ruta para cuando el alumno entra a /student/dashboard a secas */}
        <Route
          index
          element={<AnnouncementsFeed/>}
        />
      </Route>
    </RoutesWithNotFound>
  );
};

export default Student;