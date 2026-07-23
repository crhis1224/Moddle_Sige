import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getStudentsAndTasksBySubject } from "@/api/subject-services/subject.api";
import {
  createGrade,
  updateGrade,
  getGradeByEnrollment,
} from "@/api/grade-services/grade.api";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Calculator, RefreshCcw } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";

const MisCalificaciones = () => {
  const { id: subjectId } = useParams();
  const { id: teacherAuthId } = useAppSelector((state) => state.auth);

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<number | null>(null);

  useEffect(() => {
    if (subjectId) fetchStudents();
  }, [subjectId]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const result = await getStudentsAndTasksBySubject(subjectId!);
      const studentsWithGrades = await Promise.all(
        result.students.map(async (s: any) => {
          const gradeData = await getGradeByEnrollment(s.enrollmentId);
          return {
            ...s,
            gradeId: gradeData?.id || null,
            parcial1: gradeData ? Number(gradeData.parcial1) : 0,
            parcial2: gradeData ? Number(gradeData.parcial2) : 0,
            parcial3: gradeData ? Number(gradeData.parcial3) : 0,
            examenExtraordinario: gradeData?.examenExtraordinario ?? "",
            subjectName: result.subjectName || "Materia",
          };
        }),
      );
      setStudents(studentsWithGrades);
    } catch (e: any) {
      toast.error("Error al sincronizar con la base de datos");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const newStudents = [...students];
    const val = value === "" ? "" : parseFloat(value);
    newStudents[index][field] = val;
    setStudents(newStudents);
  };

  const calculateRow = (row: any) => {
    const p1 = Number(row.parcial1) || 0;
    const p2 = Number(row.parcial2) || 0;
    const p3 = Number(row.parcial3) || 0;
    const promParciales = (p1 + p2 + p3) / 3;

    let finalValue = promParciales;
    let status = promParciales >= 6.0 ? "APROBADO" : "EXTRAORDINARIO";
    let needsExtra = promParciales < 6.0;

    if (needsExtra && row.examenExtraordinario !== "" && row.examenExtraordinario !== null) {
      finalValue = Number(row.examenExtraordinario);
      status = finalValue >= 6.0 ? "APROBADO (EXTRA)" : "REPROBADO";
    }

    return { ordinario: promParciales.toFixed(2), final: finalValue.toFixed(2), status, needsExtra };
  };

  const handleSaveRow = async (index: number) => {
    if (!teacherAuthId) return toast.error("Sesión no válida");
    const row = students[index];
    const calc = calculateRow(row);
    setIsSaving(index);

    const cleanTeacherId = teacherAuthId.includes("-") ? teacherAuthId.split("-")[1] : teacherAuthId;
    const payload = {
      parcial1: Number(row.parcial1),
      parcial2: Number(row.parcial2),
      parcial3: Number(row.parcial3),
      examenOrdinario: Number(calc.ordinario),
      examenExtraordinario: row.examenExtraordinario === "" ? null : Number(row.examenExtraordinario),
      enrollmentId: Number(row.enrollmentId),
      teacherId: cleanTeacherId,
    };

    try {
      if (row.gradeId) {
        await updateGrade(row.gradeId, payload);
        toast.success(`Actualizado: ${row.name}`);
      } else {
        const res = await createGrade(payload);
        const updated = [...students];
        updated[index].gradeId = res.id;
        setStudents(updated);
        toast.success(`Guardado: ${row.name}`);
      }
    } catch (error: any) {
      toast.error("Error al guardar");
    } finally {
      setIsSaving(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col h-64 items-center justify-center gap-4 text-muted-foreground">
      <RefreshCcw className="h-10 w-10 animate-spin text-primary" />
      <p className="animate-pulse font-medium">Cargando calificaciones...</p>
    </div>
  );

  return (
    <Card className="shadow-md border-border overflow-hidden bg-card text-card-foreground">
      <CardHeader className="bg-muted/50 border-b border-border">
        <CardTitle className="flex items-center gap-2 font-bold text-foreground uppercase text-sm tracking-widest">
          <Calculator className="h-5 w-5 text-primary" /> Sábana de Calificaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="pl-6 font-bold text-foreground">Alumno</TableHead>
              <TableHead className="text-center font-bold text-foreground">P1</TableHead>
              <TableHead className="text-center font-bold text-foreground">P2</TableHead>
              <TableHead className="text-center font-bold text-foreground">P3</TableHead>
              <TableHead className="text-center font-bold text-primary bg-primary/5">Ord.</TableHead>
              <TableHead className="text-center font-bold text-foreground">Extra.</TableHead>
              <TableHead className="text-center font-bold text-foreground">Final</TableHead>
              <TableHead className="text-center font-bold text-foreground">Estatus</TableHead>
              <TableHead className="text-right pr-6 font-bold text-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s, idx) => {
              const calc = calculateRow(s);
              return (
                <TableRow key={s.id} className="hover:bg-muted/30 border-border border-b last:border-0 transition-colors">
                  <TableCell className="font-bold text-[10px] pl-6 uppercase text-muted-foreground">
                    {s.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <Input className="w-14 h-9 text-center mx-auto bg-background border-input" type="number" step="0.1" value={s.parcial1}
                      onChange={(e) => handleInputChange(idx, "parcial1", e.target.value)} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Input className="w-14 h-9 text-center mx-auto bg-background border-input" type="number" step="0.1" value={s.parcial2}
                      onChange={(e) => handleInputChange(idx, "parcial2", e.target.value)} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Input className="w-14 h-9 text-center mx-auto bg-background border-input" type="number" step="0.1" value={s.parcial3}
                      onChange={(e) => handleInputChange(idx, "parcial3", e.target.value)} />
                  </TableCell>
                  <TableCell className="text-center font-black text-primary bg-primary/5">
                    {calc.ordinario}
                  </TableCell>
                  <TableCell className="text-center">
                    <Input 
                      className={`w-14 h-9 text-center mx-auto transition-colors ${
                        calc.needsExtra 
                        ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400" 
                        : "bg-muted opacity-50 cursor-not-allowed"
                      }`} 
                      type="number" step="0.1" value={s.examenExtraordinario}
                      onChange={(e) => handleInputChange(idx, "examenExtraordinario", e.target.value)}
                      disabled={!calc.needsExtra} />
                  </TableCell>
                  <TableCell className="text-center font-black text-foreground">
                    {calc.final}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-sm border uppercase transition-colors ${
                      calc.status.includes("APROBADO") 
                      ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400" 
                      : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      {calc.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant={s.gradeId ? "outline" : "default"} 
                        className="h-9 w-9 p-0 rounded-full"
                        onClick={() => handleSaveRow(idx)} 
                        disabled={isSaving === idx}
                      >
                        {isSaving === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MisCalificaciones;