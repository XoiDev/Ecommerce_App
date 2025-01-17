import React from "react";

const Header = () => {
  return (
    <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Ecommerce Dashboard</h1>
      <div>
        <button className="bg-blue-500 px-4 py-2 rounded text-white">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
