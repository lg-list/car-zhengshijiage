const filterButton = document.querySelector("#price-search-button");
const priceCityFilter = document.querySelector("#price-city-filter");
const priceBrandFilter = document.querySelector("#price-brand-filter");
const priceModelFilter = document.querySelector("#price-model-filter");
const priceResultList = document.querySelector("#price-result-list");
let priceRecords = [];

function formatUsd(value) {
  return `$${Math.round(value || 0).toLocaleString("en-US")}`;
}

function median(values) {
  const numbers = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!numbers.length) return 0;
  const mid = Math.floor(numbers.length / 2);
  return numbers.length % 2 ? numbers[mid] : (numbers[mid - 1] + numbers[mid]) / 2;
}

function average(values) {
  const numbers = values.filter((value) => Number.isFinite(value));
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : 0;
}

function brandLabel(brand) {
  const labels = {
    bmw: "BMW",
    mercedes: "Mercedes-Benz",
  };
  if (labels[brand]) return labels[brand];
  return String(brand)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function populateSelect(select, options, allLabel) {
  if (!select) return;
  const currentValue = select.value || "all";
  select.innerHTML = [`<option value="all">${allLabel}</option>`, ...options.map(([value, label]) => `<option value="${value}">${label}</option>`)].join("");
  select.value = options.some(([value]) => value === currentValue) ? currentValue : "all";
}

async function readPriceRecords() {
  try {
    const response = await fetch("./data/latest-deals.json", { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload.records) ? payload.records : [];
  } catch {
    return [];
  }
}

function populatePriceFilters() {
  const cityOptions = Array.from(new Map(priceRecords.map((record) => [`${record.city}|${record.state}`, `${record.city}, ${record.state}`]))).sort((a, b) => a[1].localeCompare(b[1]));
  const brandOptions = Array.from(new Map(priceRecords.map((record) => [record.brand, brandLabel(record.brand)]))).sort((a, b) => a[1].localeCompare(b[1]));
  const selectedBrand = priceBrandFilter?.value || "all";
  const scopedRecords = selectedBrand === "all" ? priceRecords : priceRecords.filter((record) => record.brand === selectedBrand);
  const modelOptions = Array.from(new Map(scopedRecords.map((record) => [record.model, record.modelName]))).sort((a, b) => a[1].localeCompare(b[1]));

  populateSelect(priceCityFilter, cityOptions, "All Cities");
  populateSelect(priceBrandFilter, brandOptions, "All Brands");
  populateSelect(priceModelFilter, modelOptions, "All Models");
}

function filteredPriceRecords() {
  const selectedCity = priceCityFilter?.value || "all";
  const selectedBrand = priceBrandFilter?.value || "all";
  const selectedModel = priceModelFilter?.value || "all";

  return priceRecords.filter((record) => {
    const cityKey = `${record.city}|${record.state}`;
    return (selectedCity === "all" || cityKey === selectedCity) && (selectedBrand === "all" || record.brand === selectedBrand) && (selectedModel === "all" || record.model === selectedModel);
  });
}

function evidenceLabel(record) {
  if (record.sourceType === "masked_receipt" && record.verification === "verified") return "Masked receipt verified";
  if (record.sourceType === "masked_receipt") return "Masked receipt pending review";
  return "Public price signal";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderPriceSearchResults() {
  if (!priceResultList) return;
  const visibleRecords = filteredPriceRecords();
  const sample = visibleRecords.length ? visibleRecords : priceRecords.slice(0, 8);
  const vehiclePrices = sample.map((record) => record.vehiclePrice);
  const outTheDoorPrices = sample.map((record) => record.outTheDoorPrice);
  const lowest = Math.min(...vehiclePrices);

  setText("summary-low", formatUsd(lowest));
  setText("summary-mid", formatUsd(median(vehiclePrices)));
  setText("summary-otd", formatUsd(average(outTheDoorPrices)));
  setText("summary-low-note", `Lowest selling price from ${sample.length} samples`);
  setText("summary-mid-note", "Median selling price for the current filter");
  setText("summary-otd-note", "Average out-the-door price with taxes and required fees");

  if (!visibleRecords.length) {
    priceResultList.innerHTML = `
      <article class="deal-row empty-result">
        <div>
          <span class="make">No Matches</span>
          <h3>No samples match this city, brand and model yet</h3>
          <p>The summary is based on all available samples. Try a broader city or model filter.</p>
        </div>
      </article>
    `;
    return;
  }

  priceResultList.innerHTML = visibleRecords
    .slice(0, 24)
    .map((record) => {
      const delta = record.vehiclePrice - record.msrp;
      const isLower = delta <= 0;
      const deltaText = isLower ? `Below MSRP ${formatUsd(Math.abs(delta))}` : `Above MSRP ${formatUsd(delta)}`;
      return `
        <article class="deal-row">
          <div>
            <span class="make">${brandLabel(record.brand)}</span>
            <h3>${record.modelName} ${record.trim}</h3>
            <p>${record.city}, ${record.state} · ${record.purchaseDate} · ${evidenceLabel(record)}</p>
          </div>
          <strong>${formatUsd(record.vehiclePrice)}</strong>
          <span class="delta ${isLower ? "down" : "up"}">${deltaText}</span>
        </article>
      `;
    })
    .join("");
}

async function initPriceSearch() {
  if (!priceResultList) return;
  priceRecords = await readPriceRecords();
  populatePriceFilters();
  renderPriceSearchResults();

  priceBrandFilter?.addEventListener("change", () => {
    populatePriceFilters();
    renderPriceSearchResults();
  });
  priceCityFilter?.addEventListener("change", renderPriceSearchResults);
  priceModelFilter?.addEventListener("change", renderPriceSearchResults);
  filterButton?.addEventListener("click", renderPriceSearchResults);
}

initPriceSearch();
