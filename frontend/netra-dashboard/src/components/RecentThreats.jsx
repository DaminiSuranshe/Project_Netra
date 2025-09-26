import React from "react";

function SeverityTag({ s }) {
  const map = {
    low: "bg-green-100 text-green-700",
    medium: "bg-orange-100 text-orange-700",
    high: "bg-red-100 text-red-700",
    critical: "bg-purple-100 text-purple-700"
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[s] || 'bg-gray-100'}`}>{s.toUpperCase()}</span>;
}

export default function RecentThreats({ items }) {
  return (
    <div className="space-y-3 max-h-80 overflow-auto pr-2">
      {items.map(it => (
        <div key={it.id} className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <SeverityTag s={it.severity} />
                <div className="font-semibold">{it.indicator}</div>
              </div>
              <div className="text-sm text-gray-600">{it.desc}</div>
              <div className="text-xs text-gray-400 mt-1">{it.time} • {it.source}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
