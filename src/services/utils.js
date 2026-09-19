/**
 * Utility helpers for RR-Sys
 */

export const NumberUtils = {
  /**
   * Parses a value into a finite number, handling comma decimals.
   * @param {any} value
   * @returns {number}
   */
  parse(value) {
    const normalized = String(value ?? "").replace(",", ".");
    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
  },

  /**
   * Ensures a number is not negative.
   * @param {any} value
   * @param {number} fallback
   * @returns {number}
   */
  safe(value, fallback = 0) {
    const num = this.parse(value);
    return Math.max(num, fallback);
  },

  /**
   * Formats a number as a decimal string with 2 digits.
   * @param {number} value
   * @returns {string}
   */
  formatDecimal(value) {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
};

export function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `id-${Date.now()}`;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").slicing(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function formatDocument(value) {
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
