import React, { useState, useCallback, type DragEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Upload, XCircle, File as FileIcon } from "lucide-react";
import { fileDropZone } from "@/api/api";

// Lista actualizada: Microsoft Office + PDF
const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
];

interface taskIdSub {
  taskId: string;
  open: (on: boolean) => void;
}

interface FileWithId {
  file: File;
  tempId: string;
}

export function FileDropZone({ taskId, open }: taskIdSub) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const generateTempId = () => Math.random().toString(36).substring(2, 9);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(event.dataTransfer.files);
    const validFiles: FileWithId[] = droppedFiles
      .filter((file) => ALLOWED_MIMES.includes(file.type))
      .map((file) => ({ file: file, tempId: generateTempId() }));

    if (validFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    } else if (droppedFiles.length > 0) {
      alert("Solo se permiten PDFs y documentos de Microsoft Office.");
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
    const validFiles: FileWithId[] = selectedFiles
      .filter((file) => ALLOWED_MIMES.includes(file.type))
      .map((file) => ({ file: file, tempId: generateTempId() }));

    if (validFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    }
    event.target.value = "";
  };

  const removeFile = (tempId: string) => {
    setFiles(files.filter((f) => f.tempId !== tempId));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    files.forEach((item) => {
      formData.append("files", item.file, item.file.name);
    });

    try {
      // Llamada a tu API para subir materiales de apoyo
      await fileDropZone(formData, taskId);
      
      setFiles([]); 
      // Cerramos el modal inmediatamente tras el éxito
      open(false);
      // Opcional: Podrías disparar un mensaje de éxito global aquí
    } catch (error) {
      alert("Ocurrió un error al subir los materiales.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full max-w-lg p-4 space-y-4 bg-background text-foreground">
      <div
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg min-h-[150px] transition-colors 
          ${isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/30 hover:border-primary/50 bg-muted/5"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length === 0 ? (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-center text-foreground">
              <strong>Arrastra y suelta</strong> materiales de apoyo aquí
            </p>
            <p className="text-xs text-muted-foreground mb-4 text-center">
              (PDF, Word, Excel, PowerPoint)
            </p>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                multiple
                accept={ALLOWED_MIMES.join(",")}
              />
              <span className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Seleccionar Materiales
              </span>
            </label>
          </>
        ) : (
          <div className="w-full p-2">
            <h3 className="text-sm font-semibold mb-3 text-foreground">
              Archivos seleccionados ({files.length}):
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20">
              {files.map((item) => (
                <div
                  key={item.tempId}
                  className="flex items-center justify-between p-2 border border-border rounded-md bg-card shadow-sm"
                >
                  <div className="flex items-center min-w-0">
                    {item.file.type === "application/pdf" ? (
                      <FileIcon className="h-4 w-4 mr-2 text-destructive flex-shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate max-w-[200px] text-foreground">
                      {item.file.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(item.tempId);
                    }}
                    className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                    disabled={isUploading}
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <label
                htmlFor="file-upload-more"
                className="cursor-pointer text-xs text-primary hover:underline font-medium"
              >
                + Añadir más materiales
              </label>
              <Input
                id="file-upload-more"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                multiple
                accept={ALLOWED_MIMES.join(",")}
              />
            </div>
          </div>
        )}
      </div>

      <Button
        disabled={files.length === 0 || isUploading}
        onClick={handleSubmit}
        className="w-full h-11"
      >
        {isUploading ? "Subiendo materiales..." : `Guardar Materiales (${files.length})`}
      </Button>
    </div>
  );
}