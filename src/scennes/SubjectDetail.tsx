import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  ArrowLeft,
  Loader2,
  BookOpen,
  Inbox,
  Eye,
  Lock,
  FileText,
  Download,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { RootState } from "@/redux/store";
import { getSubjectDetails } from "@/api/subject-services/subject.api";
import { SubmitTaskModal } from "./partials/SubmitTaskModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IMateriaSimplificada {
  id: string;
  subjectName: string;
  group: string;
}

const SubjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const context = useOutletContext<{ subjects: IMateriaSimplificada[] }>() || {
    subjects: [],
  };
  const { subjects } = context;

  const userId = useSelector((state: RootState) => state.auth.id);
  const studentId = userId ? userId.split("-")[1] : "";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{
    id: string;
    title: string;
    subjectId: string;
    isSubmission: boolean; // NUEVO: Para distinguir el tipo de ID
    files?: { id: number; name: string; url: string }[];
  } | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (id && studentId) {
      try {
        setLoading(true);
        const res = await getSubjectDetails(id, studentId);
        setData(res);
      } catch (error) {
        console.error("Error al obtener detalles:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, studentId]);

  // 2. Función para controlar la expansión
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  const handleSubjectChange = (newId: string) => {
    navigate(`/student/dashboard/tareas-pendientes/${newId}`);
  };

  const handleOpenSubmit = (task: any) => {
    setSelectedTask({
      id: task.id,
      title: task.title,
      subjectId: id || "",
      isSubmission: task.isSubmission, // Lo tomamos de la respuesta del backend refactorizado
      files: task.files || [],
    });
    setIsModalOpen(true);
  };

  const getUrgency = (date: string, status: string) => {
    if (status === "submitted" || status === "ENTREGADO")
      return {
        label: "Entregado",
        color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
        icon: CheckCircle2,
      };

    const dueDate = new Date(date);
    const now = new Date();

    if (status === "late" || now > dueDate)
      return {
        label: "Vencida",
        color: "bg-destructive/10 text-destructive border-destructive/20",
        icon: AlertCircle,
      };

    const diff = dueDate.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24)
      return {
        label: "Vence pronto",
        color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
        icon: Clock,
      };

    return {
      label: "Pendiente",
      color: "bg-muted text-muted-foreground border-border",
      icon: Clock,
    };
  };

  const filteredTasks = useMemo(() => {
    if (!data?.tasks) return { pending: [], submitted: [], overdue: [] };
    const now = new Date();

    return data.tasks.reduce(
      (acc: any, task: any) => {
        const isSubmitted =
          task.status === "submitted" || task.status === "ENTREGADO";
        const dueDate = new Date(task.dueDate);
        const isOverdue =
          (task.status === "late" || now > dueDate) && !isSubmitted;

        if (isSubmitted) {
          acc.submitted.push(task);
        } else if (isOverdue) {
          acc.overdue.push(task);
        } else {
          acc.pending.push(task);
        }
        return acc;
      },
      { pending: [], submitted: [], overdue: [] },
    );
  }, [data]);

  const renderTaskCard = (task: any) => {
    const urgency = getUrgency(task.dueDate, task.status);
    const UrgencyIcon = urgency.icon;
    const isSubmitted =
      task.status === "submitted" || task.status === "ENTREGADO";

    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const isLocked = (task.status === "late" || now > dueDate) && !isSubmitted;

    return (
      <Card
        key={task.id}
        className={cn(
          "group transition-all border-l-4 hover:shadow-md bg-card text-card-foreground",
          isSubmitted
            ? "border-l-green-500"
            : isLocked
              ? "border-l-destructive"
              : "border-l-primary",
        )}
      >
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-center gap-5">
            <div className="flex-grow space-y-1">
              <Badge
                variant="outline"
                className={cn("text-[10px] px-2 py-0 border", urgency.color)}
              >
                <UrgencyIcon className="mr-1 h-3 w-3" />
                {urgency.label}
              </Badge>
              <h3 className="font-bold text-foreground">{task.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {task.description}
              </p>
              {isLocked && (
                <p className="text-[10px] text-destructive font-medium flex items-center gap-1 mt-1">
                  <Lock className="h-3 w-3" />
                  Buzón cerrado el{" "}
                  {dueDate.toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end min-w-[140px] text-right">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                Vencimiento
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  isLocked ? "text-destructive" : "text-foreground",
                )}
              >
                {dueDate.toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isSubmitted ? (
                <Button
                  variant="outline"
                  onClick={() => handleOpenSubmit(task)}
                  className="text-green-600 dark:text-green-400 border-green-500/20 bg-green-500/10 hover:bg-green-500/20 rounded-xl gap-2 transition-all"
                >
                  <Eye className="h-4 w-4" /> Ver / Editar Entrega
                </Button>
              ) : isLocked ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-not-allowed">
                        <Button
                          disabled
                          className="bg-muted text-muted-foreground border-border rounded-xl gap-2 opacity-70"
                        >
                          <Lock className="h-4 w-4" /> Plazo finalizado
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover text-popover-foreground border border-border text-[11px]">
                      <p>La fecha límite ha expirado</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Button
                  onClick={() => handleOpenSubmit(task)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 shadow-sm transition-all"
                >
                  <UploadCloud className="h-4 w-4" /> Enviar
                </Button>
              )}
            </div>
          </div>
          {!isSubmitted && task.teacherResources && task.teacherResources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-dashed border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
              className={cn(
                "h-8 text-[10px] font-bold uppercase tracking-wider transition-all",
                expandedTaskId === task.id 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <BookOpen className="mr-2 h-3.5 w-3.5" />
              {expandedTaskId === task.id ? "Cerrar Recursos" : `Recursos del Docente (${task.teacherResources.length})`}
            </Button>

            {expandedTaskId === task.id && (
              <div className="mt-3 grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                {task.teacherResources.map((file: any) =>
                {
                  const fileNameForDownload = file.url.split('/').pop();
                return (
                  <a
                    key={file.id}
                    href={`${import.meta.env.VITE_API_DOC_ADRESS}/${fileNameForDownload}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center min-w-0">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg mr-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
                        {file.name}
                      </span>
                    </div>
                    <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                  </a>
                )})}
              </div>
            )}
          </div>
        )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground leading-none">
              Tareas del Estudiante
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {id ? "Gestión de actividades" : "Selecciona una materia"}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <Select value={id || ""} onValueChange={handleSubjectChange}>
            <SelectTrigger className="h-9 bg-card border-border shadow-sm text-sm font-medium">
              <SelectValue placeholder="Elegir una materia..." />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.subjectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Consultando tareas...</p>
        </div>
      ) : data ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-primary">
                {data.subjectName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Docente: {data.teacherName}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("../materias")}
              className="text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
          </div>

          <Tabs defaultValue="pending" className="w-full space-y-6">
            <TabsList className="bg-muted/50 p-1 h-12 w-full justify-start gap-2 rounded-xl border border-border">
              <TabsTrigger
                value="pending"
                className="rounded-lg px-4 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Pendientes
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-1.5 py-0">
                  {filteredTasks.pending.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="submitted"
                className="rounded-lg px-4 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Entregados
                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-none px-1.5 py-0">
                  {filteredTasks.submitted.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="overdue"
                className="rounded-lg px-4 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Vencidos
                <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-none px-1.5 py-0">
                  {filteredTasks.overdue.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 outline-none">
              {filteredTasks.pending.length > 0 ? (
                filteredTasks.pending.map((task: any) => renderTaskCard(task))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-muted/20 border border-dashed border-border rounded-2xl text-muted-foreground font-medium">
                  <CheckCircle2 className="h-10 w-10 text-green-500/50 mb-3" />
                  ¡Estás al día!
                </div>
              )}
            </TabsContent>

            <TabsContent value="submitted" className="space-y-4 outline-none">
              {filteredTasks.submitted.length > 0 ? (
                filteredTasks.submitted.map((task: any) => renderTaskCard(task))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-muted/20 border border-dashed border-border rounded-2xl text-muted-foreground font-medium">
                  <UploadCloud className="h-10 w-10 text-primary/30 mb-3" />
                  Sin entregas aún
                </div>
              )}
            </TabsContent>

            <TabsContent value="overdue" className="space-y-4 outline-none">
              {filteredTasks.overdue.length > 0 ? (
                filteredTasks.overdue.map((task: any) => renderTaskCard(task))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-muted/20 border border-dashed border-border rounded-2xl text-muted-foreground font-medium">
                  <AlertCircle className="h-10 w-10 text-muted/50 mb-3" />
                  Todo en orden
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/10 border-2 border-dashed border-border rounded-3xl">
          <div className="p-4 bg-card rounded-full shadow-sm mb-4">
            <Inbox className="h-12 w-12 text-primary/30" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Buzón vacío</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-2">
            Selecciona una materia para ver actividades.
          </p>
        </div>
      )}

      {selectedTask && (
        <SubmitTaskModal
          key={selectedTask.id}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          taskData={selectedTask}
          studentId={studentId}
          onSuccess={fetchDetails}
        />
      )}
    </div>
  );
};

export default SubjectDetail;