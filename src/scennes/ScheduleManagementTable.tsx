import React, { useEffect, useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from "@/redux/hooks";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Save, X, FilterX } from "lucide-react";
import { toast } from "sonner";
import { deleteScheduleThunk, fetchAllSchedulesThunk, updateScheduleThunk } from '@/redux/ScheduleSlice';

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;

export const ScheduleManagementTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { allSchedules, loading } = useAppSelector((state) => state.schudeleState);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  // Estados para filtros
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  useEffect(() => {
    dispatch(fetchAllSchedulesThunk());
  }, [dispatch]);

  // Obtener listas únicas para los filtros basados en los datos
  const teachersList = useMemo(() => {
    const unique = new Map();
    allSchedules.forEach(s => {
      const t = s.subject?.teacher;
      if (t) unique.set(t.id, `${t.name} ${t.primerApellido}`);
    });
    return Array.from(unique.entries());
  }, [allSchedules]);

  const subjectsList = useMemo(() => {
    const unique = new Set(allSchedules.map(s => s.subject?.subject).filter(Boolean));
    return Array.from(unique);
  }, [allSchedules]);

  // Lógica de filtrado
  const filteredSchedules = useMemo(() => {
    return allSchedules.filter(s => {
      const matchTeacher = filterTeacher === "all" || s.subject?.teacher?.id === filterTeacher;
      const matchSubject = filterSubject === "all" || s.subject?.subject === filterSubject;
      return matchTeacher && matchSubject;
    });
  }, [allSchedules, filterTeacher, filterSubject]);

  const handleEditClick = (schedule: any) => {
    setEditingId(schedule.id);
    setEditForm({ ...schedule });
  };

  const handleSave = async () => {
    try {
      const payload = {
        day: editForm.day,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        classroom: editForm.classroom
      };
      await dispatch(updateScheduleThunk({ id: editingId!, data: payload })).unwrap();
      toast.success("Cambios guardados");
      setEditingId(null);
    } catch (error: any) {
      toast.error(error || "Error al actualizar");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Eliminar este horario?")) {
      try {
        await dispatch(deleteScheduleThunk(id)).unwrap();
        toast.success("Eliminado correctamente");
      } catch (error: any) {
        toast.error(error || "Error al eliminar");
      }
    }
  };

  if (loading && allSchedules.length === 0) return <p className="text-center p-4 text-xs italic">Cargando base de datos...</p>;

  return (
    <div className="space-y-3">
      {/* BARRA DE FILTROS */}
      <div className="flex flex-wrap items-end gap-2 bg-muted/30 p-2 rounded-lg border border-dashed">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase px-1">Filtrar Docente</label>
          <Select value={filterTeacher} onValueChange={setFilterTeacher}>
            <SelectTrigger className="h-8 text-xs w-[180px] bg-background">
              <SelectValue placeholder="Todos los docentes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los docentes</SelectItem>
              {teachersList.map(([id, name]) => (
                <SelectItem key={id} value={id} className="text-xs">{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase px-1">Filtrar Materia</label>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="h-8 text-xs w-[180px] bg-background">
              <SelectValue placeholder="Todas las materias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las materias</SelectItem>
              {subjectsList.map(sub => (
                <SelectItem key={sub} value={sub} className="text-xs">{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(filterTeacher !== "all" || filterSubject !== "all") && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs text-destructive hover:text-destructive"
            onClick={() => { setFilterTeacher("all"); setFilterSubject("all"); }}
          >
            <FilterX className="h-3.5 w-3.5 mr-1" /> Limpiar
          </Button>
        )}
      </div>

      {/* TABLA */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs h-9">Docente</TableHead>
              <TableHead className="text-xs h-9">Materia</TableHead>
              <TableHead className="text-xs h-9">Día</TableHead>
              <TableHead className="text-xs h-9">Horario</TableHead>
              <TableHead className="text-xs h-9">Aula</TableHead>
              <TableHead className="text-right text-xs h-9 px-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/30">
                  <TableCell className="py-2 text-xs font-medium">
                    {s.subject?.teacher?.name} {s.subject?.teacher?.primerApellido}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">
                    {s.subject?.subject} <span className="text-[10px] font-bold">({s.subject?.group})</span>
                  </TableCell>
                  
                  {editingId === s.id ? (
                    <>
                      <TableCell className="py-1">
                        <Select value={editForm.day} onValueChange={(val) => setEditForm({...editForm, day: val})}>
                          <SelectTrigger className="h-7 text-xs w-[100px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {DAYS.map(d => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-1">
                        <div className="flex items-center gap-1">
                          <Input type="time" className="h-7 text-[10px] w-18 p-1" value={editForm.startTime} onChange={(e) => setEditForm({...editForm, startTime: e.target.value})} />
                          <Input type="time" className="h-7 text-[10px] w-18 p-1" value={editForm.endTime} onChange={(e) => setEditForm({...editForm, endTime: e.target.value})} />
                        </div>
                      </TableCell>
                      <TableCell className="py-1">
                        <Input className="h-7 text-xs w-16" value={editForm.classroom} onChange={(e) => setEditForm({...editForm, classroom: e.target.value})} />
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-xs">{s.day}</TableCell>
                      <TableCell className="text-xs tabular-nums">{s.startTime} - {s.endTime}</TableCell>
                      <TableCell className="text-xs">{s.classroom || "-"}</TableCell>
                    </>
                  )}

                  <TableCell className="text-right py-1 px-4">
                    {editingId === s.id ? (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleSave} title="Guardar">
                          <Save className="h-3.5 w-3.5 text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(null)} title="Cancelar">
                          <X className="h-3.5 w-3.5 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEditClick(s)} title="Editar">
                          <Edit className="h-3.5 w-3.5 text-blue-600" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDelete(s.id)} title="Eliminar">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground italic">
                  No se encontraron horarios con los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};