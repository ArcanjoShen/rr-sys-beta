const STORAGE_KEYS = {
  consent: "rr_orcamentos_consent_v1",
  company: "rr_orcamentos_company_v2",
  draft: "rr_orcamentos_draft_v2",
  quotes: "rr_orcamentos_saved_quotes_v2",
  clients: "rr_orcamentos_clients_v1",
  materials: "rr_orcamentos_materials_v2",
  services: "rr_orcamentos_services_v2",
  defaults: "rr_orcamentos_defaults_v2"
};

const state = {
  ready: false,
  materials: [],
  defaultMaterials: [],
  services: {
    polishingPerM2: 0,
    installationPerM2: 0,
    edgeFinishPerMeter: 0,
    cutoutEach: 0,
    holeEach: 0
  },
  defaults: {
    validityDays: 7,
    deliveryDays: 15,
    paymentTerms: "50% de entrada e 50% na entrega",
    warranty: "90 dias contra defeitos de instalacao",
    infinitePayFeePercent: 0,
    maxInstallments: 1
  },
  items: [],
  clients: [],
  savedQuotes: []
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const decimal = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const PIECE_TEMPLATES = {
  bancada: {
    label: "Bancada",
    defaults: {
      pieceName: "Bancada",
      width: 0.6,
      length: 1.5,
      skirtCount: 0,
      skirtHeight: 0,
      backsplashCount: 0,
      backsplashHeight: 0,
      trimCount: 0,
      trimMeters: 0,
      trimWidth: 0,
      turnCount: 0,
      turnMeters: 0,
      turnHeight: 0,
      cutouts: 0,
      holes: 0
    }
  },
  pia: {
    label: "Pia",
    defaults: {
      pieceName: "Pia",
      width: 0.6,
      length: 1.8,
      skirtCount: 0,
      skirtHeight: 0,
      backsplashCount: 0,
      backsplashHeight: 0,
      trimCount: 0,
      trimMeters: 0,
      trimWidth: 0,
      turnCount: 0,
      turnMeters: 0,
      turnHeight: 0,
      cutouts: 0,
      holes: 0
    }
  },
  balcao: {
    label: "Balcao",
    defaults: {
      pieceName: "Balcao",
      width: 0.6,
      length: 1.5,
      skirtCount: 0,
      skirtHeight: 0,
      backsplashCount: 0,
      backsplashHeight: 0,
      trimCount: 0,
      trimMeters: 0,
      trimWidth: 0,
      turnCount: 0,
      turnMeters: 0,
      turnHeight: 0,
      cutouts: 0,
      holes: 0
    }
  },
  empena: {
    label: "Empena",
    defaults: {
      pieceName: "Empena",
      width: 0.6,
      length: 0.9,
      skirtCount: 0,
      skirtHeight: 0,
      backsplashCount: 0,
      backsplashHeight: 0,
      trimCount: 0,
      trimMeters: 0,
      trimWidth: 0,
      turnCount: 0,
      turnMeters: 0,
      turnHeight: 0,
      cutouts: 0,
      holes: 0
    }
  },
  "pe-ilha": {
    label: "Pe de ilha",
    defaults: {
      pieceName: "Pe de ilha",
      width: 0.6,
      length: 0.9,
      skirtCount: 0,
      skirtHeight: 0,
      backsplashCount: 0,
      backsplashHeight: 0,
      trimCount: 0,
      trimMeters: 0,
      trimWidth: 0,
      turnCount: 0,
      turnMeters: 0,
      turnHeight: 0,
      cutouts: 0,
      holes: 0
    }
  },
  ilha: {
    label: "Ilha",
    defaults: {
      pieceName: "Ilha",
      width: 0.9,
      length: 1.8,
      skirtCount: 0,
      skirtHeight: 0,
      backsplashCount: 0,
      backsplashHeight: 0,
      trimCount: 0,
      trimMeters: 0,
      trimWidth: 0,
      turnCount: 0,
      turnMeters: 0,
      turnHeight: 0,
      cutouts: 0,
      holes: 0
    }
  },
  nicho: {
    label: "Nicho",
    defaults: {
      pieceName: "Nicho",
      width: 0.3,
      length: 0.6,
      skirtCount: 0,
      skirtHeight: 0,
      backsplashCount: 0,
      backsplashHeight: 0,
      trimCount: 0,
      trimMeters: 0,
      trimWidth: 0,
      turnCount: 0,
      turnMeters: 0,
      turnHeight: 0,
      cutouts: 0,
      holes: 0
    }
  },
  soleira: {
    label: "Soleira",
    defaults: {
      pieceName: "Soleira",
      width: 0.15,
      length: 0.9,
      skirtCount: 0,
      skirtHeight: 0,
      backsplashCount: 0,
      backsplashHeight: 0,
      trimCount: 0,
      trimMeters: 0,
      trimWidth: 0,
      turnCount: 0,
      turnMeters: 0,
      turnHeight: 0,
      cutouts: 0,
      holes: 0
    }
  },
  personalizado: {
    label: "Personalizado",
    defaults: {
      pieceName: "Peca personalizada",
      width: 1,
      length: 1,
      skirtCount: 0,
      skirtHeight: 0,
      backsplashCount: 0,
      backsplashHeight: 0,
      trimCount: 0,
      trimMeters: 0,
      trimWidth: 0,
      turnCount: 0,
      turnMeters: 0,
      turnHeight: 0,
      cutouts: 0,
      holes: 0
    }
  }
};

const els = {
  saveState: document.getElementById("saveState"),
  quoteStatusChip: document.getElementById("quoteStatusChip"),
  itemsBody: document.getElementById("itemsBody"),
  importFile: document.getElementById("importFile"),
  importNote: document.getElementById("importNote"),
  addItem: document.getElementById("addItem"),
  installApp: document.getElementById("installApp"),
  newQuote: document.getElementById("newQuote"),
  saveQuote: document.getElementById("saveQuote"),
  downloadPdf: document.getElementById("downloadPdf"),
  shareWhatsApp: document.getElementById("shareWhatsApp"),
  printQuote: document.getElementById("printQuote"),
  saveClient: document.getElementById("saveClient"),
  saveClientFromTab: document.getElementById("saveClientFromTab"),
  saveCompanyProfile: document.getElementById("saveCompanyProfile"),
  saveSettings: document.getElementById("saveSettings"),
  exportQuote: document.getElementById("exportQuote"),
  clearDraft: document.getElementById("clearDraft"),
  addMaterial: document.getElementById("addMaterial"),
  newMaterialName: document.getElementById("newMaterialName"),
  newMaterialUnit: document.getElementById("newMaterialUnit"),
  newMaterialPrice: document.getElementById("newMaterialPrice"),
  materialsList: document.getElementById("materialsList"),
  clientSearch: document.getElementById("clientSearch"),
  clientsList: document.getElementById("clientsList"),
  savedSearch: document.getElementById("savedSearch"),
  savedQuotesList: document.getElementById("savedQuotesList"),
  printArea: document.getElementById("printArea"),
  cookieBanner: document.getElementById("cookieBanner"),
  acceptCookies: document.getElementById("acceptCookies"),
  toast: document.getElementById("toast"),
  previewCompany: document.getElementById("previewCompany"),
  previewCompanyMeta: document.getElementById("previewCompanyMeta"),
  previewQuoteNumber: document.getElementById("previewQuoteNumber"),
  previewStatus: document.getElementById("previewStatus"),
  previewClient: document.getElementById("previewClient"),
  previewDelivery: document.getElementById("previewDelivery"),
  previewPayment: document.getElementById("previewPayment"),
  previewValidity: document.getElementById("previewValidity"),
  quoteDate: document.getElementById("quoteDate"),
  totalArea: document.getElementById("totalArea"),
  materialTotal: document.getElementById("materialTotal"),
  serviceTotal: document.getElementById("serviceTotal"),
  discountTotal: document.getElementById("discountTotal"),
  extraTotal: document.getElementById("extraTotal"),
  installmentRow: document.getElementById("installmentRow"),
  installmentInfo: document.getElementById("installmentInfo"),
  grandTotal: document.getElementById("grandTotal"),
  quoteLines: document.getElementById("quoteLines")
};

let draftTimer = null;
let toastTimer = null;
let deferredInstallPrompt = null;

function readJSON(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function setCookie(name, value, days) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  toastTimer = setTimeout(() => els.toast.classList.remove("visible"), 2600);
}

function setSaveState(message) {
  els.saveState.textContent = message;
}

function fieldElement(name) {
  return document.querySelector(`[data-field="${name}"]`);
}

function getField(name) {
  const field = fieldElement(name);
  if (!field) return "";
  return field.type === "checkbox" ? field.checked : field.value.trim();
}

function setField(name, value) {
  const field = fieldElement(name);
  if (!field) return;

  if (field.type === "checkbox") {
    field.checked = Boolean(value);
    return;
  }

  field.value = value ?? "";
}

function parseNumberValue(value) {
  const normalized = String(value ?? "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function getNumberField(name) {
  return Math.max(parseNumberValue(getField(name)), 0);
}

function allFieldValues() {
  const values = {};
  document.querySelectorAll("[data-field]").forEach((field) => {
    values[field.dataset.field] = field.type === "checkbox" ? field.checked : field.value;
  });
  return values;
}

function applyFieldValues(values = {}) {
  document.querySelectorAll("[data-field]").forEach((field) => {
    const value = values[field.dataset.field];

    if (field.type === "checkbox") {
      field.checked = Boolean(value);
    } else {
      field.value = value ?? "";
    }
  });
  syncManualTotalState(false);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(dateISO, days, businessDays = false) {
  if (!dateISO || !days) return "";
  const date = new Date(`${dateISO}T12:00:00`);
  let remaining = Number(days);

  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (!businessDays || (day !== 0 && day !== 6)) {
      remaining -= 1;
    }
  }

  return date.toISOString().slice(0, 10);
}

function formatDate(dateISO) {
  if (!dateISO) return "Nao informado";
  const [year, month, day] = dateISO.split("-");
  return `${day}/${month}/${year}`;
}

function makeId(prefix = "id") {
  return window.crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || makeId("material");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cssSlug(value) {
  return slugify(value || "item").replace(/[^a-z0-9-]/g, "");
}

function updateCalculatedDates() {
  const issueDate = getField("issueDate") || todayISO();
  const measurementDate = getField("measurementDate") || issueDate;
  const deliveryDays = getNumberField("deliveryDays");
  const useBusinessDays = getField("useBusinessDays");
  const deliveryDate = addDaysISO(measurementDate, deliveryDays, useBusinessDays);
  setField("deliveryDate", deliveryDate);
}

function calculatedValidityDate() {
  return addDaysISO(getField("issueDate") || todayISO(), getNumberField("quoteValidityDays"), false);
}

async function loadBaseConfig() {
  try {
    const response = await fetch("materials.json");
    const data = await response.json();
    state.defaultMaterials = Array.isArray(data.materials) ? data.materials : [];
    state.materials = readJSON(STORAGE_KEYS.materials, state.defaultMaterials);
    state.services = { ...state.services, ...(data.services || {}), ...readJSON(STORAGE_KEYS.services, {}) };
    state.defaults = { ...state.defaults, ...(data.defaults || {}), ...readJSON(STORAGE_KEYS.defaults, {}) };
  } catch (error) {
    state.defaultMaterials = [
      { id: "marmore-preto-sao-gabriel", name: "Marmore Preto Sao Gabriel", unit: "m2", price: 600 }
    ];
    state.materials = readJSON(STORAGE_KEYS.materials, state.defaultMaterials);
    showToast("materials.json nao carregou. Usando configuracao local.");
  }
}

function hydrateSettingsControls() {
  document.querySelectorAll("[data-service]").forEach((field) => {
    field.value = state.services[field.dataset.service] ?? 0;
  });

  document.querySelectorAll("[data-default]").forEach((field) => {
    field.value = state.defaults[field.dataset.default] ?? "";
  });
}

function defaultQuoteFields(keepCompany = true) {
  const company = keepCompany ? collectCompanyFields() : {};
  const issueDate = todayISO();

  return {
    ...company,
    quoteNumber: `ORC-${issueDate.replaceAll("-", "")}-${String(Date.now()).slice(-4)}`,
    quoteStatus: "Rascunho",
    issueDate,
    quoteValidityDays: state.defaults.validityDays,
    measurementDate: issueDate,
    deliveryDays: state.defaults.deliveryDays,
    useBusinessDays: true,
    deliveryDate: addDaysISO(issueDate, state.defaults.deliveryDays, true),
    paymentTerms: state.defaults.paymentTerms,
    deadline: "",
    quoteNotes: "Valores sujeitos a conferencia de medidas no local. Materiais sujeitos a disponibilidade em estoque.",
    companyLogo: getField("companyLogo") || "logo.png",
    clientName: "",
    clientAddress: "",
    clientPhone: "",
    clientDocument: "",
    projectArea: "",
    discountValue: "",
    extraValue: "",
    useManualTotal: false,
    manualTotal: "",
    showDetailedProposal: true
  };
}

function collectCompanyFields() {
  return {
    companyName: getField("companyName"),
    companyLogo: getField("companyLogo"),
    companyAddress: getField("companyAddress"),
    seller: getField("seller"),
    companyPhone: getField("companyPhone"),
    companyDocument: getField("companyDocument"),
    companyEmail: getField("companyEmail")
  };
}

function applyCompanyProfile(profile = readJSON(STORAGE_KEYS.company, {})) {
  Object.entries(profile || {}).forEach(([key, value]) => setField(key, value));
}

function collectClientFields() {
  return {
    clientName: getField("clientName"),
    clientAddress: getField("clientAddress"),
    clientPhone: getField("clientPhone"),
    clientDocument: getField("clientDocument"),
    projectArea: getField("projectArea")
  };
}

function applyClientProfile(client = {}) {
  Object.entries(client || {}).forEach(([key, value]) => setField(key, value));
  renderSummary();
  scheduleDraftSave();
}

function clientIdentity(client) {
  return slugify([client.clientName, client.clientPhone, client.clientDocument].filter(Boolean).join(" "));
}

function saveClientProfile(showMessage = true) {
  const client = collectClientFields();
  if (!client.clientName && !client.clientPhone) {
    showToast("Informe pelo menos nome ou telefone do cliente.");
    return;
  }

  const id = clientIdentity(client) || makeId("client");
  const snapshot = {
    ...client,
    id,
    updatedAt: new Date().toISOString()
  };
  const existingIndex = state.clients.findIndex((entry) => entry.id === id);

  if (existingIndex >= 0) {
    state.clients[existingIndex] = snapshot;
  } else {
    state.clients.push(snapshot);
  }

  writeJSON(STORAGE_KEYS.clients, state.clients);
  renderClients();
  if (showMessage) showToast("Cliente salvo.");
}

function startNewQuote(keepCompany = true) {
  applyFieldValues(defaultQuoteFields(keepCompany));
  if (keepCompany) applyCompanyProfile();
  state.items = [];
  addItem({
    pieceName: "Bancada",
    installation: true
  }, false);
  renderAll();
  scheduleDraftSave();
}

function makeSnapshot() {
  return {
    version: 2,
    fields: allFieldValues(),
    items: state.items,
    materials: state.materials,
    services: state.services,
    defaults: state.defaults,
    updatedAt: new Date().toISOString()
  };
}

function applySnapshot(snapshot) {
  if (!snapshot) return;
  if (Array.isArray(snapshot.materials) && snapshot.materials.length) {
    state.materials = snapshot.materials;
  }
  state.services = { ...state.services, ...(snapshot.services || {}) };
  state.defaults = { ...state.defaults, ...(snapshot.defaults || {}) };
  applyFieldValues(snapshot.fields || {});
  if (!snapshot.fields || snapshot.fields.showDetailedProposal === undefined) {
    setField("showDetailedProposal", true);
  }
  state.items = Array.isArray(snapshot.items) ? snapshot.items.map((item) => normalizeItem(item)) : [];
  if (!state.items.length) addItem({}, false);
  hydrateSettingsControls();
}

function saveDraftNow() {
  if (!state.ready) return;
  updateCalculatedDates();
  writeJSON(STORAGE_KEYS.draft, makeSnapshot());
  setSaveState("Salvo automaticamente");
}

function scheduleDraftSave() {
  if (!state.ready) return;
  clearTimeout(draftTimer);
  setSaveState("Salvando...");
  draftTimer = setTimeout(saveDraftNow, 450);
}

function getMaterial(materialId) {
  return state.materials.find((material) => material.id === materialId) || state.materials[0];
}

function inferPieceType(values = {}) {
  if (values.pieceType && PIECE_TEMPLATES[values.pieceType]) return values.pieceType;
  return resolvePieceType(values.pieceName);
}

function resolvePieceType(value) {
  const slug = slugify(value || "");
  if (PIECE_TEMPLATES[slug]) return slug;
  if (slug.includes("pia")) return "pia";
  if (slug.includes("nicho")) return "nicho";
  if (slug.includes("balcao") || slug.includes("balc")) return "balcao";
  if (slug.includes("empena")) return "empena";
  if (slug.includes("pe") && slug.includes("ilha")) return "pe-ilha";
  if (slug.includes("ilha")) return "ilha";
  if (slug.includes("soleira")) return "soleira";
  if (slug.includes("bancada")) return "bancada";
  return "personalizado";
}

function numberOrDefault(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function templateOptions(selectedType) {
  return Object.entries(PIECE_TEMPLATES).map(([value, template]) => `
    <option value="${value}" ${value === selectedType ? "selected" : ""}>${template.label}</option>
  `).join("");
}

function applyTemplateDefaults(item, pieceType, force = false) {
  const template = PIECE_TEMPLATES[pieceType] || PIECE_TEMPLATES.personalizado;
  item.pieceType = pieceType;

  Object.entries(template.defaults).forEach(([key, value]) => {
    if (force || item[key] === undefined || item[key] === "" || Number(item[key]) === 0) {
      item[key] = value;
    }
  });

  if (force) {
    item.notes = item.notes || template.label;
  }
}

function normalizeItem(values = {}) {
  const defaultMaterial = state.materials[0] ? state.materials[0].id : "";
  const pieceType = inferPieceType(values);
  const template = PIECE_TEMPLATES[pieceType] || PIECE_TEMPLATES.personalizado;
  const defaults = template.defaults;

  return {
    id: values.id || makeId("item"),
    pieceType,
    pieceName: values.pieceName || defaults.pieceName || "Peca",
    materialId: values.materialId || defaultMaterial,
    width: numberOrDefault(values.width, defaults.width || 1),
    length: numberOrDefault(values.length, defaults.length || 1),
    skirtCount: numberOrDefault(values.skirtCount, Number(values.skirtHeight) > 0 ? 1 : defaults.skirtCount || 0),
    skirtHeight: numberOrDefault(values.skirtHeight, defaults.skirtHeight || 0),
    backsplashCount: numberOrDefault(values.backsplashCount, Number(values.backsplashHeight) > 0 ? 1 : defaults.backsplashCount || 0),
    backsplashHeight: numberOrDefault(values.backsplashHeight, defaults.backsplashHeight || 0),
    trimCount: numberOrDefault(values.trimCount, Number(values.trimMeters) > 0 ? 1 : defaults.trimCount || 0),
    trimMeters: numberOrDefault(values.trimMeters, defaults.trimMeters || 0),
    trimWidth: numberOrDefault(values.trimWidth, defaults.trimWidth || 0),
    turnCount: numberOrDefault(values.turnCount, Number(values.turnMeters) > 0 ? 1 : defaults.turnCount || 0),
    turnMeters: numberOrDefault(values.turnMeters, defaults.turnMeters || 0),
    turnHeight: numberOrDefault(values.turnHeight, defaults.turnHeight || 0),
    quantity: numberOrDefault(values.quantity, 1),
    feet: numberOrDefault(values.feet, 0),
    extraArea: numberOrDefault(values.extraArea, 0),
    edgeMeters: numberOrDefault(values.edgeMeters, 0),
    cutouts: numberOrDefault(values.cutouts, defaults.cutouts || 0),
    holes: numberOrDefault(values.holes, defaults.holes || 0),
    notes: values.notes || "",
    polishing: Boolean(values.polishing),
    installation: values.installation === undefined ? true : Boolean(values.installation),
    expanded: values.expanded === undefined ? true : Boolean(values.expanded)
  };
}

function addItem(values = {}, shouldRender = true) {
  state.items.push({ ...normalizeItem(values), expanded: true });

  if (shouldRender) {
    renderItems();
    renderAll();
    scheduleDraftSave();
  }
}

function duplicateItem(itemId) {
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) return;
  const copy = normalizeItem({
    ...item,
    id: makeId("item"),
    pieceName: `${item.pieceName || "Peca"} copia`
  });
  copy.expanded = true;
  state.items.push(copy);
  renderItems();
  renderSummary();
  scheduleDraftSave();
  showToast("Peca duplicada.");
}

function applyItemPreset(itemId, preset) {
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) return;

  const presets = {
    saia: { skirtCount: Math.max(Number(item.skirtCount) || 0, 1), skirtHeight: Number(item.skirtHeight) || 0.08 },
    espelho: { backsplashCount: Math.max(Number(item.backsplashCount) || 0, 1), backsplashHeight: Number(item.backsplashHeight) || 0.1 },
    guarnicao: { trimCount: Math.max(Number(item.trimCount) || 0, 1), trimMeters: Number(item.trimMeters) || Number(item.length) || 1, trimWidth: Number(item.trimWidth) || 0.05 },
    virada: { turnCount: Math.max(Number(item.turnCount) || 0, 1), turnMeters: Number(item.turnMeters) || Number(item.length) || 1, turnHeight: Number(item.turnHeight) || 0.04 },
    recorte: { cutouts: (Number(item.cutouts) || 0) + 1 },
    furo: { holes: (Number(item.holes) || 0) + 1 }
  };

  Object.assign(item, presets[preset] || {});
  item.expanded = true;
  renderItems();
  renderSummary();
  scheduleDraftSave();
}

function itemTotals(item) {
  const material = getMaterial(item.materialId);
  const quantity = Math.max(Number(item.quantity), 0);
  const topArea = Math.max(Number(item.width), 0) * Math.max(Number(item.length), 0);
  const skirtArea = Math.max(Number(item.skirtCount), 0) * Math.max(Number(item.skirtHeight), 0) * Math.max(Number(item.length), 0);
  const backsplashArea = Math.max(Number(item.backsplashCount), 0) * Math.max(Number(item.backsplashHeight), 0) * Math.max(Number(item.length), 0);
  const trimArea = Math.max(Number(item.trimCount), 0) * Math.max(Number(item.trimMeters), 0) * Math.max(Number(item.trimWidth), 0);
  const turnArea = Math.max(Number(item.turnCount), 0) * Math.max(Number(item.turnMeters), 0) * Math.max(Number(item.turnHeight), 0);
  const extraArea = Math.max(Number(item.extraArea), 0);
  const area = (topArea + skirtArea + backsplashArea + trimArea + turnArea + extraArea) * quantity;
  const materialValue = area * (material ? Number(material.price) : 0);
  const polishingValue = item.polishing ? area * Number(state.services.polishingPerM2 || 0) : 0;
  const installationValue = item.installation ? area * Number(state.services.installationPerM2 || 0) : 0;
  const edgeValue = Math.max(Number(item.edgeMeters), 0) * Number(state.services.edgeFinishPerMeter || 0);
  const cutoutValue = Math.max(Number(item.cutouts), 0) * Number(state.services.cutoutEach || 0);
  const holeValue = Math.max(Number(item.holes), 0) * Number(state.services.holeEach || 0);
  const serviceValue = polishingValue + installationValue + edgeValue + cutoutValue + holeValue;

  return {
    area,
    materialValue,
    serviceValue,
    total: materialValue + serviceValue
  };
}

function computeTotals(ignoreManual = false) {
  const totals = state.items.reduce((acc, item) => {
    const current = itemTotals(item);
    acc.area += current.area;
    acc.material += current.materialValue;
    acc.service += current.serviceValue;
    acc.subtotal += current.total;
    return acc;
  }, { area: 0, material: 0, service: 0, subtotal: 0 });

  const discount = getNumberField("discountValue");
  const extra = getNumberField("extraValue");
  const adjusted = Math.max(totals.subtotal - discount + extra, 0);
  const manualEnabled = getField("useManualTotal");
  const manual = getNumberField("manualTotal");
  const totalBeforeFee = !ignoreManual && manualEnabled ? manual : adjusted;
  const paymentFeePercent = Math.max(parseNumberValue(state.defaults.infinitePayFeePercent), 0);
  const paymentFee = totalBeforeFee * (paymentFeePercent / 100);
  const total = totalBeforeFee + paymentFee;
  const installmentCount = Math.max(Math.floor(parseNumberValue(state.defaults.maxInstallments) || 1), 1);

  return {
    ...totals,
    discount,
    extra,
    totalBeforeFee,
    paymentFeePercent,
    paymentFee,
    total,
    installmentCount,
    installmentValue: total / installmentCount
  };
}

function buildInstallmentText(totals) {
  if (totals.installmentCount <= 1) return "A vista";
  return `Ate ${totals.installmentCount}x sem juros de ${currency.format(totals.installmentValue)}`;
}

function buildMeasureText(item) {
  return [
    `L ${decimal.format(Number(item.width) || 0)} m`,
    `C ${decimal.format(Number(item.length) || 0)} m`,
    Number(item.skirtCount) > 0 && Number(item.skirtHeight) > 0 ? `saia ${item.skirtCount}x ${decimal.format(Number(item.skirtHeight))} m` : "",
    Number(item.backsplashCount) > 0 && Number(item.backsplashHeight) > 0 ? `espelho ${item.backsplashCount}x ${decimal.format(Number(item.backsplashHeight))} m` : "",
    Number(item.trimCount) > 0 && Number(item.trimMeters) > 0 ? `guarnicao ${item.trimCount}x ${decimal.format(Number(item.trimMeters))} m` : "",
    Number(item.turnCount) > 0 && Number(item.turnMeters) > 0 ? `virada ${item.turnCount}x ${decimal.format(Number(item.turnMeters))} m x ${decimal.format(Number(item.turnHeight) || 0)} m` : "",
    Number(item.feet) > 0 ? `${item.feet} pes/apoios` : "",
    Number(item.cutouts) > 0 ? `${item.cutouts} recorte(s)` : "",
    Number(item.holes) > 0 ? `${item.holes} furo(s)` : "",
    Number(item.extraArea) > 0 ? `extra ${decimal.format(Number(item.extraArea))} m2` : "",
    Number(item.quantity) > 1 ? `${item.quantity} un.` : ""
  ].filter(Boolean).join(" | ");
}

function buildSpecList(item) {
  const specs = [
    ["Comprimento", `${decimal.format(Number(item.length) || 0)} m`],
    ["Largura", `${decimal.format(Number(item.width) || 0)} m`],
    ["Quantidade", `${decimal.format(Number(item.quantity) || 0)} un.`]
  ];

  if (Number(item.skirtCount) > 0 && Number(item.skirtHeight) > 0) {
    specs.push(["Saia", `${Number(item.skirtCount)} un. de ${decimal.format(Number(item.skirtHeight))} m`]);
  }
  if (Number(item.backsplashCount) > 0 && Number(item.backsplashHeight) > 0) {
    specs.push(["Espelho/frontao", `${Number(item.backsplashCount)} un. de ${decimal.format(Number(item.backsplashHeight))} m`]);
  }
  if (Number(item.trimCount) > 0 && Number(item.trimMeters) > 0) {
    specs.push(["Guarnicao", `${Number(item.trimCount)} un. | ${decimal.format(Number(item.trimMeters))} m x ${decimal.format(Number(item.trimWidth) || 0)} m`]);
  }
  if (Number(item.turnCount) > 0 && Number(item.turnMeters) > 0) {
    specs.push(["Virada", `${Number(item.turnCount)} un. | ${decimal.format(Number(item.turnMeters))} m x ${decimal.format(Number(item.turnHeight) || 0)} m`]);
  }
  if (Number(item.extraArea) > 0) specs.push(["Area extra", `${decimal.format(Number(item.extraArea))} m2`]);
  if (Number(item.feet) > 0) specs.push(["Pes/apoios", `${Number(item.feet)} un.`]);
  if (Number(item.cutouts) > 0) specs.push(["Recortes", `${Number(item.cutouts)} un.`]);
  if (Number(item.holes) > 0) specs.push(["Furos", `${Number(item.holes)} un.`]);

  return specs;
}

function renderItems() {
  els.itemsBody.innerHTML = "";

  state.items.forEach((item) => {
    const totals = itemTotals(item);
    const row = document.createElement("tr");
    row.dataset.itemId = item.id;
    row.dataset.cardTitle = `${item.pieceName || "Peca"} | ${currency.format(totals.total)}`;
    row.className = `${item.expanded ? "expanded" : ""} piece-type-${cssSlug(item.pieceType)}`.trim();
    row.innerHTML = `
      <td data-label="Tipo / peca" class="piece-cell">
        <select data-item-field="pieceType">
          ${templateOptions(item.pieceType)}
        </select>
        <input data-item-field="pieceName" type="text" value="${escapeHtml(item.pieceName)}" placeholder="Nome da peca">
      </td>
      <td data-label="Material">
        <select data-item-field="materialId">
          ${state.materials.map((material) => `
            <option value="${escapeHtml(material.id)}" ${material.id === item.materialId ? "selected" : ""}>
              ${escapeHtml(material.name)} - ${currency.format(Number(material.price) || 0)}/${escapeHtml(material.unit)}
            </option>
          `).join("")}
        </select>
      </td>
      <td data-label="Base" class="measure-grid">
        <label>Larg.<input data-item-field="width" type="number" min="0" step="0.01" value="${item.width}"></label>
        <label>Comp.<input data-item-field="length" type="number" min="0" step="0.01" value="${item.length}"></label>
      </td>
      <td data-label="Qtd."><input data-item-field="quantity" type="number" min="1" step="1" value="${item.quantity}"></td>
      <td data-label="Componentes" class="component-grid">
        <label>Saia qtd.<input data-item-field="skirtCount" type="number" min="0" step="1" value="${item.skirtCount}"></label>
        <label>Saia alt.<input data-item-field="skirtHeight" type="number" min="0" step="0.01" value="${item.skirtHeight}"></label>
        <label>Esp. qtd.<input data-item-field="backsplashCount" type="number" min="0" step="1" value="${item.backsplashCount}"></label>
        <label>Esp. alt.<input data-item-field="backsplashHeight" type="number" min="0" step="0.01" value="${item.backsplashHeight}"></label>
        <label>Guarn. qtd.<input data-item-field="trimCount" type="number" min="0" step="1" value="${item.trimCount}"></label>
        <label>Guarn. m<input data-item-field="trimMeters" type="number" min="0" step="0.01" value="${item.trimMeters}"></label>
        <label>Guarn. larg.<input data-item-field="trimWidth" type="number" min="0" step="0.01" value="${item.trimWidth}"></label>
        <label>Virada qtd.<input data-item-field="turnCount" type="number" min="0" step="1" value="${item.turnCount}"></label>
        <label>Virada m<input data-item-field="turnMeters" type="number" min="0" step="0.01" value="${item.turnMeters}"></label>
        <label>Virada alt.<input data-item-field="turnHeight" type="number" min="0" step="0.01" value="${item.turnHeight}"></label>
        <label>Extra m2<input data-item-field="extraArea" type="number" min="0" step="0.01" value="${item.extraArea}"></label>
      </td>
      <td data-label="Acabamentos" class="finish-grid">
        <label>Borda m<input data-item-field="edgeMeters" type="number" min="0" step="0.01" value="${item.edgeMeters}"></label>
        <label>Pes<input data-item-field="feet" type="number" min="0" step="1" value="${item.feet}"></label>
        <label>Recortes<input data-item-field="cutouts" type="number" min="0" step="1" value="${item.cutouts}"></label>
        <label>Furos<input data-item-field="holes" type="number" min="0" step="1" value="${item.holes}"></label>
        <label class="toggle-card compact"><input data-item-field="installation" type="checkbox" ${item.installation ? "checked" : ""}> Instalacao</label>
        <label class="toggle-card compact"><input data-item-field="polishing" type="checkbox" ${item.polishing ? "checked" : ""}> Polimento</label>
        <input data-item-field="notes" type="text" value="${escapeHtml(item.notes)}" placeholder="Observacao da peca">
      </td>
      <td data-label="Total" class="line-total" data-line-total>${currency.format(totals.total)}</td>
      <td class="row-actions">
        <button class="ghost small" data-toggle-item="${item.id}" type="button">${item.expanded ? "Fechar" : "Abrir"}</button>
        <div class="quick-preset-actions">
          <button class="ghost small" data-item-preset="saia" data-item-id="${item.id}" type="button">+ Saia</button>
          <button class="ghost small" data-item-preset="espelho" data-item-id="${item.id}" type="button">+ Espelho</button>
          <button class="ghost small" data-item-preset="guarnicao" data-item-id="${item.id}" type="button">+ Guarn.</button>
          <button class="ghost small" data-item-preset="recorte" data-item-id="${item.id}" type="button">+ Recorte</button>
          <button class="ghost small" data-item-preset="furo" data-item-id="${item.id}" type="button">+ Furo</button>
        </div>
        <button class="ghost small" data-duplicate-item="${item.id}" type="button">Duplicar</button>
        <button class="danger soft small" data-remove-item="${item.id}" type="button">Remover</button>
      </td>
    `;
    els.itemsBody.appendChild(row);
  });
}

function updateLineTotal(row, item) {
  const totalCell = row.querySelector("[data-line-total]");
  if (totalCell) totalCell.textContent = currency.format(itemTotals(item).total);
}

function updateItemFromTarget(target) {
  const row = target.closest("tr");
  const field = target.dataset.itemField;
  if (!row || !field) return;

  const item = state.items.find((entry) => entry.id === row.dataset.itemId);
  if (!item) return;

  if (target.type === "checkbox") {
    item[field] = target.checked;
  } else if (target.type === "number") {
    item[field] = parseNumberValue(target.value);
  } else {
    item[field] = target.value;
  }

  if (field === "pieceType") {
    applyTemplateDefaults(item, target.value, true);
    renderItems();
    renderSummary();
    scheduleDraftSave();
    return;
  }

  updateLineTotal(row, item);
  renderAll(false);
  scheduleDraftSave();
}

function updateMaterialFromTarget(target) {
  const row = target.closest("[data-material-id]");
  const field = target.dataset.materialField;
  if (!row || !field) return;

  const material = state.materials.find((entry) => entry.id === row.dataset.materialId);
  if (!material) return;
  material[field] = field === "price" ? parseNumberValue(target.value) : target.value;
  persistMaterials();
  renderItems();
  renderSummary();
  scheduleDraftSave();
}

function renderMaterials() {
  els.materialsList.innerHTML = state.materials.map((material) => `
    <div class="material-row" data-material-id="${escapeHtml(material.id)}">
      <label>
        Nome
        <input data-material-field="name" type="text" value="${escapeHtml(material.name)}">
      </label>
      <label>
        Unidade
        <select data-material-field="unit">
          <option value="m2" ${material.unit === "m2" ? "selected" : ""}>m2</option>
          <option value="un" ${material.unit === "un" ? "selected" : ""}>un</option>
          <option value="metro" ${material.unit === "metro" ? "selected" : ""}>metro</option>
        </select>
      </label>
      <label>
        Valor
        <input data-material-field="price" type="number" min="0" step="0.01" value="${Number(material.price) || 0}">
      </label>
      <button class="danger soft" data-remove-material="${escapeHtml(material.id)}" type="button">Remover</button>
    </div>
  `).join("");
}

function persistMaterials() {
  writeJSON(STORAGE_KEYS.materials, state.materials);
}

function renderSavedQuotes() {
  if (!state.savedQuotes.length) {
    els.savedQuotesList.innerHTML = `<div class="empty-state">Nenhum orcamento salvo ainda.</div>`;
    return;
  }

  const query = slugify(els.savedSearch ? els.savedSearch.value : "");
  const quotes = state.savedQuotes
    .slice()
    .sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)))
    .filter((quote) => {
      if (!query) return true;
      const fields = quote.fields || {};
      const haystack = [
        fields.quoteNumber,
        fields.quoteStatus,
        fields.clientName,
        fields.clientPhone,
        fields.clientAddress,
        fields.projectArea,
        fields.seller,
        formatDate(String(quote.savedAt || "").slice(0, 10))
      ].filter(Boolean).join(" ");
      return slugify(haystack).includes(query);
    });

  if (!quotes.length) {
    els.savedQuotesList.innerHTML = `<div class="empty-state">Nenhum orcamento encontrado para essa busca.</div>`;
    return;
  }

  els.savedQuotesList.innerHTML = quotes
    .map((quote) => {
      const fields = quote.fields || {};
      const totals = quote.items && quote.items.length
        ? quote.items.reduce((sum, item) => sum + itemTotals(normalizeItem(item)).total, 0)
        : 0;
      return `
        <article class="saved-card">
          <div>
            <strong>${escapeHtml(fields.quoteNumber || "Orcamento")}</strong>
            <span>${escapeHtml(fields.clientName || "Cliente nao informado")} | ${escapeHtml(fields.quoteStatus || "Rascunho")} | ${formatDate(String(quote.savedAt || "").slice(0, 10))}</span>
            <span>${escapeHtml(fields.clientPhone || "Sem telefone")} | ${escapeHtml(fields.projectArea || "Sem ambiente")} | ${currency.format(totals)}</span>
          </div>
          <div class="actions">
            <button class="ghost small" data-load-quote="${escapeHtml(quote.id)}" type="button">Editar</button>
            <button class="danger soft small" data-delete-quote="${escapeHtml(quote.id)}" type="button">Excluir</button>
          </div>
        </article>
      `;
    }).join("");
}

