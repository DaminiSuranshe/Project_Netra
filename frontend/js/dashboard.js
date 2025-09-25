const fetchBtn = document.getElementById("fetchThreatsBtn");
const cardsContainer = document.getElementById("threatsCards");
const fetchMsg = document.getElementById("fetchMsg");
const alertBanner = document.getElementById("alertBanner");

let allThreats = [];
let topSourcesChart, trendChart;

// Severity badge
function getSeverityBadge(severity) {
  switch (severity.toLowerCase()) {
    case "high": return '<span class="bg-red-600 px-2 py-1 rounded text-xs">🔥 High</span>';
    case "medium": return '<span class="bg-yellow-500 px-2 py-1 rounded text-xs">⚠️ Medium</span>';
    case "low": return '<span class="bg-green-600 px-2 py-1 rounded text-xs">✅ Low</span>';
    default: return '<span class="bg-gray-700 px-2 py-1 rounded text-xs">❓ Unknown</span>';
  }
}

// Render threat cards with alert banner
function renderCards(threats) {
  cardsContainer.innerHTML = threats.map((t, index) => `
    <div class="bg-gray-800 p-4 rounded shadow hover:scale-105 transform transition duration-200 cursor-pointer" data-index="${index}">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold text-lg truncate">${t.source} | ${t.type}</h3>
        ${getSeverityBadge(t.severity)}
      </div>
      <p class="truncate"><b>Indicator:</b> ${t.indicator}</p>
      <p class="truncate"><b>Description:</b> ${t.description}</p>
      <p class="text-xs mt-1"><b>Date:</b> ${new Date(t.date).toLocaleString()}</p>
    </div>
  `).join("");

  // High-severity alert
  const highCount = threats.filter(t => t.severity.toLowerCase() === "high").length;
  if(highCount > 0) {
    alertBanner.textContent = `⚠️ ALERT: ${highCount} high-severity threats detected!`;
    alertBanner.classList.remove("hidden");
    setTimeout(() => alertBanner.classList.add("hidden"), 5000);
  }
}

// Top sources chart
function renderTopSourcesChart(threats) {
  const counts = {};
  threats.forEach(t => counts[t.source] = (counts[t.source] || 0) + 1);

  if(topSourcesChart) topSourcesChart.destroy();

  const ctx = document.getElementById("topSourcesChart").getContext("2d");
  topSourcesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(counts),
      datasets: [{ label: "# Threats", data: Object.values(counts), backgroundColor: ["#f87171","#facc15","#34d399","#60a5fa"] }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

// Trend chart
function renderTrendChart(threats) {
  const dates = [...Array(7).keys()].map(i => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0,10);
  }).reverse();

  const counts = dates.map(date => threats.filter(t => t.date.slice(0,10) === date).length);

  if(trendChart) trendChart.destroy();

  const ctx = document.getElementById("trendChart").getContext("2d");
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Threats per Day',
        data: counts,
        borderColor:'#60a5fa',
        backgroundColor:'rgba(96,165,250,0.2)',
        tension:0.3
      }]
    },
    options: { responsive:true }
  });
}

// Fetch button
fetchBtn.addEventListener("click", async () => {
  fetchMsg.textContent = "⏳ Fetching threats...";
  cardsContainer.innerHTML = "";
  try {
    const res = await fetch("http://localhost:5000/api/threats");
    allThreats = await res.json();
    fetchMsg.textContent = `✅ ${allThreats.length} threats fetched`;
    renderCards(allThreats);
    renderTopSourcesChart(allThreats);
    renderTrendChart(allThreats);
  } catch (err) {
    fetchMsg.textContent = `❌ ${err.message}`;
  }
});
