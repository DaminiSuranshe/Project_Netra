import React from "react";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";

export default function ThreatMap({ threats }) {
  const center = [21.1458, 79.0882]; // Nagpur as default
  return (
    <div className="rounded-lg overflow-hidden" style={{ height: 240 }}>
      <MapContainer center={center} zoom={10} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {threats.map(t => {
          const lat = t.geo?.latitude;
          const lng = t.geo?.longitude;
          const color = t.severity === "critical" ? "purple" : t.severity === "high" ? "red" : t.severity === "medium" ? "orange" : "green";
          if (!lat || !lng) return null;
          return (
            <CircleMarker key={t.id} center={[lat, lng]} radius={8} pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
