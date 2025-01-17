import { useState } from "react";

const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPage(1); // Reset về page đầu khi đổi pageSize
    }
  };

  return { page, pageSize, handlePageChange };
};

export default usePagination;
