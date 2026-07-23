import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner"; // O tu librería de notificaciones
import {
  User,
  ShieldCheck,
  Phone,
  MapPin,
  UserCircle,
  GraduationCap,
  Hash,
  Star,
  Mail,
  MessageCircleWarning,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { updateStudentProfile, changeUserPassword, changeUserEmail } from "@/api/api";
import * as z from "zod";

// Esquema para datos personales (Student)
export const profileSchema = z.object({
  celular: z.string().min(10, "Mínimo 10 dígitos").optional().or(z.literal("")),
  telCasa: z.string().optional().or(z.literal("")),
  correo: z.string().email("Correo inválido"),
  // Domicilio
  municipioResidencia: z.string().min(1, "Campo requerido"),
  localidad: z.string().min(1, "Campo requerido"),
  calle: z.string().min(1, "Campo requerido"),
  numero: z.string().min(1, "Campo requerido"),
  colonia: z.string().min(1, "Campo requerido"),
  cp: z.string().length(5, "Deben ser 5 dígitos"),
  // Tutor
  tutorCelular: z.string().min(10, "Mínimo 10 dígitos"),
  tutorOcupacion: z.string().min(1, "Campo requerido"),
});

export const emailSchema = z.object({
  nuevoEmail: z.string().email("Correo inválido"),
});

// Esquema para seguridad (User)
export const securitySchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme su contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
const ProfilePage = () => {
  const { studentData } = useOutletContext<{ studentData: any }>();
  const [loading, setLoading] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // 1. Formulario de Datos Personales
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      celular: studentData?.celular || "",
      telCasa: studentData?.telCasa || "",
      correo: studentData?.correo || "",
      municipioResidencia: studentData?.municipioResidencia || "",
      localidad: studentData?.localidad || "",
      calle: studentData?.calle || "",
      numero: studentData?.numero || "",
      colonia: studentData?.colonia || "",
      cp: studentData?.cp || "",
      tutorCelular: studentData?.tutorCelular || "",
      tutorOcupacion: studentData?.tutorOcupacion || "",
    },
  });
// 2. FORMULARIO DE EMAIL
  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { nuevoEmail: studentData?.user?.email || "" },
  });
  // 2. Formulario de Seguridad
  const securityForm = useForm({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onUpdateProfile = async (values: any) => {
    try {
      setLoading(true);
      await updateStudentProfile(values);
      toast.success("Perfil actualizado correctamente");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
const onUpdateEmail = async (values: any) => {
    try {
      setLoadingEmail(true);
      // Aquí llamarías a tu API: await updateEmail(values.nuevoEmail);
      await changeUserEmail(values)
      toast.success("Correo electrónico actualizado");
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoadingEmail(false);
    }
  };
  const onChangePassword = async (values: any) => {
    try {
      setLoading(true);
      await changeUserPassword({
        email:values.email,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Contraseña actualizada");
      securityForm.reset();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
      {/* HEADER: TARJETA DE IDENTIDAD (NO EDITABLE) */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-24 w-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
              <UserCircle className="h-16 w-16 text-white" />
            </div>
            <div className="text-center md:text-left space-y-2 grow">
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white hover:bg-white/30 border-none italic backdrop-blur-sm"
                >
                  <Hash className="h-3 w-3 mr-1" /> {studentData?.id}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/90 text-white border-none font-bold shadow-sm"
                >
                  {studentData?.semestre}° Semestre
                </Badge>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {studentData?.name}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-indigo-50 text-sm">
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 opacity-80" /> CURP:{" "}
                  {studentData?.curp}
                </span>
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4 opacity-80 text-yellow-300" /> Promedio:{" "}
                  <span className="font-bold">{studentData?.promedioFinal}</span>
                </span>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-indigo-50 text-sm">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 opacity-80" /> Email-Personal:{" "}
                  {studentData?.correo}
                </span>
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 opacity-80" /> Email Institucional:{" "}
                  {studentData?.user?.email||"No asignado"}
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs mt-6 text-orange-200/90 bg-orange-500/10 p-2 rounded-md border border-orange-500/20 max-w-2xl">
                  <MessageCircleWarning className="h-4 w-4 shrink-0" />
                  <p>Si los correos son iguales o no cuentas con institucional, puedes usar el mismo email en ambos campos.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-muted/50 border border-border">
          <TabsTrigger value="personal" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <User className="h-4 w-4" /> Datos Personales
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ShieldCheck className="h-4 w-4" /> Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6 animate-in fade-in-50 duration-300">
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onUpdateProfile)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SECCIÓN CONTACTO */}
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                      <Phone className="h-5 w-5 text-indigo-500" /> Contacto Directo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="correo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Correo Personal</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="email@ejemplo.com" className="bg-background border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="celular"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80">Celular</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-background border-border" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="telCasa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80">Tel. Casa</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-background border-border" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* SECCIÓN DOMICILIO */}
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                      <MapPin className="h-5 w-5 text-indigo-500" /> Domicilio Actual
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="calle"
                      render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                          <FormLabel className="text-foreground/80">Calle</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Número</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="colonia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Colonia</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="municipioResidencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Municipio</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="cp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">C.P.</FormLabel>
                          <FormControl>
                            <Input {...field} maxLength={5} className="bg-background border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* SECCIÓN TUTOR / CONTACTO EMERGENCIA */}
                <Card className="md:col-span-2 bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                      <UserCircle className="h-5 w-5 text-destructive" /> Contacto de Emergencia (Tutor)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 p-4 bg-muted/40 rounded-lg border border-border italic text-sm text-muted-foreground">
                      Estos datos son vitales para que la institución pueda
                      contactar a un responsable en caso de incidentes.
                    </div>
                    <FormField
                      control={profileForm.control}
                      name="tutorCelular"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Celular del Tutor</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="tutorOcupacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Ocupación del Tutor</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-background border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Actualizar Información Personal"}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="security" className="mt-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="space-y-6 max-w-2xl mx-auto">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                   Correo Electrónico de Acceso
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Este correo se utiliza para iniciar sesión y recibir notificaciones de seguridad.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onUpdateEmail)} className="flex flex-col sm:flex-row gap-4 items-end">
                    <FormField
                      control={emailForm.control}
                      name="nuevoEmail"
                      render={({ field }) => (
                        <FormItem className="flex-grow w-full">
                          <FormLabel className="text-foreground/80">Nuevo Email</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ejemplo@correo.com" className="bg-background border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={loadingEmail} className="w-full sm:w-auto">
                      {loadingEmail ? "Guardando..." : "Cambiar Email"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Gestión de Seguridad</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Se recomienda cambiar su contraseña cada 6 meses para mantener su cuenta protegida.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form
                    onSubmit={securityForm.handleSubmit(onChangePassword)}
                    className="space-y-4"
                  >
                    <FormField
                      control={securityForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Contraseña Actual</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="bg-background border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Nueva Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="bg-background border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={securityForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Confirmar Nueva Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="bg-background border-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full text-white"
                      variant="destructive"
                      disabled={loading}
                    >
                      {loading ? "Procesando..." : "Cambiar Contraseña"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;