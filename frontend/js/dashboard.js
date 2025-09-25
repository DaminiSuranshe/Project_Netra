// Optional: Map sources/types to icons
const sourceIcons = {
  "AbuseIPDB": "🛡️",
  "AlienVault OTX": "👾",
  "VirusTotal": "🦠",
  "CISA": "📢"
};

const typeIcons = {
  "IP": "🌐",
  "Domain": "🔗",
  "FileHash": "🗂️",
  "Advisory": "📄"
};

// -------------------------
// Elements
// -------------------------
const fetchBtn = document.getElementById("fetchThreatsBtn");
const cardsContainer = document.getElementById("threatsCards");
const fetchMsg = document.getElementById("fetchMsg");
const searchInput = document.getElementById("searchInput");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

// Modal elements
const threatModal = document.getElementById("threatModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalTitle = document.getElementById("modalTitle");
const modalIndicator = document.getElementById("modalIndicator");
const modalSource = document.getElementById("modalSource");
const modalType = document.getElementById("modalType");
const modalSeverity = document.getElementById("modalSeverity");
const modalDescription = document.getElementById("modalDescription");
const modalDate = document.getElementById("modalDate");
const alertBanner = document.getElementById("alertBanner");

let allThreats = []; // global store
let topSourcesChart, trendChart;

// -------------------------
// Severity Badge
// -------------------------
function getSeverityBadge(severity) {
  switch (severity.toLowerCase()) {
    case "high": return '<span class="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold">🔥 High</span>';
    case "medium": return '<span class="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold">⚠️ Medium</span>';
    case "low": return '<span class="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">✅ Low</span>';
    default: return '<span class="bg-gray-700 text-white px-2 py-1 rounded-full text-xs font-semibold">❓ Unknown</span>';
  }
}

// -------------------------
// Sort Threats (Severity → Date)
// -------------------------
function sortThreats(threats) {
  const severityOrder = { high: 3, medium: 2, low: 1, unknown: 0 };
  return threats.sort((a, b) => {
    const sevDiff = (severityOrder[b.severity.toLowerCase()] || 0) - (severityOrder[a.severity.toLowerCase()] || 0);
    if (sevDiff !== 0) return sevDiff;
    return new Date(b.date) - new Date(a.date); // newest first
  });
}

// -------------------------
// Render Cards with Modal
// -------------------------
function renderCards(threats) {
  cardsContainer.innerHTML = threats
    .map((t, index) => `
      <div class="bg-gray-800 p-4 rounded-lg shadow-md hover:scale-105 transform transition duration-200 cursor-pointer" data-index="${index}">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-bold text-lg truncate" title="${t.source} | ${t.type}">
            <span title="${t.source}">${sourceIcons[t.source] || "❓"}</span> ${t.source} | 
            <span title="${t.type}">${typeIcons[t.type] || "❔"}</span> ${t.type}
            </h3>
          ${getSeverityBadge(t.severity)}
        </div>
        <p class="truncate" title="${t.indicator}"><span class="font-semibold">Indicator:</span> ${t.indicator}</p>
        <p class="truncate" title="${t.description}"><span class="font-semibold">Description:</span> ${t.description}</p>
        <p class="text-xs text-gray-300 mt-1"><span class="font-semibold">Date:</span> ${new Date(t.date).toLocaleString()}</p>
      </div>
    `).join("");

  // Click event for modal
  document.querySelectorAll("#threatsCards > div").forEach(card => {
    card.addEventListener("click", () => {
      const t = threats[card.dataset.index];
      modalTitle.textContent = `${t.source} | ${t.type}`;
      modalIndicator.textContent = t.indicator;
      modalSource.textContent = t.source;
      modalType.textContent = t.type;
      modalSeverity.innerHTML = getSeverityBadge(t.severity);
      modalDescription.textContent = t.description;
      modalDate.textContent = new Date(t.date).toLocaleString();

      // Color-coded modal header
      switch (t.severity.toLowerCase()) {
        case "high":
          threatModal.querySelector(".modal-header").className = "modal-header bg-red-700 text-white px-4 py-2 rounded-t-lg";
          break;
        case "medium":
          threatModal.querySelector(".modal-header").className = "modal-header bg-yellow-500 text-black px-4 py-2 rounded-t-lg";
          break;
        case "low":
          threatModal.querySelector(".modal-header").className = "modal-header bg-green-600 text-white px-4 py-2 rounded-t-lg";
          break;
        default:
          threatModal.querySelector(".modal-header").className = "modal-header bg-gray-700 text-white px-4 py-2 rounded-t-lg";
      }

      threatModal.classList.remove("hidden");
    });
  });

  // High-severity alert banner
  const highCount = threats.filter(t => t.severity.toLowerCase() === "high").length;
  if (highCount > 0) {
    alertBanner.textContent = `⚠️ ALERT: ${highCount} high-severity threats detected!`;
    alertBanner.classList.remove("hidden");
    setTimeout(() => alertBanner.classList.add("hidden"), 5000); // auto-hide
  }
}

// -------------------------
// Render Top Sources Chart
// -------------------------
function renderTopSourcesChart(threats) {
  const sourcesCount = {};
  threats.forEach(t => { sourcesCount[t.source] = (sourcesCount[t.source] || 0) + 1; });

  if(topSourcesChart) topSourcesChart.destroy();

  const ctx = document.getElementById("topSourcesChart").getContext("2d");
  topSourcesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(sourcesCount),
      datasets: [{
        label: "# of Threats",
        data: Object.values(sourcesCount),
        backgroundColor: ["#f87171","#facc15","#34d399","#60a5fa"],
      }],
    },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });
}

