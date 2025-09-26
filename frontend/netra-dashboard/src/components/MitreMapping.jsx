import React from "react";

export default function MitreMapping({ items }) {
  return (
    <div className="space-y-3">
      {items.map(it => (
        <div key={it.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
          <div>
            <div className="text-sm font-semibold">{it.name}</div>
            <div className="text-xs text-gray-500">Technique {it.id}</div>
          </div>
          <div className="text-sm text-gray-700">{it.count} detections</div>
        </div>
      ))}
    </div>
  );
}
