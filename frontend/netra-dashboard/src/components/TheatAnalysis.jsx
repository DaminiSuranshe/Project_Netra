//src/components/ThreatAnalysis.jsx
import React from 'react';

function BarRow({ name, percent, color }) {
  const bg = color === 'red' ? 'bg-red-500' : color === 'orange' ? 'bg-orange-400' : color === 'blue' ? 'bg-blue-400' : color === 'purple' ? 'bg-indigo-400' : 'bg-gray-400';
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${bg}`}></div>
          <div className="text-sm font-medium">{name}</div>
        </div>
        <div className="text-sm text-gray-500">{percent}%</div>
      </div>
      <div className="bg-gray-100 h-3 rounded-full">
        <div className={`h-3 rounded-full ${bg}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

export default function ThreatAnalysis() {
  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-2">Threat Analysis</h2>
      <p>Threat analysis details will appear here.</p>
    </div>
  );
}