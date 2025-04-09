"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 7; // Maximum number of page buttons to show
    const sidePages = 2; // Number of pages to show on each side of current page

    if (totalPages <= maxVisiblePages) {
      // If total pages is less than max visible, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of page range around current page
      let rangeStart = Math.max(2, currentPage - sidePages);
      let rangeEnd = Math.min(totalPages - 1, currentPage + sidePages);

      // Adjust range to show more numbers if possible
      if (currentPage <= sidePages + 2) {
        rangeEnd = Math.min(totalPages - 1, maxVisiblePages - 2);
      } else if (currentPage >= totalPages - (sidePages + 1)) {
        rangeStart = Math.max(2, totalPages - (maxVisiblePages - 2));
      }

      // Add ellipsis and range start
      if (rangeStart > 2) {
        pageNumbers.push("...");
      }

      // Add page numbers in range
      for (let i = rangeStart; i <= rangeEnd; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis and last page
      if (rangeEnd < totalPages - 1) {
        pageNumbers.push("...");
      }
      if (rangeEnd < totalPages) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center space-x-2", className)}
    >
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <span className="sr-only">Previous page</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((pageNumber, index) =>
          pageNumber === "..." ? (
            <div
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
            >
              &#8230;
            </div>
          ) : (
            <Button
              key={pageNumber}
              variant={currentPage === pageNumber ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-8 w-8",
                currentPage === pageNumber &&
                  "bg-primary text-primary-foreground"
              )}
              onClick={() => onPageChange(pageNumber as number)}
              disabled={currentPage === pageNumber}
            >
              <span className="sr-only">Page {pageNumber}</span>
              <span>{pageNumber}</span>
            </Button>
          )
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="sr-only">Next page</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
