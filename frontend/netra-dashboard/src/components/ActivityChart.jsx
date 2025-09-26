import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function ActivityChart({ data }) {
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="#f1f5f9" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="threatsDetected" stroke="#2563eb" strokeWidth={2} />
          <Line type="monotone" dataKey="blockedAttacks" stroke="#ef4444" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
