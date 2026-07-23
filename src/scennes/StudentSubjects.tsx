import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react"; // Añadimos Loader2 para el feedback
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Para obtener el ID del alumno
import type { RootState } from "@/redux/store";
import { getMySubjects } from "@/api/subject-services/subject.api";

// El tipo debe coincidir con lo que devuelve tu nuevo endpoint de NestJS
interface StudentSubject {
  id: string;
  subjectName: string;
  teacherName: string;
  group: string;
  semester: string;
  progress: number;
  pendingTasks: number;
}

const StudentSubjects = () => {
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Obtenemos el ID del alumno desde el estado de auth de Redux
  const userId = useSelector((state: RootState) => state.auth.id);
  const studentId = userId ? userId.split("-")[1] : "";

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!studentId) return;

      try {
        setLoading(true);
        const data = await getMySubjects(studentId);
        setSubjects(data);
      } catch (error) {
        console.error("Error cargando materias:", error);
        // Aquí podrías usar un toast para avisar al usuario
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground font-medium">Cargando tus materias...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* CABECERA COMPACTA CORREGIDA */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Mis Materias
        </h2>
        <p className="text-xs text-muted-foreground">
          Gestiona tus cursos y revisa tu avance académico.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.length > 0 ? (
          subjects.map((item) => (
            <Card
              key={item.id}
              className="group hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary overflow-hidden bg-card text-card-foreground"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/20 border-none"
                  >
                    {item.semester} Semestre
                  </Badge>
                  <div className="bg-muted text-[10px] font-bold px-2 py-1 rounded border border-border text-muted-foreground uppercase">
                    GP: {item.group}
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors text-foreground">
                  {item.subjectName}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                  <Avatar className="h-8 w-8 ring-1 ring-border">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {item.teacherName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                      Docente
                    </p>
                    <p className="font-medium text-foreground">
                      {item.teacherName}
                    </p>
                  </div>
                </div>
                {/* Nota: Progreso se mantiene en 0 hasta implementar lógica de tareas en Backend */}
              </CardContent>

              <CardFooter className="bg-muted/30 border-t border-border p-4 flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-medium italic">
                  {item.pendingTasks > 0
                    ? `${item.pendingTasks} tareas pendientes`
                    : "¡Todo al día!"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-background text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                  onClick={() => navigate(`../tareas-pendientes/${item.id}`)}
                >
                  Entrar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10 bg-muted/20 rounded-lg border-2 border-dashed border-border">
            <p className="text-muted-foreground font-medium">
              No estás inscrito en ninguna materia todavía.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSubjects;