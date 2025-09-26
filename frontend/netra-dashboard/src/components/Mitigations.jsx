import React from "react";

const priorityColor = (p) => {
  if (p === "High") return "bg-green-100 text-green-700";
  if (p === "Medium") return "bg-orange-100 text-orange-700";
  return "bg-blue-100 text-blue-700";
};

export default function Mitigations({ items }) {
  return (
    <div className="mt-6 space-y-3">
      <h4 className="text-lg font-medium">Recommended Mitigations</h4>
      {items.map((m, i) => (
        <div key={i} className="p-4 bg-green-50 rounded-lg flex justify-between items-center">
          <div>
            <div className="font-semibold">{m.title}</div>
            <div className="text-sm text-gray-600">{m.detail}</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${priorityColor(m.priority)}`}>{m.priority} Priority</div>
        </div>
      ))}
    </div>
  );
}
