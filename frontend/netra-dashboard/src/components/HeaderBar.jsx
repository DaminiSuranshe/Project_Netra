import React from "react";
import SearchBar from "./SearchBar";
import { Bell } from "lucide-react";

export default function HeaderBar() {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Threat Intelligence Dashboard <span className="ml-2 inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Live</span></h1>
      </div>

      <div className="flex items-center gap-4">
        <SearchBar />
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell size={18} />
          <span className="absolute -top-0 -right-0 bg-red-500 text-white rounded-full text-xs px-1">3</span>
        </button>
      </div>
    </header>
  );
}