function renderClients() {
  if (!els.clientsList) return;

  if (!state.clients.length) {
    els.clientsList.innerHTML = `<div class="empty-state">Nenhum cliente salvo ainda.</div>`;
    return;
  }

  const query = slugify(els.clientSearch ? els.clientSearch.value : "");
  const clients = state.clients
    .slice()
    .sort((a, b) => String(a.clientName || "").localeCompare(String(b.clientName || "")))
    .filter((client) => {
      if (!query) return true;
      const haystack = [
        client.clientName,
        client.clientPhone,
        client.clientDocument,
        client.clientAddress,
        client.projectArea
      ].filter(Boolean).join(" ");
      return slugify(haystack).includes(query);
    });

  if (!clients.length) {
    els.clientsList.innerHTML = `<div class="empty-state">Nenhum cliente encontrado para essa busca.</div>`;
    return;
  }

  els.clientsList.innerHTML = clients.map((client) => `
    <article class="client-card" data-client-id="${escapeHtml(client.id)}">
      <div>
        <strong>${escapeHtml(client.clientName || "Cliente sem nome")}</strong>
        <span>${escapeHtml([client.clientPhone, client.clientDocument, client.projectArea].filter(Boolean).join(" | ") || "Sem telefone")}</span>
        <span>${escapeHtml(client.clientAddress || "Endereco nao informado")}</span>
      </div>
      <div class="actions">
        <button class="ghost small" data-load-client="${escapeHtml(client.id)}" type="button">Usar</button>
        <button class="danger soft small" data-delete-client="${escapeHtml(client.id)}" type="button">Excluir</button>
      </div>
    </article>
  `).join("");
}

