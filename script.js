const filterButton = document.querySelector("#price-search-button");
const priceCityFilter = document.querySelector("#price-city-filter");
const priceBrandFilter = document.querySelector("#price-brand-filter");
const priceModelFilter = document.querySelector("#price-model-filter");
const priceResultList = document.querySelector("#price-result-list");
const brandTabs = document.querySelectorAll(".brand-logo-grid button");
const seriesGrid = document.querySelector(".series-grid");
const seriesCount = document.querySelector(".series-count");
const sortButtons = document.querySelectorAll(".sort-checks button");
let currentBrandKey = "toyota";
let currentSortKey = "hot";
let priceRecords = [];

const imageSet = {
  sedan: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/2023_Honda_Accord_LX%2C_front_left%2C_07-13-2023.jpg/960px-2023_Honda_Accord_LX%2C_front_left%2C_07-13-2023.jpg",
  whiteSedan: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/2025_Toyota_Camry_Hybrid_XSE_AWD_%28United_States%29_front_view.png/960px-2025_Toyota_Camry_Hybrid_XSE_AWD_%28United_States%29_front_view.png",
  suv: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Toyota_Highlander_Hybrid_%28XU70%29_1X7A6356.jpg/960px-Toyota_Highlander_Hybrid_%28XU70%29_1X7A6356.jpg",
  truck: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/2018_Ford_F-150_XLT_Crew_Cab%2C_front_11.10.19.jpg/960px-2018_Ford_F-150_XLT_Crew_Cab%2C_front_11.10.19.jpg",
  ev: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Tesla_Model_Y_Premium_%28Facelift%29_%E2%80%93_f_05052026.jpg/960px-Tesla_Model_Y_Premium_%28Facelift%29_%E2%80%93_f_05052026.jpg",
  luxury: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Mercedes-Benz_X254_1X7A6343.jpg/960px-Mercedes-Benz_X254_1X7A6343.jpg",
};

