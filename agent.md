# Agent Guide: RR-Sys (Sistema de Orçamentos)

Este documento serve como o "cérebro" para qualquer agente de IA que precise dar manutenção, expandir ou corrigir o projeto RR-Sys.

## Conceito do Projeto
O **RR-Sys** é uma aplicação PWA (Progressive Web App) especializada na criação de orçamentos para marmorarias (mármores e granitos). O sistema permite calcular áreas de peças complexas (bancadas, pias, ilhas) incluindo componentes adicionais (saias, espelhos, guarnições) e serviços agregados (polimento, instalação, recortes).

### Fluxo Principal
1. **Cadastro da Empresa:** Configuração de dados da marmoraria e preços base.
2. **Configuração de Serviços:** Definição de valores por $m^2$ ou unidade para serviços.
3. **Montagem do Orçamento:** 
   - Seleção de material $\rightarrow$ definição de dimensões $\rightarrow$ adição de componentes $\rightarrow$ cálculo automático de área e valor.
4. **Gestão de Clientes:** Salvamento de perfis de clientes para reuso.
5. **Fechamento:** Aplicação de descontos, acréscimos e definição de prazos.
6. **Saída:** Geração de proposta formatada para impressão (PDF) ou compartilhamento via WhatsApp.

## Arquitetura Técnica

### Stack
- **Frontend:** HTML5, CSS3 (Modern CSS com variáveis), JavaScript Vanilla (ES6+).
- **Persistência:** `localStorage` (Client-side storage).
- **Offline:** Service Worker para cache de App Shell.
- **Servidor Local:** `local-server.js` (Node.js simples para desenvolvimento).

### Estrutura de Dados Chave (`app.js`)
- `STORAGE_KEYS`: Mapeamento de chaves do `localStorage`.
- `state`: Objeto global que mantém materiais, serviços, clientes e itens do orçamento atual.
- `PIECE_TEMPLATES`: Definições de dimensões padrão para tipos de peças (Bancada, Pia, etc).

### Lógica de Cálculo
O cálculo de preço segue a fórmula:
$$\text{Total Item} = (\text{Área Total} \times \text{Preço Material}) + \text{Serviços}$$
Onde a **Área Total** é a soma da base + saias + espelhos + guarnições + viradas + área extra.

## Pontos de Atenção para o Agente

### 1. Manipulação de DOM
O projeto utiliza intensamente `data-field` e `data-item-field` para vincular elementos HTML ao estado do JavaScript. Ao adicionar novos campos, **sempre** adicione o atributo `data-field` correspondente.

### 2. Renderização
A renderização é feita via manipulação de `innerHTML`. Para evitar bugs de estado, siga o fluxo:
`Atualizar Estado` $\rightarrow$ `Renderizar Componente` $\rightarrow$ `Atualizar Resumo (renderSummary)`.

### 3. Formatação
O sistema utiliza `Intl.NumberFormat` para moeda (BRL) e decimais. Mantenha a consistência nos formatadores `currency` e `decimal`.

## Guia de Expansão
- **Para adicionar novos materiais:** Altere `materials.json` ou use a interface de configurações.
- **Para novos tipos de peças:** Adicione a definição no objeto `PIECE_TEMPLATES` e atualize a função `resolvePieceType`.
- **Para novas funcionalidades de persistência:** Implemente métodos de `readJSON` e `writeJSON` utilizando as chaves em `STORAGE_KEYS`.
