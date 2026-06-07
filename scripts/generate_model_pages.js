const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const siteBase = "https://www.autoleledger.com";

const brandNames = {
  toyota: "Toyota",
  ford: "Ford",
  chevrolet: "Chevrolet",
  honda: "Honda",
  hyundai: "Hyundai",
  nissan: "Nissan",
  kia: "Kia",
  subaru: "Subaru",
  tesla: "Tesla",
  bmw: "BMW",
  mercedes: "Mercedes-Benz",
  lexus: "Lexus",
};

function toSlug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function loadCatalogFromHomeScript() {
  const source = fs.readFileSync(path.join(root, "script.js"), "utf8");
  const sandbox = {
    console,
    localStorage: { getItem: () => "[]", setItem: () => {} },
    document: { querySelector: () => null, querySelectorAll: () => [] },
    fetch: async () => ({ ok: false, json: async () => ({ records: [] }) }),
    URLSearchParams,
    Date,
  };
  vm.createContext(sandbox);
  vm.runInContext(`${source}\n;globalThis.__brandSeries = brandSeries;`, sandbox);
  return sandbox.__brandSeries;
}

function modelIdFromName(name) {
  return toSlug(name.replace(/^[A-Za-z-]+\s*/, "")) || toSlug(name);
}

function cleanPrice(value) {
  return String(value || "").replace(/\s*owner paid\s*$/i, "").trim();
}


function parsePriceRange(value) {
  const numbers = String(value || "")
    .match(/\$?[\d,]+/g)
    ?.map((item) => Number(item.replace(/[$,]/g, "")))
    .filter(Number.isFinite);
  return {
    low: numbers?.[0] || 0,
    high: numbers?.[1] || numbers?.[0] || 0,
  };
}

function modelJson(brand, model) {
  const [name, badge, price, cases, score] = model;
  return {
    brand,
    model: modelIdFromName(name),
    name,
    badge,
    price: cleanPrice(price),
    cases,
    score,
    pricePath: "./price.html",
    configPath: "./config.html",
  };
}

function modelSegment(badge) {
  const text = String(badge || "").toLowerCase();
  if (text.includes("pickup")) return "pickup truck";
  if (text.includes("electric")) return "electric car";
  if (text.includes("hybrid")) return "hybrid car";
  if (text.includes("luxury")) return "luxury car";
  if (text.includes("suv")) return "SUV";
  if (text.includes("sedan")) return "sedan";
  if (text.includes("minivan")) return "minivan";
  return "car";
}


function seoForModel(data, brandName) {
  const segment = modelSegment(data.badge);
  const year = "2026";
  const longTailKeywords = [
    `${year} ${data.name} out the door price`,
    `${data.name} OTD price`,
    `${data.name} owner paid price`,
    `${data.name} prices paid`,
    `${data.name} dealer quote by city`,
    `${data.name} trim price`,
    `${data.name} MSRP vs dealer quote`,
    `${data.name} real transaction price`,
    `${brandName} ${segment} out the door price`,
  ];
  return {
    year,
    segment,
    longTailKeywords,
    priceTitle: `${year} ${data.name} real owner paid prices | OTD Price, Dealer Quote, MSRP | AutoLedger`,
    priceDescription: `Compare ${year} ${data.name} real owner paid prices in the US, including selling price, out-the-door price, dealer quote, MSRP, trim and city samples.`,
    priceH1: `${year} ${data.name} real owner paid prices`,
    priceSlogan: `Before buying a ${data.name}, compare selling price, out-the-door price, dealer quote, MSRP and same-trim owner paid samples in one place.`,
    configTitle: `${year} ${data.name} trim specs and real owner paid prices | MSRP, Dealer Quote, OTD | AutoLedger`,
    configDescription: `Compare ${year} ${data.name} trims by specs, MSRP, dealer quote and real owner paid prices before choosing a configuration in the US market.`,
    configH1: `${year} ${data.name} trim specs and real owner paid prices`,
    configSlogan: `Compare trim differences and real price gaps to decide which ${data.name} configuration is worth buying.`,
    keywords: [
      `${data.name} real price paid`,
      `${data.name} owner paid price`,
      `${data.name} out the door price`,
      `${data.name} dealer quote`,
      ...longTailKeywords,
    ].join(", "),
  };
}


function jsonLdScript(items) {
  return items
    .map(
      (item) => `    <script type="application/ld+json">
${JSON.stringify(item, null, 2)}
    </script>`,
    )
    .join("\n");
}

function breadcrumbJsonLd({ brand, brandName, data, currentName, currentUrl }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AutoLedger", item: `${siteBase}/` },
      { "@type": "ListItem", position: 2, name: `${brandName} real owner prices`, item: `${siteBase}/cars/${brand}/index.html` },
      { "@type": "ListItem", position: 3, name: data.name, item: `${siteBase}/cars/${brand}/${data.model}/price.html` },
      { "@type": "ListItem", position: 4, name: currentName, item: currentUrl },
    ],
  };
}

function priceJsonLd({ brand, brandName, data, seo, canonical }) {
  const range = parsePriceRange(data.price);
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: seo.priceTitle,
      description: seo.priceDescription,
      url: canonical,
      inLanguage: "en-US",
      about: `${seo.year} ${data.name} real owner paid price, OTD price, dealer quote and MSRP`,
      keywords: seo.keywords,
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${seo.year} ${data.name}`,
      brand: { "@type": "Brand", name: brandName },
      category: seo.segment,
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: range.low || undefined,
        highPrice: range.high || undefined,
        offerCount: data.cases,
        availability: "https://schema.org/InStock",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: priceFaqItems(data, seo).map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    breadcrumbJsonLd({ brand, brandName, data, currentName: `${data.name} owner paid price`, currentUrl: canonical }),
  ];
}

function configJsonLd({ brand, brandName, data, seo, canonical }) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: seo.configTitle,
      description: seo.configDescription,
      url: canonical,
      inLanguage: "en-US",
      about: `${seo.year} ${data.name} trims, configuration, MSRP and real owner transaction price`,
      keywords: seo.keywords,
    },
    breadcrumbJsonLd({ brand, brandName, data, currentName: `${data.name} configuration and real price`, currentUrl: canonical }),
  ];
}

function priceFaqItems(data, seo) {
  return [
    {
      q: `What is the ${seo.year} ${data.name} out the door price?`,
      a: `AutoLedger tracks ${seo.year} ${data.name} out the door price examples by city, trim and purchase month, including vehicle price, estimated taxes and fees, and dealer quote references.`,
    },
    {
      q: `How do I compare ${data.name} MSRP vs dealer quote?`,
      a: `Use the price trend chart to compare ${data.name} MSRP, recent owner paid price and dealer quote for the selected trim before negotiating.`,
    },
    {
      q: `Where can I find ${data.name} owner paid price by city?`,
      a: `The city tabs show ${data.name} owner paid price samples for major US cities so buyers can compare local market prices instead of relying only on national MSRP.`,
    },
  ];
}

function priceFaqSection(data, seo) {
  const items = priceFaqItems(data, seo)
    .map(
      ({ q, a }) => `
          <article>
            <strong>${q}</strong>
            <p>${a}</p>
          </article>`,
    )
    .join("");
  return `
      <section class="seo-faq-section" aria-label="${data.name} price FAQ">
        <h2 class="sr-only">${data.name} OTD price, owner paid price and dealer quote FAQ</h2>
        <details class="seo-faq-disclosure">
          <summary>${data.name} price reference notes</summary>
          <div class="seo-faq-grid">
${items}
          </div>
        </details>
      </section>`;
}


function pageDataScript(data) {
  return `<script>
      window.AUTOLEDGER_MODEL_PAGE = ${JSON.stringify(data)};
      window.AUTOLEDGER_DATA_PATH = "../../../data/latest-deals.json";
    </script>`;
}

function sharedHead({ title, description, canonical, keywords }) {
  return `    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${description}" />
    ${keywords ? `<meta name="keywords" content="${keywords}" />` : ""}
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <link rel="canonical" href="${canonical}" />
    <title>${title}</title>
    <link rel="icon" href="../../../assets/favicon.ico" sizes="any" />
    <link rel="icon" href="../../../assets/autoleledger-mark.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="../../../styles.css" />`;
}

function header(active, brandName) {
  return `    <header class="site-header">
      <a class="brand" href="../../../index.html#catalog" aria-label="AutoLedger home">
        <img class="brand-mark" src="../../../assets/autoleledger-mark.svg" alt="" />
        <span>AutoLedger</span>
      </a>
      <nav class="nav-links" aria-label="Main navigation">
        <a href="../../../index.html#catalog">Popular Brands</a>
        <a class="${active === "price" ? "active" : ""}" id="price-page-link" href="./price.html">Owner Prices</a>
        <a class="${active === "config" ? "active" : ""}" id="config-page-link" href="./config.html">Specs</a>
      </nav>
      <a class="header-action" href="../../../deals.html">${brandName} Price Search</a>
    </header>`;
}