function commonsFilePath(fileName) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=900`;
}

const verifiedModelImages = {
  "Toyota Camry": "https://upload.wikimedia.org/wikipedia/commons/1/12/2025_Toyota_Camry_Hybrid_XSE_AWD_%28United_States%29_front_view.png",
  "Toyota RAV4": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Toyota_RAV4_XLE_%28facelift%29_%28front%29.jpg/960px-Toyota_RAV4_XLE_%28facelift%29_%28front%29.jpg",
  "Toyota Corolla": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg/960px-Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg",
  "Toyota Tacoma": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Toyota_Tacoma_%28N300%29_TRD_1X7A2438.jpg/960px-Toyota_Tacoma_%28N300%29_TRD_1X7A2438.jpg",
  "Toyota Highlander": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Toyota_Highlander_Hybrid_%28XU70%29_1X7A6356.jpg/960px-Toyota_Highlander_Hybrid_%28XU70%29_1X7A6356.jpg",
  "Toyota Prius": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Toyota_Prius_2.0_HEV_Limited_%28V%29_%E2%80%93_f_18112022.jpg/960px-Toyota_Prius_2.0_HEV_Limited_%28V%29_%E2%80%93_f_18112022.jpg",
  "Toyota Sienna": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/2021_Toyota_Sienna_XLE_Hybrid%2C_front_12.21.21.jpg/960px-2021_Toyota_Sienna_XLE_Hybrid%2C_front_12.21.21.jpg",
  "Toyota 4Runner": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2025_Toyota_4Runner_TRD_Sport_in_Wind_Chill_Pearl%2C_front_right%2C_2025-05-18.jpg/960px-2025_Toyota_4Runner_TRD_Sport_in_Wind_Chill_Pearl%2C_front_right%2C_2025-05-18.jpg",
  "Toyota Tundra": commonsFilePath("2022 Toyota Tundra Limited CrewMax 4x4, front 6.11.22.jpg"),
  "Toyota Crown": commonsFilePath("2023 Toyota Crown Platinum in Heavy Metal, front right, 07-16-2023.jpg"),
  "Toyota Grand Highlander": commonsFilePath("2024 Toyota Grand Highlander Limited, front 5.28.23.jpg"),
  "Toyota bZ4X": commonsFilePath("Toyota bZ4X 1X7A0384.jpg"),
  "Ford F-150": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/2018_Ford_F-150_XLT_Crew_Cab%2C_front_11.10.19.jpg/960px-2018_Ford_F-150_XLT_Crew_Cab%2C_front_11.10.19.jpg",
  "Ford Explorer": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Ford_Explorer_%28sixth_generation%29_IMG_6063.jpg/960px-Ford_Explorer_%28sixth_generation%29_IMG_6063.jpg",
  "Ford Escape": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/2021_Ford_Escape_Hybrid_SEL_AWD_in_Oxford_White%2C_front_left.jpg/960px-2021_Ford_Escape_Hybrid_SEL_AWD_in_Oxford_White%2C_front_left.jpg",
  "Ford Mustang Mach-E": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/2021_Ford_Mustang_Mach-E_Standard_Range_Front.jpg/960px-2021_Ford_Mustang_Mach-E_Standard_Range_Front.jpg",
  "Ford Bronco": commonsFilePath("2021 Ford Bronco Badlands 4-door, front 4.17.22.jpg"),
  "Ford Maverick": commonsFilePath("2022 Ford Maverick XLT Hybrid, front 6.19.22.jpg"),
  "Ford Mustang": commonsFilePath("2024 Ford Mustang GT, front 6.19.23.jpg"),
  "Ford Expedition": commonsFilePath("2022 Ford Expedition Limited, front 3.13.22.jpg"),
  "Chevrolet Silverado": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/2022_Chevrolet_Silverado_2500HD_High_Country%2C_Front_Left%2C_11-21-2021.jpg/960px-2022_Chevrolet_Silverado_2500HD_High_Country%2C_Front_Left%2C_11-21-2021.jpg",
  "Chevrolet Equinox": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Chevrolet_Equinox_LT_%28III%2C_Facelift%29_%E2%80%93_f_05102022.jpg/960px-Chevrolet_Equinox_LT_%28III%2C_Facelift%29_%E2%80%93_f_05102022.jpg",
  "Chevrolet Tahoe": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/2022_Chevrolet_Tahoe_RST%2C_front_3.7.22.jpg/960px-2022_Chevrolet_Tahoe_RST%2C_front_3.7.22.jpg",
  "Chevrolet Trax": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/2024_Chevrolet_Trax_2RS%2C_front_left%2C_12-10-2023.jpg/960px-2024_Chevrolet_Trax_2RS%2C_front_left%2C_12-10-2023.jpg",
  "Chevrolet Traverse": commonsFilePath("2024 Chevrolet Traverse RS, front 4.7.24.jpg"),
  "Chevrolet Colorado": commonsFilePath("2023 Chevrolet Colorado Z71, front 4.7.24.jpg"),
  "Chevrolet Malibu": commonsFilePath("2019 Chevrolet Malibu LT, front 9.23.18.jpg"),
  "Chevrolet Blazer EV": commonsFilePath("2024 Chevrolet Blazer EV RS, front 7.16.23.jpg"),
  "Honda CR-V": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Honda_CR-V_e-HEV_Elegance_AWD_%28VI%29_%E2%80%93_f_14072024.jpg/960px-Honda_CR-V_e-HEV_Elegance_AWD_%28VI%29_%E2%80%93_f_14072024.jpg",
  "Honda Accord": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/2023_Honda_Accord_LX%2C_front_left%2C_07-13-2023.jpg/960px-2023_Honda_Accord_LX%2C_front_left%2C_07-13-2023.jpg",
  "Honda Civic": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Honda_Civic_e-HEV_Sport_%28XI%29_%E2%80%93_f_30062024.jpg/960px-Honda_Civic_e-HEV_Sport_%28XI%29_%E2%80%93_f_30062024.jpg",
  "Honda Pilot": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/2023_Honda_Pilot_Touring_in_Radiant_Red%2C_front_left.jpg/960px-2023_Honda_Pilot_Touring_in_Radiant_Red%2C_front_left.jpg",
  "Honda Odyssey": commonsFilePath("2021 Honda Odyssey Elite, front 11.26.21.jpg"),
  "Honda HR-V": commonsFilePath("2023 Honda HR-V EX-L AWD, front 9.18.22.jpg"),
  "Honda Passport": commonsFilePath("2022 Honda Passport TrailSport, front 4.17.22.jpg"),
  "Honda Ridgeline": commonsFilePath("2021 Honda Ridgeline RTL-E, front 6.5.21.jpg"),
  "Hyundai Tucson": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/2022_Hyundai_Tucson_Preferred%2C_Front_Right%2C_05-24-2021.jpg/960px-2022_Hyundai_Tucson_Preferred%2C_Front_Right%2C_05-24-2021.jpg",
  "Hyundai Santa Fe": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/2024_Hyundai_Santa_Fe_Luxury_AWD_in_Hampton_Grey%2C_front_left%2C_2024-06-30.jpg/960px-2024_Hyundai_Santa_Fe_Luxury_AWD_in_Hampton_Grey%2C_front_left%2C_2024-06-30.jpg",
  "Hyundai Elantra": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2023_Hyundai_Elantra_Limited_in_Silver%2C_front_left%2C_04-04-2026.jpg/960px-2023_Hyundai_Elantra_Limited_in_Silver%2C_front_left%2C_04-04-2026.jpg",
  "Hyundai Ioniq 5": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Hyundai_Ioniq_5_AWD_Techniq-Paket_%E2%80%93_f_31122024.jpg/960px-Hyundai_Ioniq_5_AWD_Techniq-Paket_%E2%80%93_f_31122024.jpg",
  "Hyundai Palisade": commonsFilePath("2023 Hyundai Palisade Calligraphy, front 8.28.22.jpg"),
  "Hyundai Sonata": commonsFilePath("2024 Hyundai Sonata N Line, front 3.17.24.jpg"),
  "Hyundai Santa Cruz": commonsFilePath("2022 Hyundai Santa Cruz SEL Premium, front 9.4.21.jpg"),
  "Hyundai Kona": commonsFilePath("2024 Hyundai Kona Limited, front 6.17.23.jpg"),
  "Nissan Rogue": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/2023_Nissan_Rogue_SV_in_Super_Black%2C_front_left.jpg/960px-2023_Nissan_Rogue_SV_in_Super_Black%2C_front_left.jpg",
  "Nissan Sentra": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/2024_Nissan_Sentra_%28B18%29_DSC_3754.jpg/960px-2024_Nissan_Sentra_%28B18%29_DSC_3754.jpg",
  "Nissan Altima": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/2024_Nissan_Altima_SR%2C_front_left%2C_05-05-2025.jpg/960px-2024_Nissan_Altima_SR%2C_front_left%2C_05-05-2025.jpg",
  "Nissan Frontier": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/2021_Nissan_Frontier_Pro_4X_%28Colombia%3B_facelift%29_front_view_01.png/960px-2021_Nissan_Frontier_Pro_4X_%28Colombia%3B_facelift%29_front_view_01.png",
  "Nissan Pathfinder": commonsFilePath("2022 Nissan Pathfinder Platinum 4WD, front 9.4.21.jpg"),
  "Nissan Kicks": commonsFilePath("2021 Nissan Kicks SR, front 3.15.21.jpg"),
  "Nissan Armada": commonsFilePath("2021 Nissan Armada Platinum, front 5.31.21.jpg"),
  "Nissan Ariya": commonsFilePath("2023 Nissan Ariya Evolve+ e-4ORCE, front 8.20.23.jpg"),
  "Kia Sportage": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/2025_Kia_Sportage_S_front_only.jpg/960px-2025_Kia_Sportage_S_front_only.jpg",
  "Kia Telluride": commonsFilePath("2022 Kia Telluride EX (facelift), front 4.16.23.jpg"),
  "Kia K5": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/2022_Kia_K5_GT-Line_in_Pacific_Blue%2C_Front_Left%2C_09-05-2022.jpg/960px-2022_Kia_K5_GT-Line_in_Pacific_Blue%2C_Front_Left%2C_09-05-2022.jpg",
  "Kia EV6": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/2021_Kia_EV6_GT-Line_S.jpg/960px-2021_Kia_EV6_GT-Line_S.jpg",
  "Kia Sorento": commonsFilePath("2021 Kia Sorento SX Prestige X-Line, front 3.14.21.jpg"),
  "Kia Carnival": commonsFilePath("2022 Kia Carnival SX Prestige, front 4.18.21.jpg"),
  "Kia Niro": commonsFilePath("2023 Kia Niro SX HEV, front 2.4.23.jpg"),
  "Kia Seltos": commonsFilePath("2021 Kia Seltos SX Turbo AWD, front 9.26.20.jpg"),
  "Subaru Outback": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/2023_Subaru_Outback_Premium%2C_front_right%2C_09-09-2023.jpg/960px-2023_Subaru_Outback_Premium%2C_front_right%2C_09-09-2023.jpg",
  "Subaru Forester": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Subaru_Forester_%28SL%29_e-BOXER_DSC_8811.jpg/960px-Subaru_Forester_%28SL%29_e-BOXER_DSC_8811.jpg",
  "Subaru Crosstrek": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Subaru_Crosstrek_2.0ie_Active_%28III%29_%E2%80%93_f_31052025.jpg/960px-Subaru_Crosstrek_2.0ie_Active_%28III%29_%E2%80%93_f_31052025.jpg",
  "Subaru Impreza": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Subaru_Impreza_%28GU%29_Automesse_Ludwigsburg_2024_IMG_1593.jpg/960px-Subaru_Impreza_%28GU%29_Automesse_Ludwigsburg_2024_IMG_1593.jpg",
  "Subaru Ascent": commonsFilePath("2023 Subaru Ascent Onyx Edition, front 8.7.22.jpg"),
  "Subaru Legacy": commonsFilePath("2020 Subaru Legacy Limited, front 8.25.19.jpg"),
  "Subaru WRX": commonsFilePath("2022 Subaru WRX GT, front 4.24.22.jpg"),
  "Tesla Model Y": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Tesla_Model_Y_Premium_%28Facelift%29_%E2%80%93_f_05052026.jpg/960px-Tesla_Model_Y_Premium_%28Facelift%29_%E2%80%93_f_05052026.jpg",
  "Tesla Model 3": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg/960px-Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg",
  "Tesla Model X": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/2017_Tesla_Model_X_100D_Front.jpg/960px-2017_Tesla_Model_X_100D_Front.jpg",
  "Tesla Cybertruck": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/2024_Tesla_Cybertruck_Foundation_Series%2C_front_left_%28Greenwich%29.jpg/960px-2024_Tesla_Cybertruck_Foundation_Series%2C_front_left_%28Greenwich%29.jpg",
  "Tesla Model S": commonsFilePath("Tesla Model S Plaid IMG 5202.jpg"),
  "BMW X5": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2019_BMW_X5_M50d_Automatic_3.0.jpg/960px-2019_BMW_X5_M50d_Automatic_3.0.jpg",
  "BMW 3 Series": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/BMW_G20_%282022%29_IMG_7316_%282%29.jpg/960px-BMW_G20_%282022%29_IMG_7316_%282%29.jpg",
  "BMW X3": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/BMW_G45_20_IMG_3794.jpg/960px-BMW_G45_20_IMG_3794.jpg",
  "BMW i4": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/BMW_i4_IMG_6695.jpg/960px-BMW_i4_IMG_6695.jpg",
  "BMW X7": commonsFilePath("BMW X7 xDrive40i (G07) IMG 3914.jpg"),
  "BMW 5 Series": commonsFilePath("BMW G60 520d IMG 9621.jpg"),
  "BMW iX": commonsFilePath("BMW iX xDrive50 IMG 4882.jpg"),
  "Mercedes-Benz GLC": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Mercedes-Benz_X254_1X7A6343.jpg/960px-Mercedes-Benz_X254_1X7A6343.jpg",
  "Mercedes-Benz C-Class": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Mercedes-Benz_W206_IMG_6380.jpg/960px-Mercedes-Benz_W206_IMG_6380.jpg",
  "Mercedes-Benz GLE": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Mercedes-Benz_GLE_350_d_4MATIC_AMG_Line_%28V_167%29_%E2%80%93_f_18042021.jpg/960px-Mercedes-Benz_GLE_350_d_4MATIC_AMG_Line_%28V_167%29_%E2%80%93_f_18042021.jpg",
  "Mercedes-Benz EQE": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Mercedes-Benz_V295_350%2B_Classic-Days_2022_DSC_0018.jpg/960px-Mercedes-Benz_V295_350%2B_Classic-Days_2022_DSC_0018.jpg",
  "Mercedes-Benz E-Class": commonsFilePath("Mercedes-Benz W214 IMG 8716.jpg"),
  "Mercedes-Benz GLS": commonsFilePath("Mercedes-Benz X167 IMG 4048.jpg"),
  "Mercedes-Benz GLA": commonsFilePath("Mercedes-Benz H247 IMG 6908.jpg"),
  "Lexus RX": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Lexus_RX_500h_F_SPORT%2B_%28V%29_%E2%80%93_f_14072024.jpg/960px-Lexus_RX_500h_F_SPORT%2B_%28V%29_%E2%80%93_f_14072024.jpg",
  "Lexus NX": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/2023_Lexus_NX_450h%2C_front_4.5.23.jpg/960px-2023_Lexus_NX_450h%2C_front_4.5.23.jpg",
  "Lexus ES": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Lexus_ES_350_%28GSZ10%29_IMG_4332.jpg/960px-Lexus_ES_350_%28GSZ10%29_IMG_4332.jpg",
  "Lexus TX": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/2024_Lexus_TX350_in_Wind_Chill_Pearl%2C_front_right.jpg/960px-2024_Lexus_TX350_in_Wind_Chill_Pearl%2C_front_right.jpg",
  "Lexus GX": commonsFilePath("2024 Lexus GX 550 Premium in Eminent White Pearl, front 4.20.24.jpg"),
  "Lexus IS": commonsFilePath("2021 Lexus IS 350 F Sport, front 2.14.21.jpg"),
  "Lexus RZ": commonsFilePath("2023 Lexus RZ 450e Luxury, front 5.6.23.jpg"),
};

const wikipediaTitleOverrides = {
  "Ford F-150": "Ford F-Series",
  "Ford Maverick": "Ford Maverick (2022)",
  "Honda HR-V": "Honda HR-V",
  "Hyundai Ioniq 5": "Hyundai Ioniq 5",
  "BMW 3 Series": "BMW 3 Series",
  "BMW 5 Series": "BMW 5 Series",
  "Mercedes-Benz C-Class": "Mercedes-Benz C-Class",
  "Mercedes-Benz E-Class": "Mercedes-Benz E-Class",
};

const modelImageCacheKey = "autoleledger_model_images_v2";
let modelImageCache = {};

try {
  modelImageCache = JSON.parse(localStorage.getItem(modelImageCacheKey) || "{}");
} catch {
  modelImageCache = {};
}

function modelPlaceholder(name) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 506">
      <rect width="900" height="506" fill="#eef5ff"/>
      <rect x="72" y="314" width="756" height="66" rx="33" fill="#0757c8" opacity=".12"/>
      <path d="M210 310h480l-58-92c-18-29-46-46-80-46H354c-34 0-64 17-82 46l-62 92Z" fill="#ffffff" stroke="#0757c8" stroke-width="10"/>
      <path d="M335 200h210c22 0 42 10 54 29l30 47H278l34-50c6-9 14-17 23-26Z" fill="#dcecff"/>
      <circle cx="303" cy="380" r="50" fill="#0a1224"/>
      <circle cx="303" cy="380" r="22" fill="#ffffff"/>
      <circle cx="602" cy="380" r="50" fill="#0a1224"/>
      <circle cx="602" cy="380" r="22" fill="#ffffff"/>
      <text x="450" y="92" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800" fill="#0a1224">${name}</text>
      <text x="450" y="140" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#5e6a7f">Vehicle image pending review</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function modelImageInitial(name, fallbackImage = "") {
  return verifiedModelImages[name] || modelImageCache[name] || fallbackImage || modelPlaceholder(name);
}

function wikiTitleForModel(name) {
  return wikipediaTitleOverrides[name] || name;
}

function cacheModelImage(name, url) {
  if (!url || url.includes("Wikimedia-logo")) return;
  modelImageCache[name] = url;
  try {
    localStorage.setItem(modelImageCacheKey, JSON.stringify(modelImageCache));
  } catch {
    // File previews can block storage; the image still renders in the current session.
  }
}

async function fetchWikipediaModelImage(name) {
  const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitleForModel(name))}`;
  try {
    const response = await fetch(endpoint, { cache: "force-cache" });
    if (!response.ok) return "";
    const payload = await response.json();
    const source = payload?.thumbnail?.source || payload?.originalimage?.source || "";
    return source.replace(/\/\d+px-/u, "/960px-");
  } catch {
    return "";
  }
}

function applyModelImage(name, url) {
  document.querySelectorAll("img[data-model-name]").forEach((img) => {
    if (img.dataset.modelName === name && url && img.src !== url) {
      img.src = url;
      img.classList.remove("is-placeholder");
    }
  });
}

async function hydrateModelImage(name) {
  if (verifiedModelImages[name] || modelImageCache[name]) return;
  const url = await fetchWikipediaModelImage(name);
  if (!url) return;
  cacheModelImage(name, url);
  applyModelImage(name, url);
}

function hydrateSeriesImages(names) {
  Array.from(new Set(names)).forEach((name) => {
    if (!verifiedModelImages[name] && !modelImageCache[name]) {
      hydrateModelImage(name);
    }
  });
}

function handleModelImageError(img) {
  const name = img.dataset.modelName;
  if (!name) return;
  if (modelImageCache[name] && img.src !== modelImageCache[name]) {
    img.src = modelImageCache[name];
    return;
  }
  const fallbackImage = img.dataset.fallbackImage;
  img.src = fallbackImage || modelPlaceholder(name);
  img.classList.toggle("is-placeholder", !fallbackImage);
  hydrateModelImage(name);
}

const brandSeries = {
  toyota: {
    count: 45,
    series: [
      ["Toyota Camry", "Midsize sedan owner paid samples", "$31,860-$41,520 owner paid", 126, "4.3", imageSet.sedan],
      ["Toyota RAV4", "Compact SUV owner paid samples", "$34,200-$46,880 owner paid", 118, "4.4", imageSet.suv],
      ["Toyota Corolla", "Compact sedan owner paid samples", "$24,900-$31,600 owner paid", 92, "4.2", imageSet.whiteSedan],
      ["Toyota Tacoma", "Pickup owner paid samples", "$38,500-$55,900 owner paid", 86, "4.5", imageSet.truck],
      ["Toyota Highlander", "Three-row SUV owner paid samples", "$43,900-$58,400 owner paid", 64, "4.1", imageSet.suv],
      ["Toyota Prius", "Hybrid owner paid samples", "$31,200-$39,500 owner paid", 58, "4.4", imageSet.ev],
      ["Toyota Sienna", "Minivan owner paid samples", "$45,600-$62,300 owner paid", 42, "4.3", imageSet.suv],
      ["Toyota 4Runner", "SUV owner paid samples", "$48,700-$63,900 owner paid", 39, "4.0", imageSet.suv],
      ["Toyota Tundra", "Pickup owner paid samples", "$52,900-$76,400 owner paid", 36, "4.1", imageSet.truck],
      ["Toyota Crown", "Sedan owner paid samples", "$43,700-$55,800 owner paid", 31, "4.0", imageSet.sedan],
      ["Toyota Grand Highlander", "Three-row SUV owner paid samples", "$49,600-$66,900 owner paid", 28, "4.2", imageSet.suv],
      ["Toyota bZ4X", "Electric SUV owner paid samples", "$41,900-$53,200 owner paid", 22, "3.9", imageSet.ev],
    ],
  },
  ford: {
    count: 38,
    series: [
      ["Ford F-150", "Pickup owner paid samples", "$47,800-$76,900 owner paid", 142, "4.5", imageSet.truck],
      ["Ford Explorer", "Three-row SUV owner paid samples", "$42,300-$59,800 owner paid", 82, "4.1", imageSet.suv],
      ["Ford Escape", "Luxury sedan owner paid samples", "$31,700-$43,200 owner paid", 67, "4.0", imageSet.suv],
      ["Ford Mustang Mach-E", "Electric SUV owner paid samples", "$43,900-$62,500 owner paid", 51, "4.2", imageSet.ev],
      ["Ford Bronco", "SUV owner paid samples", "$41,800-$67,900 owner paid", 48, "4.3", imageSet.suv],
      ["Ford Maverick", "Pickup owner paid samples", "$28,600-$39,800 owner paid", 44, "4.2", imageSet.truck],
      ["Ford Mustang", "Sports car owner paid samples", "$36,900-$58,400 owner paid", 37, "4.3", imageSet.sedan],
      ["Ford Expedition", "Full-size SUV owner paid samples", "$66,800-$91,600 owner paid", 24, "4.0", imageSet.suv],
    ],
  },
  chevrolet: {
    count: 36,
    series: [
      ["Chevrolet Silverado", "Pickup owner paid samples", "$45,900-$73,200 owner paid", 116, "4.3", imageSet.truck],
      ["Chevrolet Equinox", "Compact SUV owner paid samples", "$29,800-$39,400 owner paid", 74, "4.0", imageSet.suv],
      ["Chevrolet Tahoe", "Full-size SUV owner paid samples", "$61,700-$84,900 owner paid", 49, "4.2", imageSet.suv],
      ["Chevrolet Trax", "SUV owner paid samples", "$23,900-$30,600 owner paid", 44, "4.1", imageSet.suv],
      ["Chevrolet Traverse", "Three-row SUV owner paid samples", "$39,900-$56,700 owner paid", 39, "4.0", imageSet.suv],
      ["Chevrolet Colorado", "Pickup owner paid samples", "$34,600-$49,800 owner paid", 35, "4.1", imageSet.truck],
      ["Chevrolet Malibu", "Midsize sedan owner paid samples", "$27,900-$34,800 owner paid", 27, "3.8", imageSet.sedan],
      ["Chevrolet Blazer EV", "Electric SUV owner paid samples", "$46,900-$61,700 owner paid", 21, "4.0", imageSet.ev],
    ],
  },
  honda: {
    count: 34,
    series: [
      ["Honda CR-V", "Compact SUV owner paid samples", "$34,800-$45,200 owner paid", 121, "4.5", imageSet.suv],
      ["Honda Accord", "Midsize sedan owner paid samples", "$31,500-$42,300 owner paid", 96, "4.4", imageSet.whiteSedan],
      ["Honda Civic", "Compact sedan owner paid samples", "$27,600-$36,100 owner paid", 88, "4.3", imageSet.sedan],
      ["Honda Pilot", "Three-row SUV owner paid samples", "$45,900-$58,800 owner paid", 57, "4.1", imageSet.suv],
      ["Honda Odyssey", "Minivan owner paid samples", "$43,200-$56,900 owner paid", 43, "4.2", imageSet.suv],
      ["Honda HR-V", "SUV owner paid samples", "$27,800-$35,600 owner paid", 41, "4.0", imageSet.suv],
      ["Honda Passport", "SUV owner paid samples", "$43,900-$55,300 owner paid", 29, "4.0", imageSet.suv],
      ["Honda Ridgeline", "Pickup owner paid samples", "$42,600-$53,700 owner paid", 26, "4.1", imageSet.truck],
    ],
  },
  hyundai: {
    count: 31,
    series: [
      ["Hyundai Tucson", "Compact SUV owner paid samples", "$31,900-$42,700 owner paid", 79, "4.2", imageSet.suv],
      ["Hyundai Santa Fe", "Compact SUV owner paid samples", "$38,400-$52,600 owner paid", 61, "4.1", imageSet.suv],
      ["Hyundai Elantra", "Compact sedan owner paid samples", "$24,800-$32,900 owner paid", 54, "4.0", imageSet.whiteSedan],
      ["Hyundai Ioniq 5", "Electric SUV owner paid samples", "$43,200-$58,700 owner paid", 43, "4.4", imageSet.ev],
      ["Hyundai Palisade", "Luxury sedan owner paid samples", "$43,900-$59,400 owner paid", 38, "4.2", imageSet.suv],
      ["Hyundai Sonata", "Midsize sedan owner paid samples", "$29,400-$38,900 owner paid", 36, "4.0", imageSet.sedan],
      ["Hyundai Santa Cruz", "Pickup owner paid samples", "$31,900-$43,500 owner paid", 24, "3.9", imageSet.truck],
      ["Hyundai Kona", "SUV owner paid samples", "$27,900-$36,800 owner paid", 22, "4.0", imageSet.suv],
    ],
  },
  nissan: {
    count: 29,
    series: [
      ["Nissan Rogue", "Luxury sedan owner paid samples", "$31,400-$42,100 owner paid", 82, "4.0", imageSet.suv],
      ["Nissan Sentra", "Luxury sedan owner paid samples", "$23,800-$30,700 owner paid", 49, "3.9", imageSet.sedan],
      ["Nissan Altima", "Luxury sedan owner paid samples", "$29,900-$39,600 owner paid", 46, "4.0", imageSet.whiteSedan],
      ["Nissan Frontier", "Pickup owner paid samples", "$36,500-$49,200 owner paid", 33, "4.1", imageSet.truck],
      ["Nissan Pathfinder", "Luxury sedan owner paid samples", "$41,600-$55,900 owner paid", 31, "4.0", imageSet.suv],
      ["Nissan Kicks", "Luxury sedan owner paid samples", "$24,800-$31,600 owner paid", 28, "3.9", imageSet.suv],
      ["Nissan Armada", "Luxury sedan owner paid samples", "$61,900-$78,500 owner paid", 19, "4.0", imageSet.suv],
      ["Nissan Ariya", "Electric SUV owner paid samples", "$42,800-$57,600 owner paid", 17, "3.9", imageSet.ev],
    ],
  },
  kia: {
    count: 27,
    series: [
      ["Kia Sportage", "Compact SUV owner paid samples", "$31,200-$43,800 owner paid", 72, "4.2", imageSet.suv],
      ["Kia Telluride", "Three-row SUV owner paid samples", "$45,300-$59,700 owner paid", 56, "4.5", imageSet.suv],
      ["Kia K5", "Compact sedan owner paid samples", "$29,600-$38,900 owner paid", 38, "4.0", imageSet.sedan],
      ["Kia EV6", "Electric SUV owner paid samples", "$43,700-$60,900 owner paid", 35, "4.3", imageSet.ev],
      ["Kia Sorento", "Compact SUV owner paid samples", "$36,900-$51,800 owner paid", 34, "4.1", imageSet.suv],
      ["Kia Carnival", "Minivan owner paid samples", "$39,800-$53,200 owner paid", 27, "4.0", imageSet.suv],
      ["Kia Niro", "Hybrid owner paid samples", "$29,900-$39,400 owner paid", 24, "4.1", imageSet.suv],
      ["Kia Seltos", "SUV owner paid samples", "$26,800-$34,900 owner paid", 22, "4.0", imageSet.suv],
    ],
  },
  subaru: {
    count: 24,
    series: [
      ["Subaru Outback", "SUV owner paid samples", "$34,600-$47,800 owner paid", 68, "4.3", imageSet.suv],
      ["Subaru Forester", "Luxury sedan owner paid samples", "$32,200-$43,100 owner paid", 61, "4.2", imageSet.suv],
      ["Subaru Crosstrek", "SUV owner paid samples", "$29,900-$38,400 owner paid", 45, "4.1", imageSet.suv],
      ["Subaru Impreza", "Compact sedan owner paid samples", "$25,700-$31,800 owner paid", 29, "3.9", imageSet.sedan],
      ["Subaru Ascent", "Three-row SUV owner paid samples", "$39,800-$52,700 owner paid", 26, "4.0", imageSet.suv],
      ["Subaru Legacy", "Midsize sedan owner paid samples", "$28,900-$37,600 owner paid", 20, "3.9", imageSet.sedan],
      ["Subaru WRX", "Luxury SUV owner paid samples", "$34,800-$45,900 owner paid", 18, "4.1", imageSet.sedan],
    ],
  },
  tesla: {
    count: 18,
    series: [
      ["Tesla Model Y", "Electric SUV owner paid samples", "$43,900-$58,200 owner paid", 103, "4.4", imageSet.ev],
      ["Tesla Model 3", "Electric sedan owner paid samples", "$38,800-$51,600 owner paid", 91, "4.3", imageSet.ev],
      ["Tesla Model X", "Electric SUV owner paid samples", "$79,900-$106,500 owner paid", 26, "4.1", imageSet.ev],
      ["Tesla Cybertruck", "Electric pickup owner paid samples", "$82,400-$111,900 owner paid", 18, "4.0", imageSet.truck],
      ["Tesla Model S", "Electric sedan owner paid samples", "$78,900-$101,600 owner paid", 32, "4.2", imageSet.ev],
    ],
  },
  bmw: {
    count: 22,
    series: [
      ["BMW X5", "Luxury SUV owner paid samples", "$69,800-$91,600 owner paid", 52, "4.4", imageSet.luxury],
      ["BMW 3 Series", "Luxury sedan owner paid samples", "$48,900-$63,700 owner paid", 47, "4.2", imageSet.sedan],
      ["BMW X3", "Luxury SUV owner paid samples", "$49,700-$64,800 owner paid", 44, "4.1", imageSet.suv],
      ["BMW i4", "Electric sedan owner paid samples", "$56,900-$73,200 owner paid", 25, "4.2", imageSet.ev],
      ["BMW X7", "Luxury SUV owner paid samples", "$86,900-$112,400 owner paid", 23, "4.2", imageSet.suv],
      ["BMW 5 Series", "Luxury sedan owner paid samples", "$62,800-$82,600 owner paid", 21, "4.1", imageSet.sedan],
      ["BMW iX", "Electric SUV owner paid samples", "$78,900-$104,800 owner paid", 16, "4.0", imageSet.ev],
    ],
  },
  mercedes: {
    count: 25,
    series: [
      ["Mercedes-Benz GLC", "Luxury sedan owner paid samples", "$57,400-$74,900 owner paid", 63, "4.3", imageSet.luxury],
      ["Mercedes-Benz C-Class", "Luxury sedan owner paid samples", "$51,600-$69,300 owner paid", 58, "4.1", imageSet.whiteSedan],
      ["Mercedes-Benz GLE", "Luxury sedan owner paid samples", "$72,900-$98,600 owner paid", 36, "4.2", imageSet.suv],
      ["Mercedes-Benz EQE", "Electric sedan owner paid samples", "$68,400-$91,200 owner paid", 21, "4.0", imageSet.ev],
      ["Mercedes-Benz E-Class", "Luxury sedan owner paid samples", "$67,900-$88,300 owner paid", 28, "4.2", imageSet.sedan],
      ["Mercedes-Benz GLS", "Luxury sedan owner paid samples", "$91,800-$121,600 owner paid", 19, "4.1", imageSet.suv],
      ["Mercedes-Benz GLA", "Luxury sedan owner paid samples", "$43,900-$56,700 owner paid", 17, "4.0", imageSet.suv],
    ],
  },
  lexus: {
    count: 20,
    series: [
      ["Lexus RX", "Luxury SUV owner paid samples", "$55,200-$72,600 owner paid", 69, "4.5", imageSet.luxury],
      ["Lexus NX", "Luxury SUV owner paid samples", "$48,700-$63,500 owner paid", 44, "4.3", imageSet.suv],
      ["Lexus ES", "Luxury sedan owner paid samples", "$47,900-$61,800 owner paid", 41, "4.2", imageSet.sedan],
      ["Lexus TX", "Luxury SUV owner paid samples", "$61,300-$79,900 owner paid", 28, "4.1", imageSet.suv],
      ["Lexus GX", "Luxury SUV owner paid samples", "$68,900-$86,700 owner paid", 31, "4.4", imageSet.suv],
      ["Lexus IS", "Luxury sedan owner paid samples", "$45,900-$59,200 owner paid", 22, "4.0", imageSet.sedan],
      ["Lexus RZ", "Electric SUV owner paid samples", "$54,800-$69,900 owner paid", 16, "3.9", imageSet.ev],
    ],
  },
};

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function modelHref(brandKey, name, price, cases, score) {
  const modelSlug = toSlug(name.replace(/^[A-Za-z-]+\s*/, "")) || toSlug(name);
  return `./cars/${brandKey}/${modelSlug}/price.html`;
}