function renderSummary() {
  updateCalculatedDates();
  const totals = computeTotals();
  const validity = calculatedValidityDate();
  const companyMeta = [getField("companyAddress"), getField("companyPhone"), getField("companyDocument")].filter(Boolean).join(" | ");
  const clientMeta = [getField("clientName"), getField("clientPhone"), getField("projectArea")].filter(Boolean).join(" | ");

  els.previewCompany.textContent = getField("companyName") || "Sua empresa";
  els.previewCompanyMeta.textContent = companyMeta || "Endereco e contato";
  els.previewQuoteNumber.textContent = getField("quoteNumber") || "--";
  els.previewStatus.textContent = getField("quoteStatus") || "Rascunho";
  els.quoteStatusChip.textContent = getField("quoteStatus") || "Rascunho";
  els.quoteStatusChip.className = `panel-chip status-${cssSlug(getField("quoteStatus") || "Rascunho")}`;
  els.previewClient.textContent = clientMeta || "Nao informado";
  els.previewDelivery.textContent = getField("deliveryDate") ? formatDate(getField("deliveryDate")) : "Nao definida";
  els.previewPayment.textContent = getField("paymentTerms") || "Nao informado";
  els.previewValidity.textContent = validity ? formatDate(validity) : "Nao informada";
  els.quoteDate.textContent = getField("issueDate") ? formatDate(getField("issueDate")) : formatDate(todayISO());
  els.totalArea.textContent = `${decimal.format(totals.area)} m2`;
  els.materialTotal.textContent = currency.format(totals.material);
  els.serviceTotal.textContent = currency.format(totals.service);
  els.discountTotal.textContent = currency.format(totals.discount);
  els.extraTotal.textContent = currency.format(totals.extra);
  els.installmentInfo.textContent = buildInstallmentText(totals);
  els.installmentRow.hidden = totals.installmentCount <= 1;
  els.grandTotal.textContent = currency.format(totals.total);

  els.quoteLines.innerHTML = state.items.map((item, index) => {
    const material = getMaterial(item.materialId);
    const total = itemTotals(item);
    const template = PIECE_TEMPLATES[item.pieceType] || PIECE_TEMPLATES.personalizado;
    return `
      <div class="mini-line">
        <strong>${index + 1}. ${escapeHtml(item.pieceName || "Peca")} (${template.label})</strong>
        <span>${escapeHtml(material ? material.name : "Material")} | ${decimal.format(total.area)} m2 | ${escapeHtml(buildMeasureText(item))} | ${currency.format(total.total)}</span>
      </div>
    `;
  }).join("");

  renderPrintArea(totals, validity);
}

