import { useState, useMemo, useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pencil,
  Trash2,
  UserPlus,
  Users,
  Search,
  UserCog,
  UserCheck,
  Loader2,
  RefreshCw,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// APIs
import { 
  registerTeacher, 
  updateTeacher, 
  assignUserToTeacher, 
  updateUser,
  getTeachers,
} from "@/api/teacher-services/teacher.api";
import { permanentDeleteTeacher } from "@/api/api";

// --- ESQUEMAS ---
const teacherSchema = z.object({
  id: z.string().min(3, "ID muy corto").max(15, "Máximo 15 caracteres"),
  name: z.string().min(2, "Nombre requerido"),
  primerApellido: z.string().min(2, "Requerido"),
  segundoApellido: z.string().optional().nullable().or(z.literal("")),
});

const userSchema = z.object({
  id: z.string().min(1, "ID requerido"),
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Correo inválido"),
  password: z.string().optional().or(z.literal('')),
  role: z.string().min(1, "Seleccione un rol"),
  esEdicion: z.boolean(),
}).superRefine((values, ctx) => {
  if (!values.esEdicion && (!values.password || values.password.length < 6)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La contraseña es obligatoria (mín. 6 caracteres)",
      path: ["password"],
    });
  }
});

type TeacherValues = z.infer<typeof teacherSchema>;
type UserValues = z.infer<typeof userSchema>;

