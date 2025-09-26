import React from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="flex items-center bg-white border rounded-lg px-3 py-1 shadow-sm">
      <Search size={16} className="text-gray-400" />
      <input className="ml-2 outline-none w-64" placeholder="Search IoCs, IPs, domains..." />
    </div>
  );
}
