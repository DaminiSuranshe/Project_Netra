import React from "react";
import Sidebar from "./components/Sidebar";
import HeaderBar from "./components/HeaderBar";
import MetricCards from "./components/MetricCards";
import ActivityChart from "./components/ActivityChart";
import ThreatMap from "./components/ThreatMap";
import ThreatAnalysis from "./components/ThreatAnalysis";
import Mitigations from "./components/Mitigations";
import RecentThreats from "./components/RecentThreats";
import MitreMapping from "./components/MitreMapping";
import { metrics, trendData, geoThreats, topCauses, mitigations as mitig, recentThreats, mitre } from "./mockData";

export default function App() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <HeaderBar />
        <MetricCards metrics={metrics} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left big column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4">Threat Activity Trends</h3>
              <ActivityChart data={trendData} />
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4">Threat Analysis - Nagpur Region</h3>
              <ThreatAnalysis causes={topCauses} />
              <Mitigations items={mitig} />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-3">Nagpur Region Threat Map <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">Live</span></h3>
              <ThreatMap threats={geoThreats} />
            </div>

            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-3">Recent Threats</h3>
              <RecentThreats items={recentThreats} />
            </div>

            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-3">MITRE ATT&CK Mapping</h3>
              <MitreMapping items={mitre} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
