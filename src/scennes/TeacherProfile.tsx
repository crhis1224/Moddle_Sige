import { useState, useEffect } from "react";
import { User as UserIcon, Mail, Lock, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useOutletContext } from "react-router-dom";
import { updateFullProfile } from "@/api/teacher-services/teacher.api";

// Definimos el tipo basado en lo que ya tienes en el Dashboard
interface TeacherData {
  id: string;
  name: string;
  primerApellido: string;
  segundoApellido: string;
  user?: {
    id: string;
    email: string;
  };
}

const TeacherProfile = () => {
  const { teacherData } = useOutletContext<{ teacherData: any }>();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    password: "",
  });

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (teacherData) {
      setFormData({
        name: teacherData.name || "",
        primerApellido: teacherData.primerApellido || "",
        segundoApellido: teacherData.segundoApellido || "",
        email: teacherData.user?.email || "",
        password: "",
      });
    }
  }, [teacherData]);

  const handleUpdate = async () => {
    if (!teacherData?.id || !teacherData?.user?.id) {
      alert("Error: No se pudo identificar al usuario o docente.");
      return;
    }

    setSaving(true);
    try {
      // Llamamos a la función que definimos en el paso anterior (updateFullProfile)
      await updateFullProfile(teacherData.id, teacherData.user.id, formData);

      alert("✅ Perfil y credenciales actualizados con éxito.");

      // Limpiamos el campo de password por seguridad
      setFormData((prev) => ({ ...prev, password: "" }));

      // Opcional: Podrías forzar una recarga de la página o
      // llamar a una función del Dashboard para refrescar el estado global
      // window.location.reload();
    } catch (error: any) {
      alert(`❌ Error al actualizar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-background text-foreground">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <UserIcon className="h-5 w-5 text-primary" />
            Configuración de Perfil
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            ID Docente:{" "}
            <span className="font-mono font-bold text-foreground">
              {teacherData?.id}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos Personales */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Información Personal
              </h3>
              <div className="space-y-2">
                <Label className="text-foreground">Nombre(s)</Label>
                <Input
                  className="bg-background border-border text-foreground"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Primer Apellido</Label>
                <Input
                  className="bg-background border-border text-foreground"
                  value={formData.primerApellido}
                  onChange={(e) =>
                    setFormData({ ...formData, primerApellido: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Segundo Apellido</Label>
                <Input
                  className="bg-background border-border text-foreground"
                  value={formData.segundoApellido}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      segundoApellido: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Credenciales */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Acceso al Sistema
              </h3>
              <div className="space-y-2">
                <Label className="text-foreground">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10 bg-background border-border text-foreground"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Cambiar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    className="pl-10 bg-background border-border text-foreground"
                    placeholder="Dejar vacío para mantener actual"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" /> La contraseña se encriptará
                  automáticamente.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              onClick={handleUpdate}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="h-4 w-4 mr-2" /> {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherProfile;