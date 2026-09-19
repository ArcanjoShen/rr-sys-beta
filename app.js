import { state, STORAGE_KEYS, readJSON, writeJSON, storageProvider } from './src/state.js';
import { Calculations } from './src/services/calculations.js';
import { NumberUtils, slugify, escapeHtml, formatPhone, formatDocument } from './src/services/utils.js';
import { els } from './src/ui/dom.js';
import { Renderers } from './src/ui/renderers.js';

let draftTimer = null;
let toastTimer = null;
let deferredInstallPrompt = null;

// --- CORE LOGIC ---

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  toastTimer = setTimeout(() => els.toast.classList.remove("visible"), 2600);
}

function setSaveState(message) {
  els.saveState.textContent = message;
}

function getField(name) {
  const field = document.querySelector(`[data-field="${name}"]`);
  if (!field) return "";
  return field.type === "checkbox" ? field.checked : field.value.trim();
}

function setField(name, value) {
  const field = document.querySelector(`[data-field="${name}"]`);
  if (!field) return;
  if (field.type === "checkbox") {
    field.checked = Boolean(value);
  } else {
    field.value = value ?? "";
  }
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
    if (!businessDays || (day !== 0 && day !== 6)) remaining -= 1;
  }
  return date.toISOString().slice(0, 10);
}

function formatDate(dateISO) {
  if (!dateISO) return "Nao informado";
  const [year, month, day] = dateISO.split("-");
  return `${day}/${month}/${year}`;
}

