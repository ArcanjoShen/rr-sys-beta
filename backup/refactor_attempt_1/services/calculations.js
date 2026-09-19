import { NumberUtils } from './utils.js';

/**
 * Pure business logic for marble area and price calculations
 */
export const Calculations = {
  /**
   * Calculates totals for a single piece
   * @param {Object} item
   * @param {Object} materials - Available materials list
   * @param {Object} services - Global service prices
   * @returns {Object}
   */
  itemTotals(item, materials, services) {
    const material = materials.find((m) => m.id === item.materialId) || materials[0];
    const quantity = NumberUtils.safe(item.quantity, 1);

    const topArea = NumberUtils.safe(item.width) * NumberUtils.safe(item.length);
    const skirtArea = NumberUtils.safe(item.skirtCount) * NumberUtils.safe(item.skirtHeight) * NumberUtils.safe(item.length);
    const backsplashArea = NumberUtils.safe(item.backsplashCount) * NumberUtils.safe(item.backsplashHeight) * NumberUtils.safe(item.length);
    const trimArea = NumberUtils.safe(item.trimCount) * NumberUtils.safe(item.trimMeters) * NumberUtils.safe(item.trimWidth);
    const turnArea = NumberUtils.safe(item.turnCount) * NumberUtils.safe(item.turnMeters) * NumberUtils.safe(item.turnHeight);
    const extraArea = NumberUtils.safe(item.extraArea);

    const area = (topArea + skirtArea + backsplashArea + trimArea + turnArea + extraArea) * quantity;
    const materialValue = area * (material ? NumberUtils.safe(material.price) : 0);

    const polishingValue = item.polishing ? area * NumberUtils.safe(services.polishingPerM2) : 0;
    const installationValue = item.installation ? area * NumberUtils.safe(services.installationPerM2) : 0;
    const edgeValue = NumberUtils.safe(item.edgeMeters) * NumberUtils.safe(services.edgeFinishPerMeter);
    const cutoutValue = NumberUtils.safe(item.cutouts) * NumberUtils.safe(services.cutoutEach);
    const holeValue = NumberUtils.safe(item.holes) * NumberUtils.safe(services.holeEach);

    const serviceValue = polishingValue + installationValue + edgeValue + cutoutValue + holeValue;

    return {
      area,
      materialValue,
      serviceValue,
      total: materialValue + serviceValue
    };
  },

  /**
   * Computes overall quote totals
   * @param {Array} items
   * @param {Object} materials
   * @param {Object} services
   * @param {Object} fields - Quote fields (discount, extra, etc)
   * @param {Boolean} ignoreManual
   * @returns {Object}
   */
  computeTotals(items, materials, services, fields, ignoreManual = false) {
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
    const adjusted = Math.max(totals.subtotal - discount + extra, 0);

    const manualEnabled = fields.useManualTotal;
    const manual = NumberUtils.safe(fields.manualTotal);

    const totalBeforeFee = !ignoreManual && manualEnabled ? manual : adjusted;
    const paymentFeePercent = NumberUtils.safe(state.defaults?.infinitePayFeePercent || 0); // Note: state access will be handled in state.js
    const paymentFee = totalBeforeFee * (paymentFeePercent / 100);
    const total = totalBeforeFee + paymentFee;
    const installmentCount = Math.max(Math.floor(NumberUtils.safe(state.defaults?.maxInstallments, 1)), 1);

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
};
