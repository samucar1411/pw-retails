'use client';

import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface IdCellProps {
  id: string;
  basePath: 'incidentes' | 'sospechosos';
}

export function IdCell({ id, basePath }: IdCellProps) {
  const [copied, setCopied] = useState(false);
  const shortId = id.slice(-8).toUpperCase();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("ID copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground group">
      <Link
        href={`/dashboard/${basePath}/${id}`}
        className="font-mono text-xs hover:text-primary transition-colors"
      >
        {shortId}
      </Link>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
} 