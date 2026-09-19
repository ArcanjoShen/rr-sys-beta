import { LocalStorageProvider } from './storage/local.provider.js';

export const STORAGE_KEYS = {
  consent: "rr_orcamentos_consent_v1",
  company: "rr_orcamentos_company_v2",
  draft: "rr_orcamentos_draft_v2",
  quotes: "rr_orcamentos_saved_quotes_v2",
  clients: "rr_orcamentos_clients_v1",
  materials: "rr_orcamentos_materials_v2",
  services: "rr_orcamentos_services_v2",
  defaults: "rr_orcamentos_defaults_v2"
};

export const state = {
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

// Default to Local Storage. This will be changed when Auth is implemented.
export let storageProvider = new LocalStorageProvider();

export async function readJSON(key, fallback = null) {
  const value = await storageProvider.getItem(key);
  return value !== null ? value : fallback;
}

export async function writeJSON(key, value) {
  await storageProvider.setItem(key, value);
}