function renderAll(includeItems = true) {
  if (includeItems) renderItems();
  renderMaterials();
  renderClients();
  renderSavedQuotes();
  renderSummary();
}

function renderPrintArea(totals, validityDate) {
  const showDetailed = Boolean(getField("showDetailedProposal"));
  const companyLogo = getField("companyLogo") || "logo.png";
  const hasInstallments = totals.installmentCount > 1;
  const installmentText = buildInstallmentText(totals);
  const rows = state.items.map((item, index) => {
    const material = getMaterial(item.materialId);
    const total = itemTotals(item);
    const services = [
      item.installation ? "Instalacao" : "",
      item.polishing ? "Polimento" : "",
      Number(item.edgeMeters) > 0 ? `${decimal.format(Number(item.edgeMeters))} m borda` : "",
      Number(item.cutouts) > 0 ? `${item.cutouts} recorte(s)` : "",
      Number(item.holes) > 0 ? `${item.holes} furo(s)` : ""
    ].filter(Boolean).join(", ") || "-";
    const template = PIECE_TEMPLATES[item.pieceType] || PIECE_TEMPLATES.personalizado;
    const baseSpecs = buildSpecList(item);
    const specs = (showDetailed ? baseSpecs : baseSpecs.slice(0, 3)).map(([label, value]) => `
      <div class="print-spec-row">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `).join("");

    return `
      <article class="print-item">
        <div class="print-item-head">
          <div>
            <span>Item ${index + 1}</span>
            <h3>${escapeHtml(item.pieceName || template.label || "Peca")}</h3>
            <p>${escapeHtml(template.label)} | ${escapeHtml(material ? material.name : "Material")}</p>
          </div>
          <div class="print-item-total">
            <span>Valor</span>
            <strong>${currency.format(total.total)}</strong>
          </div>
        </div>
        <div class="print-spec-grid">
          ${specs}
          <div class="print-spec-row">
            <span>Area calculada</span>
            <strong>${decimal.format(total.area)} m2</strong>
          </div>
          ${showDetailed ? `<div class="print-spec-row">
            <span>Servicos</span>
            <strong>${escapeHtml(services)}</strong>
          </div>` : ""}
        </div>
        ${item.notes ? `<p class="print-item-note">${escapeHtml(item.notes)}</p>` : ""}
      </article>
    `;
  }).join("");

  els.printArea.innerHTML = `
    <article class="print-sheet">
      <header class="print-header">
        <div class="print-brand">
          ${companyLogo ? `<img src="${escapeHtml(companyLogo)}" alt="">` : `<div class="print-logo-fallback">RR</div>`}
          <div>
            <p>Proposta comercial</p>
            <h1>${escapeHtml(getField("companyName") || "Sua empresa")}</h1>
            <span>${escapeHtml([getField("companyAddress"), getField("companyPhone"), getField("companyEmail"), getField("companyDocument")].filter(Boolean).join(" | "))}</span>
          </div>
        </div>
        <div class="print-meta-box">
          <strong>${escapeHtml(getField("quoteNumber") || "Orcamento")}</strong>
          <span>Emissao: ${formatDate(getField("issueDate") || todayISO())}</span>
          <span>Validade: ${formatDate(validityDate)}</span>
        </div>
      </header>

      <section class="print-grid">
        <div>
          <h2>Cliente</h2>
          <p>${escapeHtml(getField("clientName") || "Nao informado")}</p>
          <span>${escapeHtml([getField("clientAddress"), getField("clientPhone"), getField("clientDocument"), getField("projectArea")].filter(Boolean).join(" | "))}</span>
        </div>
        <div>
          <h2>Condicoes</h2>
          <p>Entrega prevista: ${formatDate(getField("deliveryDate"))}</p>
          <span>Pagamento: ${escapeHtml(getField("paymentTerms") || "Nao informado")}</span>
          ${hasInstallments ? `<span>Cartao: ${escapeHtml(installmentText)}</span>` : ""}
          <span>Garantia: ${escapeHtml(state.defaults.warranty || "Nao informada")}</span>
        </div>
      </section>

      <section class="print-items">${rows}</section>

      <section class="print-bottom">
        <div class="print-notes">
          <h2>Observacoes</h2>
          <p>${escapeHtml(getField("quoteNotes") || "Valores sujeitos a conferencia de medidas no local.")}</p>
          ${getField("deadline") ? `<p>Prazo solicitado pelo cliente: ${escapeHtml(getField("deadline"))}</p>` : ""}
        </div>
        <div class="print-totals">
          <div><span>Area total</span><strong>${decimal.format(totals.area)} m2</strong></div>
          <div><span>Materiais</span><strong>${currency.format(totals.material)}</strong></div>
          <div><span>Servicos</span><strong>${currency.format(totals.service)}</strong></div>
          <div><span>Desconto</span><strong>${currency.format(totals.discount)}</strong></div>
          <div><span>Acrescimos</span><strong>${currency.format(totals.extra)}</strong></div>
          ${hasInstallments ? `<div><span>Parcelamento</span><strong>${escapeHtml(installmentText)}</strong></div>` : ""}
          <div class="print-grand"><span>Total</span><strong>${currency.format(totals.total)}</strong></div>
        </div>
      </section>

      <footer class="print-footer">
        <span>Vendedor: ${escapeHtml(getField("seller") || "Nao informado")}</span>
        <span>${escapeHtml(getField("companyPhone") || getField("companyEmail") || "")}</span>
      </footer>
    </article>
  `;
}

