import { LocalStorageProvider } from './storage/local.provider.js';

/**
 * Storage keys used across the application.
 * Versioned to allow for future schema migrations.
 */
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

/**
 * Global application state.
 * Initialized with default values.
 */
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

/**
 * The active storage provider.
 * Currently defaults to LocalStorage, but can be swapped for ApiProvider in Cloud mode.
 */
export let storageProvider = new LocalStorageProvider();

/**
 * Helper to read JSON from the active storage provider.
 * @param {string} key
 * @param {any} fallback
 * @returns {Promise<any>}
 */
export async function readJSON(key, fallback = null) {
  const value = await storageProvider.getItem(key);
  return value !== null ? value : fallback;
}

/**
 * Helper to write JSON to the active storage provider.
 * @param {string} key
 * @param {any} value
 * @returns {Promise<void>}
 */
export async function writeJSON(key, value) {
  await storageProvider.setItem(key, value);
}
