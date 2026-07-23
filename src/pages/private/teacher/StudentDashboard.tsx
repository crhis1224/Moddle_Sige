import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  BookOpen,
  Calendar,
  GraduationCap,
  ClipboardList,
  Trophy,
  Megaphone,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/authSlice";
import { getMySubjects } from "@/api/subject-services/subject.api";
import { getStudentByIdDadhboard } from "@/api/api";
import { ModeToggle } from "@/components/ui/mode-toggle";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { id: authId } = useAppSelector((state) => state.auth);
  const studentId = authId ? authId.split("-")[1] : "";

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      if (!studentId) return;
      try {
        setLoading(true);
        const student = await getStudentByIdDadhboard(studentId);
        const subjectsData = await getMySubjects(studentId);
        setSubjects(subjectsData);

        setStudentData({
          name:
            student?.nombres +
            " " +
            student?.apellidoPaterno +
            " " +
            student?.apellidoMaterno,

          celular: student?.celular,
          telCasa: student?.telCasa,
          correo: student?.correo,
          municipioResidencia: student?.municipioResidencia,
          localidad: student?.localidad,
          calle: student?.calle,
          numero: student?.numero,
          colonia: student?.colonia,
          cp: student?.cp,
          tutorCelular: student?.tutorCelular,
          tutorOcupacion: student?.tutorOcupacion,
          semestre: student?.semestre,
          curp: student?.curp,
          promedioFinal: student?.promedioFinal,
          id: student?.id ? "Id Oculto" : "Idperdido",
          user: student?.user,
        });
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [studentId]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/Login", { replace: true });
  };

  const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full px-4 py-3 transition-all rounded-lg text-sm font-medium mb-1 ${
      isActive
        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center animate-pulse text-primary font-bold bg-background">
        Cargando tu panel...
      </div>
    );

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-border bg-card flex flex-col h-full">
        <div className="flex flex-col flex-grow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="font-bold text-xl tracking-tight text-foreground">
                  Portal Alumno
                </h1>
              </div>
              <ModeToggle />
            </div>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-bold">
              Estudiante Activo
            </span>
          </div>

          <nav className="px-4 flex-grow">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">
              Menú Principal
            </p>
            <NavLink to="avisos" className={navLinkStyles}>
              <Megaphone className="mr-3 h-5 w-5" /> Avisos
            </NavLink>
            <NavLink to="horario" className={navLinkStyles}>
              <Calendar className="mr-3 h-5 w-5" /> Horario
            </NavLink>
            <NavLink to="materias" className={navLinkStyles}>
              <BookOpen className="mr-3 h-5 w-5" /> Mis Materias
            </NavLink>

            <NavLink to="tareas-pendientes" className={navLinkStyles}>
              <ClipboardList className="mr-3 h-5 w-5" /> Tareas Pendientes
            </NavLink>

            <NavLink to="calificaciones" className={navLinkStyles}>
              <Trophy className="mr-3 h-5 w-5" /> Mis Notas
            </NavLink>
          </nav>
        </div>

        <div className="p-4 border-t border-border bg-muted/30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-14 hover:bg-background border border-transparent hover:border-border transition-all"
              >
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {studentData?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left overflow-hidden">
                  <span className="text-sm font-semibold text-foreground truncate w-full">
                    {studentData?.name || "Estudiante"}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Ver mi perfil
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 mb-2 bg-popover text-popover-foreground border-border"
            >
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => navigate("perfil")}
                className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
              >
                <User className="mr-2 h-4 w-4" /> Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive font-medium cursor-pointer focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="grow overflow-y-auto bg-background">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="text-sm text-muted-foreground italic">
            "El éxito es la suma de pequeños esfuerzos repetidos día tras día."
          </div>
        </header>
        <div className="p-8">
          <Outlet context={{ subjects, studentData }} />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
