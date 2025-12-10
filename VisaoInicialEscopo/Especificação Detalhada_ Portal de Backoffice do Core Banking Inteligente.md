# Especificação Detalhada: Portal de Backoffice do Core Banking Inteligente

## 1. Conceito Dual: Dois Hemisférios

O Portal de Backoffice não é uma aplicação monolítica tradicional. Ele é dividido em dois "hemisférios" funcionais, acessíveis através da mesma plataforma, mas com propósitos e experiências de usuário distintos.

---

## 2. Hemisfério de Criação (Back Section)
**Propósito**: Definir a ontologia, as regras e a estrutura do universo bancário. É onde a "física" do sistema é escrita.

### 2.1. Funcionalidades Principais
1.  **Editor de Ontologia Natural**:
    *   Interface de texto rico (estilo Notion) onde arquitetos descrevem objetos.
    *   Exemplo de Input: *"Uma 'Conta Garantida' é um tipo de Conta que possui um 'Imóvel' vinculado como garantia. O limite da conta é 50% do valor do imóvel."*
    *   **Processamento**: O Cérebro (LLM) analisa o texto, extrai entidades, atributos e regras, e propõe o esquema JSON.
2.  **Visualizador de Grafo de Definições**:
    *   Visualização da hierarquia de classes e dependências entre objetos.
    *   Permite ver como uma mudança na "Conta Base" afeta a "Conta Garantida".
3.  **Gestão de Políticas**:
    *   Editor de regras de negócio em linguagem natural (ex: *"Transações acima de 50k requerem aprovação de dois gerentes"*).
    *   Simulador de Políticas: Testar regras contra cenários hipotéticos antes de publicar.

### 2.2. UX/UI
*   **Estilo**: Minimalista, focado em texto e diagramas esquemáticos.
*   **Interação**: Chat-first. O usuário "conversa" com o Agente Arquiteto para refinar definições.

---

## 3. Hemisfério de Gestão (Front Section)
**Propósito**: Operar o banco no dia a dia. Gerenciar as instâncias vivas dos objetos definidos no Back Section.

### 3.1. Funcionalidades Principais
1.  **Interface Neural Sutil (Navegação)**:
    *   Substitui menus de árvore por um grafo navegável.
    *   **Busca Semântica**: *"Encontre o cliente João Silva e mostre suas conexões de risco"*.
    *   **Drill-Down**: Clicar em um nó expande seus relacionamentos (Contas, Cartões, Familiares).
2.  **Gestão de Instâncias (CRUD Inteligente)**:
    *   Ao criar uma nova instância (ex: Novo Cliente), a interface é gerada dinamicamente baseada na definição do Back Section.
    *   Preenchimento assistido por IA (OCR de documentos, validação em tempo real).
3.  **Centro de Operações (Action Hub)**:
    *   Execução de ações manuais (bloqueios, estornos, aprovações).
    *   As ações disponíveis dependem do estado do objeto e das permissões do usuário (RBAC).

### 3.2. UX/UI
*   **Estilo**: "Neural Network Noir". Fundo escuro, elementos neon, foco em visualização de dados.
*   **Interação**: Graph-first. A navegação acontece explorando conexões, não clicando em menus.

---

## 4. Integração e Segurança

### 4.1. RBAC Dinâmico (Role-Based Access Control)
*   O acesso aos hemisférios e funcionalidades é controlado por papéis.
*   **Arquitetos**: Acesso total ao Back Section, leitura no Front Section.
*   **Operadores**: Acesso restrito ao Front Section (apenas leitura/escrita em objetos específicos).
*   **Auditores**: Acesso de leitura global e logs.

### 4.2. Ciclo de Vida (Definição -> Instância)
1.  Arquiteto define "Novo Produto" no **Back Section**.
2.  Cérebro valida e publica a definição.
3.  Imediatamente, o **Front Section** passa a permitir a criação de instâncias desse "Novo Produto", gerando as interfaces necessárias automaticamente.
4.  Não há deploy de código. A adaptação é instantânea.

Esta especificação garante que o sistema seja flexível o suficiente para evoluir com o negócio (Back Section) e robusto o suficiente para operar em escala (Front Section).
