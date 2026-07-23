import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Bell, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getMyFeed, type IAnnouncement } from "@/api/grade-services/grade.api";
import { useOutletContext } from "react-router-dom";

const AnnouncementsFeed = () => {
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const { subjects } = useOutletContext<{ subjects: any[] }>();

  const getSubjectName = (id?: string) => {
    if (!id) return "Materia";
    const sub = subjects.find((s) => s.id === id);
    return sub ? sub.subject : "Materia";
  };

  useEffect(() => {
    const fetchAvisos = async () => {
      try {
        const data = await getMyFeed();
        setAnnouncements(data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAvisos();
  }, []);

  // Estilos de prioridad corregidos con variables semánticas y opacidad
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "URGENTE":
        return "bg-destructive/10 border-destructive/20 text-destructive dark:text-red-400";
      case "IMPORTANTE":
        return "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400";
      default:
        return "bg-primary/10 border-primary/20 text-primary dark:text-blue-400";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "URGENTE":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "IMPORTANTE":
        return <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <Megaphone className="h-5 w-5 text-primary" />;
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center animate-pulse text-muted-foreground bg-background">
        Cargando avisos recientes...
      </div>
    );

  return (
    <div className="space-y-6 max-w-4xl mx-auto transition-colors duration-300">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="text-primary" /> Tablón de Avisos
        </h2>
        <span className="text-xs text-muted-foreground font-medium bg-secondary px-3 py-1 rounded-full border border-border">
          {announcements.length} Avisos totales
        </span>
      </div>

      {announcements.length === 0 ? (
        <Card className="border-dashed shadow-none bg-transparent">
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay avisos relevantes para ti en este momento.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {announcements.map((aviso) => (
            <Card
              key={aviso.id}
              className={`overflow-hidden border-l-4 transition-all bg-card text-card-foreground shadow-sm hover:shadow-md ${
                aviso.priority === "URGENTE"
                  ? "border-l-destructive"
                  : aviso.priority === "IMPORTANTE"
                    ? "border-l-orange-500"
                    : "border-l-primary"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(aviso.priority)}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${getPriorityStyles(aviso.priority)}`}
                    >
                      {aviso.priority}
                    </span>

                    {aviso.type === "GENERAL" ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                        DIRECCIÓN
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {getSubjectName(aviso.subjectId)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock className="h-3 w-3" />
                    {format(new Date(aviso.createdAt), "d 'de' MMMM", {
                      locale: es,
                    })}
                  </div>
                </div>
                <CardTitle className="text-lg mt-2 font-bold text-foreground uppercase tracking-tight">
                  {aviso.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {aviso.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsFeed;