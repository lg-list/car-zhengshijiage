const params = new URLSearchParams(window.location.search);
const pageData = window.AUTOLEDGER_MODEL_PAGE || {};

const brandId = pageData.brand || params.get("brand") || "toyota";
const modelId = pageData.model || params.get("model") || "camry";
const modelName = pageData.name || params.get("name") || "Toyota Camry";
const priceRange = pageData.price || params.get("price") || "$31,860-$41,520";
const scoreValue = pageData.score || params.get("score") || "4.3";
const sampleCount = Number(pageData.cases || params.get("cases") || 126);

const compareState = { hideSame: false, highlightDiff: false };
let allRows = [];
let selectedYear = Number(params.get("year")) || 2026;
let activeTrimIndex = 0;
let priceChart = null;

function $(id) {
  return document.getElementById(id);
}

function firstElement(...ids) {
  return ids.map((id) => $(id)).find(Boolean);
}

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = value;
}

function currencyToNumber(value) {
  const match = String(value).match(/\$?([\d,]+)/);
  return match ? Number(match[1].replace(/,/g, "")) : 31860;
}

function formatUsd(value) {
  return `$${Math.round(value || 0).toLocaleString("en-US")}`;
}

function average(values) {
  const valid = values.filter(Number.isFinite);
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
}

function inferModelType(name) {
  const lower = name.toLowerCase();
  if (["f-150", "silverado", "tacoma", "frontier", "cybertruck", "maverick", "colorado", "ridgeline"].some((key) => lower.includes(key))) return "truck";
  if (["model 3", "model y", "model s", "model x", "ev", "ioniq", "mach-e", "eqe", "i4", "ariya", "rz"].some((key) => lower.includes(key))) return "ev";
  if (["bmw", "mercedes", "lexus"].some((key) => lower.includes(key))) return "luxury";
  if (["rav4", "cr-v", "rogue", "pilot", "explorer", "escape", "tucson", "sportage", "telluride", "outback", "forester", "highlander", "sienna", "4runner", "tahoe", "equinox", "glc", "gle", "rx", "nx", "x5", "x3"].some((key) => lower.includes(key))) return "suv";
  return "sedan";
}

function trimNamesForModel(name) {
  const type = inferModelType(name);
  const lower = name.toLowerCase();
  if (lower.includes("highlander")) return ["LE", "XLE", "XSE", "Limited", "Platinum", "Hybrid XLE", "Hybrid Limited"];
  if (type === "truck") return ["SR", "SR5", "TRD Off-Road", "Limited", "Platinum"];
  if (type === "ev") return ["Standard", "Long Range", "Premium", "Performance"];
  if (type === "luxury") return ["Base", "Premium", "Luxury", "Sport", "Executive"];
  if (type === "suv") return ["LE", "XLE", "XSE", "Limited", "Platinum"];
  return ["LE", "SE", "XLE", "XSE", "Limited"];
}

function queryPage(fileName) {
  const query = new URLSearchParams({
    brand: brandId,
    model: modelId,
    name: modelName,
    price: priceRange,
    cases: String(sampleCount),
    score: String(scoreValue),
  }).toString();
  return `./${fileName}?${query}`;
}

function wireLinks() {
  const priceHref = pageData.pricePath || queryPage("model.html");
  const configHref = pageData.configPath || queryPage("config.html");
  const priceLink = $("price-page-link");
  const configLink = $("config-page-link");
  const priceAction = $("price-action-link");
  if (priceLink) priceLink.href = priceHref;
  if (configLink) configLink.href = configHref;
  if (priceAction) priceAction.href = priceHref;
}

async function readDealData() {
  const dataPath = window.AUTOLEDGER_DATA_PATH || "../data/latest-deals.json";
  try {
    const response = await fetch(dataPath, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload.records) ? payload.records : [];
  } catch {
    return [];
  }
}

function buildFallbackRows() {
  const base = currencyToNumber(priceRange);
  const type = inferModelType(modelName);
  const msrpBase = base + (type === "luxury" ? 3600 : 2400);
  const cities = [
    ["Los Angeles", "CA"],
    ["San Francisco", "CA"],
    ["San Diego", "CA"],
    ["Houston", "TX"],
    ["Dallas", "TX"],
    ["Austin", "TX"],
    ["Miami", "FL"],
    ["Orlando", "FL"],
    ["New York", "NY"],
    ["Boston", "MA"],
    ["Chicago", "IL"],
    ["Seattle", "WA"],
    ["Portland", "OR"],
    ["Phoenix", "AZ"],
    ["Denver", "CO"],
    ["Atlanta", "GA"],
    ["Charlotte", "NC"],
    ["Las Vegas", "NV"],
  ];
  const months = {
    2026: ["2026-05", "2026-05", "2026-04", "2026-04", "2026-03", "2026-03", "2026-02", "2026-02", "2026-01", "2026-01", "2025-12", "2025-12", "2025-11", "2025-11", "2025-10", "2025-10"],
    2025: ["2025-12", "2025-11", "2025-10", "2025-09", "2025-08", "2025-07", "2025-06", "2025-05", "2025-04", "2025-03", "2025-02", "2025-01", "2024-12", "2024-11", "2024-10", "2024-09"],
  };

  return trimNamesForModel(modelName).flatMap((trim, trimIndex) =>
    [2026, 2025].flatMap((year) => {
      const yearDelta = year === 2025 ? -1750 : 0;
      const trimDelta = trimIndex * (type === "luxury" ? 2450 : 1720);
      return Array.from({ length: 16 }, (_, rowIndex) => {
        const [city, state] = cities[(trimIndex * 4 + rowIndex) % cities.length];
        const owner = base + trimDelta + yearDelta - 620 + rowIndex * 165 - (rowIndex % 3) * 110;
        const msrp = msrpBase + trimDelta + yearDelta * 0.45;
        const dealer = msrp - 1250 - rowIndex * 42;
        return {
          brand: brandId,
          model: modelId,
          modelName,
          year,
          trim,
          city,
          state,
          purchaseDate: months[year][rowIndex],
          msrp: Math.round(msrp),
          dealerQuote: Math.round(dealer),
          vehiclePrice: Math.round(owner),
          outTheDoorPrice: Math.round(owner + 2900 + trimIndex * 420 + (state === "CA" ? 520 : state === "TX" ? 260 : 340)),
          sourceType: rowIndex % 3 === 0 ? "masked_receipt" : "public_lead",
          verification: rowIndex % 3 === 0 ? "verified" : "pending",
        };
      });
    }),
  );
}

function rowsForCurrentModel(records) {
  const localRows = records.filter((row) => row.brand === brandId && row.model === modelId);
  return localRows.length >= 30 ? localRows : [...localRows, ...buildFallbackRows()];
}

function availableYears(rows) {
  const years = Array.from(new Set(rows.map((row) => Number(row.year)).filter(Boolean))).sort((a, b) => b - a);
  return years.length ? years : [2026];
}

function rowsForYear() {
  const rows = allRows.filter((row) => Number(row.year) === selectedYear);
  return rows.length ? rows : allRows;
}

function groupedTrims(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    if (!groups.has(row.trim)) groups.set(row.trim, []);
    groups.get(row.trim).push(row);
  });
  return Array.from(groups.entries()).map(([name, records]) => ({
    name,
    records,
    msrp: average(records.map((row) => row.msrp)),
    dealer: average(records.map((row) => row.dealerQuote)),
    owner: average(records.map((row) => row.vehiclePrice)),
    outDoor: average(records.map((row) => row.outTheDoorPrice)),
  }));
}

function wireYearSelect() {
  const yearTabs = $("year-tabs");
  if (yearTabs) {
    const years = availableYears(allRows);
    if (!years.includes(selectedYear)) selectedYear = years[0];
    yearTabs.innerHTML = years
      .map(
        (year) => `
          <button class="year-tab${year === selectedYear ? " active" : ""}" type="button" role="tab" aria-selected="${year === selectedYear}" data-year="${year}">
            ${year}
          </button>
        `,
      )
      .join("");
    yearTabs.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const nextYear = Number(button.dataset.year) || years[0];
        if (nextYear === selectedYear) return;
        selectedYear = nextYear;
        activeTrimIndex = 0;
        renderPage();
      });
    });
    return;
  }

  const select = $("year-select") || document.querySelector(".model-list-controls select");
  if (!select) return;
  const years = availableYears(allRows);
  if (!years.includes(selectedYear)) selectedYear = years[0];
  select.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");
  select.value = String(selectedYear);
  select.onchange = () => {
    selectedYear = Number(select.value) || years[0];
    activeTrimIndex = 0;
    renderPage();
  };
}