function pricePage({ brand, brandName, model }) {
  const data = modelJson(brand, model);
  const seo = seoForModel(data, brandName);
  const title = seo.priceTitle;
  const description = seo.priceDescription;
  const canonical = `${siteBase}/cars/${brand}/${data.model}/price.html`;

  return `<!doctype html>
<html lang="en-US">
  <head>
${sharedHead({ title, description, canonical, keywords: seo.keywords })}
${jsonLdScript(priceJsonLd({ brand, brandName, data, seo, canonical }))}
  </head>
  <body>
${header("price", brandName)}
    <main class="model-page model-price-page">
      <section class="model-hero compact-price-hero">
        <div>
          <span class="eyebrow">${brandName} ${seo.segment} owner paid price</span>
          <h1 id="model-title">${seo.priceH1}</h1>
          <p class="seo-slogan">${seo.priceSlogan}</p>
          <p class="seo-keywords-line">${data.name} real price paid ? ${data.name} owner paid price ? ${data.name} out-the-door price ? ${data.name} dealer quote ? US ${brandName} ${seo.segment} price reference</p>
        </div>
        <div class="hero-metrics" aria-label="Price overview">
          <div><strong id="sample-count">${data.cases}</strong><span>${data.name} owner samples</span></div>
          <div><strong id="score-value">${data.score}</strong><span>Price reference score</span></div>
        </div>
      </section>

      <section class="trim-selector-section">
        <div class="section-toolbar">
          <h2 class="sr-only">${seo.year} ${data.name} trims with owner paid prices</h2>
          <span class="module-kicker">${data.name} trims</span>
          <div class="year-tabs" id="year-tabs" role="tablist" aria-label="Choose model year"></div>
        </div>
        <div class="trim-options" id="trim-options" aria-label="Trim options"></div>
      </section>

      <section class="trend-section">
        <div class="section-toolbar">
          <h2 class="sr-only">${data.name} MSRP, 60-day owner paid price and dealer quote</h2>
          <span class="module-kicker">${data.name} price trend</span>
        </div>
        <div class="trend-summary" id="trend-summary"></div>
        <div class="price-line-chart">
          <canvas id="price-trend-chart" aria-label="Owner price trend chart"></canvas>
        </div>
      </section>

      <section class="owner-price-section">
        <div class="section-toolbar">
          <h2 class="sr-only">${data.name} all real owner paid price samples</h2>
          <span class="module-kicker">${data.name} owner paid prices</span>
        </div>
        <div class="city-tabs-row">
          <div class="city-tabs" id="city-tabs" aria-label="City filter"></div>
        </div>
        <div class="owner-price-list" id="owner-price-list"></div>
      </section>
${priceFaqSection(data, seo)}
    </main>
    ${pageDataScript(data)}
    <script src="../../../assets/vendor/chart.umd.min.js"></script>
    <script src="../../model.js?v=20260607-us-localized"></script>
  </body>
</html>
`;
}


function configPage({ brand, brandName, model }) {
  const data = modelJson(brand, model);
  const seo = seoForModel(data, brandName);
  const title = seo.configTitle;
  const description = seo.configDescription;
  const canonical = `${siteBase}/cars/${brand}/${data.model}/config.html`;

  return `<!doctype html>
<html lang="en-US">
  <head>
${sharedHead({ title, description, canonical, keywords: seo.keywords })}
${jsonLdScript(configJsonLd({ brand, brandName, data, seo, canonical }))}
  </head>
  <body>
${header("config", brandName)}
    <main class="model-page model-config-page">
      <section class="model-hero config-hero">
        <div>
          <span class="eyebrow">${brandName} ${seo.segment} specs and real prices</span>
          <h1 id="model-title">${seo.configH1}</h1>
          <p class="seo-slogan">${seo.configSlogan}</p>
          <p class="seo-keywords-line">${data.name} trim specs ? ${data.name} MSRP ? ${data.name} dealer quote ? ${data.name} real owner paid price</p>
        </div>
        <div class="hero-metrics" aria-label="Trim overview">
          <div><strong id="trim-count">0</strong><span>${data.name} available trims</span></div>
          <div><strong id="score-value">${data.score}</strong><span>Price reference score</span></div>
        </div>
      </section>

      <section class="config-compare-section">
        <div class="section-heading">
          <div>
            <span class="eyebrow">${data.name} specs</span>
            <h2>${seo.year} ${data.name} trim specs and price comparison</h2>
          </div>
          <div class="config-tools">
            <button type="button" class="ghost-button" id="hide-same-btn">Hide Same Items</button>
            <button type="button" class="ghost-button" id="highlight-diff-btn">Highlight Differences</button>
          </div>
        </div>
        <p class="scroll-hint">Scroll horizontally to compare every trim and spec.</p>
        <div class="config-table-wrap">
          <table class="config-table" id="config-table"></table>
        </div>
      </section>

      <section class="page-switch">
        <div>
          <span class="eyebrow">${data.name} owner prices</span>
          <h2>View ${data.name} real owner paid prices</h2>
          <p>Open the price page to compare selling price, out-the-door price and dealer quote samples by city, year and trim.</p>
        </div>
        <a href="./price.html">View Prices</a>
      </section>
    </main>
    ${pageDataScript(data)}
    <script src="../../model.js?v=20260607-us-localized"></script>
  </body>
</html>
`;
}


function brandIndexPage({ brand, brandName, models }) {
  const title = `${brandName} model directory and real owner paid prices | US car OTD price and dealer quote | AutoLedger`;
  const description = `Browse popular ${brandName} models in the US. Open each model to compare real owner paid prices, selling price, out-the-door price, dealer quote, city samples and trim specs.`;
  const canonical = `${siteBase}/cars/${brand}/`;
  const keywords = `${brandName} owner paid price, ${brandName} out the door price, ${brandName} OTD price, ${brandName} dealer quote, ${brandName} prices paid, ${brandName} model directory`;
  const cards = models
    .map((model) => {
      const data = modelJson(brand, model);
      return `
          <article class="model-card">
            <span>${data.cases} real owner samples</span>
            <h2>${data.name} real owner paid prices</h2>
            <p>${data.badge}. Owner paid reference range ${data.price}. Compare ${data.name} selling price, out-the-door price, dealer quote and trim specs.</p>
            <div class="source-links">
              <a href="./${data.model}/price.html">View Prices</a>
              <a href="./${data.model}/config.html">Specs</a>
            </div>
          </article>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <link rel="canonical" href="${canonical}" />
    <title>${title}</title>
    <link rel="icon" href="../../assets/favicon.ico" sizes="any" />
    <link rel="icon" href="../../assets/autoleledger-mark.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="../../styles.css" />
    <script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonical,
    inLanguage: "en-US",
    about: `${brandName} owner paid price, out-the-door price and dealer quote by model`,
    keywords,
  },
  null,
  2,
)}
    </script>
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="../../index.html#catalog" aria-label="AutoLedger home">
        <img class="brand-mark" src="../../assets/autoleledger-mark.svg" alt="" />
        <span>AutoLedger</span>
      </a>
      <nav class="nav-links" aria-label="Main navigation">
        <a href="../../index.html#catalog">Popular Brands</a>
        <a href="../../deals.html">Price Search</a>
        <a href="../../methodology.html">Methodology</a>
      </nav>
      <a class="header-action" href="../../index.html#catalog">Back Home</a>
    </header>
    <main class="content-page brand-directory-page">
      <h1>${brandName} model directory and real owner paid prices</h1>
      <p>Browse popular ${brandName} models sold in the US, then open a model to compare owner paid prices, selling price, out-the-door price, city samples and trim specs.</p>
      <section class="model-card-grid" aria-label="${brandName} models">
${cards}
      </section>
    </main>
    <footer class="site-footer"><span>AutoLedger</span><p>${brandName} owner prices and configuration pages.</p><a href="../../privacy.html">Privacy</a></footer>
  </body>
</html>
`;
}


function main() {
  const brandSeries = loadCatalogFromHomeScript();
  const sitemap = [
    `${siteBase}/`,
    `${siteBase}/deals.html`,
    `${siteBase}/methodology.html`,
    `${siteBase}/privacy.html`,
  ];
  let count = 0;

  Object.entries(brandSeries).forEach(([brand, brandRecord]) => {
    const models = Array.isArray(brandRecord) ? brandRecord : brandRecord.series || [];
    const brandName = brandNames[brand] || brand;
    const brandDir = path.join(root, "cars", brand);
    fs.mkdirSync(brandDir, { recursive: true });
    fs.writeFileSync(path.join(brandDir, "index.html"), brandIndexPage({ brand, brandName, models }), "utf8");
    sitemap.push(`${siteBase}/cars/${brand}/index.html`);

    models.forEach((model) => {
      const data = modelJson(brand, model);
      const dir = path.join(brandDir, data.model);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "price.html"), pricePage({ brand, brandName, model }), "utf8");
      fs.writeFileSync(path.join(dir, "config.html"), configPage({ brand, brandName, model }), "utf8");
      sitemap.push(`${siteBase}/cars/${brand}/${data.model}/price.html`);
      sitemap.push(`${siteBase}/cars/${brand}/${data.model}/config.html`);
      count += 2;
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap
  .map((loc) => `  <url><loc>${loc}</loc><changefreq>daily</changefreq><priority>${loc === siteBase + "/" ? "1.0" : "0.8"}</priority></url>`)
  .join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(root, "sitemap.xml"), xml, "utf8");
  console.log(`Generated ${count} model pages and sitemap.xml`);
}

main();