function syncManualTotalState(fillWhenEnabled = true) {
  const manualField = fieldElement("manualTotal");
  const enabled = getField("useManualTotal");
  manualField.disabled = !enabled;

  if (enabled && fillWhenEnabled && !manualField.value) {
    const totals = computeTotals(true);
    manualField.value = totals.totalBeforeFee.toFixed(2);
  }
}

function saveCompanyProfile() {
  const profile = collectCompanyFields();
  writeJSON(STORAGE_KEYS.company, profile);
  setCookie("rr_company_profile", "saved", 180);
  showToast("Dados da empresa salvos.");
}

function persistSettings(showMessage = false) {
  document.querySelectorAll("[data-service]").forEach((field) => {
    state.services[field.dataset.service] = parseNumberValue(field.value);
  });

  document.querySelectorAll("[data-default]").forEach((field) => {
    const key = field.dataset.default;
    state.defaults[key] = field.type === "number" ? parseNumberValue(field.value) : field.value;
  });

  writeJSON(STORAGE_KEYS.services, state.services);
  writeJSON(STORAGE_KEYS.defaults, state.defaults);
  if (showMessage) showToast("Configuracoes salvas.");
  renderAll();
  scheduleDraftSave();
}

function saveSettings() {
  persistSettings(true);
}

