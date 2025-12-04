"use client";

import { Alert, AlertDescription, AlertTitle } from "./alert";
import { AlertCircle, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
  variant?: "default" | "destructive";
}

export function ErrorAlert({
  title = "Erro",
  message,
  onDismiss,
  className,
  variant = "destructive",
}: ErrorAlertProps) {
  return (
    <Alert variant={variant} className={cn("relative", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={onDismiss}
          aria-label="Fechar alerta"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}

