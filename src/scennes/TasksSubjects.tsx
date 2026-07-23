import {
  findOneWithTasks,
  deleteTask,
  updateTaskStatus,
} from "@/api/subject-services/subject.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDropZone } from "@/components/widgets/FileDropZone";
import { TaskActionCard } from "@/components/widgets/TaskActionCard";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { setSelectedTask } from "@/redux/taskSlice";
import { setId } from "@/redux/id/id";

interface task {
  description: string;
  id: string;
  status: "Abierto" | "Cerrado";
  title: string;
  dueDate: string; 
}

type materia = {
  id: string;
  subject: string;
  semester: string;
  group: string;
  effectiveDate: string;
  task: task[];
};

const TasksSubjects = () => {
  const { id: idFromUrl } = useParams<{ id: string }>();
  const currentIdRedux = useAppSelector((state) => state.idState.currentId);
  const currentId = currentIdRedux || idFromUrl;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [subjectData, setSubjectData] = useState<materia>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubjectData = useCallback(async () => {
    if (!currentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await findOneWithTasks(currentId);
      setSubjectData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentId]);

  useEffect(() => {
    fetchSubjectData();
  }, [fetchSubjectData]);

  const handleEdit = (taskId: string) => {
    const taskToEdit = subjectData?.task.find((t) => t.id === taskId);
    if (taskToEdit && currentId) {
      dispatch(setSelectedTask(taskToEdit));
      dispatch(setId(currentId));
      navigate(`/private/Dashboard/editar-tarea/${taskId}`);
    }
  };

  const handleDelete = async (taskId: string) => {
    const confirmed = window.confirm("¿Estás seguro de que deseas eliminar esta tarea?");
    if (!confirmed) return;

    try {
      await deleteTask(taskId);
      if (subjectData) {
        setSubjectData({
          ...subjectData,
          task: subjectData.task.filter((t) => t.id !== taskId),
        });
      }
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: "Abierto" | "Cerrado") => {
    try {
      await updateTaskStatus(taskId, newStatus);
      if (subjectData) {
        setSubjectData({
          ...subjectData,
          task: subjectData.task.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t
          ),
        });
      }
    } catch (err: any) {
      alert(`Error al actualizar estado: ${err.message}`);
    }
  };

  const handleAssign = (taskId: string) => {
    setTaskId(taskId);
    setOpen(true);
  };

  const openTasks = (subjectData?.task || []).filter((t) => t.status === "Abierto");
  const closedTasks = (subjectData?.task || []).filter((t) => t.status === "Cerrado");

  if (loading) return <div className="p-8 text-xl text-center animate-pulse text-muted-foreground">Cargando tareas...</div>;
  if (error) return <div className="p-8 text-xl text-destructive text-center font-medium">Error: {error}</div>;
  if (!currentId) return <div className="p-8 text-xl text-center text-muted-foreground">No hay materia seleccionada.</div>;

  return (
    <div className="w-full p-4 space-y-6 bg-background text-foreground">
      <Tabs defaultValue="abiertas" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted p-1 border border-border">
          <TabsTrigger value="abiertas" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
            Abiertas <span className="ml-2 px-2 py-0.5 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold rounded-full">{openTasks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="cerradas" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
            Cerradas <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/10 text-green-600 dark:text-green-400 font-bold rounded-full">{closedTasks.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="abiertas" className="mt-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[650px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
            {openTasks.length > 0 ? (
              openTasks.map((tarea) => (
                <TaskActionCard
                  key={tarea.id}
                  {...tarea} // 👈 Aquí pasamos dueDate automáticamente a la Card
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAssign={handleAssign}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-20 bg-muted/30 border-2 border-dashed border-border rounded-xl text-muted-foreground font-medium">
                No hay tareas abiertas pendientes.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cerradas" className="mt-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[650px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
            {closedTasks.length > 0 ? (
              closedTasks.map((tarea) => (
                <TaskActionCard
                  key={tarea.id}
                  {...tarea}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAssign={handleAssign}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-20 bg-muted/30 border-2 border-dashed border-border rounded-xl text-muted-foreground font-medium">
                No hay tareas cerradas en el historial.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Subir material para la tarea</DialogTitle>
          </DialogHeader>
          <FileDropZone taskId={taskId} open={setOpen} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksSubjects;