import React from "react";

interface FieldProps {
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ children }) => {
  return (
    <div className="flex flex-col items-start gap-2.5 mb-6">{children}</div>
  );
};

export default Field;
