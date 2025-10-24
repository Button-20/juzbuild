"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SortAsc,
  SortDesc,
} from "lucide-react";
import React, { useState } from "react";

export type SortDirection = "asc" | "desc";

export interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  sorting?: {
    sortBy: keyof T | null;
    sortDirection: SortDirection;
    onSort: (key: keyof T, direction: SortDirection) => void;
  };
  emptyMessage?: string;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) {
  // Local sorting state if not controlled
  const [localSortBy, setLocalSortBy] = useState<keyof T | null>(null);
  const [localSortDirection, setLocalSortDirection] =
    useState<SortDirection>("asc");

  const sortBy = sorting?.sortBy ?? localSortBy;
  const sortDirection = sorting?.sortDirection ?? localSortDirection;

  const handleSort = (key: keyof T) => {
    const newDirection: SortDirection =
      sortBy === key && sortDirection === "asc" ? "desc" : "asc";

    if (sorting?.onSort) {
      sorting.onSort(key, newDirection);
    } else {
      setLocalSortBy(key);
      setLocalSortDirection(newDirection);
    }
  };

  // Apply local sorting if not controlled
  const sortedData = React.useMemo(() => {
    if (!sortBy || sorting?.onSort) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [data, sortBy, sortDirection, sorting?.onSort]);

  const renderSortIcon = (columnKey: keyof T, sortable: boolean) => {
    if (!sortable) return null;

    if (sortBy === columnKey) {
      return sortDirection === "asc" ? (
        <SortAsc className="ml-2 h-4 w-4" />
      ) : (
        <SortDesc className="ml-2 h-4 w-4" />
      );
    }

    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  const startItem = pagination
    ? (pagination.page - 1) * pagination.pageSize + 1
    : 1;
  const endItem = pagination
    ? Math.min(pagination.page * pagination.pageSize, pagination.total)
    : sortedData.length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)} className="h-12">
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort(column.key)}
                    >
                      <span>{column.header}</span>
                      {renderSortIcon(column.key, column.sortable)}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) =>
                pagination.onPageSizeChange(Number(value))
              }
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={String(pagination.pageSize)} />
              </SelectTrigger>
              <SelectContent side="top">
                {PAGE_SIZE_OPTIONS.map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {pagination.page} of{" "}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.page === 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.pageSize)
                }
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() =>
                  pagination.onPageChange(
                    Math.ceil(pagination.total / pagination.pageSize)
                  )
                }
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.pageSize)
                }
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {pagination.total} results
          </div>
        </div>
      )}
    </div>
  );
}
