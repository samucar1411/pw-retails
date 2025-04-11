"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-[100vh] flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="rounded-full bg-muted p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-xl font-semibold">Página no encontrada</h2>
        <p className="text-muted-foreground">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
      </div>
      <div className="flex gap-2">
        <Link href="/dashboard">
          <Button variant="default">Volver al inicio</Button>
        </Link>
        <Button variant="outline" onClick={() => window.history.back()}>
          Volver atrás
        </Button>
      </div>
    </div>
  );
}
