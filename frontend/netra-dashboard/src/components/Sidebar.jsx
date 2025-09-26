import React from "react";
import { Home, Search, Database, TrendingUp, MapPin, Layers } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-72 bg-white h-screen shadow-lg p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-netraBlue flex items-center justify-center text-white font-bold">N</div>
          <div>
            <div className="font-bold text-lg">Netra</div>
            <div className="text-xs text-gray-500">CTI Aggregator</div>
          </div>
        </div>

        <nav className="space-y-1">
          <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700" href="#">
            <Home size={18} /> Dashboard
          </a>
          <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700" href="#">
            <Search size={18} /> IoC Lookup
          </a>
          <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700" href="#">
            <Database size={18} /> Threat Feeds
          </a>
          <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700" href="#">
            <TrendingUp size={18} /> Analytics
          </a>
          <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700" href="#">
            <MapPin size={18} /> Geo Intelligence
          </a>
          <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700" href="#">
            <Layers size={18} /> MITRE ATT&CK
          </a>
        </nav>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div>
            <div className="font-semibold">SOC Analyst</div>
            <div className="text-xs text-gray-500">Security Team</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
