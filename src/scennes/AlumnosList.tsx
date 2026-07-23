import { Columns, type Alumno } from "./partials/columns-student";
import { AlumnosTable } from "./partials/data-table-student";
import { Button } from "@/components/ui/button";
import { Users, RefreshCw } from "lucide-react";
import { getStudents } from "@/api/api";
import { useEffect, useState, useCallback } from "react";

export default function AlumnosList() {
  const [datas, setData] = useState<Alumno[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const students = await getStudents();
      setData(students);
    } catch (err: any) {
      console.error("Error al obtener alumnos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteFromState = (id: string) => {
    setData((prev) => prev.filter((student) => student.id !== id));
  };

  const columns = Columns({ 
    onDeleteSuccess: handleDeleteFromState,
    onRefreshData: fetchData 
  });

  return (
    <div className="px-8 max-w-7xl mx-auto animate-in fade-in duration-500 text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* bg-primary/10 es genial porque se adapta al color primario de tu tema actual */}
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Gestión de Alumnos
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualiza y administra los expedientes de los alumnos y sus tutores.
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={fetchData} 
          disabled={isLoading}
          className="gap-2 border-border hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar Tabla
        </Button>
      </div>

      {/* Contenedor de la tabla: bg-card permite que cambie de blanco a gris oscuro/negro automáticamente */}
      <div className="bg-card text-card-foreground rounded-xl border border-border overflow-hidden transition-colors shadow-sm">
        <AlumnosTable columns={columns} data={datas} />
      </div>
    </div>
  );
}