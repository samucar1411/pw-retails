"use client";

import { useState } from "react";

import Image from "next/image";
import { X } from "lucide-react";
import { format } from "date-fns";
import { type ColumnDef } from "@tanstack/react-table";

import { Event } from "@/types/event";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "visor-ui";

console.log("Component render start");

const ImageCell = ({ src, alt }: { src: string | null; alt: string }) => {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div className="w-fit bg-muted rounded-lg overflow-hidden">
      {src ? (
        <>
          {imageLoading && (
            <Skeleton className="absolute inset-0 bg-muted/80 animate-pulse" />
          )}
          <Image
            src={src}
            alt={alt}
            width={80}
            height={45}
            className="object-cover"
            sizes="80px"
            onLoadingComplete={() => setImageLoading(false)}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">No hay imagen</span>
        </div>
      )}
    </div>
  );
};

export const EventModal = ({
  event,
  isOpen,
  onClose,
}: {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [imageLoading, setImageLoading] = useState(true);

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
        <div className="relative w-full h-[450px] bg-muted">
          {event.img_file ? (
            <>
              {imageLoading && (
                <Skeleton className="absolute inset-0 bg-muted/80 animate-pulse" />
              )}
              <Image
                src={event.img_file}
                alt={event.staff_name}
                fill
                className="object-cover"
                sizes="(max-width: 800px) 100vw, 800px"
                priority
                onLoadingComplete={() => setImageLoading(false)}
                style={{ objectFit: "cover" }}
              />
            </>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No hay imagen</span>
            </div>
          )}
        </div>
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalles del Evento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-4 items-center gap-4 text-lg">
              <span className="font-medium">Personal:</span>
              <span className="col-span-3">{event.staff_name}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 text-lg">
              <span className="font-medium">Dispositivo:</span>
              <span className="col-span-3">{event.device_name}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 text-lg">
              <span className="font-medium">Oficina:</span>
              <span className="col-span-3">{event.office_name}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 text-lg">
              <span className="font-medium">Fecha:</span>
              <span className="col-span-3">
                {format(new Date(event.created_at), "PPpp")}
              </span>
            </div>
          </div>
          <DialogClose asChild>
            <Button
              onClick={onClose}
              variant="default"
              size="icon"
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 border border-white/20"
            >
              <X className="h-5 w-5 text-white" />
            </Button>
          </DialogClose>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button>Descargar Imagen</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

type Column = ColumnDef<Event>;

export const columns: Column[] = [
  {
    id: "image",
    header: () => <div className="text-center">Imagen</div>,
    cell: ({ row }) => (
      <ImageCell src={row.original.img_file} alt={row.original.staff_name} />
    ),
  },
  {
    id: "staff_name",
    header: () => <div>Personal</div>,
    cell: ({ row }) => (
      <div className="font-medium">{row.original.staff_name}</div>
    ),
  },
  {
    id: "device_name",
    header: () => <div>Dispositivo</div>,
    cell: ({ row }) => <div>{row.original.device_name}</div>,
  },
  {
    id: "office_name",
    header: () => <div>Oficina</div>,
    cell: ({ row }) => <div>{row.original.office_name}</div>,
  },
  {
    id: "created_at",
    header: () => <div>Fecha</div>,
    cell: ({ row }) => (
      <div>{format(new Date(row.original.created_at), "PPpp")}</div>
    ),
  },
];
