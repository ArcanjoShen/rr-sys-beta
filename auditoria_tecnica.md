# Relatório de Auditoria Técnica: RR-Sys

Este documento resume as fragilidades e a lógica essencial do sistema para orientar a refatoração segura.

## 1. Fluxo de Dados (Essencial)
**Input $\rightarrow$ Estado $\rightarrow$ Cálculo $\rightarrow$ UI**
- O usuário altera um valor $\rightarrow$ `updateItemFromTarget` atualiza o `state.items` $\rightarrow$ `renderAll` dispara $\rightarrow$ `computeTotals` soma as áreas e custos $\rightarrow$ `renderSummary` atualiza a tela.

## 2. Lógica de Cálculo (O que deve ser preservado)
**Invariante:** O preço final nunca deve mudar.
- **Cálculo da Peça:** `(Área Base + Saias + Espelhos + Guarnições + Viradas + Área Extra) * Quantidade`.
- **Custo da Peça:** `(Área Total * Preço Material) + Polimento + Instalação + Bordas + Recortes + Furos`.
- **Total Geral:** `Sum(Peças) - Desconto + Acréscimo` $\rightarrow$ `Manual Override (se ativo)` $\rightarrow$ `Taxa Cartão (%)` $\rightarrow$ `Total Final`.

## 3. Pontos de Fragilidade (Riscos)
- **Renderização:** Uso massivo de `innerHTML` para reconstruir tabelas inteiras a cada tecla digitada. Risco de performance e XSS.
- **Dependências:** Se um material for deletado, o sistema assume o primeiro da lista (`materials[0]`). Se a lista estiver vazia, o app crasha.
- **Tipagem:** Valores inválidos tornam-se `0` silenciosamente via `parseNumberValue`, o que pode mascarar erros de digitação do usuário.
- **Impressão:** Depende de `window.open`, que é frequentemente bloqueado por navegadores modernos.

## 4. Riscos de Regressão (Cenários de Teste Obrigatórios)
Para validar a refatoração, os seguintes cenários devem produzir o mesmo valor centavo a centavo:
- **Peça Complexa:** Peça com múltiplas saias, espelhos, guarnições e recortes simultaneamente.
- **Total Manual:** Ativar "Valor Fechado" e garantir que a taxa de cartão ainda seja aplicada sobre esse valor.
- **Alteração de Preço:** Mudar o preço de um material nas configurações e verificar a atualização instantânea de todas as peças relacionadas.
- **Quantidade > 1:** Validar se a área e os serviços escalam corretamente com a quantidade.

## 5. Resumo de Segurança
| Recurso | Estado Atual | Risco | Ação Necessária |
| :--- | :--- | :--- | :--- |
| **UI** | `innerHTML` total | XSS / Performance | Mudar para templates ou DOM API |
| **Dados** | `localStorage` sem schema | Corrupção de JSON $\rightarrow$ Crash | Validar estrutura no `readJSON` |
| **Inputs** | Conversão simples | `NaN` $\rightarrow$ `0` silencioso | Validação explícita de campos |
| **Impressão** | `window.open` | Bloqueio de Pop-up | Usar iframe oculto ou CSS `@media print` |