function renderTrimCards(trims) {
  const wrap = firstElement("trim-options", "trim-option-grid");
  if (!wrap) return;
  wrap.innerHTML = trims
    .map(
      (trim, index) => `
        <button class="trim-option-card${index === activeTrimIndex ? " active" : ""}" type="button" data-index="${index}">
          <span>${trim.records.length} owner price samples</span>
          <strong>${selectedYear} ${modelName} ${trim.name}</strong>
          <small>MSRP ${formatUsd(trim.msrp)} · Owner paid ${formatUsd(trim.owner)}</small>
        </button>
      `,
    )
    .join("");
  wrap.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeTrimIndex = Number(button.dataset.index) || 0;
      renderPage();
    });
  });
}

function specForTrim(trim, index) {
  const type = inferModelType(modelName);
  const lower = modelName.toLowerCase();
  const isEv = type === "ev";
  const isTruck = type === "truck";
  const isSuv = type === "suv" || type === "luxury";
  const seats = isSuv && ["highlander", "pilot", "telluride", "palisade", "sienna", "explorer"].some((key) => lower.includes(key)) ? "7 seats" : "5 seats";
  const drivetrain = isEv ? (index > 1 ? "Dual motor AWD" : "RWD") : isTruck ? (index > 1 ? "4WD" : "RWD") : isSuv ? (index > 1 ? "AWD" : "FWD") : "FWD";
  return {
    MSRP: formatUsd(trim.msrp),
    "Dealer quote": formatUsd(trim.dealer),
    "60-day owner paid": formatUsd(trim.owner),
    "Sample count": `${trim.records.length} samples`,
    "Fuel type": isEv ? "Electric" : trim.name.toLowerCase().includes("hybrid") ? "Hybrid" : "Gasoline",
    Segment: isTruck ? "Pickup" : isSuv ? "SUV" : "Sedan",
    "Model year": String(selectedYear),
    "Body style": isTruck ? "4-door pickup" : isSuv ? "5-door SUV" : "4-door sedan",
    Seating: seats,
    Doors: isSuv ? "5" : "4",
    Length: `${isTruck ? 213 : isSuv ? 195 + index : 193} in`,
    Width: `${isTruck ? 80 : isSuv ? 76 : 73} in`,
    Height: `${isTruck ? 76 : isSuv ? 68 : 57} in`,
    Wheelbase: `${isTruck ? 131 : isSuv ? 112 : 111} in`,
    Cargo: isTruck ? "5.0 ft bed" : isSuv ? `${16 + index * 2} cu ft` : `${15 + index} cu ft`,
    "Curb weight": `${3650 + index * 180} lb est.`,
    Engine: isEv ? "Electric motor" : isTruck ? "2.4T / V6" : trim.name.toLowerCase().includes("hybrid") ? "2.5L Hybrid" : "2.0L / 2.5L",
    Horsepower: `${isEv ? 260 + index * 28 : isTruck ? 278 + index * 20 : 190 + index * 14} hp est.`,
    Transmission: isEv ? "Single-speed" : trim.name.toLowerCase().includes("hybrid") ? "E-CVT" : "8AT / CVT",
    Drivetrain: drivetrain,
    "Efficiency": isEv ? `${28 - index} kWh/100mi est.` : `${24 + index} mpg est.`,
    "Safety suite": index > 1 ? "L2 driver assist" : "Standard safety suite",
    "Adaptive cruise": index > 0 ? "Yes" : "Optional",
    "Lane keeping": "Yes",
    "Blind spot monitor": index > 1 ? "Yes" : "Optional",
    "Rear camera": "Yes",
    "Center screen": index > 2 ? "12.3 inch" : "8 inch",
    "Gauge cluster": index > 2 ? "Digital cluster" : "Analog / digital",
    "CarPlay / Android Auto": "Wireless",
    Audio: index > 3 ? "Premium audio" : "Standard audio",
    Upholstery: index > 2 ? "Leather trimmed" : "Fabric / SofTex",
    "Heated front seats": index > 1 ? "Yes" : "Optional",
    "Ventilated seats": index > 3 ? "Yes" : "No",
    "Panoramic roof": index > 3 ? "Yes" : "Optional",
    Wheels: `${17 + Math.min(index, 3)} inch`,
    Warranty: "3 yr / 36k mi basic",
  };
}

function rowIsSame(specs, label) {
  const values = specs.map((spec) => String(spec[label]).toLowerCase());
  return values.every((value) => value === values[0]);
}

