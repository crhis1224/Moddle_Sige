import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch } from "react-redux";

// Importa tu acción desde donde tengas tu authSlice
import { setCredentials } from "@/redux/authSlice";

// --- 1. ESQUEMA DE VALIDACIÓN (Zod) ---
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo es obligatorio" })
    .email({ message: "Introduce un correo electrónico válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// --- 2. COMPONENTES DE UI (Shadcn) ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { auth, getAuthCredentials } from "@/api/api";
import { useNavigate } from "react-router-dom";
import { PrivateRoutes } from "@/utilities/routes";
import { Roles } from "@/utilities/roles";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 2. Inicializar navigate

  // Configuración de React Hook Form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await auth(values);
      console.log(response)
      const profileRes = await getAuthCredentials()
      console.log(profileRes)

      //1. Guardar en Redux
      dispatch(setCredentials({
        email: profileRes.email,
        id: profileRes.sub,
        role: profileRes.role
      }));

      //2. Redirección Dinámica basada en el rol de la respuesta
      if (profileRes.role === Roles.STUDENT) {
        navigate("/student", { replace: true });
      } else {
        // Para ADMIN y USER (Docentes)
        navigate(`/${PrivateRoutes.PRIVATE}`, { replace: true });
      }

    } catch (error) {
      console.error("Error en el login:", error);
      alert("Error al iniciar sesión. Verifica tus credenciales.");
    }
  };


  return (
    <section className="flex justify-center items-center h-screen bg-background text-foreground p-4">
      <Card className="w-full max-w-sm shadow-lg border-border bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Inicia sesión</CardTitle>
          <CardDescription className="text-muted-foreground">
            Ingresa tus datos para entrar a la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="correo@ejemplo.com" 
                        {...field} 
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Cargando..." : "Iniciar Sesión"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}