function configHref(brandKey, name, price, cases, score) {
  const modelSlug = toSlug(name.replace(/^[A-Za-z-]+\s*/, "")) || toSlug(name);
  return `./cars/${brandKey}/${modelSlug}/config.html`;
}

function seriesPriceLow(series) {
  const match = String(series[2]).match(/\$?([\d,]+)/);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function sortedSeries(series) {
  const items = [...series];
  if (currentSortKey === "price-low") {
    return items.sort((a, b) => seriesPriceLow(a) - seriesPriceLow(b));
  }
  if (currentSortKey === "price-high") {
    return items.sort((a, b) => seriesPriceLow(b) - seriesPriceLow(a));
  }
  return items.sort((a, b) => b[3] - a[3]);
}

function currencyToNumber(value) {
  const match = String(value).match(/\$?([\d,]+)/);
  return match ? Number(match[1].replace(/,/g, "")) : 31860;
}

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
  return brand
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

function renderPriceSearchResults() {
  if (!priceResultList) return;
  const visibleRecords = filteredPriceRecords();
  const sample = visibleRecords.length ? visibleRecords : priceRecords.slice(0, 8);
  const vehiclePrices = sample.map((record) => record.vehiclePrice);
  const outTheDoorPrices = sample.map((record) => record.outTheDoorPrice);
  const lowest = Math.min(...vehiclePrices);

  document.querySelector("#summary-low").textContent = formatUsd(lowest);
  document.querySelector("#summary-mid").textContent = formatUsd(median(vehiclePrices));
  document.querySelector("#summary-otd").textContent = formatUsd(average(outTheDoorPrices));
  document.querySelector("#summary-low-note").textContent = `Lowest selling price from ${sample.length} samples`;
  document.querySelector("#summary-mid-note").textContent = "Median selling price for the current filter";
  document.querySelector("#summary-otd-note").textContent = "Average out-the-door price with taxes and required fees";

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
    .slice(0, 12)
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

  priceResultList.querySelectorAll(".deal-row").forEach((row, index) => {
    row.animate(
      [
        { opacity: 0.55, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 220 + index * 40, easing: "ease-out" },
    );
  });
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

function renderSeries(brandKey) {
  const data = brandSeries[brandKey] || brandSeries.toyota;
  const displaySeries = sortedSeries(data.series);

  if (seriesCount) {
    seriesCount.textContent = displaySeries.length;
  }

  if (!seriesGrid) return;

  seriesGrid.innerHTML = displaySeries
    .map(([name, badge, price, cases, score, image]) => {
      const dealHref = modelHref(brandKey, name, price, cases, score);
      const specHref = configHref(brandKey, name, price, cases, score);
      const imageUrl = modelImageInitial(name, image);
      const placeholderClass = imageUrl.startsWith("data:image/svg+xml") ? " is-placeholder" : "";

      return `
        <article class="series-card">
          <span class="series-badge">${badge}</span>
          <img class="${placeholderClass.trim()}" src="${imageUrl}" alt="${name}" data-model-name="${name}" data-fallback-image="${image || ""}" loading="lazy" onerror="handleModelImageError(this)" />
          <h3>${name}</h3>
          <p class="series-score">Score ${score} <span>★★★★★</span></p>
          <strong>${price}</strong>
          <p>${cases} owner price samples</p>
          <div class="series-actions">
            <a href="${dealHref}">View Prices</a>
            <a href="${specHref}">Specs</a>
          </div>
        </article>
      `;
    })
    .join("");
  hydrateSeriesImages(displaySeries.map(([name]) => name));
}

brandTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const brandKey = tab.dataset.brand;

    brandTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    currentBrandKey = brandKey;
    renderSeries(brandKey);
  });
});

renderSeries("toyota");
initPriceSearch();

sortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentSortKey = button.dataset.sort || "hot";
    sortButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderSeries(currentBrandKey);
  });
});