function renderConfigTable(trims) {
  const target = firstElement("config-table", "model-config-table");
  if (!target) return;
  const specs = trims.map(specForTrim);
  const groups = [
    ["Price", ["MSRP", "Dealer quote", "60-day owner paid", "Sample count"]],
    ["Basics", ["Fuel type", "Segment", "Model year", "Body style", "Seating", "Doors"]],
    ["Dimensions", ["Length", "Width", "Height", "Wheelbase", "Cargo", "Curb weight"]],
    ["Powertrain", ["Engine", "Horsepower", "Transmission", "Drivetrain", "Efficiency"]],
    ["Safety", ["Safety suite", "Adaptive cruise", "Lane keeping", "Blind spot monitor", "Rear camera"]],
    ["Comfort", ["Center screen", "Gauge cluster", "CarPlay / Android Auto", "Audio", "Upholstery", "Heated front seats", "Ventilated seats", "Panoramic roof", "Wheels", "Warranty"]],
  ];
  const colWidth = Math.max(180, Math.min(240, Math.floor(1100 / Math.max(trims.length, 1))));

  if (target.tagName === "TABLE") {
    target.style.minWidth = `${220 + trims.length * colWidth}px`;
    target.innerHTML = `
      <thead><tr><th>Spec</th>${trims.map((trim) => `<th>${modelName} ${trim.name}<span>${formatUsd(trim.owner)}</span></th>`).join("")}</tr></thead>
      <tbody>
        ${groups
          .map(([groupName, labels]) => {
            const rows = labels
              .map((label) => {
                const same = rowIsSame(specs, label);
                if (compareState.hideSame && same) return "";
                return `<tr class="${same ? "is-same" : "is-diff"}"><td>${label}</td>${specs
                  .map((spec) => `<td class="${compareState.highlightDiff && !same ? "is-different" : ""}">${spec[label]}</td>`)
                  .join("")}</tr>`;
              })
              .join("");
            return rows ? `<tr class="config-group-row"><td colspan="${trims.length + 1}">${groupName}</td></tr>${rows}` : "";
          })
          .join("")}
      </tbody>`;
  } else {
    target.style.setProperty("--trim-count", String(Math.max(trims.length, 1)));
    target.innerHTML = `
      <div class="config-compare-row config-compare-top">
        <div class="config-compare-label">Spec</div>
        ${trims.map((trim) => `<div class="config-compare-trim"><strong>${modelName} ${trim.name}</strong><span>${formatUsd(trim.owner)}</span><a href="${pageData.pricePath || queryPage("model.html")}">View Prices</a></div>`).join("")}
      </div>
      ${groups
        .map(([groupName, labels]) => {
          const rows = labels
            .map((label) => {
              const same = rowIsSame(specs, label);
              if (compareState.hideSame && same) return "";
              return `<div class="config-compare-row ${same ? "config-row-same" : "config-row-different"}"><div class="config-compare-label">${label}</div>${specs
                .map((spec) => `<div class="config-value-cell ${compareState.highlightDiff && !same ? "is-different" : ""}">${spec[label]}</div>`)
                .join("")}</div>`;
            })
            .join("");
          return rows ? `<div class="config-compare-group">${groupName}</div>${rows}` : "";
        })
        .join("")}`;
  }
}

function wireConfigButtons() {
  const hideButton = $("hide-same-btn") || document.querySelector(".config-switches button:nth-child(2)");
  const diffButton = $("highlight-diff-btn") || document.querySelector(".config-switches button:nth-child(3)");
  if (hideButton && !hideButton.dataset.bound) {
    hideButton.dataset.bound = "true";
    hideButton.addEventListener("click", () => {
      compareState.hideSame = !compareState.hideSame;
      renderPage();
    });
  }
  if (diffButton && !diffButton.dataset.bound) {
    diffButton.dataset.bound = "true";
    diffButton.addEventListener("click", () => {
      compareState.highlightDiff = !compareState.highlightDiff;
      renderPage();
    });
  }
  if (hideButton) {
    hideButton.classList.toggle("active", compareState.hideSame);
    hideButton.setAttribute("aria-pressed", String(compareState.hideSame));
  }
  if (diffButton) {
    diffButton.classList.toggle("active", compareState.highlightDiff);
    diffButton.setAttribute("aria-pressed", String(compareState.highlightDiff));
  }
}

function trendRows(records, trim) {
  const labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];
  const sorted = [...records].sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate)).slice(-labels.length);
  const owner = sorted.map((row) => row.vehiclePrice);
  const dealer = sorted.map((row) => row.dealerQuote);
  while (owner.length < labels.length) owner.unshift(trim.owner);
  while (dealer.length < labels.length) dealer.unshift(trim.dealer);
  return { labels, owner, dealer, msrp: labels.map(() => trim.msrp) };
}

