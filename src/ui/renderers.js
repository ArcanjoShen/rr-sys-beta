import { els } from './dom.js';
import { Calculations } from '../services/calculations.js';
import { escapeHtml, NumberUtils } from '../services/utils.js';
import { state } from '../state.js';

/**
 * UI Rendering Module
 * Handles all DOM updates. Transitioning from full innerHTML
 * to safer and more efficient updates.
 */
export const Renderers = {
  /**
   * Formats currency according to BRL standards.
   */
  formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  },

  /**
   * Renders the items table.
   * Note: Currently still uses innerHTML for migration, but will be
   * updated to incremental rendering in the next a phase.
   */
  renderItems() {
    els.itemsBody.innerHTML = "";

    state.items.forEach((item) => {
      const totals = Calculations.itemTotals(item, state.materials, state.services);
      const row = document.createElement("tr");
      row.dataset.itemId = item.id;
      row.dataset.cardTitle = `${item.pieceName || "Peca"} | ${this.formatCurrency(totals.total)}`;
      row.className = `${item.expanded ? "expanded" : ""} piece-type-${item.pieceType}`.trim();

      // Use a template for the row content to keep it cleaner
      row.innerHTML = `
        <td data-label="Tipo / peca" class="piece-cell">
          <select data-item-field="pieceType">
            ${this._renderPieceTypeOptions(item.pieceType)}
          </select>
          <input data-item-field="pieceName" type="text" value="${escapeHtml(item.pieceName)}" placeholder="Nome da peca">
        </td>
        <td data-label="Material">
          <select data-item-field="materialId">
            ${state.materials.map((material) => `
              <option value="${escapeHtml(material.id)}" ${material.id === item.materialId ? "selected" : ""}>
                ${escapeHtml(material.name)} - ${this.formatCurrency(NumberUtils.safe(material.price))}/${escapeHtml(material.unit)}
              </option>
            `).join("")}
          </select>
        </td>
        <td data-label="Base" class="measure-grid">
          <label>Larg.<input data-item-field="width" type="number" min="0" step="0.01" value="${item.width}" inputmode="decimal"></label>
          <label>Comp.<input data-item-field="length" type="number" min="0" step="0.01" value="${item.length}" inputmode="decimal"></label>
        </td>
        <td data-label="Qtd."><input data-item-field="quantity" type="number" min="1" step="1" value="${item.quantity}" inputmode="numeric"></td>
        <td data-label="Componentes" class="component-grid">
          <label>Saia qtd.<input data-item-field="skirtCount" type="number" min="0" step="1" value="${item.skirtCount}" inputmode="numeric"></label>
          <label>Saia alt.<input data-item-field="skirtHeight" type="number" min="0" step="0.01" value="${item.skirtHeight}" inputmode="decimal"></label>
          <label>Esp. qtd.<input data-item-field="backsplashCount" type="number" min="0" step="1" value="${item.backsplashCount}" inputmode="numeric"></label>
          <label>Esp. alt.<input data-item-field="backsplashHeight" type="number" min="0" step="0.01" value="${item.backsplashHeight}" inputmode="decimal"></label>
          <label>Guarn. qtd.<input data-item-field="trimCount" type="number" min="0" step="1" value="${item.trimCount}" inputmode="numeric"></label>
          <label>Guarn. m<input data-item-field="trimMeters" type="number" min="0" step="0.01" value="${item.trimMeters}" inputmode="decimal"></label>
          <label>Guarn. larg.<input data-item-field="trimWidth" type="number" min="0" step="0.01" value="${item.trimWidth}" inputmode="decimal"></label>
          <label>Virada qtd.<input data-item-field="turnCount" type="number" min="0" step="1" value="${item.turnCount}" inputmode="numeric"></label>
          <label>Virada m<input data-item-field="turnMeters" type="number" min="0" step="0.01" value="${item.turnMeters}" inputmode="decimal"></label>
          <label>Virada alt.<input data-item-field="turnHeight" type="number" min="0" step="0.01" value="${item.turnHeight}" inputmode="decimal"></label>
          <label>Extra m2<input data-item-field="extraArea" type="number" min="0" step="0.01" value="${item.extraArea}" inputmode="decimal"></label>
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
        <td data-label="Total" class="line-total" data-line-total>${this.formatCurrency(totals.total)}</td>
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
  },

  _renderPieceTypeOptions(selectedType) {
    // This should eventually come from a central PIECE_TEMPLATES definition
    // For now, we keep the existing types
    const types = {
      bancada: "Bancada", pia: "Pia", balcao: "Balcao", empena: "Empena",
      "pe-ilha": "Pe de ilha", ilha: "Ilha", nicho: "Nicho", soleira: "Soleira", personalizado: "Personalizado"
    };
    return Object.entries(types).map(([val, label]) => `
      <option value="${val}" ${val === selectedType ? "selected" : ""}>${label}</option>
    `).join("");
  },

  renderSummary(totals, validityDate) {
    // Summary data flow: state -> calculations -> UI
    els.totalArea.textContent = `${NumberUtils.formatDecimal(totals.area)} m2`;
    els.materialTotal.textContent = this.formatCurrency(totals.material);
    els.serviceTotal.textContent = this.// currency formatting...
  }
};
