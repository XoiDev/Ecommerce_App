import React from "react";

interface LoadingSpinnerProps {
  size?: string;
  borderSize?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "40px",
  borderSize = "5px",
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderWidth: borderSize,
      }}
      className={`border-t-transparent border-b-transparent  border-red-600 rounded-full animate-spin`}
    ></div>
  );
};

export default LoadingSpinner;
