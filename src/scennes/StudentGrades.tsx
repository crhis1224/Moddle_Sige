import { useState, useEffect } from "react";
import { getReporteOficial } from "@/api/grade-services/grade.api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, RefreshCcw, User } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import type { IReporteMateria, IReporteOficialResponse } from "@/utilities/interface";

const StudentGrades = () => {
  // Obtenemos el ID del alumno desde el estado de Redux
  const { id: studentAuthId } = useAppSelector((state) => state.auth);

  const [reportData, setReportData] = useState<IReporteOficialResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studentAuthId) fetchReporte();
  }, [studentAuthId]);

  const fetchReporte = async () => {
    if (!studentAuthId) return;

    // Limpieza profesional
    const cleanId = studentAuthId.replace(/^USR-/, "");
    setLoading(true);
    try {
      const data = await getReporteOficial(cleanId);
      setReportData(data);
    } catch (e: any) {
      toast.error("Error al obtener tu reporte de calificaciones");
    } finally {
      setLoading(false);
    }
  };

  const calculateRow = (materia: IReporteMateria) => {
  // Verificamos si faltan calificaciones (si son null)
  const isPending = materia.parcial1 === null || materia.parcial2 === null || materia.parcial3 === null;
  
  const p1 = materia.parcial1 ?? 0;
  const p2 = materia.parcial2 ?? 0;
  const p3 = materia.parcial3 ?? 0;
  
  const promParciales = (p1 + p2 + p3) / 3;

  let finalValue = promParciales;
  let status = "";
  let needsExtra = false;

  // LÓGICA DE ESTATUS MEJORADA
  if (isPending) {
    status = "EN CURSO";
  } else {
    // Solo si ya están todos los parciales evaluamos aprobación
    if (promParciales >= 6.0) {
      status = "APROBADO";
    } else {
      status = "EXTRAORDINARIO";
      needsExtra = true;
    }
  }

  // Si requiere extra y ya hay una nota capturada en el examen extraordinario
  if (needsExtra && materia.examenExtraordinario !== null) {
    finalValue = materia.examenExtraordinario;
    status = finalValue >= 6.0 ? "APROBADO (EXTRA)" : "REPROBADO";
  }

  return { 
    ordinario: isPending && promParciales === 0 ? "--" : promParciales.toFixed(2), 
    final: isPending && finalValue === 0 ? "--" : finalValue.toFixed(2), 
    status, 
    needsExtra 
  };
};

  if (loading) return (
    <div className="flex flex-col h-64 items-center justify-center gap-4 text-muted-foreground">
      <RefreshCcw className="h-10 w-10 animate-spin text-primary" />
      <p className="animate-pulse font-medium">Cargando sábana de calificaciones...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-muted/50 border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <User className="text-primary h-5 w-5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Estudiante</p>
                <p className="font-bold text-foreground">{reportData?.studentName || "---"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50 border-none shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Periodo</p>
            <p className="font-bold text-foreground">{reportData?.periodo || "---"}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/50 border-none shadow-sm">
          <CardContent className="pt-6 text-right">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Semestre</p>
            <p className="font-bold text-foreground">{reportData?.semester || "---"}° Semestre</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-border overflow-hidden bg-card text-card-foreground">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="flex items-center gap-2 font-bold text-foreground uppercase text-sm tracking-widest">
            <Calculator className="h-5 w-5 text-primary" /> Sábana de Calificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="pl-6 font-bold text-foreground">Materia</TableHead>
                <TableHead className="text-center font-bold text-foreground">P1</TableHead>
                <TableHead className="text-center font-bold text-foreground">P2</TableHead>
                <TableHead className="text-center font-bold text-foreground">P3</TableHead>
                <TableHead className="text-center font-bold text-primary bg-primary/5">Ord.</TableHead>
                <TableHead className="text-center font-bold text-orange-600 dark:text-orange-400">Extra.</TableHead>
                <TableHead className="text-center font-bold text-foreground">Final</TableHead>
                <TableHead className="text-center font-bold text-foreground">Estatus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData?.subjects.map((materia, idx) => {
                const calc = calculateRow(materia);
                return (
                  <TableRow key={idx} className="hover:bg-muted/30 border-border border-b last:border-0 transition-colors">
                    <TableCell className="font-bold text-[10px] pl-6 uppercase text-muted-foreground">
                      {materia.subjectName}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground font-medium">
                      {materia.parcial1 ?? "--"}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground font-medium">
                      {materia.parcial2 ?? "--"}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground font-medium">
                      {materia.parcial3 ?? "--"}
                    </TableCell>
                    <TableCell className="text-center font-black text-primary bg-primary/5">
                      {calc.ordinario}
                    </TableCell>
                    <TableCell className={`text-center font-bold ${calc.needsExtra ? "text-orange-600 dark:text-orange-400 bg-orange-500/5" : "text-muted/50"}`}>
                      {materia.examenExtraordinario ?? "--"}
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentGrades;