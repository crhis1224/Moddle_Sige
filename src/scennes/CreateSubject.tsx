import { useState, useMemo, useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pencil,
  Trash2,
  BookOpen,
  Calendar,
  PlusCircle,
  Filter,
  Loader2,
  UserPlus,
  UserCheck,
  Users,
  X,
  CheckCircle2,
  Search,
  CheckSquare,
  Square,
  Layers,
  Info
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  deleteSubjectPermanent,
  getSubject,
  registerSubject,
  updateSubject,
  bulkEnrollStudents,
} from "@/api/subject-services/subject.api";
import { getTeachers, assignSubjectToTeacher } from "@/api/teacher-services/teacher.api";
import { getEnrolledStudentsIds, getStudents } from "@/api/api";

const formSchema = z.object({
  id: z.string().min(4, "ID demasiado corto").max(10, "Máximo 10 caracteres"),
  subject: z.string().min(2, "Materia requerida"),
  semester: z.string().min(1, "Requerido"),
  group: z.string().min(1, "Requerido"),
  effectiveDate: z.string().regex(/^\d{4}$/, "Año inválido"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AcademicForm() {
  const currentYear = new Date().getFullYear().toString();
  
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [yearFilter, setYearFilter] = useState<string>(currentYear);
  const [semesterFilter, setSemesterFilter] = useState<string>("all");

  const [teachers, setTeachers] = useState<any[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const [students, setStudents] = useState<any[]>([]);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [alreadyEnrolledIds, setAlreadyEnrolledIds] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      subject: "",
      semester: "",
      group: "",
      effectiveDate: currentYear,
    },
  });

  const fetchData = async () => {
    setIsLoading(true); 
    try {
      const [subjectsData, teachersData, studentsData] = await Promise.all([
        getSubject(),
        getTeachers(),
        getStudents() 
      ]);
      setSubjectsList(Array.isArray(subjectsData) ? subjectsData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isEnrollModalOpen) setSearchTerm("");
  }, [isEnrollModalOpen]);

  const availableYears = useMemo(() => {
    const years = subjectsList.map((s) => s.effectiveDate);
    return Array.from(new Set([currentYear, ...years])).sort((a, b) => b.localeCompare(a));
  }, [subjectsList, currentYear]);

  const filteredSubjects = useMemo(() => {
    return subjectsList.filter((s) => {
      const matchYear = yearFilter === "all" || s.effectiveDate === yearFilter;
      const matchSemester = semesterFilter === "all" || String(s.semester) === semesterFilter;
      return matchYear && matchSemester;
    });
  }, [subjectsList, yearFilter, semesterFilter]);

  const filteredStudentsBySemester = useMemo(() => {
    if (!selectedSubjectId || students.length === 0) return [];
    const currentSubject = subjectsList.find(s => s.id === selectedSubjectId);
    if (!currentSubject) return [];

    const targetSemester = String(currentSubject.semester || "").trim();
    
    let result = students.filter(s => 
      String(s.semestre || "").trim() === targetSemester && 
      !alreadyEnrolledIds.includes(s.id)
    );

    if (searchTerm.trim() !== "") {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.nombres?.toLowerCase().includes(lowSearch) || 
        s.apellidoPaterno?.toLowerCase().includes(lowSearch) ||
        s.id?.toLowerCase().includes(lowSearch)
      );
    }
    return result;
  }, [selectedSubjectId, subjectsList, students, searchTerm, alreadyEnrolledIds]);

  const handleOpenEnrollModal = async (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedStudentIds([]);
    try {
      const enrolledIds = await getEnrolledStudentsIds(subjectId);
      setAlreadyEnrolledIds(enrolledIds);
      setIsEnrollModalOpen(true);
    } catch (error: any) {
      alert("Error al obtener inscritos: " + error.message);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudentsBySemester.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudentsBySemester.map(s => s.id));
    }
  };

  const handleAssignTeacher = async (teacherId: string) => {
    if (!selectedSubjectId) return;
    setIsAssigning(true);
    try {
      const updatedTeacher = await assignSubjectToTeacher(teacherId, selectedSubjectId);
      setSubjectsList((prevList) => 
        prevList.map((subject) => {
          if (subject.id === selectedSubjectId) return { ...subject, teacher: updatedTeacher };
          return subject;
        })
      );
      setIsAssignModalOpen(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleBulkEnroll = async () => {
    if (!selectedSubjectId || selectedStudentIds.length === 0) return;
    setIsEnrolling(true);
    try {
      await bulkEnrollStudents({ subjectId: selectedSubjectId, studentIds: selectedStudentIds });
      setSelectedStudentIds([]);
      setIsEnrollModalOpen(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsEnrolling(false);
    }
  };

  async function onSubmit(values: FormValues) {
    if (!isEditing && subjectsList.some((s) => s.id === values.id)) {
      form.setError("id", { message: "Este ID ya existe" });
      return;
    }
    try {
      if (isEditing) {
        await updateSubject(values);
        setSubjectsList((prev) => prev.map((item) => (item.id === isEditing ? { ...item, ...values } : item)));
        setIsEditing(null);
      } else {
        await registerSubject(values);
        setSubjectsList((prev) => [{ ...values, teacher: null }, ...prev]);
      }
      form.reset({ id: "", subject: "", semester: "", group: "", effectiveDate: values.effectiveDate });
    } catch (error) {
      console.error(error);
    }
  }

  const handleEdit = (id: string) => {
    const item = subjectsList.find((s) => s.id === id);
    if (item) { form.reset(item); setIsEditing(id); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar materia permanentemente?")) {
        await deleteSubjectPermanent(id);
        setSubjectsList((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 transition-colors duration-300">
      {/* FORMULARIO */}
      <Card className="shadow-sm border-border bg-card text-card-foreground">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <PlusCircle className="w-5 h-5 text-primary" />
            {isEditing ? "Editar Materia" : "Registro de Materia"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <FormField control={form.control} name="id" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">ID Matrícula</FormLabel>
                    <FormControl><Input placeholder="MAT-101A" className="bg-background border-border" disabled={!!isEditing} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Nombre Materia</FormLabel>
                    <FormControl><Input placeholder="Asignatura" className="bg-background border-border" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="semester" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Semestre</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="bg-background border-border"><SelectValue placeholder="Elegir" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>{num}º Semestre</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-2">
                  <FormField control={form.control} name="group" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Grupo</FormLabel>
                      <FormControl><Input placeholder="402-A" className="bg-background border-border" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="effectiveDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Año</FormLabel>
                      <FormControl><Input type="number" className="bg-background border-border" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {isEditing && (
                  <Button type="button" variant="outline" onClick={() => { setIsEditing(null); form.reset(); }}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit" className="px-8 h-10 font-bold uppercase tracking-wider">{isEditing ? "Actualizar" : "Guardar Materia"}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* LISTADO CON FILTROS */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-border pb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground uppercase tracking-tight">
            <BookOpen className="w-5 h-5 text-primary" />
            Materias Registradas ({filteredSubjects.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3 bg-secondary/30 p-2 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="h-9 w-[130px] bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                  {availableYears.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="h-6 w-[1px] bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger className="h-9 w-[150px] bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los semestres</SelectItem>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>{num}º Semestre</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(yearFilter !== "all" || semesterFilter !== "all") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setYearFilter("all"); setSemesterFilter("all"); }}
                className="h-8 text-xs text-destructive hover:bg-destructive/10"
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
              {filteredSubjects.map((sub) => (
                <div key={sub.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all border-l-4 border-l-primary flex flex-row justify-between gap-2">
                  
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <span className="text-[10px] font-bold text-primary/70 font-mono tracking-wider">{sub.id}</span>
                      <h3 className="font-extrabold text-sm text-foreground uppercase mt-1 leading-tight break-words">{sub.subject}</h3>
                      
                      <div className="mt-3 flex items-center gap-1.5 p-1.5 bg-secondary/50 rounded-md border border-dashed border-border">
                        <UserCheck className={`w-3.5 h-3.5 ${sub.teacher ? 'text-green-500' : 'text-muted-foreground/40'}`} />
                        <span className="text-[10px] font-medium text-muted-foreground truncate">
                          {sub.teacher ? `${sub.teacher.name} ${sub.teacher.primerApellido}` : "Sin profesor"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-1.5 text-[10px] items-center">
                      <span className="bg-primary/10 text-primary dark:bg-primary/20 px-2 py-0.5 rounded-full font-bold">G: {sub.group}</span>
                      <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase font-medium">{sub.semester}º Sem.</span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase"><Calendar className="w-3 h-3" /> {sub.effectiveDate}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 dark:text-green-400 hover:bg-green-500/10 border-border" onClick={() => { setSelectedSubjectId(sub.id); setIsAssignModalOpen(true); }}><UserPlus className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 border-border" onClick={() => handleOpenEnrollModal(sub.id)}><Users className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border-border" onClick={() => handleEdit(sub.id)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 border-border" onClick={() => handleDelete(sub.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>

                </div>
              ))}
            </div>
            {filteredSubjects.length === 0 && (
              <div className="text-center py-20 bg-secondary/20 rounded-xl border-2 border-dashed border-border">
                <Filter className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-muted-foreground font-medium">No hay materias que coincidan con los filtros.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL INSCRIPCIÓN */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground"><Users className="w-5 h-5 text-primary" /> Inscripción de Alumnos</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEnrollModalOpen(false)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[11px] font-bold text-primary uppercase">Materia ID: {selectedSubjectId}</p>
                <p className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">{selectedStudentIds.length} seleccionados</p>
              </div>

              {filteredStudentsBySemester.length === 0 && searchTerm === "" && (
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-start gap-3 text-primary">
                  <Info className="w-5 h-5 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">
                    No hay más alumnos de este semestre disponibles para inscribir.
                  </p>
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre o ID..." className="pl-9 h-9 bg-background border-border" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              {filteredStudentsBySemester.length > 0 && (
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-primary hover:bg-primary/10 h-8 gap-2" onClick={handleSelectAll}>
                  {selectedStudentIds.length === filteredStudentsBySemester.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  {selectedStudentIds.length === filteredStudentsBySemester.length ? "Desmarcar Todos" : "Seleccionar Visibles"}
                </Button>
              )}

              <div className="max-h-64 overflow-y-auto space-y-2 pr-2 border-y border-border py-2 scrollbar-thin">
                {filteredStudentsBySemester.map((s) => (
                  <div key={s.id} onClick={() => toggleStudentSelection(s.id)} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedStudentIds.includes(s.id) ? "border-primary bg-primary/10" : "hover:bg-secondary/50 border-border"}`}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedStudentIds.includes(s.id) ? "bg-primary border-primary" : "bg-background border-border"}`}>{selectedStudentIds.includes(s.id) && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}</div>
                    <div className="flex flex-col"><span className="text-sm font-bold text-foreground">{s.nombres} {s.apellidoPaterno}</span><span className="text-[9px] text-muted-foreground uppercase font-mono">ID: {s.id} | Semestre: {s.semestre}</span></div>
                  </div>
                ))}
                
                {filteredStudentsBySemester.length === 0 && searchTerm !== "" && (
                  <p className="text-center text-xs text-muted-foreground py-10">Sin resultados.</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 border-border" onClick={() => setIsEnrollModalOpen(false)}>Cerrar</Button>
                <Button className="flex-1 font-bold uppercase" disabled={isEnrolling || selectedStudentIds.length === 0} onClick={handleBulkEnroll}>
                  {isEnrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : `Inscribir (${selectedStudentIds.length})`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL PROFESOR */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <UserPlus className="w-5 h-5 text-primary" />
                Asignar Docente
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAssignModalOpen(false)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {(() => {
                const currentSubject = subjectsList.find(s => s.id === selectedSubjectId);
                const currentTeacher = currentSubject?.teacher;
                if (!currentTeacher) return null;
                return (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">Actual:</p>
                      <p className="text-sm text-foreground font-bold">{currentTeacher.name} {currentTeacher.primerApellido}</p>
                      <p className="text-[10px] font-mono text-amber-600">ID: {currentTeacher.id}</p>
                    </div>
                  </div>
                );
              })()}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                {teachers
                  .filter((t) => t.id !== subjectsList.find(s => s.id === selectedSubjectId)?.teacher?.id)
                  .map((t) => (
                    <div key={t.id} className="flex justify-between items-center p-3 border border-border rounded-lg hover:border-primary transition-colors bg-secondary/20 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{t.name} {t.primerApellido}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">ID: {t.id}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        disabled={isAssigning} 
                        onClick={() => handleAssignTeacher(t.id)}
                        className="h-8 text-xs font-bold border border-border"
                      >
                        {isAssigning ? <Loader2 className="h-3 w-3 animate-spin" /> : "Asignar"}
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}