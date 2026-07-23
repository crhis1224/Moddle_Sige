import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { findTeacherAndSubjects, getTeachers } from "@/api/teacher-services/teacher.api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { materia } from './MisMaterias';
import { createSchedule } from '@/api/schedule.api';

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;

export const scheduleFormSchema = z.object({
  teacherId: z.string().min(1, "Debes seleccionar un docente"),
  subjectId: z.string().min(1, "La materia es obligatoria"),
  day: z.enum(DAYS, { message: "Selecciona un día válido" }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato HH:mm (24h)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato HH:mm (24h)"),
  classroom: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

// Integración de la Interface para Props
interface AdminScheduleFormProps {
  onSuccess?: () => void;
}

export const AdminScheduleForm: React.FC<AdminScheduleFormProps> = ({ onSuccess }) => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<materia[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState<boolean>(true);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
  const [selectKey, setSelectKey] = useState<number>(0);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      teacherId: "",
      subjectId: "",
      day: "Lunes",
      classroom: "",
      startTime: "07:30",
      endTime: "08:20",
    },
  });

  const selectedTeacherId = form.watch("teacherId");

  useEffect(() => {
    const loadTeachersList = async () => {
      try {
        const data = await getTeachers();
        setTeachers(data);
      } catch (err) {
        toast.error("Error al cargar la lista de docentes");
      } finally {
        setLoadingTeachers(false);
      }
    };
    loadTeachersList();
  }, []);

  useEffect(() => {
    const loadSubjects = async (): Promise<void> => {
      if (!selectedTeacherId) {
        setSubjects([]);
        return;
      }
      
      try {
        setLoadingSubjects(true);
        const cleanId = selectedTeacherId.trim().replace(/^USR-/, '');
        const data = await findTeacherAndSubjects(cleanId);
        const subjectsList: materia[] = data?.subject || (Array.isArray(data) ? data : []);
        setSubjects(subjectsList);
        form.setValue("subjectId", "");
      } catch (err) {
        console.error("Error al cargar materias:", err);
        toast.error("No se pudieron cargar las materias de este docente");
      } finally {
        setLoadingSubjects(false);
      }
    };
    loadSubjects();
  }, [selectedTeacherId, form]);

  const onSubmit = async (values: ScheduleFormValues): Promise<void> => {
    try {
      const { teacherId, ...payload } = values; 
      await createSchedule(payload);
      toast.success("Horario registrado exitosamente");
      
      // Integración del callback de refresco
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset({
        ...form.getValues(),
        subjectId: "",
        classroom: "",
      });
      setSelectKey(prev => prev + 1);
    } catch (err: any) {
      toast.error(err.message || "Error al registrar");
    }
  };

  if (loadingTeachers) return <div className="p-10 text-center italic text-muted-foreground bg-background">Cargando docentes...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-background text-foreground">
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-6 p-6 bg-card text-card-foreground rounded-xl border border-border shadow-sm transition-all"
        >
          <header className="border-b border-border pb-4">
            <h2 className="text-lg font-bold tracking-tight">
              Panel Administrativo: Registrar Horario
            </h2>
            <p className="ext-xs text-muted-foreground">
              Selecciona un docente y asigna sus horarios por materia.
            </p>
          </header>

          <FormField
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-semibold">1. Seleccionar Docente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Busca un docente..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover border-border">
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} {t.primerApellido}  {t.segundoApellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            key={`subject-${selectKey}`}
            control={form.control}
            name="subjectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-semibold">2. Asignatura / Grupo</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={!selectedTeacherId || loadingSubjects}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder={loadingSubjects ? "Cargando materias..." : "Seleccionar materia"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover border-border">
                    {subjects.length > 0 ? (
                      subjects.map((sub: materia) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.subject} - {sub.group}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-xs text-muted-foreground text-center">
                        Sin materias asignadas
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Día</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border">
                      {DAYS.map((d: string) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classroom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Aula</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: B-10" 
                      className="bg-background border-border focus-visible:ring-primary text-foreground" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Hora Inicio</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      className="bg-background border-border text-foreground" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Hora Fin</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      className="bg-background border-border text-foreground" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full font-semibold shadow-md"
            disabled={!form.getValues("subjectId") || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Registrando..." : "Registrar Horario"}
          </Button>
        </form>
      </Form>
    </div>
  );
};