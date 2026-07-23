import { Route, Navigate } from "react-router-dom";
import RoutesWithNotFound from "@/scennes/partials/RoutesWithNotFound";
import Dashboard from "./teacher/Dashboard";
import FormularioAlumno from "@/scennes/FormularioAlumno";
import TeacherForm from "@/scennes/TeacherForm";
import AlumnosList from "@/scennes/AlumnosList";
import CreateSubject from "@/scennes/CreateSubject";
import TasksSubjects from "@/scennes/TasksSubjects";
import Table from "@/scennes/Table";
import CreateTasks from "@/scennes/CreateTasks";
import RoleGuard from "@/utilities/Role.guard";
import { Roles } from "@/utilities/roles";
import MisMaterias from "@/scennes/MisMaterias";
import MisAlumnos from "@/scennes/MisAlumnos";
import MisCalificaciones from "@/scennes/MisCalificaciones";
import CreateStudyPlan from "@/scennes/CreateStudyPlan";
import TeacherProfile from "@/scennes/TeacherProfile";
import ManageAnnouncements from "@/scennes/ManageAnnouncements";
import { ScheduleCalendar } from "@/scennes/ScheduleCalendar";
import { AdminScheduleForm } from "@/scennes/AdminScheduleForm";
import { SchedulePage } from "@/scennes/SchedulePage";

const Private = () => {
  return (
    // <RoutesWithNotFound>
    //   {/* El Dashboard actúa como Layout para sus rutas hijas */}
    //   <Route path="/" element={<Navigate to="Dashboard" />} />

    //   <Route path="Dashboard" element={<Dashboard />}>
    //     {/* Estas rutas se renderizan dentro del <Outlet /> de Dashboard */}
    //     {/* <Route path="inscripciones" element={<FormularioAlumno />} />
    //     <Route path="docente" element={<TeacherForm />} />
    //     <Route path="lista-alumnos" element={<AlumnosList />} />
    //     <Route path="editar-estudiante/:id" element={<FormularioAlumno />} />
    //     <Route path="crear-materia" element={<CreateSubject />} />
    //        <Route path="crear-tarea" element={<CreateTasks />} />
    //      <Route path="tareas/:id" element={<TasksSubjects />} />
    //     <Route path="tabla/:id" element={<Table />} />
    //     <Route
    //       index
    //       element={
    //         <div className="p-8 text-2xl">Bienvenido al Panel de Control</div>
    //       }
    //     /> */}
    //   </Route>
    // </RoutesWithNotFound>

    <RoutesWithNotFound>
      <Route path="/" element={<Navigate to="Dashboard" />} />

      <Route path="Dashboard" element={<Dashboard />}>
        {/* --- RUTAS COMPARTIDAS --- */}
        <Route path="crear-tarea" element={<CreateTasks />} />
        <Route path="editar-tarea/:id" element={<CreateTasks />} />
        <Route path="tareas/:id" element={<TasksSubjects />} />
        <Route path="tabla/:id" element={<Table />} />
        <Route path="mis-materias" element={<MisMaterias />} />
        // Dentro de Private.tsx, en el bloque de rutas del Dashboard:
        <Route path="mis-alumnos/:id?" element={<MisAlumnos />} />
        <Route path="gestion-avisos" element={<ManageAnnouncements />} />
        <Route path="mis-calificaciones/:id?" element={<MisCalificaciones />} />
        <Route path="perfil" element={<TeacherProfile />} />
        <Route path="Mi-Horario" element={<ScheduleCalendar />} />
        {/* --- RUTAS PROTEGIDAS (Bloqueo de URL Manual) --- */}
        {/* Envolvemos las rutas exclusivas en un RoleGuard */}
        <Route element={<RoleGuard allowedRoles={[Roles.ADMIN]} />}>
          <Route path="lista-alumnos" element={<AlumnosList />} />
          <Route path="inscripciones" element={<FormularioAlumno />} />
          <Route path="editar-estudiante/:id" element={<FormularioAlumno />} />
          <Route path="docente" element={<TeacherForm />} />
          <Route path="crear-materia" element={<CreateSubject />} />
          <Route path="configurar-plan" element={<CreateStudyPlan />} />
          <Route path="crear-horario" element={<SchedulePage />} />
        </Route>
        <Route index element={<div className="p-8">Bienvenido</div>} />
      </Route>
    </RoutesWithNotFound>
  );
};

export default Private;
