import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
} 