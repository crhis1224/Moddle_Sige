import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import {
  Eye,
  GraduationCap,
  Pencil,
  Trash2,
  User as UserIcon,
  UserPlus,
  Key,
  Loader2,
  MapPin,
  Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { setSelectedStudent, type Student } from "@/redux/id/studentSlice";
import { getStatusAlert, permanentDeleteStudent } from "@/api/api";
import {
  assignUserToStudent,
  updateUser,
} from "@/api/teacher-services/teacher.api";
import { useNavigate } from "react-router-dom";

// 1. ESQUEMA DE VALIDACIÓN CORREGIDO
const userSchema = z.object({
  id: z.string().min(1, "ID requerido"),
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Correo inválido"),
  password: z.string().optional().or(z.literal("")),
  role: z.string().min(1, "Seleccione un rol"),
  tieneUsuario: z.boolean(), // Campo auxiliar para la lógica de validación
}).superRefine((values, ctx) => {
  // Si NO tiene usuario (es creación) y el password está vacío
  if (!values.tieneUsuario && (!values.password || values.password.length < 6)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La contraseña es obligatoria para nuevos accesos (mín. 6 caracteres)",
      path: ["password"],
    });
  }
});

export type Alumno = {
  id: string;
  semestre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  sexo: string;
  estadoCivil: string;
  fechaNacimiento: string;
  edad: number;
  nacionalidad: string;
  lugarNacimiento: string;
  municipioResidencia: string;
  localidad: string;
  calle: string;
  numero: string;
  colonia: string;
  cp: string;
  telCasa: string;
  celular: string;
  correo: string;
  curp: string;
  escuelaMunicipio: string;
  escuelaNombre: string;
  promedioFinal: number;
  tutorApellidoPaterno: string;
  tutorApellidoMaterno: string;
  tutorNombres: string;
  tutorCalle: string;
  tutorNumero: string;
  tutorColonia: string;
  tutorCP: string;
  tutorTelCasa: string;
  tutorCelular: string;
  tutorOcupacion: string;
  user?: { id: string; email: string; name: string; role: string };
};

type ColumnProps = {
  onDeleteSuccess: (id: string) => void;
  onRefreshData?: () => void;
};

