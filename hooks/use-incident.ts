
import React from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getIncidents } from "@/services";

// We don't need a separate fetchIncidents function anymore since we're using the service

export function useIncidents(page: number = 1, pageSize = 10) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["incidents", page, pageSize],
    queryFn: () => getIncidents({ page, pageSize }),
  });

  React.useEffect(() => {
    if (query.data?.count) {
      const totalPages = Math.ceil(query.data.count / pageSize);
      if (page < totalPages) {
        // Use the same getIncidents function for prefetching to ensure auth tokens are included
        queryClient.prefetchQuery({
          queryKey: ["incidents", page + 1, pageSize],
          queryFn: () => getIncidents({ page: page + 1, pageSize }),
        });
      }
    }
  }, [page, pageSize, query.data?.count, queryClient]);

  return query;
}