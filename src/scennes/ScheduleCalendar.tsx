import  { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, User, MapPin, CalendarDays } from "lucide-react";
import { fetchMySchedule } from '@/api/schedule.api';
import type { RootState } from '@/redux/store';

interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  group: string;
  teacher?: string;
  classroom?: string;
}

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const ScheduleCalendar = () => {
  const { role } = useSelector((state: RootState) => state.auth);
  // Inicializamos siempre como array para que .filter() nunca falle
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMySchedule();
        
        // Validación estricta: si no es array, forzamos array vacío
        if (data && Array.isArray(data)) {
          setSchedule(data);
        } else {
          setSchedule([]);
        }
      } catch (error) {
        console.error("Error al obtener el horario:", error);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground animate-pulse">Cargando horario...</p>
        </div>
      </div>
    );
  }

  // Si no hay datos después de cargar
  if (!schedule || schedule.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/20 border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CalendarDays className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-foreground">No hay clases registradas</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Aún no tienes materias asignadas en tu horario para este periodo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl font-bold text-foreground">Mi Horario Escolar</CardTitle>
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          Vista: <span className="text-primary font-bold">{role}</span>
        </p>
      </CardHeader>
      
      <CardContent className="px-0">
        {/* Contenedor con Scroll Invisible */}
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide select-none group h-full">
          {DAYS_OF_WEEK.map((dayName) => {
            // Filtramos con seguridad sobre el array 'schedule'
            const dayClasses = schedule
              .filter(s => s && s.day === dayName)
              .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

            // Si el día no tiene clases, no renderizamos la columna
            if (dayClasses.length === 0) return null;

            return (
              <div key={dayName} className="min-w-[300px] flex-1 flex flex-col gap-4">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 px-1">
                  <h3 className="font-extrabold text-xl border-b-4 border-primary w-fit pr-6 rounded-sm text-foreground">
                    {dayName}
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  {dayClasses.map((item, idx) => (
                    <div 
                      key={`${dayName}-${idx}`}
                      className="group relative p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 font-mono py-1 px-2">
                          <Clock className="w-3 h-3 mr-2" />
                          {item.startTime} - {item.endTime}
                        </Badge>
                        <span className="text-[10px] font-black text-muted-foreground/60 tracking-tighter uppercase">
                          GRUPO: {item.group}
                        </span>
                      </div>

                      <h4 className="font-bold text-base leading-tight mb-4 flex items-start gap-3 text-foreground">
                        <BookOpen className="w-5 h-5 text-primary shrink-0" />
                        {item.subjectName}
                      </h4>

                      <div className="space-y-2 mt-4 border-t border-border pt-4">
                        {item.teacher && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground italic">
                            <User className="w-4 h-4 text-primary/70" />
                            <span className="truncate">{item.teacher}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                          <MapPin className="w-4 h-4 text-primary/70" />
                          <span>Aula: <span className="text-foreground font-semibold">{item.classroom || 'Sin asignar'}</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};