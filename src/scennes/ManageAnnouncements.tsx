import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Trash2, Send } from "lucide-react";
import { toast } from "sonner";

// API & Hooks
import {
  createAnnouncement,
  deleteAnnouncement,
  getMyCreatedAnnouncements,
  type CreateAnnouncementPayload,
  type IAnnouncement,
} from "@/api/grade-services/grade.api";
import { useAppSelector } from "@/redux/hooks";

const formSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  content: z.string().min(5, "Contenido demasiado corto"),
  priority: z.enum(["NORMAL", "IMPORTANTE", "URGENTE"]),
  isGeneral: z.boolean(),
  subjectId: z.string(),
  priorityDays: z.string().min(1).refine((val) => !isNaN(Number(val)), {
    message: "La cadena debe contener solo números",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ManageAnnouncements = () => {
  const { teacherData } = useOutletContext<{ teacherData: any }>();
  const [myAnnouncements, setMyAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const { id: authId } = useAppSelector((state) => state.auth);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      priority: "NORMAL",
      isGeneral: true,
      subjectId: "",
      priorityDays: "7",
    },
  });

  const watchPriority = form.watch("priority");
  const watchIsGeneral = form.watch("isGeneral");

  const loadData = async () => {
    if (!authId) return;
    try {
      const data = await getMyCreatedAnnouncements(authId);
      setMyAnnouncements(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [authId]);

  const onSubmit = async (data: FormValues) => {
    try {
      const payload: CreateAnnouncementPayload = {
        title: data.title,
        content: data.content,
        priority: data.priority,
        priorityDays: Number(data.priorityDays),
        type: data.isGeneral ? "GENERAL" : "SUBJECT",
        subjectId: data.isGeneral ? null : data.subjectId,
      };

      if (!data.isGeneral && !data.subjectId) {
        toast.error("Selecciona una materia para el aviso específico.");
        return;
      }

      await createAnnouncement(payload);
      toast.success("Aviso publicado");
      form.reset();
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Deseas eliminar este aviso?")) return;
    try {
      await deleteAnnouncement(id, authId!);
      toast.success("Eliminado correctamente");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Megaphone className="h-6 w-6 text-primary" /> Gestión de Avisos
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA FORMULARIO */}
        <Card className="lg:col-span-1 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs uppercase text-muted-foreground font-bold tracking-widest">
              Nuevo Comunicado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Título del aviso..." 
                          className="bg-background border-input"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Escribe el mensaje aquí..." 
                          className="min-h-[100px] bg-background border-input"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isGeneral"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border border-border p-3 bg-muted/30">
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase">
                        {field.value ? "Público General" : "Solo Materia"}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Prioridad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NORMAL">Normal</SelectItem>
                            <SelectItem value="IMPORTANTE">Importante</SelectItem>
                            <SelectItem value="URGENTE">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <Select 
                          disabled={watchIsGeneral}
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Materia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teacherData?.subject?.map((s: any) => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                {s.subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                {watchPriority !== "NORMAL" && (
                  <FormField
                    control={form.control}
                    name="priorityDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Días de vigencia</FormLabel>
                        <FormControl>
                          <Input type="number" className="bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Publicar Aviso
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* COLUMNA LISTADO */}
        <Card className="lg:col-span-2 shadow-sm border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xs uppercase text-muted-foreground font-bold tracking-widest">
              Historial de Avisos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground animate-pulse">Cargando avisos...</div>
            ) : (
              <div className="space-y-3">
                {myAnnouncements.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-background hover:bg-accent/20 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${a.priority === 'URGENTE' ? 'bg-destructive' : 'bg-primary'}`} />
                        <h4 className="font-bold text-foreground">{a.title}</h4>
                        {a.type === 'GENERAL' && (
                          <span className="text-[9px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full border border-border font-bold">GENERAL</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{a.content}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(a.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {myAnnouncements.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-border rounded-xl text-muted-foreground">
                    No hay avisos publicados todavía.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageAnnouncements;