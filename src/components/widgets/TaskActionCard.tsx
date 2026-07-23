// components/TaskActionCard.tsx
import { Edit, Trash2, CheckCircle, Clock, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "../ui/checkbox";
import { useState, useEffect } from "react";
import { intervalToDuration, isBefore, parseISO } from "date-fns";

interface TaskActionCardProps {
  id: string;
  title: string;
  description: string;
  status: "Abierto" | "Cerrado";
  dueDate?: string; 
  onStatusChange?: (taskId: string, newStatus: "Abierto" | "Cerrado") => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onAssign?: (taskId: string) => void;
}

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const target = parseISO(targetDate);
      
      if (isBefore(target, now)) {
        setIsExpired(true);
        setTimeLeft("Plazo vencido");
        return;
      }

      const duration = intervalToDuration({ start: now, end: target });
      const format = (n?: number) => n?.toString().padStart(2, '0') || "00";
      
      setTimeLeft(
        `${duration.days ? duration.days + 'd ' : ''}${format(duration.hours)}h:${format(duration.minutes)}m:${format(duration.seconds)}s`
      );
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={`flex items-center gap-1 text-[10px] mt-2 font-mono ${isExpired ? "text-destructive font-bold" : "text-primary"}`}>
      <Clock className="h-3 w-3" />
      <span>{isExpired ? "" : "Cierra en: "}{timeLeft}</span>
    </div>
  );
};

export function TaskActionCard({
  id,
  title,
  description,
  status,
  dueDate,
  onStatusChange,
  onEdit,
  onDelete,
  onAssign,
}: TaskActionCardProps) {
  
  const isClosed = status === "Cerrado";

  const statusConfig = isClosed
    ? {
        icon: CheckCircle,
        color: "text-green-500",
        borderColor: "border-green-500/50",
      }
    : {
        icon: Clock,
        color: "text-yellow-500",
        borderColor: "border-yellow-500/50",
      };

  const IconComponent = statusConfig.icon;

  const handleAction = (callback: ((id: string) => void) | undefined) => {
    return () => {
      if (callback) {
        callback(id);
      }
    };
  };

  const handleStatusChange = (checked: boolean) => {
    if (onStatusChange) {
      const newStatus = checked ? "Cerrado" : "Abierto";
      onStatusChange(id, newStatus);
    }
  };

  const hasActions = onEdit || onDelete || onAssign;

  return (
    <Card
      className={`w-full max-w-lg shadow-md m-2 border-l-8 transition-all hover:shadow-lg bg-card text-card-foreground
      ${statusConfig.borderColor}`}
    >
      <CardContent className="flex items-center justify-between p-4 space-x-4">
        <div className="flex items-start space-x-3 flex-grow min-w-0">
          <div className="flex flex-col items-center space-y-2 pt-1 flex-shrink-0">
            <Checkbox
              id={`task-${id}`}
              checked={isClosed}
              onCheckedChange={handleStatusChange}
              disabled={!onStatusChange}
              className="mt-1"
            />
            <IconComponent className={`h-5 w-5 ${statusConfig.color}`} />
          </div>

          <div className="flex flex-col min-w-0 flex-grow">
            <h4 className="font-semibold text-base leading-snug truncate text-foreground">
              {title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 italic">
              {description}
            </p>
            
            {/* LÓGICA DE FECHA DENTRO DEL CARD */}
            {!isClosed ? (
              dueDate ? (
                <Countdown targetDate={dueDate} />
              ) : (
                <p className="text-[10px] text-muted-foreground/60 italic mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Sin fecha de vencimiento
                </p>
              )
            ) : null}

            <p className="text-[10px] mt-2 text-muted-foreground font-medium">
              Estado: <span className={isClosed ? "text-green-500" : "text-yellow-500"}>{status}</span>
            </p>
          </div>
        </div>

        {hasActions && (
          <div className="flex space-x-2 flex-shrink-0 ml-4">
            {onEdit && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleAction(onEdit)}
                className="text-blue-500 hover:bg-blue-500/10 border-blue-500/50 h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {onDelete && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleAction(onDelete)}
                className="text-destructive hover:bg-destructive/10 border-destructive/50 h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            {onAssign && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleAction(onAssign)}
                className="text-amber-500 hover:bg-amber-500/10 border-amber-500/50 h-8 w-8"
              >
                <FilePlus className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}