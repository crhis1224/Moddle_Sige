import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminScheduleForm } from "./AdminScheduleForm"; 
import { ScheduleManagementTable } from "./ScheduleManagementTable"; 
import { useAppDispatch } from "@/redux/hooks";
import { fetchAllSchedulesThunk } from "@/redux/ScheduleSlice";

export const SchedulePage = () => {
  const dispatch = useAppDispatch();

  const handleRefresh = () => {
    dispatch(fetchAllSchedulesThunk());
  };

  return (
    // Reducido py-6 a py-2 para ganar espacio arriba
    <div className="container mx-auto py-2 space-y-4">
      
      {/* Cabecera mucho más pequeña y compacta */}
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Gestión de Horarios</h1>
          <p className="text-xs text-muted-foreground">Administración global de clases.</p>
        </div>
      </div>

      {/* Tabs con menos margen superior */}
      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="bg-muted p-1 h-9"> {/* h-9 para hacerlo más delgado */}
          <TabsTrigger value="manage" className="text-xs">Gestión</TabsTrigger>
          <TabsTrigger value="create" className="text-xs">Nuevo Registro</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="mt-2">
          <ScheduleManagementTable />
        </TabsContent>

        <TabsContent value="create" className="mt-2">
          <AdminScheduleForm onSuccess={handleRefresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
};