function saveCurrentQuote() {
  updateCalculatedDates();
  if (getField("clientName") || getField("clientPhone")) {
    saveClientProfile(false);
  }
  const snapshot = makeSnapshot();
  const id = getField("quoteNumber") || makeId("quote");
  snapshot.id = id;
  snapshot.savedAt = new Date().toISOString();

  const existingIndex = state.savedQuotes.findIndex((quote) => quote.id === id);
  if (existingIndex >= 0) {
    state.savedQuotes[existingIndex] = snapshot;
  } else {
    state.savedQuotes.push(snapshot);
  }

  writeJSON(STORAGE_KEYS.quotes, state.savedQuotes);
  renderSavedQuotes();
  showToast("Orcamento salvo.");
  setSaveState("Salvo");
}

function exportCurrentQuote() {
  const snapshot = makeSnapshot();
  const fileName = `${getField("quoteNumber") || "orcamento"}.json`;
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function openProposalPrintWindow(title = "Proposta RR Orcamentos") {
  renderSummary();
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    window.print();
    return;
  }

  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n");
      } catch (error) {
        return "";
      }
    })
    .join("\n");

  printWindow.document.write(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(title)}</title>
        <style>${styles}</style>
        <style>
          body { background: #fff; margin: 0; }
          .print-area { display: block; }
        </style>
      </head>
      <body>
        <section class="print-area">${els.printArea.innerHTML}</section>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 350);
}

