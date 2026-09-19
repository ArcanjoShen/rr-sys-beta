# Changelog

## [1.0.0] - 2026-09-18
### Análise Inicial e Auditoria
- **Auditoria de Código:** Realizada análise completa da estrutura do projeto.
- **Identificação de Melhorias:**
    - **Segurança:** Identificada ausência de validação rigorosa de inputs no `app.js` (embora seja um app client-side).
    - **UX/UI:** O sistema de abas e fluxo mobile está funcional, mas a gestão de estado via `localStorage` pode causar perda de dados se o usuário limpar o cache do navegador.
    - **Arquitetura:** O arquivo `app.js` está crescendo significativamente (monolítico), concentrando lógica de cálculo, renderização e persistência. Recomenda-se modularização futura.
    - **PWA:** Service Worker implementado corretamente para cache de assets básicos.
- **Documentação:** Iniciado processo de criação do `agent.md` para facilitar a manutenção por agentes de IA.
