import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
  children: string;
}

const Label: React.FC<LabelProps> = ({ htmlFor = "", children, ...props }) => {
  return (
    <label
      className="font-semibold cursor-pointer"
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;
