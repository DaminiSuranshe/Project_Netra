import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [threats, setThreats] = useState([]);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("");
  const [source, setSource] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchThreats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/threats/search", {
        params: { query, severity, source, startDate, endDate, page, limit: 5 }
      });
      setThreats(response.data.threats);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching threats:", error);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, [page]);

  const handleSearch = () => {
    setPage(1); // reset to first page on new search
    fetchThreats();
  };

  const handleExport = async () => {
    try {
      const params = { query, severity, source, startDate, endDate };
      const response = await axios.get("http://localhost:5000/api/threats/export", {
        params,
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "threats_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleExportExcel = async () => {
  try {
    const params = { query, severity, source, startDate, endDate };
    const response = await axios.get("http://localhost:5000/api/threats/export/excel", {
      params,
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "threats_export.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Excel export failed:", error);
  }
};

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Threat Intelligence Dashboard</h2>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input type="text" placeholder="Search by IP, domain, hash..." value={query} onChange={(e) => setQuery(e.target.value)} className="border p-2 rounded" />
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="border p-2 rounded">
          <option value="">All Severities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} className="border p-2 rounded">
          <option value="">All Sources</option>
          <option value="AbuseIPDB">AbuseIPDB</option>
          <option value="VirusTotal">VirusTotal</option>
          <option value="OTX">OTX</option>
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded" />
      </div>

      <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
      <button onClick={handleExport} className="bg-green-500 text-white px-4 py-2 rounded ml-2">Export CSV</button>

      {/* Threats Table */}
      <table className="w-full mt-6 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Severity</th>
            <th className="border p-2">Source</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
      <tbody>
        {threats.length > 0 ? (
          threats.map((threat) => (
            <tr key={threat._id}>
              <td className="border p-2">{threat.name}</td>
              <td className="border p-2">{threat.severity}</td>
              <td className="border p-2">{threat.source}</td>
              <td className="border p-2">{new Date(threat.createdAt).toLocaleString()}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="text-center p-4">No threats found.</td>
          </tr>
        )}
      </tbody>
    </table>

    <button onClick={handleExport} className="bg-green-500 text-white px-4 py-2 rounded mt-4">
      Export CSV
    </button>

    <button onClick={handleExportExcel} className="bg-blue-500 text-white px-4 py-2 rounded ml-2">
      Export Excel
    </button>
  </div>
);
};

export default Dashboard;
