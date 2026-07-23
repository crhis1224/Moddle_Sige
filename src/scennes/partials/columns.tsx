import { type ColumnDef } from "@tanstack/react-table";
import type { FlattenedTableRow } from "./data";
import { Button } from "@/components/ui/button";
import { FileSearch, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const columns: ColumnDef<FlattenedTableRow>[] = [
  {
    accessorKey: "studentName",
    header: "Nombre del Alumno",
  },
  {
    accessorKey: "taskTitle",
    header: "Título de la Tarea",
  },
  {
    accessorKey: "taskStatus",
    header: "Estatus de Entrega",
    cell: ({ row }) => {
      const status = row.getValue("taskStatus") as string;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            status === "ENTREGADO"
              ? "bg-green-500/15 text-green-600 dark:text-green-400"
              : status === "PENDIENTE"
              ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Archivos",
    cell: ({ row }) => {
      const task = row.original;
      
      if (task.taskId === "N/A")
        return (
          <span className="text-muted-foreground text-sm">No disponible</span>
        );

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FileSearch className="h-4 w-4" />
              Ver archivos
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-background border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Archivos de Entrega</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {task.studentName} - {task.taskTitle}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2 py-4">
              {task.files.length > 0 ? (
                task.files.map((file) =>{

                  const fileNameForDownload = file.url.split('/').pop();
                  return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 border border-border rounded bg-card/50"
                  >
                    <span className="text-sm truncate max-w-[200px] text-foreground">
                      {file.name}
                    </span>
                    <Button size="sm" variant="ghost" asChild className="hover:bg-accent text-muted-foreground hover:text-foreground">
                      <a href={`${import.meta.env.VITE_API_DOC_ADRESS}/${fileNameForDownload}`} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )})
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  No hay archivos adjuntos.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
];