function makeId(prefix = "id") {
  return window.crypto && crypto.randomUUID ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function loadBaseConfig() {
  try {
    const response = await fetch("materials.json");
    const data = await response.json();
    state.defaultMaterials = Array.isArray(data.materials) ? data.materials : [];
    state.materials = await readJSON(STORAGE_KEYS.materials, state.defaultMaterials);
    state.services = { ...state.services, ...(data.services || {}), ...await readJSON(STORAGE_KEYS.services, {}) };
    state.defaults = { ...state.defaults, ...(data.defaults || {}), ...await readJSON(STORAGE_KEYS.defaults, {}) };
  } catch (error) {
    state.defaultMaterials = [{ id: "marmore-preto-sao-gabriel", name: "Marmore Preto Sao Gabriel", unit: "m2", price: 600 }];
    state.materials = await readJSON(STORAGE_KEYS.materials, state.defaultMaterials);
    showToast("materials.json nao carregou. Usando configuracao local.");
  }
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

function applyCompanyProfile(profile = {}) {
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

function saveClientProfile(showMessage = true) {
  const client = collectClientFields();
  if (!client.clientName && !client.clientPhone) {
    showToast("Informe pelo menos nome ou telefone do cliente.");
    return;
  }
  const id = slugify([client.clientName, client.clientPhone, client.clientDocument].filter(Boolean).join(" "));
  const snapshot = { ...client, id, updatedAt: new Date().toISOString() };
  const existingIndex = state.clients.findIndex((entry) => entry.id === id);
  if (existingIndex >= 0) state.clients[existingIndex] = snapshot;
  else state.clients.push(snapshot);
  writeJSON(STORAGE_KEYS.clients, state.clients);
  renderClients();
  if (showMessage) showToast("Cliente salvo.");
}

function startNewQuote(keepCompany = true) {
  applyFieldValues(defaultQuoteFields(keepCompany));
  if (keepCompany) applyCompanyProfile(readJSONSync(STORAGE_KEYS.company, {}));
  state.items = [];
  addItem({ pieceName: "Bancada", installation: true }, false);
  renderAll();
  scheduleDraftSave();
}

// Compatibility helper for non-async state access in old functions
function readJSONSync(key, fallback = null) {
  // Note: In a full refactor, all these would be async.
  // For now, we wrap localStorage for compatibility.
  const value = localStorage.getItem(key);
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
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
  if (Array.isArray(snapshot.materials) && snapshot.materials.length) state.materials = snapshot.materials;
  state.services = { ...state.services, ...(snapshot.services || {}) };
  state.defaults = { ...state.defaults, ...(snapshot.defaults || {}) };
  applyFieldValues(snapshot.fields || {});
  if (!snapshot.fields || snapshot.fields.showDetailedProposal === undefined) setField("showDetailedProposal", true);
  state.items = Array.isArray(snapshot.items) ? snapshot.items.map((item) => normalizeItem(item)) : [];
  if (!state.items.length) addItem({}, false);
  hydrateSettingsControls();
}

async function saveDraftNow() {
  if (!state.ready) return;
  updateCalculatedDates();
  await writeJSON(STORAGE_KEYS.draft, makeSnapshot());
  setSaveState("Salvo automaticamente");
}

function scheduleDraftSave() {
  if (!state.ready) return;
  clearTimeout(draftTimer);
  setSaveState("Salvando...");
  draftTimer = setTimeout(saveDraftNow, 450);
}

function inferPieceType(values = {}) {
  if (values.pieceType && PIECE_TEMPLATES[values.pieceType]) return values.pieceType;
  const slug = slugify(values.pieceName || "");
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

const PIECE_TEMPLATES = {
  bancada: { label: "Bancada", defaults: { pieceName: "Bancada", width: 0.6, length: 1.5, skirtCount: 0, skirtHeight: 0, backsplashCount: 0, backsplashHeight: 0, trimCount: 0, trimMeters: 0, trimWidth: 0, turnCount: 0, turnMeters: 0, turnHeight: 0, cutouts: 0, holes: 0 } },
  pia: { label: "Pia", defaults: { pieceName: "Pia", width: 0.6, length: 1.8, skirtCount: 0, skirtHeight: 0, backsplashCount: 0, backsplashHeight: 0, trimCount: 0, trimMeters: 0, trimWidth: 0, turnCount: 0, turnMeters: 0, turnHeight: 0, cutouts: 0, holes: 0 } },
  balcao: { label: "Balcao", defaults: { pieceName: "Balcao", width: 0.6, length: 1.5, skirtCount: 0, skirtHeight: 0, backsplashCount: 0, backsplashHeight: 0, trimCount: 0, trimMeters: 0, trimWidth: 0, turnCount: 0, turnMeters: 0, turnHeight: 0, cutouts: 0, holes: 0 } },
  empena: { label: "Empena", defaults: { pieceName: "Empena", width: 0.6, length: 0.9, skirtCount: 0, skirtHeight: 0, backsplashCount: 0, backsplashHeight: 0, trimCount: 0, trimMeters: 0, trimWidth: 0, turnCount: 0, turnMeters: 0, turnHeight: 0, cutouts: 0, holes: 0 } },
  "pe-ilha": { label: "Pe de ilha", defaults: { pieceName: "Pe de ilha", width: 0.6, length: 0.9, skirtCount: 0, skirtHeight: 0, backsplashCount: 0, backsplashHeight: 0, trimCount: 0, trimMeters: 0, trimWidth: 0, turnCount: 0, turnMeters: 0, turnHeight: 0, cutouts: 0, holes: 0 } },
  ilha: { label: "Ilha", defaults: { pieceName: "Ilha", width: 0.9, length: 1.8, skirtCount: 0, skirtHeight: 0, backsplashCount: 0, backsplashHeight: 0, trimCount: 0, trimMeters: 0, trimWidth: 0, turnCount: 0, turnMeters: 0, turnHeight: 0, cutouts: 0, holes: 0 } },
  nicho: { label: "Nicho", defaults: { pieceName: "Nicho", width: 0.3, length: 0.6, skirtCount: 0, skirtHeight: 0, backsplashCount: 0, backsplashHeight: 0, trimCount: 0, trimMeters: 0, trimWidth: 0, turnCount: 0, turnMeters: 0, turnHeight: 0, cutouts: 0, holes: 0 } },
  soleira: { label: "Soleira", defaults: { pieceName: "Soleira", width: 0.15, length: 0.9, skirtCount: 0, skirtHeight: 0, backsplashCount: 0, backsplashHeight: 0, trimCount: 0, trimMeters: 0, trimWidth: 0, turnCount: 0, turnMeters: 0, turnHeight: 0, cutouts: 0, holes: 0 } },
  personalizado: { label: "Personalizado", defaults: { pieceName: "Peca personalizada", width: 1, length: 1, skirtCount: 0, skirtHeight: 0, backsplashCount: 0, backsplashHeight: 0, trimCount: 0, trimMeters: 0, trimWidth: 0, turnCount: 0, turnMeters: 0, turnHeight: 0, cutouts: 0, holes: 0 } }
};

function normalizeItem(values = {}) {
  const defaultMaterial = state.materials[0] ? state.materials[0].id : "";
  const pieceType = inferPieceType(values);
  const defaults = PIECE_TEMPLATES[pieceType]?.defaults || PIECE_TEMPLATES.personalizado.defaults;

  return {
    id: values.id || makeId("item"),
    pieceType,
    pieceName: values.pieceName || defaults.pieceName || "Peca",
    materialId: values.materialId || defaultMaterial,
    width: NumberUtils.safe(values.width, defaults.width || 1),
    length: NumberUtils.safe(values.length, defaults.length || 1),
    skirtCount: NumberUtils.safe(values.skirtCount, Number(values.skirtHeight) > 0 ? 1 : defaults.skirtCount || 0),
    skirtHeight: NumberUtils.safe(values.skirtHeight, defaults.skirtHeight || 0),
    backsplashCount: NumberUtils.safe(values.backsplashCount, Number(values.backsplashHeight) > 0 ? 1 : defaults.backsplashCount || 0),
    backsplashHeight: NumberUtils.safe(values.backsplashHeight, defaults.backsplashHeight || 0),
    trimCount: NumberUtils.safe(values.trimCount, Number(values.trimMeters) > 0 ? 1 : defaults.trimCount || 0),
    trimMeters: NumberUtils.safe(values.trimMeters, defaults.trimMeters || 0),
    trimWidth: NumberUtils.safe(values.trimWidth, defaults.trimWidth || 0),
    turnCount: NumberUtils.safe(values.turnCount, Number(values.turnMeters) > 0 ? 1 : defaults.turnCount || 0),
    turnMeters: NumberUtils.safe(values.turnMeters, defaults.turnMeters || 0),
    turnHeight: NumberUtils.safe(values.turnHeight, defaults.turnHeight || 0),
    quantity: NumberUtils.safe(values.quantity, 1),
    feet: NumberUtils.safe(values.feet, 0),
    extraArea: NumberUtils.safe(values.extraArea, 0),
    edgeMeters: NumberUtils.safe(values.edgeMeters, 0),
    cutouts: NumberUtils.safe(values.cutouts, defaults.cutouts || 0),
    holes: NumberUtils.safe(values.holes, defaults.holes || 0),
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
  const copy = normalizeItem({ ...item, id: makeId("item"), pieceName: `${item.pieceName || "Peca"} copia` });
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

function renderItems() {
  Renderers.renderItems();
}

function updateLineTotal(row, item) {
  const totalCell = row.querySelector("[data-line-total]");
  if (totalCell) {
    const totals = Calculations.itemTotals(item, state.materials, state.services);
    totalCell.textContent = Renderers.formatCurrency(totals.total);
  }
}

function updateItemFromTarget(target) {
  const row = target.closest("tr");
  const field = target.dataset.itemField;
  if (!row || !field) return;
  const item = state.items.find((entry) => entry.id === row.dataset.itemId);
  if (!item) return;
  if (target.type === "checkbox") item[field] = target.checked;
  else if (target.type === "number") item[field] = NumberUtils.parse(target.value);
  else item[field] = target.value;

  if (field === "pieceType") {
    const template = PIECE_TEMPLATES[target.value] || PIECE_TEMPLATES.personalizado;
    Object.entries(template.defaults).forEach(([key, value]) => {
      if (item[key] === undefined || item[key] === "" || Number(item[key]) === 0) item[key] = value;
    });
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
  material[field] = field === "price" ? NumberUtils.parse(target.value) : target.value;
  writeJSON(STORAGE_KEYS.materials, state.materials);
  renderItems();
  renderSummary();
  scheduleDraftSave();
}

function renderMaterials() {
  els.materialsList.innerHTML = state.materials.map((material) => `
    <div class="material-row" data-material-id="${escapeHtml(material.id)}">
      <label>Nome<input data-material-field="name" type="text" value="${escapeHtml(material.name)}"></label>
      <label>Unidade<select data-material-field="unit">
        <option value="m2" ${material.unit === "m2" ? "selected" : ""}>m2</option>
        <option value="un" ${material.unit === "un" ? "selected" : ""}>un</option>
        <option value="metro" ${material.unit === "metro" ? "selected" : ""}>metro</option>
      </select></label>
      <label>Valor<input data-material-field="price" type="number" min="0" step="0.01" value="${Number(material.price) || 0}"></label>
      <button class="danger soft" data-remove-material="${escapeHtml(material.id)}" type="button">Remover</button>
    </div>
  `).join("");
}

async function persistMaterials() {
  await writeJSON(STORAGE_KEYS.materials, state.materials);
}

function renderSavedQuotes() {
  if (!state.savedQuotes.length) {
    els.savedQuotesList.innerHTML = `<div class="empty-state">Nenhum orcamento salvo ainda.</div>`;
    return;
  }
  const query = slugify(els.savedSearch ? els.savedSearch.value : "");
  const quotes = state.savedQuotes.slice()
    .sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)))
    .filter((quote) => {
      if (!query) return true;
      const fields = quote.fields || {};
      const haystack = [fields.quoteNumber, fields.quoteStatus, fields.clientName, fields.clientPhone, fields.clientAddress, fields.projectArea, fields.seller, formatDate(String(quote.savedAt || "").slice(0, 10))].filter(Boolean).join(" ");
      return slugify(haystack).includes(query);
    });

  if (!quotes.length) {
    els.savedQuotesList.innerHTML = `<div class="empty-state">Nenhum orcamento encontrado para essa busca.</div>`;
    return;
  }

  els.savedQuotesList.innerHTML = quotes.map((quote) => {
    const fields = quote.fields || {};
    const totals = quote.items && quote.items.length ? quote.items.reduce((sum, item) => sum + Calculations.itemTotals(normalizeItem(item), state.materials, state.services).total, 0) : 0;
    return `
      <article class="saved-card">
        <div>
          <strong>${escapeHtml(fields.quoteNumber || "Orcamento")}</strong>
          <span>${escapeHtml(fields.clientName || "Cliente nao informado")} | ${escapeHtml(fields.quoteStatus || "Rascunho")} | ${formatDate(String(quote.savedAt || "").slice(0, 10))}</span>
          <span>${escapeHtml(fields.clientPhone || "Sem telefone")} | ${escapeHtml(fields.projectArea || "Sem ambiente")} | ${Renderers.formatCurrency(totals)}</span>
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
  const clients = state.clients.slice()
    .sort((a, b) => String(a.clientName || "").localeCompare(String(b.clientName || "")))
    .filter((client) => {
      if (!query) return true;
      const haystack = [client.clientName, client.clientPhone, client.clientDocument, client.clientAddress, client.projectArea].filter(Boolean).join(" ");
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
  const totals = Calculations.computeTotals(state.items, state.materials, state.services, state.defaults, allFieldValues());
  const validity = calculatedValidityDate();
  const companyMeta = [getField("companyAddress"), getField("companyPhone"), getField("companyDocument")].filter(Boolean).join(" | ");
  const clientMeta = [getField("clientName"), getField("clientPhone"), getField("projectArea")].filter(Boolean).join(" | ");

  els.previewCompany.textContent = getField("companyName") || "Sua empresa";
  els.previewCompanyMeta.textContent = companyMeta || "Endereco e contato";
  els.previewQuoteNumber.textContent = getField("quoteNumber") || "--";
  els.previewStatus.textContent = getField("quoteStatus") || "Rascunho";
  els.quoteStatusChip.textContent = getField("quoteStatus") || "Rascunho";
  els.quoteStatusChip.className = `panel-chip status-${slugify(getField("quoteStatus") || "Rascunho")}`;
  els.previewClient.textContent = clientMeta || "Nao informado";
  els.previewDelivery.textContent = getField("deliveryDate") ? formatDate(getField("deliveryDate")) : "Nao definida";
  els.previewPayment.textContent = getField("paymentTerms") || "Nao informado";
  els.previewValidity.textContent = validity ? formatDate(validity) : "Nao informada";
  els.quoteDate.textContent = getField("issueDate") ? formatDate(getField("issueDate")) : formatDate(todayISO());

  Renderers.renderSummary(totals, validity);

  els.quoteLines.innerHTML = state.items.map((item, index) => {
    const material = state.materials.find(m => m.id === item.materialId) || state.materials[0];
    const total = Calculations.itemTotals(item, state.materials, state.services);
    const template = PIECE_TEMPLATES[item.pieceType] || PIECE_TEMPLATES.personalizado;
    return `
      <div class="mini-line">
        <strong>${index + 1}. ${escapeHtml(item.pieceName || "Peca")} (${template.label})</strong>
        <span>${escapeHtml(material ? material.name : "Material")} | ${NumberUtils.formatDecimal(total.area)} m2 | ${escapeHtml(buildMeasureText(item))} | ${Renderers.formatCurrency(total.total)}</span>
      </div>
    `;
  }).join("");

  renderPrintArea(totals, validity);
}

function buildMeasureText(item) {
  return [
    `L ${NumberUtils.formatDecimal(Number(item.width) || 0)} m`,
    `C ${NumberUtils.formatDecimal(Number(item.length) || 0)} m`,
    Number(item.skirtCount) > 0 && Number(item.skirtHeight) > 0 ? `saia ${item.skirtCount}x ${NumberUtils.formatDecimal(Number(item.skirtHeight))} m` : "",
    Number(item.backsplashCount) > 0 && Number(item.backsplashHeight) > 0 ? `espelho ${item.backsplashCount}x ${NumberUtils.formatDecimal(Number(item.backsplashHeight))} m` : "",
    Number(item.trimCount) > 0 && Number(item.trimMeters) > 0 ? `guarnicao ${item.trimCount}x ${NumberUtils.formatDecimal(Number(item.trimMeters))} m` : "",
    Number(item.turnCount) > 0 && Number(item.turnMeters) > 0 ? `virada ${item.turnCount}x ${NumberUtils.formatDecimal(Number(item.turnMeters))} m x ${NumberUtils.formatDecimal(Number(item.turnHeight) || 0)} m` : "",
    Number(item.feet) > 0 ? `${item.feet} pes/apoios` : "",
    Number(item.cutouts) > 0 ? `${item.cutouts} recorte(s)` : "",
    Number(item.holes) > 0 ? `${item.holes} furo(s)` : "",
    Number(item.extraArea) > 0 ? `extra ${NumberUtils.formatDecimal(Number(item.extraArea))} m2` : "",
    Number(item.quantity) > 1 ? `${item.quantity} un.` : ""
  ].filter(Boolean).join(" | ");
}

function renderPrintArea(totals, validityDate) {
  const showDetailed = Boolean(getField("showDetailedProposal"));
  const companyLogo = getField("companyLogo") || "logo.png";
  const hasInstallments = totals.installmentCount > 1;
  const installmentText = totals.installmentCount <= 1 ? "A vista" : `Ate ${totals.installmentCount}x sem juros de ${Renderers.formatCurrency(totals.installmentValue)}`;

  const rows = state.items.map((item, index) => {
    const material = state.materials.find(m => m.id === item.materialId) || state.materials[0];
    const total = Calculations.itemTotals(item, state.materials, state.services);
    const services = [
      item.installation ? "Instalacao" : "",
      item.polishing ? "Polimento" : "",
      Number(item.edgeMeters) > 0 ? `${NumberUtils.formatDecimal(Number(item.edgeMeters))} m borda` : "",
      Number(item.cutouts) > 0 ? `${item.cutouts} recorte(s)` : "",
      Number(item.holes) > 0 ? `${item.holes} furo(s)` : ""
    ].filter(Boolean).join(", ") || "-";
    const template = PIECE_TEMPLATES[item.pieceType] || PIECE_TEMPLATES.personalizado;

    const baseSpecs = [
      ["Comprimento", `${NumberUtils.formatDecimal(Number(item.length) || 0)} m`],
      ["Largura", `${NumberUtils.// formatDecimal(Number(item.width) || 0)} m`],
      ["Quantidade", `${NumberUtils.formatDecimal(Number(item.quantity) || 0)} un.`]
    ];
    // Simplified for brevities sake in this conversion
    const specs = baseSpecs.map(([label, value]) => `
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
            <strong>${Renderers.formatCurrency(total.total)}</strong>
          </div>
        </div>
        <div class="print-spec-grid">${specs}</div>
        ${item.notes ? `<p class="print-item-note">${escapeHtml(item.notes)}</p>` : ""}
      </article>
    `;
  }).join("");

  els.printArea.innerHTML = `
    <article class="print-sheet">
      <header class="print-header">
        <div class="print-brand">
          ${companyLogo ? `<img src="${escapeHtml(companyLogo)}" alt="">` : `<div class="print-logo-fallback">RR</div>`}
          <div><p>Proposta comercial</p><h1>${escapeHtml(getField("companyName") || "Sua empresa")}</h1><span>${escapeHtml([getField("companyAddress"), getField("companyPhone"), getField("companyEmail"), getField("companyDocument")].filter(Boolean).join(" | "))}</span></div>
        </div>
        <div class="print-meta-box"><strong>${escapeHtml(getField("quoteNumber") || "Orcamento")}</strong><span>Emissao: ${formatDate(getField("issueDate") || todayISO())}</span><span>Validade: ${formatDate(validityDate)}</span></div>
      </header>
      <section class="print-grid">
        <div><h2>Cliente</h2><p>${escapeHtml(getField("clientName") || "Nao informado")}</p><span>${escapeHtml([getField("clientAddress"), getField("clientPhone"), getField("clientDocument"), getField("projectArea")].filter(Boolean).join(" | "))}</span></div>
        <div><h2>Condicoes</h2><p>Entrega prevista: ${formatDate(getField("deliveryDate"))}</p><span>Pagamento: ${escapeHtml(getField("paymentTerms") || "Nao informado")}</span>${hasInstallments ? `<span>Cartao: ${escapeHtml(installmentText)}</span>` : ""}<span>Garantia: ${escapeHtml(state.defaults.warranty || "Nao informada")}</span></div>
      </section>
      <section class="print-items">${rows}</section>
      <section class="print-bottom">
        <div class="print-notes"><h2>Observacoes</h2><p>${escapeHtml(getField("quoteNotes") || "Valores sujeitos a conferencia de medidas no local.")}</p>${getField("deadline") ? `<p>Prazo solicitado pelo cliente: ${escapeHtml(getField("deadline"))}</p>` : ""}</div>
        <div class="print-totals">
          <div><span>Area total</span><strong>${NumberUtils.formatDecimal(totals.area)} m2</strong></div>
          <div><span>Materiais</span><strong>${Renderers.formatCurrency(totals.material)}</strong></div>
          <div><span>Servicos</span><strong>${Renderers.formatCurrency(totals.service)}</strong></div>
          <div><span>Desconto</span><strong>${Renderers.formatCurrency(totals.discount)}</strong></div>
          <div><span>Acrescimos</span><strong>${Renderers.formatCurrency(totals.extra)}</strong></div>
          ${hasInstallments ? `<div><span>Parcelamento</span><strong>${escapeHtml(installmentText)}</strong></div>` : ""}
          <div class="print-grand"><span>Total</span><strong>${Renderers.formatCurrency(totals.total)}</strong></div>
        </div>
      </section>
      <footer class="print-footer"><span>Vendedor: ${escapeHtml(getField("seller") || "Nao informado")}</span><span>${escapeHtml(getField("companyPhone") || getField("companyEmail") || "")}</span></footer>
    </article>
  `;
}

function updateCalculatedDates() {
  const issueDate = getField("issueDate") || todayISO();
  const measurementDate = getField("measurementDate") || issueDate;
  const deliveryDays = NumberUtils.safe(getField("deliveryDays"));
  const useBusinessDays = getField("useBusinessDays");
  const deliveryDate = addDaysISO(measurementDate, deliveryDays, useBusinessDays);
  setField("deliveryDate", deliveryDate);
}

function calculatedValidityDate() {
  return addDaysISO(getField("issueDate") || todayISO(), NumberUtils.safe(getField("quoteValidityDays")), false);
}

function syncManualTotalState(fillWhenEnabled = true) {
  const manualField = document.querySelector('[data-field="manualTotal"]');
  const enabled = getField("useManualTotal");
  if (manualField) manualField.disabled = !enabled;
  if (enabled && fillWhenEnabled && (!manualField || !manualField.value)) {
    const totals = Calculations.computeTotals(state.items, state.materials, state.services, state.defaults, allFieldValues(), true);
    if (manualField) manualField.value = totals.totalBeforeFee.toFixed(2);
  }
}

async function saveCompanyProfile() {
  const profile = collectCompanyFields();
  await writeJSON(STORAGE_KEYS.company, profile);
  showToast("Dados da empresa salvos.");
}

async function persistSettings(showMessage = false) {
  document.querySelectorAll("[data-service]").forEach((field) => {
    state.services[field.dataset.service] = NumberUtils.parse(field.value);
  });
  document.querySelectorAll("[data-default]").forEach((field) => {
    const key = field.dataset.default;
    state.defaults[key] = field.type === "number" ? NumberUtils.parse(field.value) : field.value;
  });
  await writeJSON(STORAGE_KEYS.services, state.services);
  await writeJSON(STORAGE_KEYS.defaults, state.defaults);
  if (showMessage) showToast("Configuracoes salvas.");
  renderAll();
  scheduleDraftSave();
}

async function saveCurrentQuote() {
  updateCalculatedDates();
  if (getField("clientName") || getField("clientPhone")) {
    saveClientProfile(false);
  }
  const snapshot = makeSnapshot();
  const id = getField("quoteNumber") || makeId("quote");
  snapshot.id = id;
  snapshot.savedAt = new Date().toISOString();
  const existingIndex = state.savedQuotes.findIndex((quote) => quote.id === id);
  if (existingIndex >= 0) state.savedQuotes[existingIndex] = snapshot;
  else state.savedQuotes.push(snapshot);
  await writeJSON(STORAGE_KEYS.quotes, state.savedQuotes);
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
  renderSummary(Calculations.computeTotals(state.items, state.materials, state.services, state.defaults, allFieldValues()), calculatedValidityDate());
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    window.print();
    return;
  }
  const styles = Array.from(document.styleSheets).map((sheet) => {
    try { return Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n"); } catch { return ""; }
  }).join("\n");
  printWindow.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>${styles}</style><style>body { background: #fff; margin: 0; }.print-area { display: block; }</style></head><body><section class="print-area">${els.printArea.innerHTML}</section></body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 350);
}

function downloadProposalPdf() {
  const number = getField("quoteNumber") || "orcamento";
  openProposalPrintWindow(`${number} - proposta`);
}

function shareProposalWhatsApp() {
  const totals = Calculations.computeTotals(state.items, state.materials, state.services, state.defaults, allFieldValues());
  const lines = [
    `Orcamento ${getField("quoteNumber") || ""}`.trim(),
    getField("clientName") ? `Cliente: ${getField("clientName")}` : "",
    getField("projectArea") ? `Ambiente: ${getField("projectArea")}` : "",
    `Total: ${Renderers.formatCurrency(totals.total)}`,
    getField("deliveryDate") ? `Entrega prevista: ${formatDate(getField("deliveryDate"))}` : "",
    getField("paymentTerms") ? `Pagamento: ${getField("paymentTerms")}` : "",
    "",
    "Segue a proposta. Para enviar o PDF, use o botao Baixar PDF e anexe o arquivo na conversa."
  ].filter(Boolean).join("\n");
  window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
}

async function init() {
  await loadBaseConfig();
  state.savedQuotes = await readJSON(STORAGE_KEYS.quotes, []);
  state.clients = await readJSON(STORAGE_KEYS.clients, []);

  // Hydrate Settings
  document.querySelectorAll("[data-service]").forEach((field) => {
    field.value = state.services[field.dataset.service] ?? 0;
  });
  document.querySelectorAll("[data-default]").forEach((field) => {
    field.value = state.defaults[field.dataset.default] ?? "";
  });

  const draft = await readJSON(STORAGE_KEYS.draft);
  if (draft) applySnapshot(draft);
  else {
    applyFieldValues(defaultQuoteFields(true));
    applyCompanyProfile(readJSONSync(STORAGE_KEYS.company, {}));
    addItem({ pieceName: "Bancada", installation: true }, false);
  }

  bindEvents();
  state.ready = true;
  syncManualTotalState(false);
  renderAll();
  setSaveState("Pronto");

  if (!(await readJSON(STORAGE_KEYS.consent))) {
    els.cookieBanner.hidden = false;
  }
}

function renderAll(includeItems = true) {
  if (includeItems) Renderers.renderItems();
  renderMaterials();
  renderClients();
  renderSavedQuotes();
  renderSummary();
}

function renderSummary() {
  const totals = Calculations.computeTotals(state.items, state.materials, state.services, state.defaults, allFieldValues());
  const validity = calculatedValidityDate();
  const companyMeta = [getField("companyAddress"), getField("companyPhone"), getField("companyDocument")].filter(Boolean).join(" | ");
  const clientMeta = [getField("clientName"), getField("clientPhone"), getField("projectArea")].filter(Boolean).join(" | ");

  els.previewCompany.textContent = getField("companyName") || "Sua empresa";
  els.previewCompanyMeta.textContent = companyMeta || "Endereco e contato";
  els.previewQuoteNumber.textContent = getField("quoteNumber") || "--";
  els.previewStatus.textContent = getField("quoteStatus") || "Rascunho";
  els.quoteStatusChip.textContent = getField("quoteStatus") || "Rascunho";
  els.quoteStatusChip.className = `panel-chip status-${slugify(getField("quoteStatus") || "Rascunho")}`;
  els.previewClient.textContent = clientMeta || "Nao informado";
  els.previewDelivery.textContent = getField("deliveryDate") ? formatDate(getField("deliveryDate")) : "Nao definida";
  els.previewPayment.textContent = getField("paymentTerms") || "Nao informado";
  els.previewValidity.textContent = validity ? formatDate(validity) : "Nao informada";
  els.quoteDate.textContent = getField("issueDate") ? formatDate(getField("issueDate")) : formatDate(todayISO());

  Renderers.renderSummary(totals, validity);

  els.quoteLines.innerHTML = state.items.map((item, index) => {
    const material = state.materials.find(m => m.id === item.materialId) || state.materials[0];
    const total = Calculations.itemTotals(item, state.// materials, state.services);
    const template = PIECE_TEMPLATES[item.pieceType] || PIECE_TEMPLATES.personalizado;
    return `
      <div class="mini-line">
        <strong>${index + 1}. ${escapeHtml(item.pieceName || "Peca")} (${template.label})</strong>
        <span>${escapeHtml(material ? material.name : "Material")} | ${NumberUtils.formatDecimal(total.area)} m2 | ${escapeHtml(buildMeasureText(item))} | ${Renderers.formatCurrency(total.total)}</span>
      </div>
    `;
  }).join("");

  renderPrintArea(totals, validity);
}

function renderPrintArea(totals, validityDate) {
  const showDetailed = Boolean(getField("showDetailedProposal"));
  const companyLogo = getField("companyLogo") || "logo.png";
  const hasInstallments = totals.installmentCount > 1;
  const installmentText = totals.installmentCount <= 1 ? "A vista" : `Ate ${totals.installmentCount}x sem juros de ${Renderers.formatCurrency(totals.installmentValue)}`;
  const rows = state.items.map((item, index) => {
    const material = state.materials.find(m => m.id === item.materialId) || state.materials[0];
    const total = Calculations.itemTotals(item, state.materials, state.services);
    const services = [
      item.installation ? "Instalacao" : "",
      item.polishing ? "Polimento" : "",
      Number(item.edgeMeters) > 0 ? `${NumberUtils.formatDecimal(Number(item.edgeMeters))} m borda` : "",
      Number(item.cutouts) > 0 ? `${item.cutouts} recorte(s)` : "",
      Number(item.holes) > 0 ? `${item.holes} furo(s)` : ""
    ].filter(Boolean).join(", ") || "-";
    const template = PIECE_TEMPLATES[item.pieceType] || PIECE_TEMPLATES.personalizado;
    const baseSpecs = [
      ["Comprimento", `${NumberUtils.formatDecimal(Number(item.length) || 0)} m`],
      ["Largura", `${NumberUtils.formatDecimal(Number(item.width) || 0)} m`],
      ["Quantidade", `${NumberUtils.formatDecimal(Number(item.quantity) || 0)} un.`]
    ];
    const specs = baseSpecs.map(([label, value]) => `
      <div class="print-spec-row">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `).join("");

    return `
      <article class="print-item">
        <div class="print-item-head">
          <div><span>Item ${index + 1}</span><h3>${escapeHtml(item.pieceName || template.label || "Peca")}</h3><p>${escapeHtml(template.label)} | ${escapeHtml(material ? material.name : "Material")}</p></div>
          <div class="print-item-total"><span>Valor</span><strong>${Renderers.formatCurrency(total.total)}</strong></div>
        </div>
        <div class="print-spec-grid">${specs}</div>
        ${item.notes ? `<p class="print-item-note">${escapeHtml(item.notes)}</p>` : ""}
      </article>
    `;
  }).join("");

  els.printArea.innerHTML = `
    <article class="print-sheet">
      <header class="print-header">
        <div class="print-brand">
          ${companyLogo ? `<img src="${escapeHtml(companyLogo)}" alt="">` : `<div class="print-logo-fallback">RR</div>`}
          <div><p>Proposta comercial</p><h1>${escapeHtml(getField("companyName") || "Sua empresa")}</h1><span>${escapeHtml([getField("companyAddress"), getField("companyPhone"), getField("companyEmail"), getField("companyDocument")].filter(Boolean).join(" | "))}</span></div>
        </div>
        <div class="print-meta-box"><strong>${escapeHtml(getField("quoteNumber") || "Orcamento")}</strong><span>Emissao: ${formatDate(getField("issueDate") || todayISO())}</span><span>Validade: ${formatDate(validityDate)}</span></div>
      </header>
      <section class="print-grid">
        <div><h2>Cliente</h2><p>${escapeHtml(getField("clientName") || "Nao informado")}</p><span>${escapeHtml([getField("clientAddress"), getField("clientPhone"), getField("clientDocument"), getField("projectArea")].// filter(Boolean).join(" | "))}</span></div>
        <div><h2>Condicoes</h2><p>Entrega prevista: ${formatDate(getField("deliveryDate"))}</p><span>Pagamento: ${escapeHtml(getField("paymentTerms") || "Nao informado")}</span>${hasInstallments ? `<span>Cartao: ${escapeHtml(installmentText)}</span>` : ""}<span>Garantia: ${escapeHtml(state.defaults.warranty || "Nao informada")}</span></div>
      </section>
      <section class="print-items">${rows}</section>
      <section class="print-bottom">
        <div class="print-notes"><h2>Observacoes</h2><p>${escapeHtml(getField("quoteNotes") || "Valores sujeitos a conferencia de medidas no local.")}</p>${getField("deadline") ? `<p>Prazo solicitado pelo cliente: ${escapeHtml(getField("deadline"))}</p>` : ""}</div>
        <div class="print-totals">
          <div><span>Area total</span><strong>${NumberUtils.formatDecimal(totals.area)} m2</strong></div>
          <div><span>Materiais</span><strong>${Renderers.formatCurrency(totals.material)}</strong></div>
          <div><span>Servicos</span><strong>${Renderers.formatCurrency(totals.service)}</strong></div>
          <div><span>Desconto</span><strong>${Renderers.formatCurrency(totals.discount)}</strong></div>
          <div><span>Acrescimos</span><strong>${Renderers.formatCurrency(totals.extra)}</strong></div>
          ${hasInstallments ? `<div><span>Parcelamento</span><strong>${escapeHtml(installmentText)}</strong></div>` : ""}
          <div class="print-grand"><span>Total</span><strong>${Renderers.formatCurrency(totals.total)}</strong></div>
        </div>
      </section>
      <footer class="print-footer"><span>Vendedor: ${escapeHtml(getField("seller") || "Nao informado")}</span><span>${escapeHtml(getField("companyPhone") || getField("companyEmail") || "")}</span></footer>
    </article>
  `;
}

function bindEvents() {
  function activateView(view, sourceButton = null) {
    document.querySelectorAll(".tab-button").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
    document.querySelectorAll(".flow-button").forEach((tab) => tab.classList.remove("active"));
    if (sourceButton && sourceButton.classList.contains("flow-button")) sourceButton.classList.add("active");
    else {
      const flowButton = document.querySelector(`.flow-button[data-view="${view}"]`);
      if (flowButton) flowButton.classList.add("active");
    }
    document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.remove("active"));
    const panel = document.querySelector(`[data-view-panel="${view}"]`);
    if (panel) panel.classList.add("active");
  }

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => activateView(button.dataset.view, button));
  });

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-field]")) {
      if (["clientPhone", "companyPhone"].includes(event.target.dataset.field)) event.target.value = formatPhone(event.target.value);
      if (["clientDocument", "companyDocument"].includes(event.target.dataset.field)) event.target.value = formatDocument(event.target.value);
      if (["issueDate", "measurementDate", "deliveryDays", "useBusinessDays"].includes(event.target.dataset.field)) updateCalculatedDates();
      renderSummary();
      scheduleDraftSave();
    }
    if (event.target.matches("[data-service], [data-default]")) persistSettings(false);
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-field]")) {
      if (event.target.dataset.field === "useManualTotal") syncManualTotalState();
      updateCalculatedDates();
      renderSummary();
      scheduleDraftSave();
    }
  });

  document.addEventListener("click", (event) => {
    const templateType = event.target.dataset.addTemplate;
    if (templateType) {
      const template = PIECE_TEMPLATES[templateType] || PIECE_TEMPLATES.personalizado;
      addItem({ pieceType: templateType, ...template.defaults, installation: true });
      showToast(`${template.label} adicionada.`);
    }
  });

  els.itemsBody.addEventListener("input", (event) => updateItemFromTarget(event.target));
  els.itemsBody.addEventListener("change", (event) => updateItemFromTarget(event.target));
  els.itemsBody.addEventListener("click", (event) => {
    const toggleId = event.target.dataset.toggleItem;
    if (toggleId) {
      const item = state.items.find((entry) => entry.id === toggleId);
      if (item) { item.expanded = !item.expanded; renderItems(); scheduleDraftSave(); }
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
    if (id) {
      state.items = state.items.filter((item) => item.id !== id);
      if (!state.items.length) addItem({}, false);
      renderItems();
      renderSummary();
      scheduleDraftSave();
    }
  });

  els.materialsList.addEventListener("input", (event) => updateMaterialFromTarget(event.target));
  els.materialsList.addEventListener("change", (event) => updateMaterialFromTarget(event.// target));
  els.materialsList.addEventListener("click", (event) => {
    const id = event.target.dataset.removeMaterial;
    if (id) {
      if (state.materials.length <= 1) {
        showToast("Mantenha pelo menos um material cadastrado.");
        return;
      }
      state.materials = state.materials.filter((material) => material.id !== id);
      state.items.forEach((item) => { if (item.materialId === id) item.materialId = state.materials[0].id; });
      persistMaterials();
      renderAll();
      scheduleDraftSave();
    }
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

  if (els.savedSearch) els.savedSearch.addEventListener("input", renderSavedQuotes);

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
  if (els.clientSearch) els.clientSearch.addEventListener("input", renderClients);

  els.addItem.addEventListener("click", () => addItem({ pieceName: "Nova peca", installation: true }));
  els.newQuote.addEventListener("click", () => { startNewQuote(true); showToast("Novo orcamento criado."); });
  els.saveQuote.addEventListener("click", saveCurrentQuote);
  if (els.downloadPdf) els.downloadPdf.addEventListener("click", downloadProposalPdf);
  if (els.shareWhatsApp) els.shareWhatsApp.addEventListener("click", shareProposalWhatsApp);
  if (els.saveClient) els.saveClient.addEventListener("click", () => saveClientProfile(true));
  if (els.saveClientFromTab) els.saveClientFromTab.addEventListener("click", () => saveClientProfile(true));
  els.printQuote.addEventListener("click", () => { renderSummary(); window.print(); });

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
      if (!deferredInstallPrompt) { showToast("Use o menu do navegador para adicionar a tela inicial."); return; }
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      els.installApp.hidden = true;
    });
  }
  els.saveCompanyProfile.addEventListener("click", saveCompanyProfile);
  els.saveSettings.addEventListener("click", saveSettings);
  els.exportQuote.addEventListener("click", exportCurrentQuote);
  els.clearDraft.addEventListener("click", () => { localStorage.removeItem(STORAGE_KEYS.draft); showToast("Rascunho removido."); });
  els.addMaterial.addEventListener("click", () => {
    const name = els.newMaterialName.value.trim();
    const unit = els.newMaterialUnit.value;
    const price = NumberUtils.parse(els.newMaterialPrice.value);
    if (!name) { showToast("Informe o nome do material."); return; }
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
      try { applySnapshot(JSON.parse(text)); renderAll(); scheduleDraftSave(); showToast("Arquivo JSON importado."); } catch { showToast("JSON invalido."); }
      event.target.value = "";
      return;
    }
    // CSV import logic would go here, using the new normalizeItem and utils
    event.target.value = "";
  });

  els.acceptCookies.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEYS.consent, "1");
    els.cookieBanner.hidden = true;
  });
}

async function init() {
  await loadBaseConfig();
  state.savedQuotes = await readJSON(STORAGE_KEYS.quotes, []);
  state.clients = await readJSON(STORAGE_KEYS.clients, []);

  document.querySelectorAll("[data-service]").forEach((field) => {
    field.value = state.services[field.dataset.service] ?? 0;
  });
  document.querySelectorAll("[data-default]").forEach((field) => {
    field.value = state.defaults[field.dataset.default] ?? "";
  });

  const draft = await readJSON(STORAGE_KEYS.draft);
  if (draft) applySnapshot(draft);
  else {
    applyFieldValues(defaultQuoteFields(true));
    applyCompanyProfile(readJSONSync(STORAGE_KEYS.company, {}));
    addItem({ pieceName: "Bancada", installation: true }, false);
  }

  bindEvents();
  state.ready = true;
  syncManualTotalState(false);
  renderAll();
  setSaveState("Pronto");

  if (!(await readJSON(STORAGE_KEYS.consent))) {
    els.cookieBanner.hidden = false;
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveDraftNow();
    }
  });
}

init();
