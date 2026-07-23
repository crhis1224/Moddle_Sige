import { useState, useEffect, useMemo } from 'react';
import { Trash2, Save, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { registerStudyPlan } from '@/api/studyPlan/studyPlan.api';
import { getAllSubjects } from '@/api/subject-services/subject.api';

export interface StudyPlanData {
  semester: string;
  year: string;
  officialSubjects: string[];
  totalRequired: number;
}

interface SubjectFromDB {
  id: string;
  subject: string;
  semester: string;
  group: string;
  effectiveDate: string; 
}

const CreateStudyPlan = () => {
  const [semester, setSemester] = useState<string>(''); 
  const [year] = useState(new Date().getFullYear().toString()); 
  const [allSubjects, setAllSubjects] = useState<SubjectFromDB[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expectedTotal, setExpectedTotal] = useState<string>("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getAllSubjects();
        setAllSubjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando materias:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const filteredSubjects = useMemo(() => {
    if (!semester) return [];
    return allSubjects.filter(sub => 
      sub.semester === semester && 
      sub.effectiveDate === year
    );
  }, [semester, year, allSubjects]);

  useEffect(() => {
    setSelectedSubject("");
  }, [semester]);

  const addSubject = () => {
    if (expectedTotal && subjectsList.length >= Number(expectedTotal)) return;
    if (selectedSubject && !subjectsList.includes(selectedSubject)) {
      setSubjectsList([...subjectsList, selectedSubject]);
      setSelectedSubject(""); 
    }
  };

  const removeSubject = (index: number) => {
    setSubjectsList(subjectsList.filter((_, i) => i !== index));
  };

  const isComplete = expectedTotal !== "" && subjectsList.length === Number(expectedTotal);

  const handleSubmit = async () => {
    if (!isComplete) return;
    const data: StudyPlanData = {
      semester,
      year,
      officialSubjects: subjectsList,
      totalRequired: subjectsList.length
    };

    try {
      await registerStudyPlan(data);
      alert("Plan de estudios guardado con éxito");
      setSubjectsList([]);
      setSemester('');
      setExpectedTotal("");
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground animate-pulse bg-background">
        Cargando configuración...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 transition-colors duration-300">
      <Card className="shadow-sm border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Configurar Plan de Estudios
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Año Escolar Activo: {year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Semestre:</Label>
              <Select onValueChange={setSemester} value={semester}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5", "6"].map((num) => (
                    <SelectItem key={num} value={num}>Semestre {num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Materias a registrar:</Label>
              <Select onValueChange={setExpectedTotal} value={expectedTotal}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Cantidad (1-10)" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>{num} Materias</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <hr className="border-border opacity-50" />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Materias del Semestre
                </h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full transition-all ${
                  isComplete 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'bg-muted text-muted-foreground border border-border'
                }`}>
                    {subjectsList.length} / {expectedTotal || "0"}
                </span>
            </div>

            <div className="flex gap-2">
              <Select 
                onValueChange={setSelectedSubject} 
                value={selectedSubject}
                disabled={!semester || !expectedTotal || isComplete}
              >
                <SelectTrigger className="flex-1 bg-background border-border text-foreground">
                  <SelectValue placeholder={
                    !semester ? "Elija semestre..." : 
                    !expectedTotal ? "Defina cantidad..." :
                    isComplete ? "Cupo alcanzado" : "Seleccionar materia..."
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map((sub) => (
                    <SelectItem key={sub.id} value={sub.subject}>
                      {sub.subject} - {sub.group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={addSubject} 
                type="button" 
                variant="secondary" 
                className="uppercase text-xs font-bold tracking-wide px-4 h-10 transition-colors"
                disabled={!selectedSubject || isComplete}
              >
                Agregar
              </Button>
            </div>

            {/* LISTA DE MATERIAS SELECCIONADAS */}
            <div className="border border-border rounded-lg bg-background/50 overflow-hidden transition-colors">
              {subjectsList.length === 0 && (
                <p className="p-8 text-sm text-muted-foreground text-center italic">Lista vacía</p>
              )}
              {subjectsList.map((sub, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-card border-b last:border-0 border-border transition-colors hover:bg-accent/50"
                >
                  <span className="text-sm text-foreground font-medium tracking-tight">
                    {sub}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeSubject(index)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-4">
            {expectedTotal && !isComplete && (
                <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-bold transition-colors">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Faltan {Number(expectedTotal) - subjectsList.length} materias para completar el plan</span>
                </div>
            )}
            
            <Button 
              onClick={handleSubmit} 
              disabled={!isComplete || !semester}
              className={`w-full h-11 uppercase text-xs font-bold tracking-widest transition-all shadow-md ${
                isComplete 
                ? "bg-primary text-primary-foreground hover:opacity-90" 
                : "bg-muted text-muted-foreground border border-border cursor-not-allowed"
              }`}
            >
              <Save className="h-4 w-4 mr-2" /> 
              Guardar plan de estudios
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default CreateStudyPlan;