function downloadProposalPdf() {
  const number = getField("quoteNumber") || "orcamento";
  openProposalPrintWindow(`${number} - proposta`);
}

function shareProposalWhatsApp() {
  const totals = computeTotals();
  const lines = [
    `Orcamento ${getField("quoteNumber") || ""}`.trim(),
    getField("clientName") ? `Cliente: ${getField("clientName")}` : "",
    getField("projectArea") ? `Ambiente: ${getField("projectArea")}` : "",
    `Total: ${currency.format(totals.total)}`,
    getField("deliveryDate") ? `Entrega prevista: ${formatDate(getField("deliveryDate"))}` : "",
    getField("paymentTerms") ? `Pagamento: ${getField("paymentTerms")}` : "",
    "",
    "Segue a proposta. Para enviar o PDF, use o botao Baixar PDF e anexe o arquivo na conversa."
  ].filter((line) => line !== null).join("\n");
  window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
}

function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function formatDocument(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const imported = [];
  if (!lines.length) return imported;

  const headers = lines[0].split(",").map((part) => slugify(part.trim()).replace(/-/g, "_"));

  function getColumn(parts, aliases, fallbackIndex = -1) {
    const index = headers.findIndex((header) => aliases.includes(header));
    if (index >= 0) return parts[index];
    return fallbackIndex >= 0 ? parts[fallbackIndex] : "";
  }

  lines.slice(1).forEach((line) => {
    const parts = line.split(",").map((part) => part.trim());
    const typeValue = getColumn(parts, ["tipo", "piece_type", "modelo"], -1);
    const pieceName = getColumn(parts, ["peca", "nome", "piece"], 0);
    const materialName = getColumn(parts, ["material"], 1);
    const pieceType = typeValue ? resolvePieceType(typeValue) : inferPieceType({ pieceName });
    const material = state.materials.find((entry) => entry.name.toLowerCase() === String(materialName).toLowerCase());
    if (!material) return;
    const skirtHeight = Number(getColumn(parts, ["saia_altura", "saia", "skirt", "skirt_height"], 4)) || 0;
    const backsplashHeight = Number(getColumn(parts, ["espelho_altura", "frontao_altura", "espelho", "frontao", "backsplash"], -1)) || 0;
    const trimMeters = Number(getColumn(parts, ["guarnicao_m", "guarnicao", "trim_meters"], -1)) || 0;
    const turnMeters = Number(getColumn(parts, ["virada_m", "virada", "turn_meters"], -1)) || 0;

    imported.push({
      pieceName: pieceName || "Peca",
      pieceType,
      materialId: material.id,
      width: Number(getColumn(parts, ["largura", "width"], 2)) || 1,
      length: Number(getColumn(parts, ["comprimento", "compr", "length"], 3)) || 1,
      skirtCount: Number(getColumn(parts, ["saia_qtd", "qtd_saia", "skirt_count"], -1)) || (skirtHeight > 0 ? 1 : 0),
      skirtHeight,
      backsplashCount: Number(getColumn(parts, ["espelho_qtd", "frontao_qtd", "qtd_espelho", "backsplash_count"], -1)) || (backsplashHeight > 0 ? 1 : 0),
      backsplashHeight,
      trimCount: Number(getColumn(parts, ["guarnicao_qtd", "qtd_guarnicao", "trim_count"], -1)) || (trimMeters > 0 ? 1 : 0),
      trimMeters,
      trimWidth: Number(getColumn(parts, ["guarnicao_largura", "trim_width"], -1)) || 0,
      turnCount: Number(getColumn(parts, ["virada_qtd", "qtd_virada", "turn_count"], -1)) || (turnMeters > 0 ? 1 : 0),
      turnMeters,
      turnHeight: Number(getColumn(parts, ["virada_altura", "turn_height"], -1)) || 0,
      quantity: Number(getColumn(parts, ["quantidade", "qtd", "quantity"], 5)) || 1,
      feet: Number(getColumn(parts, ["pes", "apoios", "feet"], 6)) || 0,
      extraArea: Number(getColumn(parts, ["extra_m2", "extra", "extra_area"], 7)) || 0,
      edgeMeters: Number(getColumn(parts, ["borda", "borda_m", "edge_meters"], 8)) || 0,
      cutouts: Number(getColumn(parts, ["recortes", "cutouts"], -1)) || 0,
      holes: Number(getColumn(parts, ["furos", "holes"], -1)) || 0,
      notes: getColumn(parts, ["observacao", "obs", "notes"], 9) || "",
      installation: true
    });
  });

  return imported;
}

