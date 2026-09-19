# Auditoria Mobile-First: RR-Sys

Este documento analisa a experiência do usuário em dispositivos móveis como o alvo primário do sistema.

## 1. Experiência de Entrada (Input & Keyboard)
**Observação:** O app usa `type="number"` e `type="tel"`, mas depende do padrão do navegador.
- **Risco:** Botões `.small` têm 34px de altura, abaixo dos 44px recomendados para uso com o polegar, facilitando cliques errados.
- **Ação:** Aumentar todos os touch targets para no mínimo 44px e adicionar `inputmode="decimal"` e `inputmode="numeric"` para forçar o teclado numérico correto em iOS/Android.

## 2. Layout e Performance (Small Screens)
**Observação:** A tabela de peças se transforma em "cards" no mobile, e a renderização é feita via `innerHTML` total.
- **Risco (Performance):** O `innerHTML = ""` em cada tecla digitada causa "jank" (travamentos/flickers) em celulares mais simples.
- **Risco (UX):** O resumo financeiro (Total) fica no final da página, exigindo scroll excessivo após cada alteração de medida.
- **Ação:** Substituir a renderização total por atualizações incrementais do DOM e implementar uma **Barra de Total Flutuante (Sticky)** no rodapé.

## 3. Ciclo de Vida e Estado
**Observação:** O sistema salva rascunhos a cada 450ms via `localStorage`.
- **Risco:** Se o navegador matar a aba ao mudar para o WhatsApp, os últimos segundos de digitação podem ser perdidos.
- **Ação:** Implementar listener para `visibilitychange` para forçar o salvamento imediato ao minimizar o app. Adicionar aviso de "Rascunho recuperado" no `init()`.

## 4. Fluxo do Usuário (Happy Path)
**Análise do Fluxo:** `Cliente` $\rightarrow$ `Peças` $\rightarrow$ `Fechamento` $\rightarrow$ `Salvos`.
- **Fricção**: A maior distância está entre "Adicionar Peça" e "Ver Preço Final".
- **Ação**: Otimizar a transição entre a aba de peças e a visualização do resumo.

## 5. PWA e Conectividade
**Observação:** Manifest e Service Worker estão configurados, mas a versão do cache é estática.
- **Risco:** O usuário pode ficar com a versão antiga do app por muito tempo. Não há indicação visual de que o app está offline.
- **Ação:** Implementar indicador de status offline e melhorar a gestão de versões do Cache.

## Resumo de Prioridades Mobile
| Item | Impacto | Risco | Prioridade |
| :--- | :--- | :--- | :--- |
| **Touch Targets** | UX | Cliques errados | Alta |
| **Renderização** | Perf | Travamentos (Jank) | Alta |
| **Sticky Total** | UX | Scroll excessivo | Alta |
| **Lifecycle Save** | Dados | Perda de info | Média |
| **Offline UI** | UX | Confusão do usuário | Baixa |