export const Columns = ({
  onDeleteSuccess,
  onRefreshData,
}: ColumnProps): ColumnDef<Alumno>[] => [
  { accessorKey: "nombres", header: "Nombre(s)" },
  { accessorKey: "apellidoPaterno", header: "Apellido Paterno" },
  { accessorKey: "apellidoMaterno", header: "Apellido Materno" },
  {
    id: "acciones",
    header: "Expediente / Acceso",
    cell: ({ row }) => {
      const al = row.original;
      const dispatch = useDispatch();
      const navigate = useNavigate();
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [dialogOpen, setDialogOpen] = useState(false);

      const tieneUsuario = !!al.user;

      const userForm = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        values: {
          id: al.user?.id || `USR-${al.id}`,
          name: al.user?.name || `${al.nombres} ${al.apellidoPaterno}`,
          email: al.user?.email || al.correo || "",
          password: "",
          role: al.user?.role || "student",
          tieneUsuario: tieneUsuario, // Pasamos el estado al formulario
        },
      });

      const onUserSubmit = async (values: z.infer<typeof userSchema>) => {
        setIsSubmitting(true);
        try {
          // 2. LIMPIEZA DEL PAYLOAD ANTES DE ENVIAR
          const payload: any = { ...values };
          delete payload.tieneUsuario; // No necesitamos enviar esto al backend

          // Si estamos editando y el password está vacío, lo eliminamos para no sobreescribir con null
          if (tieneUsuario && !payload.password) {
            delete payload.password;
          }

          if (tieneUsuario) {
            await updateUser(payload);
            alert("Acceso actualizado correctamente");
          } else {
            await assignUserToStudent(payload, al.id);
            alert("Acceso creado y vinculado con éxito");
          }
          
          if (onRefreshData) await onRefreshData();
          setDialogOpen(false);
        } catch (error: any) {
          alert("Error: " + error.message);
        } finally {
          setIsSubmitting(false);
        }
      };

      const handleEdit = () => {
        const studentData: Student = { ...al, semestre: al.semestre || "1" };
        dispatch(setSelectedStudent(studentData));
        navigate(`../editar-estudiante/${al.id}`);
      };

      const handleDelete = async () => {
        if (window.confirm(`¿Eliminar permanentemente a ${al.nombres}?`)) {
          try {
            const response = await permanentDeleteStudent(al.id);
            alert(response?.message || "Operación realizada con éxito");
            onDeleteSuccess(al.id);
          } catch (error: any) {
            alert(getStatusAlert(error.message, "Alumno"));
          }
        }
      };

      return (
        <div className="flex items-center gap-2">
          {/* DIALOG DE GESTIÓN DE USUARIO */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <TooltipProvider>
              <Tooltip>
                <DialogTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-8 w-8 transition-colors ${
                        tieneUsuario
                          ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                          : "text-blue-500 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20"
                      }`}
                    >
                      {tieneUsuario ? <Key className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                </DialogTrigger>
                <TooltipContent>
                  {tieneUsuario ? "Gestionar Acceso" : "Crear Acceso"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DialogContent className="sm:max-w-[425px] bg-background border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {tieneUsuario ? "Actualizar Credenciales" : "Configurar Nuevo Acceso"}
                </DialogTitle>
              </DialogHeader>
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={userForm.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">ID de Usuario</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-muted text-muted-foreground border-border" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ejemplo@correo.com" className="bg-background border-border text-foreground" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Rol de Sistema</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                          >
                            <option value="student" className="bg-background">Estudiante</option>
                            <option value="user" className="bg-background">Docente</option>
                            <option value="admin" className="bg-background">Administrador</option>
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                          {tieneUsuario
                            ? "Nueva Contraseña (Opcional)"
                            : "Contraseña de Acceso *"}
                        </FormLabel>
                        <FormControl>
                          <Input type="password" {...field} placeholder={tieneUsuario ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"} className="bg-background border-border text-foreground" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className={`w-full font-bold ${tieneUsuario ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Guardar Acceso"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* SHEET DE DETALLES */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2 border-border text-foreground hover:bg-accent">
                <Eye className="h-4 w-4" /> Detalle
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] bg-background border-l border-border">
              <SheetHeader className="text-left border-b border-border pb-4">
                <SheetTitle className="text-xl font-bold text-foreground">Expediente Escolar</SheetTitle>
                <SheetDescription className="font-medium text-primary">
                  {al.nombres} {al.apellidoPaterno} {al.apellidoMaterno}
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
                <div className="space-y-8 pb-10 px-10">
                  {/* SECCIÓN ACADÉMICO */}
                  <section>
                    <div className="flex items-center gap-2 mb-4 text-primary">
                      <GraduationCap className="h-5 w-5" />
                      <h3 className="font-bold uppercase text-xs tracking-widest">Información Académica</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 text-center">
                        <p className="text-[10px] uppercase font-bold text-primary/70">Semestre</p>
                        <p className="text-2xl font-black text-primary">{al.semestre}°</p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 text-center">
                        <p className="text-[10px] uppercase font-bold text-primary/70">Promedio</p>
                        <p className="text-2xl font-black text-primary">{al.promedioFinal}</p>
                      </div>
                      <DataField label="Escuela de Procedencia" value={al.escuelaNombre} className="col-span-2" />
                      <DataField label="Municipio de la Escuela" value={al.escuelaMunicipio} />
                      <DataField label="ID Sistema" value={al.id} />
                    </div>
                  </section>

                  <Separator className="bg-border" />

                  {/* SECCIÓN DATOS PERSONALES */}
                  <section>
                    <div className="flex items-center gap-2 mb-4 text-foreground/80">
                      <UserIcon className="h-5 w-5" />
                      <h3 className="font-bold uppercase text-xs tracking-widest">Datos del Alumno</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <DataField label="CURP" value={al.curp} className="col-span-2 font-mono bg-muted/50 p-2 rounded text-foreground" />
                      <DataField label="Fecha de Nacimiento" value={al.fechaNacimiento} />
                      <DataField label="Edad" value={`${al.edad} años`} />
                      <DataField label="Sexo" value={al.sexo} />
                      <DataField label="Estado Civil" value={al.estadoCivil} />
                      <DataField label="Nacionalidad" value={al.nacionalidad} />
                      <DataField label="Lugar de Nacimiento" value={al.lugarNacimiento} />
                    </div>
                  </section>

                  <Separator className="bg-border" />

                  {/* SECCIÓN CONTACTO */}
                  <section>
                    <div className="flex items-center gap-2 mb-4 text-foreground/80">
                      <MapPin className="h-5 w-5" />
                      <h3 className="font-bold uppercase text-xs tracking-widest">Contacto y Domicilio</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <DataField label="Correo Personal" value={al.correo} className="col-span-2" />
                      <DataField label="Celular" value={al.celular} />
                      <DataField label="Tel. Casa" value={al.telCasa} />
                      <DataField label="Dirección" value={`${al.calle} #${al.numero}`} className="col-span-2" />
                      <DataField label="Colonia" value={al.colonia} />
                      <DataField label="Código Postal" value={al.cp} />
                    </div>
                  </section>

                  <Separator className="bg-border" />

                  {/* SECCIÓN TUTOR */}
                  <section className="bg-muted/30 p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-2 mb-4 text-foreground/90">
                      <Briefcase className="h-5 w-5" />
                      <h3 className="font-bold uppercase text-xs tracking-widest">Información del Tutor</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <DataField label="Nombre Completo" value={`${al.tutorNombres} ${al.tutorApellidoPaterno} ${al.tutorApellidoMaterno}`} className="col-span-2" />
                      <DataField label="Ocupación" value={al.tutorOcupacion} />
                      <DataField label="Celular Tutor" value={al.tutorCelular} />
                      <DataField label="Tel. Casa Tutor" value={al.tutorTelCasa} />
                      <DataField label="CP Tutor" value={al.tutorCP} />
                      <DataField label="Dirección Tutor" value={`${al.tutorCalle} #${al.tutorNumero}, Col. ${al.tutorColonia}`} className="col-span-2" />
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* BOTONES DE ACCIÓN RÁPIDA */}
          <div className="flex items-center gap-1 ml-2 border-l border-border pl-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600" onClick={handleEdit}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Eliminar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      );
    },
  },
];

function DataField({ label, value, className = "" }: { label: string; value: string | number; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">{label}</p>
      <p className="font-semibold text-foreground break-words">{value || "No registrado"}</p>
    </div>
  );
}