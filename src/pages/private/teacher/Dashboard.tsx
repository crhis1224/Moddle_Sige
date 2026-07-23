import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Settings,
  User,
  LogOut,
  Package,
  UserPlus,
  BookPlus,
  UserRoundCog,
  List,
  LayoutGrid,
  Users,
  Megaphone,
  CalendarDays,
  CalendarPlus,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { findTeacherAndSubjects } from "@/api/teacher-services/teacher.api";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearId, setId } from "@/redux/id/id";
import { logout } from "@/redux/authSlice";
import { Roles } from "@/utilities/roles";
import { ModeToggle } from "@/components/ui/mode-toggle";

type teacher = { id: string; name: string; primerApellido: string; segundoApellido: string; subject: materia[]; };
type materia = { group: string; id: string; semester: string; subject: string; };

const Dashboard = () => {
  const [teacherData, setTeacherData] = useState<teacher>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: authId, role } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!authId) return;
      try {
        const idAuth = authId.includes("-") ? authId.split("-")[1] : authId;
        const data = await findTeacherAndSubjects(idAuth);
        setTeacherData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherData();
  }, [authId]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/Login", { replace: true });
  };

  const subjects = teacherData?.subject || [];

  // Lógica de estilos de navegación optimizada para ambos modos
  const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full px-4 py-2.5 transition-all rounded-md text-sm font-medium ${
      isActive
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  if (loading) return <div className="flex h-screen items-center justify-center italic text-muted-foreground bg-background">Cargando...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-destructive bg-background">Error: {error}</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-border bg-card flex flex-col h-full shadow-sm">
        <div className="flex flex-col flex-grow overflow-hidden">
          
          {/* HEADER SIDEBAR */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg tracking-tight">Panel Docente</h1>
              <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full uppercase font-bold">
                {role}
              </span>
            </div>
            <ModeToggle />
          </div>

          {/* NAVEGACIÓN */}
          <nav className="p-3 space-y-1 flex-grow overflow-y-auto">
            <NavLink to="mis-materias" className={navLinkStyles}>
              <LayoutGrid className="mr-3 h-4 w-4" /> Mis Materias
            </NavLink>

            <NavLink to="mis-alumnos" className={navLinkStyles}>
              <Users className="mr-3 h-4 w-4" /> Mis Alumnos
            </NavLink>

            <NavLink to="gestion-avisos" className={navLinkStyles}>
              <Megaphone className="mr-3 h-4 w-4" /> Gestión de Avisos
            </NavLink>

            {role === Roles.ADMIN && (
              <>
                <div className="pt-4 pb-2 px-4 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Administración</div>
                <NavLink to="inscripciones" className={navLinkStyles}>
                  <UserPlus className="mr-3 h-4 w-4" /> Registrar Alumno
                </NavLink>
                <NavLink to="lista-alumnos" className={navLinkStyles}>
                  <List className="mr-3 h-4 w-4" /> Lista Alumnos
                </NavLink>
                <NavLink to="docente" className={navLinkStyles}>
                  <UserRoundCog className="mr-3 h-4 w-4" /> Registrar Docente
                </NavLink>
                <NavLink to="crear-materia" className={navLinkStyles}>
                  <BookPlus className="mr-3 h-4 w-4" /> Crear Materia
                </NavLink>
              </>
            )}

            <div className="pt-4 pb-2 px-4 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Contenido</div>
            <NavLink to="crear-tarea" className={navLinkStyles}>
              <Package className="mr-3 h-4 w-4" /> Crear Tarea
            </NavLink>

            <NavLink to="Mi-Horario" className={navLinkStyles}>
              <CalendarDays className="mr-3 h-4 w-4 text-blue-500 dark:text-blue-400" /> Mi horario
            </NavLink>

            <NavLink to="crear-horario" className={navLinkStyles}>
              <CalendarPlus className="mr-3 h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Registrar Horarios
            </NavLink>

            {/* ACORDEONES */}
            <div className="pt-4 mt-4 border-t border-border">
              <Accordion type="single" collapsible className="w-full">
                
                <AccordionItem value="item-tasks" className="border-none">
                  <AccordionTrigger className="py-2 px-4 hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors">
                    Tareas por Materia
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col space-y-1 pt-1">
                    {subjects.map((m) => (
                      <NavLink
                        key={m.id}
                        to={`tareas/${m.id}`}
                        onClick={() => { dispatch(clearId()); dispatch(setId(m.id)); }}
                        className={({ isActive }) =>
                          `pl-10 pr-4 py-2 text-xs rounded-md transition-colors ${
                            isActive
                              ? "bg-secondary text-secondary-foreground font-bold"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`
                        }
                      >
                        {m.subject}
                      </NavLink>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-tables" className="border-none">
                  <AccordionTrigger className="py-2 px-4 hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors">
                    Tareas entregadas
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col space-y-1 pt-1">
                    {subjects.map((m) => (
                      <NavLink
                        key={m.id}
                        to={`tabla/${m.id}`}
                        className={({ isActive }) =>
                          `pl-10 pr-4 py-2 text-xs rounded-md transition-colors ${
                            isActive 
                              ? "bg-secondary text-secondary-foreground font-bold" 
                              : "text-muted-foreground hover:bg-accent"
                          }`
                        }
                      >
                        {m.subject}
                      </NavLink>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </nav>
        </div>

        {/* FOOTER USUARIO */}
        <div className="p-4 border-t border-border bg-card">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 hover:bg-accent transition-colors"
              >
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs uppercase">
                    {teacherData?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left overflow-hidden">
                  <span className="text-xs font-bold truncate w-full">
                    {teacherData?.name} {teacherData?.primerApellido}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase font-medium">
                    {role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("perfil")}>
                <User className="mr-2 h-4 w-4" /> Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("configurar-plan")}>
                <Settings className="mr-2 h-4 w-4" /> Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive font-medium cursor-pointer focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="grow bg-background px-8 pt-6 overflow-y-auto transition-colors duration-300">
        <Outlet context={{ teacherData }} />
      </main>
    </div>
  );
};

export default Dashboard;