import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { clearSelectedTask } from "@/redux/taskSlice";
import { format, addHours, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getTask,
  registertask,
  updatetask,
} from "@/api/subject-services/subject.api";

type materia = {
  group: string;
  id: string;
  semester: string;
  subject: string;
};

const formTaskSchema = z.object({
  title: z.string().min(5, "Mínimo 5 caracteres").max(50),
  description: z.string().min(20, "Mínimo 20 caracteres").max(500),
  subject: z.string().min(1, "Selecciona una materia"),
  dueDate: z
    .date({ error: "la fecha es requerido" })
    .refine((date) => !date || date > new Date(), {
      message: "La fecha de vencimiento debe ser posterior a la actual",
    }),
});

const generarIdConfiable = () => {
  const año = new Date().getFullYear().toString().substring(2, 4);
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const randomHex = array[0]
    .toString(16)
    .padEnd(6, "0")
    .slice(-6)
    .toUpperCase();
  return `TAR${año}${randomHex}`;
};

const CreateTasks = () => {
  const { teacherData } = useOutletContext<{ teacherData: any }>();
  const subjects: materia[] = teacherData.subject;
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const selectedTask = useAppSelector((state) => state.taskState?.selectedTask);
  const currentSubjectId = useAppSelector((state) => state.idState?.currentId);

  const isEditing = !!id;
  const form = useForm<z.infer<typeof formTaskSchema>>({
    resolver: zodResolver(formTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      dueDate: addHours(new Date(), 24),
    },
  });

  useEffect(() => {
    if (!id) {
      dispatch(clearSelectedTask());
      form.reset({
        title: "",
        description: "",
        subject: "",
        dueDate: addHours(new Date(), 24),
      });
    }
  }, [id, dispatch, form]);

  useEffect(() => {
    const loadTask = async () => {
      if (id && selectedTask) {
        form.reset({
          title: selectedTask.title || "",
          description: selectedTask.description || "",
          subject: currentSubjectId || "",
          dueDate: selectedTask.dueDate
            ? new Date(selectedTask.dueDate)
            : addHours(new Date(), 24),
        });
      } else if (id && !selectedTask) {
        setIsLoading(true);
        try {
          const data = await getTask(id);
          form.reset({
            title: data.title || "",
            description: data.description || "",
            subject: data.subject ? data.subject.id : "",
            dueDate: data.dueDate
              ? new Date(data.dueDate)
              : addHours(new Date(), 24),
          });
        } catch (error) {
          alert("Error cargando tarea");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTask();
    return () => {
      if (id) dispatch(clearSelectedTask());
    };
  }, [id, selectedTask, form, isEditing, currentSubjectId, dispatch]);

  async function onSubmit(data: z.infer<typeof formTaskSchema>) {
    setIsLoading(true);
    try {
      const isoDate = data.dueDate ? data.dueDate.toISOString() : undefined;

      if (id) {
        await updatetask({
          id,
          title: data.title,
          description: data.description,
          dueDate: isoDate,
        });
        alert("¡Tarea actualizada con éxito!");
        dispatch(clearSelectedTask());
        navigate(-1);
      } else {
        const taskid = generarIdConfiable();
        await registertask(
          {
            id: taskid,
            title: data.title,
            description: data.description,
            dueDate: isoDate,
          },
          data.subject,
        );
        alert("✅ Tarea registrada correctamente.");
        form.reset({
          title: "",
          description: "",
          subject: data.subject,
          dueDate: addHours(new Date(), 24),
        });
      }
    } catch (error: any) {
      alert(error.message || "Error al procesar");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center max-w-4xl mx-auto p-4 transition-colors duration-300">
      <Card
        className={cn(
          "w-full border-t-4 shadow-lg overflow-hidden bg-card text-card-foreground transition-all",
          id ? "border-t-orange-500" : "border-t-primary"
        )}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-foreground">
            {id ? "Panel de Edición" : "Nueva Actividad"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {id && selectedTask
              ? `Editando: ${selectedTask.title}`
              : "Completa la información para los estudiantes."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-0">
            <FieldGroup className="space-y-4">
              {/* TÍTULO */}
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="font-semibold text-foreground mb-1.5">Título</FieldLabel>
                    <Input 
                      {...field} 
                      className="focus-visible:ring-2 bg-background border-border text-foreground placeholder:text-muted-foreground" 
                      placeholder="Ej: Ensayo sobre la Revolución"
                    />
                    {fieldState.invalid && (
                      <FieldError className="text-destructive text-xs mt-1" errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* DESCRIPCIÓN */}
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="font-semibold text-foreground mb-1.5">
                      Instrucciones
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        rows={5}
                        className="resize-none focus-visible:ring-2 bg-background border-border text-foreground placeholder:text-muted-foreground"
                        placeholder="Describe los requisitos de la tarea..."
                      />
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError className="text-destructive text-xs mt-1" errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* FECHA Y HORA */}
              <Controller
                name="dueDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="font-semibold text-foreground mb-1.5">Vencimiento</FieldLabel>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      {/* Selector de Fecha */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full sm:w-[260px] justify-start text-left font-normal bg-background border-border hover:bg-accent hover:text-accent-foreground",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-primary" />
                            <span className="truncate">
                              {field.value && isValid(field.value)
                                ? format(field.value, "PPP", { locale: es })
                                : "Seleccionar fecha"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-card border-border shadow-xl" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            className="rounded-md border-none"
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                          />
                        </PopoverContent>
                      </Popover>

                      {/* Selector de Hora */}
                      <div className="relative w-full sm:w-[160px]">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                        <Input
                          type="time"
                          className="pl-10 h-10 w-full bg-background border-border text-foreground focus-visible:ring-2"
                          value={
                            field.value && isValid(field.value)
                              ? format(field.value, "HH:mm")
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            const [h, m] = val.split(":");
                            const newD = new Date(field.value || new Date());
                            newD.setHours(parseInt(h), parseInt(m));
                            field.onChange(newD);
                          }}
                        />
                      </div>
                    </div>
                    {fieldState.invalid && (
                      <FieldError className="text-destructive text-xs mt-1" errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* MATERIA */}
              <Controller
                name="subject"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="flex items-center gap-2 font-semibold text-foreground mb-1.5">
                      Materia Asignada{" "}
                      {id && <Lock className="h-3 w-3 text-orange-500" />}
                    </FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={isEditing}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full transition-all focus:ring-2",
                          id 
                            ? "bg-muted text-muted-foreground opacity-80 cursor-not-allowed border-border" 
                            : "bg-background border-border text-foreground"
                        )}
                      >
                        <SelectValue placeholder="Seleccionar materia" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground shadow-xl">
                        {subjects?.map((m: any) => (
                          <SelectItem 
                            key={m.id} 
                            value={m.id}
                            className="focus:bg-primary focus:text-primary-foreground"
                          >
                            {m.subject} - {m.group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError className="text-destructive text-xs mt-1" errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex flex-row items-center justify-end gap-3 bg-muted/20 p-6 border-t border-border mt-2">
            <Button
              type="button"
              variant="ghost"
              className="hover:bg-muted text-foreground border border-transparent hover:border-border"
              onClick={() => navigate(-1)}
            >
              {id ? "Cancelar" : "Volver"}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "min-w-[160px] font-bold shadow-md transition-all active:scale-95",
                id 
                  ? "bg-orange-600 hover:bg-orange-700 text-white" 
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Procesando...
                </>
              ) : id ? (
                "Guardar Cambios"
              ) : (
                "Publicar Actividad"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateTasks;