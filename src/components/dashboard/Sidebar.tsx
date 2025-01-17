import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-full p-4">
      <h2 className="text-2xl font-bold text-center mb-6">Dashboard</h2>
      <ul>
        <li className="mb-4">
          <Link to="/vendors" className="text-lg hover:text-blue-400">
            Vendors
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/categories" className="text-lg hover:text-blue-400">
            Categories
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/discount-codes" className="text-lg hover:text-blue-400">
            Discount Codes
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
