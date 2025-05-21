'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { debounce } from 'lodash';
import { useSuspects } from '@/context/suspect-context';

export default function SuspectsPage() {
  const {
    suspects,
    loading: isLoading,
    error: isError,
    pagination,
    fetchSuspects,
    setPagination,
    setSearchTerm
  } = useSuspects();

  useEffect(() => {
    console.log('[SuspectsPage] useEffect triggered. Context pagination.pageIndex:', pagination.pageIndex, 'pageSize:', pagination.pageSize);
    fetchSuspects({
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      
    });
  }, [fetchSuspects, pagination.pageIndex, pagination.pageSize]);

  // Create a stable reference to the debounced search function
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value); // Update search term in context
      // Reset to first page in context. The main useEffect will trigger the data fetch.
      setPagination({
        pageIndex: 0,
      });
    }, 500),
    [setSearchTerm, setPagination] // Stable dependencies from context
  );

  // Handle search input change (this will be passed to DataTable's onSearch)
  const handleSearch = useCallback((value: string) => {
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Handle pagination change
  const handlePaginationChange = useCallback((newPagingInfo: { pageIndex: number; pageSize: number }) => {
    console.log('[SuspectsPage] handlePaginationChange received:', newPagingInfo);
    // Update the context's pagination state.
    // The main useEffect will trigger the data fetch.
    setPagination({
      pageIndex: newPagingInfo.pageIndex,
      pageSize: newPagingInfo.pageSize,
    });
  }, [setPagination]);

  // Handle sorting change
  const handleSortingChange = useCallback((newSorting: { id: string; desc: boolean }[]) => {
    // Update sorting in the context if needed
    // For now, just log the sorting change
    console.log('Sorting changed:', newSorting);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Suspect Management</h1>
        <Button asChild>
          <Link href="/dashboard/suspects/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Suspect
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={suspects}
        pageCount={pagination.totalPages}
        pagination={{
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        }}
        onPaginationChange={handlePaginationChange}
        sorting={[]}
        onSortingChange={handleSortingChange}
        searchKey="id" // Assuming 'id' or another relevant key for search
        onSearch={handleSearch} // Pass the new handleSearch
        loading={isLoading}
        onAdd={() => {}}
      />

      {isError && (
        <div className="text-red-500 mt-4">
          Error loading suspects. Please try again later.
        </div>
      )}
    </div>
  );
}
