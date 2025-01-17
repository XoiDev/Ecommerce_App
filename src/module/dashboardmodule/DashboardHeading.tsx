import React, { ReactNode } from "react";

interface DashboardHeadingProps {
  title?: string;
  desc?: string;
  children?: ReactNode;
}

const DashboardHeading: React.FC<DashboardHeadingProps> = ({
  title = "",
  desc = "",
  children,
}) => {
  return (
    <div className="flex items-start justify-between mb-10">
      <div>
        <h1 className="dashboard-heading">{title}</h1>
        <p className="italic font-semibold text-gray-500 dashboard-short-desc">
          {desc}
        </p>
      </div>
      {children}
    </div>
  );
};

export default DashboardHeading;
