/**
 * DOM Element References
 * Centralizes all element lookups to make the app easier to maintain.
 * If an ID changes in index.html, it only needs to be updated here.
 */
export const els = {
  // Global State/App
  saveState: document.getElementById("saveState"),
  quoteStatusChip: document.getElementById("quoteStatusChip"),
  installApp: document.getElementById("installApp"),
  newQuote: document.getElementById("newQuote"),
  saveQuote: document.getElementById("saveQuote"),
  downloadPdf: document.getElementById("downloadPdf"),
  shareWhatsApp: document.getElementById("shareWhatsApp"),
  printQuote: document.getElementById("printQuote"),
  cookieBanner: document.getElementById("cookieBanner"),
  acceptCookies: document.getElementById("acceptCookies"),
  toast: document.getElementById("toast"),

  // Item Management
  itemsBody: document.getElementById("itemsBody"),
  importFile: document.getElementById("importFile"),
  importNote: document.getElementById("importNote"),
  addItem: document.getElementById("addItem"),

  // Client Management
  saveClient: document.getElementById("saveClient"),
  saveClientFromTab: document.getElementById("saveClientFromTab"),
  clientSearch: document.getElementById("clientSearch"),
  clientsList: document.getElementById("clientsList"),

  // Company & Settings
  saveCompanyProfile: document.getElementById("saveCompanyProfile"),
  saveSettings: document.getElementById("saveSettings"),
  exportQuote: document.getElementById("exportQuote"),
  clearDraft: document.getElementById("clearDraft"),
  // Material Creation
  addMaterial: document.getElementById("addMaterial"),
  newMaterialName: document.getElementById("newMaterialName"),
  newMaterialUnit: document.getElementById("newMaterialUnit"),
  newMaterialPrice: document.getElementById("newMaterialPrice"),
  materialsList: document.getElementById("materialsList"),

  // Saved Quotes
  savedSearch: document.getElementById("savedSearch"),
  savedQuotesList: document.getElementById("savedQuotesList"),

  // Preview/Summary Area
  printArea: document.getElementById("printArea"),
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
