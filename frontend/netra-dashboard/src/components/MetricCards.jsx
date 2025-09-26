import React from "react";

function MetricCard({ title, value, change, icon, color }) {
  return (
    <div className="card p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && <div className="text-xs text-green-600 mt-1">+{change}% from yesterday</div>}
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color || 'bg-gray-100'}`}>
        {icon}
      </div>
    </div>
  );
}

export default function MetricCards({ metrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      <MetricCard title="Active Threats" value={metrics.activeThreats} change={metrics.activeChange} color="bg-red-50 text-red-600" />
      <MetricCard title="IoCs Processed" value={metrics.iocsProcessed} change={metrics.iocsProcessed > 0 ? 5.2 : 0} color="bg-green-50 text-green-600" />
      <MetricCard title="Blocked IPs" value={metrics.blockedIPs} change={8} color="bg-orange-50 text-orange-600" />
      <MetricCard title="Feed Sources" value={metrics.feedSources} color="bg-blue-50 text-blue-600" />
    </div>
  );
}
