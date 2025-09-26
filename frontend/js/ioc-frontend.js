const lookupBtn = document.getElementById("lookupBtn");
const iocType = document.getElementById("iocType");
const iocValue = document.getElementById("iocValue");
const lookupMsg = document.getElementById("lookupMsg");
const iocResults = document.getElementById("iocResults");

// Helper: Severity Badge
function getSeverityBadge(severity) {
  switch (severity?.toLowerCase()) {
    case "high": return '<span class="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold">🔥 High</span>';
    case "medium": return '<span class="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold">⚠️ Medium</span>';
    case "low": return '<span class="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">✅ Low</span>';
    default: return '<span class="bg-gray-700 text-white px-2 py-1 rounded-full text-xs font-semibold">❓ Unknown</span>';
  }
}

// Render Results
function renderResults(results) {
  iocResults.innerHTML = results.map((r, index) => `
    <div class="bg-gray-800 p-4 rounded-lg shadow-md hover:scale-105 transform transition duration-200 cursor-pointer" 
         data-index="${index}" title="Click for details">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold text-lg truncate">${r.source} | ${r.type}</h3>
        ${getSeverityBadge(r.severity)}
      </div>
      <p title="Indicator"><span class="font-semibold">Indicator:</span> ${r.indicator}</p>
      ${r.reputation ? `<p title="Reputation Score"><span class="font-semibold">Reputation:</span> ${r.reputation}</p>` : ""}
      ${r.confidence !== undefined ? `<p title="Confidence Score"><span class="font-semibold">Confidence:</span> ${r.confidence}%</p>` : ""}
      ${r.pulseCount !== undefined ? `<p title="OTX Pulse Count"><span class="font-semibold">OTX Pulses:</span> ${r.pulseCount}</p>` : ""}
      ${r.lastAnalysisStats ? `<p title="VirusTotal Analysis"><span class="font-semibold">VT Analysis:</span> ${JSON.stringify(r.lastAnalysisStats)}</p>` : ""}
    </div>
  `).join("");

  // Optional: alert banner for high-severity IoCs
  const highCount = results.filter(r => r.severity?.toLowerCase() === "high").length;
  if (highCount > 0) {
    if (!document.getElementById("iocAlertBanner")) {
      const banner = document.createElement("div");
      banner.id = "iocAlertBanner";
      banner.className = "bg-red-600 text-white px-4 py-2 rounded mb-4 animate-pulse";
      banner.textContent = `⚠️ ALERT: ${highCount} high-severity IoC(s) detected!`;
      iocResults.parentNode.insertBefore(banner, iocResults);
      setTimeout(() => banner.remove(), 7000); // auto-hide
    }
  }
}


// Lookup Button
lookupBtn.addEventListener("click", async () => {
  const type = iocType.value;
  const value = iocValue.value.trim();

  if (!type || !value) {
    lookupMsg.textContent = "⚠️ Please enter a value";
    return;
  }

  lookupMsg.textContent = "⏳ Looking up...";
  iocResults.innerHTML = "";

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
    } else {
      lookupMsg.textContent = `✅ ${data.results.length} result(s) found`;
      renderResults(data.results);
    }

  } catch (err) {
    lookupMsg.textContent = `❌ ${err.message}`;
  }
});

// ----------------------
// DOM Elements
// ----------------------
const iocForm = document.getElementById("iocForm");
const resultsList = document.getElementById("resultsList");

// ----------------------
// Event Listener
// ----------------------
iocForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultsList.innerHTML = ""; // Clear previous results

  const type = iocType.value;
  const value = iocValue.value.trim();
  if (!value) return alert("Please enter a value");

  try {
    const res = await fetch("/api/ioc/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Lookup failed");

    // Display results
    data.results.forEach((r) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Source:</strong> ${r.source} |
        <strong>Indicator:</strong> ${r.indicator} |
        ${r.reputation ? `<strong>Reputation:</strong> ${r.reputation} |` : ""}
        ${r.pulseCount !== undefined ? `<strong>Pulse Count:</strong> ${r.pulseCount} |` : ""}
        ${r.lastAnalysisStats ? `<strong>VT Stats:</strong> ${JSON.stringify(r.lastAnalysisStats)}` : ""}
      `;
      resultsList.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    alert(`Error: ${err.message}`);
  }

});
