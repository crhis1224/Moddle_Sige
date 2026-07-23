import { useEffect, useState } from "react";
import { columns } from "./partials/columns";
import { DataTable } from "./partials/data-table";
import { useAppSelector } from "@/redux/hooks";
import { getStudentsAndTasksBySubject } from "@/api/subject-services/subject.api";
 // Asume la ruta correcta
import { getFlattenedData, type FlattenedTableRow } from "./partials/data";
import { useParams } from "react-router-dom";


const Table = () => {

  const [flattenedData, setFlattenedData] = useState<FlattenedTableRow[]>([]); 
const { id: routeId } = useParams();
const currentIdFromRedux = useAppSelector((state) => state.idState.currentId); 
  
  const activeId = routeId || currentIdFromRedux;
  useEffect(() => {
    const fetchSubjectData = async () => {
      if (!activeId) return;
      try {
        const response = await getStudentsAndTasksBySubject(activeId);
        
        const studentsFromApi = response.students || [];
        const transformedData = getFlattenedData(studentsFromApi);
        setFlattenedData(transformedData);

      } catch (err: any) {
        console.error("Error al cargar datos del profesor:", err);
      }
    };
    
    fetchSubjectData();
  }, [activeId]);

  return (
    <div className="container mx-auto pt-4 bg-background text-foreground min-h-full">
      <DataTable columns={columns} data={flattenedData} />
    </div>
  );
};

export default Table;