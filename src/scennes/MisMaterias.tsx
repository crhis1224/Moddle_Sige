import { useOutletContext, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users,  
  Search, 
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { clearId, setId } from "@/redux/id/id";

export type materia = {
  group: string;
  id: string;
  semester: string;
  subject: string;
};

const MisMaterias = () => {
  //const { subjects } = useOutletContext<{ subjects: materia[] }>();*
  const { teacherData } = useOutletContext<{ teacherData: any }>();
  const subjects:materia[] = teacherData.subject;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubjects = useMemo(() => {
    return subjects.filter((m:materia) =>
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.group.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subjects, searchTerm]);

  const handleSelection = (materiaId: string) => {
    dispatch(clearId());
    dispatch(setId(materiaId));
    navigate(`../tareas/${materiaId}`);
  };

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <GraduationCap className="h-7 w-7 text-primary" />
            Mis Materias Asignadas
          </h1>
          <p className="text-sm text-muted-foreground">
            {subjects.length} materias en total.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar materia..."
            className="pl-10 h-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSubjects.map((m) => (
            <Card 
              key={m.id} 
              className="group hover:shadow-md transition-all border-t-4 border-t-primary/40 hover:border-t-primary bg-card text-card-foreground flex flex-col justify-between aspect-square max-h-[260px]"
            >
              <CardHeader className="p-4 pb-0 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase border border-border">
                    {m.semester}º Semestre
                  </span>
                </div>
                
                <CardTitle className="text-lg font-bold line-clamp-1 leading-tight text-foreground">
                  {m.subject}
                </CardTitle>
                
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">Grupo: {m.group}</span>
                </CardDescription>
              </CardHeader>
              
              <CardFooter className="p-4 pt-0 flex gap-2 mt-auto">
                <Button 
                  onClick={() => handleSelection(m.id)}
                  className="flex-1 h-9 text-xs"
                  variant="default"
                >
                  Tareas
                </Button>
                
                <Button 
                  onClick={() => navigate(`../mis-alumnos/${m.id}`)}
                  className="flex-1 h-9 text-xs"
                  variant="outline"
                >
                  Alumnos
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
          <p className="text-muted-foreground">No hay resultados.</p>
        </div>
      )}
    </div>
  );
};

export default MisMaterias;