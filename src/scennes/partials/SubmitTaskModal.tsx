import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  X,
  FileIcon,
  Paperclip,
  Trash2,
  ExternalLink,
  CloudUpload,
} from "lucide-react";

import {
  deleteFileFromSubmission,
  submitTaskDelivery,
} from "@/api/subject-services/subject.api";
import { fileUpdate, removeFileExternal } from "@/api/api";
import { toast } from "sonner";
import * as z from "zod";

const submissionSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
});

interface SubmitTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskData: {
    id: string;
    title: string;
    subjectId: string;
    isSubmission: boolean;
    files?: { id: number; name: string; url: string }[];
  };
  studentId: string;
  onSuccess: () => void;
}

export const SubmitTaskModal = ({
  isOpen,
  onClose,
  taskData,
  studentId,
  onSuccess,
}: SubmitTaskModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<
    { id: number; name: string; url: string }[]
  >([]);

  const form = useForm({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      setExistingFiles(taskData.files || []);
      setSelectedFiles([]); 
      form.reset({
        title: taskData.isSubmission
          ? taskData.title
          : `ENTREGA: ${taskData.title}`,
        description: "",
      });
    } else {
      setSelectedFiles([]);
      setExistingFiles([]);
    }
  }, [taskData, isOpen, form]);

  const handleDeleteExistingFile = async (fileId: number, fileUrl: string) => {
    if (!confirm("¿Estás seguro de eliminar este archivo?")) return;
    try {
      setIsDeleting(fileId);
      const res = await removeFileExternal(fileUrl);
      if (res.statuscode === 200) {
        await deleteFileFromSubmission(fileId);
        setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
        toast.success("Archivo eliminado");
        onSuccess();
      }
    } catch (error) {
      toast.error("Error al eliminar el archivo");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    e.target.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      let newFilesData = [];
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("files", file));
        const uploadResponse = await fileUpdate(formData);

        if (uploadResponse.statuscode !== 201 || !uploadResponse.files) {
          throw new Error("Error al subir archivos al servidor");
        }

        newFilesData = uploadResponse.files.map((f: any) => ({
          url: f.url,
          name: f.originalName || f.filename,
        }));
      }

      const payload: any = {
        title: values.title,
        description: values.description || "",
        files: newFilesData,
      };

      if (taskData.isSubmission) {
        payload.submissionId = taskData.id;
      } else {
        payload.taskId = taskData.id;
      }

      await submitTaskDelivery(studentId, payload);

      toast.success(
        taskData.isSubmission ? "Entrega actualizada" : "Tarea enviada",
      );

      setSelectedFiles([]);
      setExistingFiles([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error en el proceso");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto border-border bg-background shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CloudUpload className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              {taskData.isSubmission ? "Gestionar Entrega" : "Entregar Tarea"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Tarea:{" "}
            <span className="font-semibold text-foreground">
              {taskData.title}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {existingFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Archivos Entregados ({existingFiles.length})
              </h4>
              <div className="grid gap-2">
                {existingFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border group transition-all hover:border-primary/30 hover:bg-muted/50"
                  >
                    <div className="bg-background p-2 rounded-lg border border-border shadow-sm text-primary">
                      <FileIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-grow overflow-hidden text-sm font-semibold text-foreground">
                      <p className="truncate">{file.name}</p>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> Ver original
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting === file.id}
                      onClick={() =>
                        handleDeleteExistingFile(file.id, file.url)
                      }
                      className="hover:text-destructive hover:bg-destructive/10"
                    >
                      {isDeleting === file.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Subir nuevos archivos
                </h4>
                <div className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center bg-muted/20 hover:border-primary/50 relative group cursor-pointer transition-colors">
                  <input
                    type="file"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelection}
                    disabled={isSubmitting}
                  />
                  <div className="bg-background p-3 rounded-full shadow-md group-hover:scale-110 transition-transform border border-border">
                    <Paperclip className="h-6 w-6 text-primary" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-muted-foreground">
                    Click o arrastra para seleccionar
                  </p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-background p-2.5 rounded-xl border border-border shadow-sm"
                      >
                        <FileIcon className="h-4 w-4 text-primary/70" />
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {file.name}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSelectedFile(index)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Nota para el docente..."
                        className="bg-muted/30 border-border h-11 text-foreground placeholder:text-muted-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="sm:justify-between gap-3 pt-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={onClose}
                  className="flex-1 text-muted-foreground"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-[2]"
                  disabled={
                    (selectedFiles.length === 0 &&
                      existingFiles.length === 0) ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : taskData.isSubmission ? (
                    "Actualizar Entrega"
                  ) : (
                    "Finalizar Entrega"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};