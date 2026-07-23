import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { getStudentsAndTasksBySubject } from "@/api/subject-services/subject.api";
import { getReporteOficial } from "@/api/grade-services/grade.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  Loader2,
  Search,
  GraduationCap,
  FileDown,
  FileText,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "sonner";
import { BoletaOficialPDF } from "@/components/reports/BoletaReport";
import type { IReporteMateria } from "@/utilities/interface";
import { getAvailablePlanYears } from "@/api/studyPlan/studyPlan.api";

type Materia = { id: string; subject: string; group: string };

interface Student {
  id: string;
  name: string;
  enrollmentId: number;
  tasksCount: number;
  totalTasks: number;
  submittedTasks: any[];
}
interface SubjectData {
  subjectName: string;
  students: Student[];
}

interface ICurrentStudentData {
  id: string;
  name: string;
  grades: IReporteMateria[];
  semestre: string;
  divisor: number;
  periodo: string;
}

const MisAlumnos = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { teacherData } = useOutletContext<{ teacherData: any }>();
  const subjects: Materia[] = teacherData?.subject || [];

  const [data, setData] = useState<SubjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingGrades, setLoadingGrades] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [currentStudentData, setCurrentStudentData] = useState<ICurrentStudentData | null>(null);
  const [planYears, setPlanYears] = useState<string[]>([]);

  useEffect(() => {
    if (id) fetchData(id);
    else setData(null);
    setSearchTerm("");
  }, [id]);

  const fetchData = async (subjectId: string) => {
    setLoading(true);
    try {
      const result = await getStudentsAndTasksBySubject(subjectId);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setCurrentStudentData(null);
  };

  const handleSubjectChange = (newId: string) => {
    navigate(`../mis-alumnos/${newId}`);
    setCurrentStudentData(null);
  };

  useEffect(() => {
    const fetchYears = async () => {
      const years = await getAvailablePlanYears();
      setPlanYears(years);
    };
    fetchYears();
  }, []);

  const dynamicYears = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    const combined = Array.from(new Set([...planYears, currentYear]));
    return combined.sort((a, b) => b.localeCompare(a));
  }, [planYears]);

  const handlePrepareBoleta = async (studentId: string) => {
    setLoadingGrades(studentId);
    try {
      const reportData = await getReporteOficial(studentId, selectedYear);

      setCurrentStudentData({
        id: studentId,
        name: reportData.studentName,
        grades: reportData.subjects,
        semestre: reportData.semester,
        divisor: reportData.divisorPlan,
        periodo: reportData.periodo,
      });

      toast.success(`Boleta de ${reportData.periodo} sincronizada`);
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 404) {
        toast.error("El alumno no existe o no tiene inscripciones registradas.");
      } else if (status === 409 || message?.toLowerCase().includes("plan")) {
        toast.error(`No existe un Plan de Estudios configurado para el Semestre y Año ${selectedYear}.`);
      } else if (status === 500) {
        toast.error("Error interno del servidor. Por favor, contacta al administrador.");
      } else if (!error.response) {
        toast.error("Error de conexión. Verifica tu internet.");
      } else {
        toast.error("Ocurrió un error inesperado al generar la boleta.");
      }
      setCurrentStudentData(null);
    } finally {
      setLoadingGrades(null);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!data?.students) return [];
    return data.students.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <Users className="h-8 w-8 text-primary" />
            Gestión de Alumnos
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualiza estudiantes y genera sus boletas oficiales.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="w-full sm:w-32">
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {dynamicYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-72">
            <Select value={id || ""} onValueChange={handleSubjectChange}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Seleccionar materia..." />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.subject} - {s.group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" /> Cargando alumnos...
        </div>
      ) : data ? (
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
            <CardTitle className="text-xl flex items-center gap-2 text-foreground">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              Estudiantes en {data.subjectName}
            </CardTitle>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alumno..."
                className="pl-9 h-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Nombre del Alumno</TableHead>
                  <TableHead className="text-muted-foreground">Tareas Entregadas</TableHead>
                  <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    className="hover:bg-muted/50 border-border transition-colors"
                  >
                    <TableCell className="font-medium uppercase text-xs text-foreground">
                      {student.name}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {student.tasksCount} / {student.totalTasks} tareas
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {currentStudentData?.id === student.id ? (
                          <PDFDownloadLink
                            document={
                              <BoletaOficialPDF
                                studentName={currentStudentData.name}
                                subjects={currentStudentData.grades}
                                periodo={currentStudentData.periodo}
                                semestre={currentStudentData.semestre}
                                divisorPlan={currentStudentData.divisor}
                              />
                            }
                            fileName={`Boleta_${student.name}_${selectedYear}.pdf`}
                          >
                            {({ loading }) => (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white h-8 gap-2"
                              >
                                {loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <FileDown className="h-4 w-4" />
                                )}
                                Descargar PDF
                              </Button>
                            )}
                          </PDFDownloadLink>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive dark:border-destructive/40"
                            onClick={() => handlePrepareBoleta(student.id)}
                            disabled={loadingGrades === student.id}
                          >
                            {loadingGrades === student.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            Generar Boleta
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/30 border-2 border-dashed border-border rounded-xl">
          <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-2" />
          <p className="text-muted-foreground">
            Selecciona una materia para visualizar la lista.
          </p>
        </div>
      )}
    </div>
  );
};

export default MisAlumnos;