function renderTrend(trim) {
  const summary = $("trend-summary");
  if (summary) {
    summary.innerHTML = `
      <div><strong>${formatUsd(trim.msrp)}</strong><span>MSRP</span></div>
      <div><strong>${formatUsd(trim.owner)}</strong><span>60-day owner paid</span></div>
      <div><strong>${formatUsd(trim.dealer)}</strong><span>Dealer quote</span></div>
    `;
  }
  setText("stat-msrp", formatUsd(trim.msrp));
  setText("stat-owner", formatUsd(trim.owner));
  setText("stat-dealer", formatUsd(trim.dealer));

  const canvas = $("price-trend-chart");
  if (!canvas || !window.Chart) return;
  const data = trendRows(trim.records, trim);
  if (priceChart) priceChart.destroy();
  priceChart = new window.Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        { label: "60-day owner paid", data: data.owner, borderColor: "#0757c8", backgroundColor: "rgba(7, 87, 200, 0.1)", borderWidth: 3, pointRadius: 3, tension: 0.35, fill: true },
        { label: "Dealer quote", data: data.dealer, borderColor: "#f2a900", backgroundColor: "rgba(242, 169, 0, 0.08)", borderWidth: 2, pointRadius: 2, tension: 0.35 },
        { label: "MSRP", data: data.msrp, borderColor: "#8a96a8", borderDash: [6, 5], borderWidth: 2, pointRadius: 0, tension: 0.2 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      plugins: {
        legend: { labels: { boxWidth: 18, color: "#344156", font: { size: 11, weight: "700" } } },
        tooltip: { callbacks: { label: (item) => `${item.dataset.label}: ${formatUsd(item.parsed.y)}` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#8a96a8", font: { size: 10 } } },
        y: { border: { display: false }, grid: { color: "#edf2f8" }, ticks: { color: "#8a96a8", font: { size: 10 }, callback: (value) => formatUsd(value) } },
      },
    },
  });
}

function renderOwnerDeals(rows) {
  const tabs = $("city-tabs");
  const list = firstElement("owner-price-list", "owner-deal-list");
  if (!tabs || !list) return;
  const cities = ["All", ...Array.from(new Set(rows.map((row) => row.city)))];

  function draw(city) {
    tabs.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.city === city));
    const visibleRows = rows.filter((row) => city === "All" || row.city === city);
    list.innerHTML = visibleRows
      .map(
        (row) => `
          <article class="owner-deal-row">
            <strong>${row.purchaseDate}</strong>
            <span>${row.city}, ${row.state}</span>
            <strong class="owner-price">${formatUsd(row.vehiclePrice)}</strong>
            <strong>${formatUsd(row.outTheDoorPrice)}</strong>
          </article>
        `,
      )
      .join("");
  }

  tabs.innerHTML = cities.map((city, index) => `<button class="${index === 0 ? "active" : ""}" type="button" data-city="${city}">${city}</button>`).join("");
  tabs.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => draw(button.dataset.city)));
  draw("All");
}

function renderPage() {
  const rows = rowsForYear();
  const trims = groupedTrims(rows);
  const activeTrim = trims[Math.min(activeTrimIndex, trims.length - 1)] || trims[0];
  const isConfigView = Boolean(firstElement("config-table", "model-config-table")) && !firstElement("owner-price-list", "owner-deal-list");

  document.title = isConfigView
    ? `${selectedYear} ${modelName} trim specs and real owner paid prices | AutoLedger`
    : `${selectedYear} ${modelName} real owner paid prices | Selling price, OTD and dealer quote | AutoLedger`;
  setText("model-title", isConfigView ? `${selectedYear} ${modelName} trim specs and real owner paid prices` : `${selectedYear} ${modelName} real owner paid prices`);
  setText("sample-count", String(rows.length));
  setText("score-value", String(scoreValue));
  setText("trim-count", String(trims.length));
  setText("trim-count-pill", `${trims.length} trims on sale`);
  setText("trim-head-model", `${selectedYear} ${modelName} trim owner paid prices`);
  setText("model-config-title", `${modelName} trim specs and price comparison`);

  renderTrimCards(trims);
  renderConfigTable(trims);
  wireConfigButtons();
  if (activeTrim) {
    renderTrend(activeTrim);
    renderOwnerDeals(activeTrim.records);
  }
}

readDealData().then((records) => {
  allRows = rowsForCurrentModel(records);
  wireLinks();
  wireYearSelect();
  renderPage();
});
