import { useState } from "react";

import Image from "next/image";
import { format } from "date-fns";
import { User, Smartphone, Building2, Calendar } from "lucide-react";

import { Event } from "@/types/event";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="relative w-full h-48 bg-muted">
        {event.img_file ? (
          <>
            {imageLoading && (
              <Skeleton className="absolute inset-0 bg-muted/80 animate-pulse" />
            )}
            <Image
              src={event.img_file}
              alt={event.staff_name}
              fill
              className="object-cover rounded-t-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              onLoadingComplete={() => setImageLoading(false)}
            />
          </>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No hay imagen</span>
          </div>
        )}
      </div>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{event.staff_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <span>{event.device_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{event.office_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {format(new Date(event.created_at), "PPpp")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
