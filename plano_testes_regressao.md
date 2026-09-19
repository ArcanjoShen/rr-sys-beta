# Plano de Testes e Validação de Regressão (Snapshot)

Este documento define a matriz de testes obrigatórios para garantir que a refatoração do RR-Sys seja segura e que o "Preço Final" permaneça invariante, a menos que um bug seja explicitamente corrigido.

## 📌 A Regra de Ouro
**O Preço Final nunca deve mudar.** 
Qualquer divergência entre a versão original e a refatorada deve ser tratada como um erro de regressão, a menos que a divergência seja a correção de um bug documentado e aprovado.

## 🧪 Matriz de Testes Obrigatórios (Casos de Borda)

Para cada cenário, registraremos: **Entrada $\rightarrow$ Fórmula $\rightarrow$ Resultado Atual $\rightarrow$ Resultado Esperado**.

### 1. Complexidade de Peça (Áreas e Serviços)
- **Cenário**: Peça com 2 saias, 1 espelho, 1 guarnição, 2 recortes e 1 furo.
- **Validação**: Verificar se cada componente soma corretamente na área total e se cada serviço (recorte/furo) é adicionado ao custo final.

### 2. Fluxo de Fechamento (Financeiro)
- **Cenário**: Subtotal $\rightarrow$ Aplicação de Desconto $\rightarrow$ Adição de Acréscimo/Frete $\rightarrow$ Aplicação de Taxa de Cartão (InfinitePay).
- **Validação**: Garantir a ordem correta das operações matemáticas para evitar erros de arredondamento.

### 3. Integridade de Dados (Casos Críticos)
- **Exclusão de Material Único**: Tentar deletar o último material cadastrado.
  - *Esperado*: O sistema deve impedir a exclusão ou tratar o erro sem crashar.
- **Alteração de Material Pós-Criação**: Mudar o preço de um material nas configurações após peças já estarem no orçamento.
  - *Esperado*: Todos os itens vinculados devem atualizar seu valor instantaneamente.
- **Entradas Inválidas**: Inserir `10abc`, campos vazios, `0` ou decimais complexos.
  - *Esperado*: O sistema deve sanitizar para `0` ou valor padrão sem quebrar o cálculo (`NaN`).

### 4. Persistência e Estado
- **Recarga de Página (F5)**: Criar orçamento $\rightarrow$ Recarregar página.
  - *Esperado*: Recuperação perfeita do rascunho via `localStorage`.
- **Manual Total**: Ativar "Valor Fechado".
  - *Esperado*: Ignorar cálculos automáticos, mas manter a aplicação da taxa de cartão sobre o valor manual.

## 📝 Tabela de Registro de Snapshots (Exemplo de Formato)

| ID | Cenário | Entrada (JSON/Valores) | Resultado Atual (R$) | Resultado Esperado (R$) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T01 | Peça Complexa | `{width: 1, length: 2, skirts: 2...}` | 1.250,00 | 1.250,00 | ⏳ |
| T02 | Combo Financeiro | `Sub: 100, Disc: 10, Extra: 5, Tax: 2%` | 94,50 | 94,50 | ⏳ |
| T03 | Material Único | `Delete(lastMaterial)` | (No Crash) | (No Crash) | ⏳ |

## 🚀 Fluxo de Execução
1. **Execução Original**: Rodar cada cenário no código atual $\rightarrow$ Registrar resultado.
2. **Refatoração Incremental**: Aplicar uma etapa da modularização.
3. **Validação**: Rodar a mesma matriz $\rightarrow$ Comparar resultados.
4. **Aprovação**: Avançar para a próxima etapa apenas se todos os status forem `✅`.