function bindEvents() {
  function activateView(view, sourceButton = null) {
    document.querySelectorAll(".tab-button").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
    document.querySelectorAll(".flow-button").forEach((tab) => tab.classList.remove("active"));
    if (sourceButton && sourceButton.classList.contains("flow-button")) {
      sourceButton.classList.add("active");
    } else {
      const flowButton = document.querySelector(`.flow-button[data-view="${view}"]`);
      if (flowButton) flowButton.classList.add("active");
    }
    document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.remove("active"));
    const panel = document.querySelector(`[data-view-panel="${view}"]`);
    if (panel) panel.classList.add("active");
  }

  function handleMobileAction(action) {
    if (action === "items") {
      activateView("items");
      return;
    }
    if (action === "add-item") {
      activateView("items");
      addItem({ pieceName: "Nova peca", installation: true });
      return;
    }
    if (action === "save") {
      saveCurrentQuote();
      return;
    }
    if (action === "pdf") {
      downloadProposalPdf();
    }
  }

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      activateView(button.dataset.view, button);
    });
  });

  document.querySelectorAll("[data-mobile-action]").forEach((button) => {
    button.addEventListener("click", () => handleMobileAction(button.dataset.mobileAction));
  });

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-field]")) {
      if (["clientPhone", "companyPhone"].includes(event.target.dataset.field)) {
        event.target.value = formatPhone(event.target.value);
      }
      if (["clientDocument", "companyDocument"].includes(event.target.dataset.field)) {
        event.target.value = formatDocument(event.target.value);
      }
      if (["issueDate", "measurementDate", "deliveryDays", "useBusinessDays"].includes(event.target.dataset.field)) {
        updateCalculatedDates();
      }
      renderSummary();
      scheduleDraftSave();
    }

    if (event.target.matches("[data-service], [data-default]")) {
      persistSettings(false);
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-field]")) {
      if (event.target.dataset.field === "useManualTotal") {
        syncManualTotalState();
      }
      updateCalculatedDates();
      renderSummary();
      scheduleDraftSave();
    }
  });

  document.addEventListener("click", (event) => {
    const templateType = event.target.dataset.addTemplate;
    if (!templateType) return;
    const template = PIECE_TEMPLATES[templateType] || PIECE_TEMPLATES.personalizado;
    addItem({ pieceType: templateType, ...template.defaults, installation: true });
    showToast(`${template.label} adicionada.`);
  });

  els.itemsBody.addEventListener("input", (event) => updateItemFromTarget(event.target));
  els.itemsBody.addEventListener("change", (event) => updateItemFromTarget(event.target));
  els.itemsBody.addEventListener("click", (event) => {
    const toggleId = event.target.dataset.toggleItem;
    if (toggleId) {
      const item = state.items.find((entry) => entry.id === toggleId);
      if (item) {
        item.expanded = !item.expanded;
        renderItems();
        scheduleDraftSave();
      }
      return;
    }

    const preset = event.target.dataset.itemPreset;
    const presetItemId = event.target.dataset.itemId;
    if (preset && presetItemId) {
      applyItemPreset(presetItemId, preset);
      return;
    }

    const duplicateId = event.target.dataset.duplicateItem;
    if (duplicateId) {
      duplicateItem(duplicateId);
      return;
    }

    const id = event.target.dataset.removeItem;
    if (!id) return;
    state.items = state.items.filter((item) => item.id !== id);
    if (!state.items.length) addItem({}, false);
    renderItems();
    renderSummary();
    scheduleDraftSave();
  });

  els.materialsList.addEventListener("input", (event) => updateMaterialFromTarget(event.target));
  els.materialsList.addEventListener("change", (event) => updateMaterialFromTarget(event.target));

  els.materialsList.addEventListener("click", (event) => {
    const id = event.target.dataset.removeMaterial;
    if (!id) return;
    if (state.materials.length <= 1) {
      showToast("Mantenha pelo menos um material cadastrado.");
      return;
    }

    state.materials = state.materials.filter((material) => material.id !== id);
    state.items.forEach((item) => {
      if (item.materialId === id) item.materialId = state.materials[0].id;
    });
    persistMaterials();
    renderAll();
    scheduleDraftSave();
  });

  els.savedQuotesList.addEventListener("click", (event) => {
    const loadId = event.target.dataset.loadQuote;
    const deleteId = event.target.dataset.deleteQuote;

    if (loadId) {
      const quote = state.savedQuotes.find((entry) => entry.id === loadId);
      applySnapshot(quote);
      renderAll();
      scheduleDraftSave();
      showToast("Orcamento carregado.");
    }

    if (deleteId) {
      state.savedQuotes = state.savedQuotes.filter((entry) => entry.id !== deleteId);
      writeJSON(STORAGE_KEYS.quotes, state.savedQuotes);
      renderSavedQuotes();
      showToast("Orcamento excluido.");
    }
  });

  if (els.savedSearch) {
    els.savedSearch.addEventListener("input", renderSavedQuotes);
  }

  if (els.clientsList) {
    els.clientsList.addEventListener("click", (event) => {
      const loadId = event.target.dataset.loadClient;
      const deleteId = event.target.dataset.deleteClient;

      if (loadId) {
        const client = state.clients.find((entry) => entry.id === loadId);
        applyClientProfile(client);
        showToast("Cliente carregado no orcamento.");
      }

      if (deleteId) {
        state.clients = state.clients.filter((entry) => entry.id !== deleteId);
        writeJSON(STORAGE_KEYS.clients, state.clients);
        renderClients();
        showToast("Cliente excluido.");
      }
    });
  }

  if (els.clientSearch) {
    els.clientSearch.addEventListener("input", renderClients);
  }

  els.addItem.addEventListener("click", () => addItem({ pieceName: "Nova peca", installation: true }));
  els.newQuote.addEventListener("click", () => {
    startNewQuote(true);
    showToast("Novo orcamento criado.");
  });
  els.saveQuote.addEventListener("click", saveCurrentQuote);
  if (els.downloadPdf) {
    els.downloadPdf.addEventListener("click", downloadProposalPdf);
  }
  if (els.shareWhatsApp) {
    els.shareWhatsApp.addEventListener("click", shareProposalWhatsApp);
  }
  if (els.saveClient) {
    els.saveClient.addEventListener("click", () => saveClientProfile(true));
  }
  if (els.saveClientFromTab) {
    els.saveClientFromTab.addEventListener("click", () => saveClientProfile(true));
  }
  els.printQuote.addEventListener("click", () => {
    renderSummary();
    window.print();
  });

  if (els.installApp) {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      els.installApp.hidden = false;
    });

    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      els.installApp.hidden = true;
      showToast("App instalado.");
    });

    els.installApp.addEventListener("click", async () => {
      if (!deferredInstallPrompt) {
        showToast("Use o menu do navegador para adicionar a tela inicial.");
        return;
      }

      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      els.installApp.hidden = true;
    });
  }
  els.saveCompanyProfile.addEventListener("click", saveCompanyProfile);
  els.saveSettings.addEventListener("click", saveSettings);
  els.exportQuote.addEventListener("click", exportCurrentQuote);
  els.clearDraft.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.draft);
    showToast("Rascunho removido.");
  });

  els.addMaterial.addEventListener("click", () => {
    const name = els.newMaterialName.value.trim();
    const unit = els.newMaterialUnit.value;
    const price = parseNumberValue(els.newMaterialPrice.value);

    if (!name) {
      showToast("Informe o nome do material.");
      return;
    }

    const idBase = slugify(name);
    const id = state.materials.some((material) => material.id === idBase) ? `${idBase}-${Date.now()}` : idBase;
    state.materials.push({ id, name, unit, price });
    els.newMaterialName.value = "";
    els.newMaterialPrice.value = "";
    persistMaterials();
    renderAll();
    scheduleDraftSave();
    showToast("Material adicionado.");
  });

  els.importFile.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    if (file.name.toLowerCase().endsWith(".json")) {
      try {
        applySnapshot(JSON.parse(text));
        renderAll();
        scheduleDraftSave();
        showToast("Arquivo JSON importado.");
      } catch (error) {
        showToast("JSON invalido.");
      }
      event.target.value = "";
      return;
    }

    const imported = parseCsv(text);
    if (imported.length) {
      state.items = imported.map((item) => ({ id: makeId("item"), ...item }));
      els.importNote.textContent = `${imported.length} peca(s) importada(s).`;
      renderItems();
      renderSummary();
      scheduleDraftSave();
    } else {
      els.importNote.textContent = "Nenhuma peca reconhecida. Confira nomes de materiais e colunas do CSV.";
    }
    event.target.value = "";
  });

  els.acceptCookies.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEYS.consent, "1");
    setCookie("rr_orcamentos_consent", "1", 180);
    els.cookieBanner.hidden = true;
  });
}

async function init() {
  await loadBaseConfig();
  state.savedQuotes = readJSON(STORAGE_KEYS.quotes, []);
  state.clients = readJSON(STORAGE_KEYS.clients, []);
  hydrateSettingsControls();

  const draft = readJSON(STORAGE_KEYS.draft);
  if (draft) {
    applySnapshot(draft);
  } else {
    applyFieldValues(defaultQuoteFields(true));
    applyCompanyProfile();
    addItem({ pieceName: "Bancada", installation: true }, false);
  }

  bindEvents();
  state.ready = true;
  syncManualTotalState(false);
  renderAll();
  setSaveState("Pronto");

  if (!localStorage.getItem(STORAGE_KEYS.consent)) {
    els.cookieBanner.hidden = false;
  }
}

init();
