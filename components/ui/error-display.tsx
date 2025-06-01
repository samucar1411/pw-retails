import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "visor-ui";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: Error | string | unknown;
  retry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  title = "Error",
  message = "Ha ocurrido un error al cargar los datos.",
  error,
  retry,
  className = "",
}: ErrorDisplayProps) {
  // Format error message if it's an Error object or string
  const errorMessage = error
    ? typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : "Error desconocido"
    : undefined;

  return (
    <Alert variant="destructive" className={`${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{message}</p>
        {errorMessage && <p className="text-xs opacity-80">{errorMessage}</p>}
        {retry && (
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            className="mt-2 w-fit"
          >
            Reintentar
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
