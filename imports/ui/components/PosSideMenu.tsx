import React from "react";

export const PosSideMenu = () => {
  return (
    <div className="w-64 bg-gray-100 flex flex-col p-0">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between bg-rose-400 text-white px-4 py-2 rounded-t-md">
        <button className="text-2xl font-bold">⋯</button>
        <span className="text-lg font-semibold">Table 12</span>
        <button className="text-2xl font-bold">×</button>
      </div>

      {/* Sidebar content will come here later */}
    </div>
  );
};
