import React, { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className={`w-full overflow-x-auto rounded-lg shadow-md ${className}`}>
      <table className="min-w-full">{children}</table>
    </div>
  );
};

export default Table;
