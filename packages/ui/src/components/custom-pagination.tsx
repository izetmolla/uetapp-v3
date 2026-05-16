import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { usePagination } from "@workspace/ui/hooks/use-pagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink
} from "@workspace/ui/components/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@workspace/ui/components/select";

import { useSearchParams } from "react-router";
import { useCallback } from "react";

type PaginationProps = {
  currentPage?: number;
  totalPages?: number;
  paginationItemsToDisplay?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (value: string) => void;
};


function CustomPagination({
  currentPage,
  totalPages=1,
  paginationItemsToDisplay = 5,
  onPageChange,
  onLimitChange
}: PaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: currentPage ?? Number(searchParams.get("page")) ?? 1,
    paginationItemsToDisplay,
    totalPages: totalPages ?? Number(searchParams.get("totalPages")) ?? 10
  });



  const mergeSearchParams = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        mutate(next);
        return next;
      });
    },
    [setSearchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      mergeSearchParams((next) => {
        next.set("page", String(page));
      });
      onPageChange?.(page);
    },
    [mergeSearchParams, onPageChange]
  );

  const handleLimitChange = useCallback(
    (value: string) => {
      const limit = value || "10";
      mergeSearchParams((next) => {
        next.set("limit", limit);
        next.set("page", "1");
      });
      onLimitChange?.(limit);
    },
    [mergeSearchParams, onLimitChange]
  );

  return (
    <div className="flex items-center w-full justify-between gap-3">
      {/* Page number information */}
      <p aria-live="polite" className="text-muted-foreground flex-1 text-sm whitespace-nowrap">
        Page <span className="text-foreground">{currentPage}</span> of{" "}
        <span className="text-foreground">{totalPages}</span>
      </p>

      {/* Pagination */}
      <div className="grow">
        <Pagination>
          <PaginationContent>
            {/* Previous page button */}
            <PaginationItem>
              <PaginationLink
                aria-disabled={(currentPage ?? 1) === 1 ? true : undefined}
                aria-label="Go to previous page"
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={() => handlePageChange((currentPage ?? 1) - 1)}
                role={(currentPage ?? 1) === 1 ? "link" : undefined}>
                <ChevronLeftIcon aria-hidden="true" size={16} />
              </PaginationLink>
            </PaginationItem>

            {/* Left ellipsis (...) */}
            {showLeftEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Page number links */}
            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink onClick={() => handlePageChange(page)} isActive={page === currentPage}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* Right ellipsis (...) */}
            {showRightEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Next page button */}
            <PaginationItem>
              <PaginationLink
                aria-disabled={(currentPage ?? 1) === totalPages ? true : undefined}
                aria-label="Go to next page"
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={() => handlePageChange((currentPage ?? 1) + 1)}
                role={(currentPage ?? 1) === totalPages ? "link" : undefined}>
                <ChevronRightIcon aria-hidden="true" size={16} />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Results per page */}
      <div className="flex flex-1 justify-end">
        <Select aria-label="Results per page" defaultValue="10" onValueChange={(value) => handleLimitChange(value)}>
          <SelectTrigger className="w-fit whitespace-nowrap" id="results-per-page">
            <SelectValue placeholder="Select number of results" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / page</SelectItem>
            <SelectItem value="20">20 / page</SelectItem>
            <SelectItem value="50">50 / page</SelectItem>
            <SelectItem value="100">100 / page</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}


export default CustomPagination;