// -------------------------
// Render Trend Chart
// -------------------------
function renderTrendChart(threats) {
  const dates = [...Array(7).keys()].map(i => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0,10);
  }).reverse();

  const trendCounts = dates.map(date =>
    threats.filter(t => t.date.slice(0,10) === date).length
  );

  if(trendChart) trendChart.destroy();

  const ctx = document.getElementById("trendChart").getContext("2d");
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Threats per Day',
        data: trendCounts,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.2)',
        tension: 0.3
      }]
    },
    options: { responsive: true, plugins: { legend: { display: true } } },
  });
}

// -------------------------
// Apply Filters
// -------------------------
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const severityFilter = document.querySelector(".filterBtn.active")?.dataset.severity || "all";

  let filtered = allThreats;

  if (severityFilter !== "all") filtered = filtered.filter(t => t.severity.toLowerCase() === severityFilter);
  if (searchTerm) filtered = filtered.filter(t =>
    t.source.toLowerCase().includes(searchTerm) ||
    t.type.toLowerCase().includes(searchTerm) ||
    t.indicator.toLowerCase().includes(searchTerm)
  );

  filtered = sortThreats(filtered);

  renderCards(filtered);
  renderTopSourcesChart(filtered);
  renderTrendChart(filtered);
}

// -------------------------
// Fetch Threats Button
// -------------------------
fetchBtn.addEventListener("click", async () => {
  fetchMsg.textContent = "⏳ Fetching threats...";
  cardsContainer.innerHTML = "";

  try {
    await apiFetch("threats/fetch"); // fetch latest
    allThreats = await apiFetch("threats"); // get stored threats
    fetchMsg.textContent = `✅ ${allThreats.length} threats fetched`;

    applyFilters(); // initial render
  } catch (err) {
    fetchMsg.textContent = `❌ ${err.message}`;
  }
});

// -------------------------
// Severity Filter Buttons
// -------------------------
document.querySelectorAll(".filterBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filterBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilters();
  });
});

// -------------------------
// Search Input
// -------------------------
searchInput.addEventListener("input", applyFilters);

// -------------------------
// Modal Close
// -------------------------
modalCloseBtn.addEventListener("click", () => threatModal.classList.add("hidden"));
threatModal.addEventListener("click", e => {
  if (e.target === threatModal) threatModal.classList.add("hidden");
});


clearFiltersBtn.addEventListener("click", () => {
  searchInput.value = ""; // clear search
  document.querySelectorAll(".filterBtn").forEach(b => b.classList.remove("active"));
  document.querySelector(".filterBtn[data-severity='all']").classList.add("active"); // reset severity
  applyFilters(); // re-render all threats
});
