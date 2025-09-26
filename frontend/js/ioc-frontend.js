// ----------------------
// DOM Elements
// ----------------------
const iocForm = document.getElementById("iocForm");
const lookupBtn = document.getElementById("lookupBtn");
const iocType = document.getElementById("iocType");
const iocValue = document.getElementById("iocValue");
const lookupMsg = document.getElementById("lookupMsg");
const iocResults = document.getElementById("iocResults");
const resultsList = document.getElementById("resultsList");

// ----------------------
// Helper: Severity Badge
// ----------------------
function getSeverityBadge(severity) {
  switch (severity?.toLowerCase()) {
    case "high":
      return '<span class="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold">🔥 High</span>';
    case "medium":
      return '<span class="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold">⚠️ Medium</span>';
    case "low":
      return '<span class="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">✅ Low</span>';
    default:
      return '<span class="bg-gray-700 text-white px-2 py-1 rounded-full text-xs font-semibold">❓ Unknown</span>';
  }
}

// ----------------------
// Render Card Results
// ----------------------
function renderCardResults(results) {
  iocResults.innerHTML = results.map((r, index) => `
    <div class="bg-gray-800 p-4 rounded-lg shadow-md hover:scale-105 transform transition duration-200 cursor-pointer mb-4" 
         data-index="${index}" title="Click for details">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold text-lg truncate">${r.source} | ${r.type}</h3>
        ${getSeverityBadge(r.severity)}
      </div>
      <p title="Indicator"><span class="font-semibold">Indicator:</span> ${r.indicator}</p>
      ${r.reputation ? `<p title="Reputation Score"><span class="font-semibold">Reputation:</span> ${r.reputation}</p>` : ""}
      ${r.confidence !== undefined ? `<p title="Confidence Score"><span class="font-semibold">Confidence:</span> ${r.confidence}%</p>` : ""}
      ${r.pulseCount !== undefined 
        ? `<div class="overflow-auto max-h-24 bg-gray-700 p-2 rounded mt-2"><strong>OTX Pulses:</strong> ${r.pulseCount}</div>` 
        : ""}
      ${r.lastAnalysisStats 
        ? `<div class="overflow-auto max-h-48 bg-gray-700 p-2 rounded mt-2"><strong>VT Analysis:</strong><pre class="text-xs">${JSON.stringify(r.lastAnalysisStats, null, 2)}</pre></div>` 
        : ""}
    </div>
  `).join("");

  // High-severity alert banner
  const highCount = results.filter(r => r.severity?.toLowerCase() === "high").length;
  if (highCount > 0) {
    if (!document.getElementById("iocAlertBanner")) {
      const banner = document.createElement("div");
      banner.id = "iocAlertBanner";
      banner.className = "bg-red-600 text-white px-4 py-2 rounded mb-4 animate-pulse";
      banner.textContent = `⚠️ ALERT: ${highCount} high-severity IoC(s) detected!`;
      iocResults.parentNode.insertBefore(banner, iocResults);
      setTimeout(() => banner.remove(), 7000);
    }
  }
}

// ----------------------
// Render List Results (Fallback)
// ----------------------
function renderListResults(results) {
  if (!resultsList) return;
  resultsList.innerHTML = "";
  results.forEach(r => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>Source:</strong> ${r.source} |
      <strong>Indicator:</strong> ${r.indicator} |
      ${r.reputation ? `<strong>Reputation:</strong> ${r.reputation} |` : ""}
      ${r.pulseCount !== undefined ? `<strong>Pulse Count:</strong> ${r.pulseCount} |` : ""}
      ${r.lastAnalysisStats ? `<strong>VT Stats:</strong><pre class="text-xs">${JSON.stringify(r.lastAnalysisStats, null, 2)}</pre>` : ""}
    `;
    resultsList.appendChild(li);
  });
}

// ----------------------
// Fetch IoC Results
// ----------------------
async function lookupIoC(type, value) {
  if (!type || !value) {
    lookupMsg.textContent = "⚠️ Please enter a value";
    return [];
  }

  lookupMsg.textContent = "⏳ Looking up...";
  iocResults.innerHTML = "";
  if (resultsList) resultsList.innerHTML = "";

  try {
    const res = await fetch("/api/ioc/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value })
    });

    if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      lookupMsg.textContent = "ℹ️ No results found";
      return [];
    } else {
      lookupMsg.textContent = `✅ ${data.results.length} result(s) found`;
      return data.results;
    }

  } catch (err) {
    lookupMsg.textContent = `❌ ${err.message}`;
    return [];
  }
}

// ----------------------
// Event Listeners
// ----------------------
if (lookupBtn) {
  lookupBtn.addEventListener("click", async () => {
    const results = await lookupIoC(iocType.value, iocValue.value.trim());
    if (results.length > 0) {
      renderCardResults(results);
      renderListResults(results);
    }
  });
}

if (iocForm) {
  iocForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const results = await lookupIoC(iocType.value, iocValue.value.trim());
    if (results.length > 0) {
      renderCardResults(results);
      renderListResults(results);
    }
  });
}