export default function TeacherManagement() {
  const [teachersList, setTeachersList] = useState<TeacherValues[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [isEditingTeacher, setIsEditingTeacher] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const teacherForm = useForm<TeacherValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { id: "", name: "", primerApellido: "", segundoApellido: "" },
  });

  const userForm = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { id: "", name: "", email: "", password: "", role: "user", esEdicion: false },
  });

  // --- CARGA DE DATOS ---
  const fetchTeachers = async () => {
    setIsInitialLoading(true);
    try {
      const data = await getTeachers();
      setTeachersList(data.map((t: any) => ({
        id: t.id,
        name: t.name,
        primerApellido: t.primerApellido,
        segundoApellido: t.segundoApellido || ""
      })));

      const newUsersMap: Record<string, any> = {};
      data.forEach((t: any) => {
        if (t.user) {
          newUsersMap[t.id] = {
            id: t.user.id,
            name: t.user.name,
            email: t.user.email,
            role: t.user.role || "user",
          };
        }
      });
      setUsersMap(newUsersMap);
    } catch (error) {
      console.error("Error al sincronizar:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  // --- LÓGICA DE FORMULARIO DOCENTE ---
  const handleCancelTeacherEdit = () => {
    setIsEditingTeacher(null);
    teacherForm.reset({ id: "", name: "", primerApellido: "", segundoApellido: "" });
  };

  async function onTeacherSubmit(values: TeacherValues) {
    setIsLoading(true);
    try {
      if (isEditingTeacher) {
        await updateTeacher(values);
      } else {
        await registerTeacher(values);
      }
      handleCancelTeacherEdit(); // Resetea y limpia campos
      await fetchTeachers();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // --- LÓGICA DE ELIMINACIÓN ---
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar permanentemente a ${name}?`)) return;
    setIsLoading(true);
    try {
      await permanentDeleteTeacher(id);
      if (isEditingTeacher === id) handleCancelTeacherEdit();
      await fetchTeachers(); 
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE USUARIO ---
  async function onUserSubmit(values: UserValues, teacherId: string) {
    setIsLoading(true);
    const isEdicion = !!usersMap[teacherId];
    const payload: any = { ...values };
    delete payload.esEdicion;

    if (isEdicion && !payload.password) delete payload.password;

    try {
      if (isEdicion) {
        await updateUser(payload);
      } else {
        await assignUserToTeacher(payload, teacherId);
      }
      await fetchTeachers(); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePrepareUserForm = (teacher: TeacherValues) => {
    const existingUser = usersMap[teacher.id];
    userForm.reset(existingUser ? { 
      ...existingUser, 
      password: "", 
      esEdicion: true 
    } : {
      id: `USR-${teacher.id}`,
      name: `${teacher.name} ${teacher.primerApellido}`,
      email: "",
      password: "",
      role: "user",
      esEdicion: false
    });
  };

  const filteredTeachers = useMemo(() => {
    return teachersList.filter((t) =>
      `${t.name} ${t.primerApellido} ${t.id}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachersList, searchTerm]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 bg-background text-foreground">
      {/* FORMULARIO DOCENTE */}
      <Card className={`shadow-md border-t-4 transition-all ${isEditingTeacher ? "border-t-amber-500 bg-amber-500/5" : "border-t-primary bg-card"}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2 text-primary">
            <UserPlus className="w-5 h-5" />
            {isEditingTeacher ? "Modificar Docente" : "Nuevo Docente"}
          </CardTitle>
          <div className="flex gap-2">
            {isEditingTeacher && (
              <Button variant="ghost" size="sm" onClick={handleCancelTeacherEdit} className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10">
                <X className="w-4 h-4 mr-1" /> Cancelar
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={fetchTeachers} disabled={isInitialLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isInitialLoading ? "animate-spin" : ""}`} />
              Actualizar Tabla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...teacherForm}>
            <form onSubmit={teacherForm.handleSubmit(onTeacherSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField control={teacherForm.control} name="id" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase">ID / CÉDULA</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} disabled={!!isEditingTeacher || isLoading} className="bg-background"/></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />
              <FormField control={teacherForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase">NOMBRE</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} disabled={isLoading} className="bg-background"/></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />
              <FormField control={teacherForm.control} name="primerApellido" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase">1ER APELLIDO</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} disabled={isLoading} className="bg-background"/></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />
              <FormField control={teacherForm.control} name="segundoApellido" render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase">2DO APELLIDO</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} disabled={isLoading} className="bg-background"/></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className={`h-10 px-6 col-span-4 transition-colors ${isEditingTeacher ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-primary hover:bg-primary/90"}`} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditingTeacher ? "Actualizar registro" : "Crear registro docente")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* TABLA CON SCROLL */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-2">
          <h2 className="font-bold flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-primary"/> 
            Docentes en Sistema ({filteredTeachers.length})
          </h2>
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre o ID..." className="pl-9 bg-background" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          {isInitialLoading ? (
            <div className="flex flex-col items-center py-20">
              <Loader2 className="animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Cargando datos...</p>
            </div>
          ) : (
            <div className="relative overflow-y-auto max-h-[450px] scrollbar-thin scrollbar-thumb-muted"> 
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="font-bold text-foreground h-11 bg-muted/50">Id</TableHead>
                    <TableHead className="font-bold text-foreground h-11 bg-muted/50">Docente</TableHead>
                    <TableHead className="text-center font-bold text-foreground h-11 bg-muted/50">Usuario</TableHead>
                    <TableHead className="text-right px-6 font-bold text-foreground h-11 bg-muted/50">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id} className={`${isEditingTeacher === teacher.id ? "bg-amber-500/10" : "hover:bg-muted/30"} border-border`}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{teacher.id}</TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{teacher.name} {teacher.primerApellido} {teacher.segundoApellido}</TableCell>
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant={usersMap[teacher.id] ? "secondary" : "outline"} size="sm" className="h-8 gap-2 border-border" onClick={() => handlePrepareUserForm(teacher)}>
                              {usersMap[teacher.id] ? <><UserCheck className="w-3.5 h-3.5 text-green-500"/> {usersMap[teacher.id].email}</> : <><UserCog className="w-3.5 h-3.5"/> Vincular</>}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card border-border text-card-foreground">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">{usersMap[teacher.id] ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
                            </DialogHeader>
                            <Form {...userForm}>
                              <form onSubmit={userForm.handleSubmit((vals) => onUserSubmit(vals, teacher.id))} className="space-y-4">
                                <FormField control={userForm.control} name="id" render={({ field }) => (
                                  <FormItem><FormLabel>Id/Matricula</FormLabel><FormControl><Input {...field} disabled={true} className="bg-muted cursor-not-allowed"/></FormControl></FormItem>
                                )} />
                                <FormField control={userForm.control} name="email" render={({ field }) => (
                                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} disabled={isLoading} className="bg-background border-border"/></FormControl><FormMessage/></FormItem>
                                )} />
                                <FormField control={userForm.control} name="role" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Rol</FormLabel>
                                    <FormControl>
                                      <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring" disabled={isLoading}>
                                        <option value="user">Docente</option>
                                        <option value="admin">Administrador</option>
                                        <option value="student">Estudiante</option>
                                      </select>
                                    </FormControl>
                                  </FormItem>
                                )} />
                                <FormField control={userForm.control} name="password" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{usersMap[teacher.id] ? "Nueva Contraseña (Opcional)" : "Contraseña *"}</FormLabel>
                                    <FormControl><Input type="password" {...field} disabled={isLoading} className="bg-background border-border" placeholder={usersMap[teacher.id] ? "Dejar vacío para mantener" : "Mínimo 6 caracteres"}/></FormControl>
                                    <FormMessage/>
                                  </FormItem>
                                )} />
                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>Guardar Acceso</Button>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-right px-6 space-x-1">
                        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" onClick={() => { teacherForm.reset(teacher); setIsEditingTeacher(teacher.id); window.scrollTo({top:0, behavior:'smooth'}); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10" 
                          onClick={() => handleDelete(teacher.id, teacher.name)} 
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">No se encontraron docentes.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}