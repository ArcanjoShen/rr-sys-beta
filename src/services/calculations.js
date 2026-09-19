import { NumberUtils } from './utils.js';

/**
 * Pure business logic for marble area and price calculations.
 * This module is the "Invariant" of the system.
 */
export const Calculations = {
  /**
   * Calculates totals for a single piece.
   * @param {Object} item - The piece data.
   * @param {Array} materials - List of available materials.
   * @param {Object} services - Global service rates.
   * @returns {Object} Calculation results for the item.
   */
  itemTotals(item, materials, services) {
    // Safety: fallback to first material if the selected one is missing
    const material = materials.find((m) => m.id === item.materialId) || materials[0];
    const quantity = NumberUtils.safe(item.quantity, 1);

    // Area calculation based on components
    const topArea = NumberUtils.safe(item.width) * NumberUtils.safe(item.length);
    const skirtArea = NumberUtils.safe(item.skirtCount) * NumberUtils.safe(item.skirtHeight) * NumberUtils.safe(item.length);
    const backsplashArea = NumberUtils.safe(item.backsplashCount) * NumberUtils.safe(item.backsplashHeight) * NumberUtils.safe(item.length);
    const trimArea = NumberUtils.safe(item.trimCount) * NumberUtils.safe(item.trimMeters) * NumberUtils.safe(item.trimWidth);
    const turnArea = NumberUtils.safe(item.turnCount) * NumberUtils.safe(item.turnMeters) * NumberUtils.safe(item.turnHeight);
    const extraArea = NumberUtils.safe(item.extraArea);

    const totalArea = (topArea + skirtArea + backsplashArea + trimArea + turnArea + extraArea) * quantity;

    // Cost calculations
    const materialValue = totalArea * (material ? NumberUtils.safe(material.price) : 0);

    const polishingValue = item.polishing ? totalArea * NumberUtils.safe(services.polishingPerM2) : 0;
    const installationValue = item.installation ? totalArea * NumberUtils.safe(services.installationPerM2) : 0;
    const edgeValue = NumberUtils.safe(item.edgeMeters) * NumberUtils.safe(services.edgeFinishPerMeter);
    const cutoutValue = NumberUtils.safe(item.cutouts) * NumberUtils.safe(services.cutoutEach);
    const holeValue = NumberUtils.safe(item.holes) * NumberUtils.safe(services.holeEach);

    const totalServiceValue = polishingValue + installationValue + edgeValue + cutoutValue + holeValue;

    return {
      area: totalArea,
      materialValue,
      serviceValue: totalServiceValue,
      total: materialValue + totalServiceValue
    };
  },

  /**
   * Computes overall quote totals.
   * @param {Array} items - List of pieces in the quote.
   * @param {Array} materials - Material list.
   * @param {Object} services - Service rates.
   * @param {Object} defaults - Global default settings (e.g. fees).
   * @param {Object} fields - Quote-specific fields (discount, etc).
   * @param {Boolean} ignoreManual - Whether to ignore manual total override.
   * @returns {Object} Aggregate totals for the quote.
   */
  computeTotals(items, materials, services, defaults, fields, ignoreManual = false) {
    const totals = items.reduce((acc, item) => {
      const current = this.itemTotals(item, materials, services);
      acc.area += current.area;
      acc.material += current.materialValue;
      acc.service += current.serviceValue;
      acc.subtotal += current.total;
      return acc;
    }, { area: 0, material: 0, service: 0, subtotal: 0 });

    const discount = NumberUtils.safe(fields.discountValue);
    const extra = NumberUtils.safe(fields.extraValue);
    const adjustedSubtotal = Math.max(totals.subtotal - discount + extra, 0);

    const manualEnabled = fields.useManualTotal;
    const manualValue = NumberUtils.safe(fields.manualTotal);

    const totalBeforeFee = (!ignoreManual && manualEnabled) ? manualValue : adjustedSubtotal;

    const paymentFeePercent = NumberUtils.safe(defaults?.infinitePayFeePercent || 0);
    const paymentFee = totalBeforeFee * (paymentFeePercent / 100);
    const grandTotal = totalBeforeFee + paymentFee;

    const installmentCount = Math.max(Math.floor(NumberUtils.safe(defaults?.maxInstallments, 1)), 1);

    return {
      ...totals,
      discount,
      extra,
      totalBeforeFee,
      paymentFeePercent,
      paymentFee,
      grandTotal,
      installmentCount,
      installmentValue: grandTotal / installmentCount
    };
  }
};
