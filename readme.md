

## 🎯 Análise Crítica da Arquitetura do Frontend

### Pontos Fortes

1. **Alinhamento FDD + Clean Architecture:** O agrupamento por *Features* (`auth`, `exercises`, `workout`, `metrics`, `profile`) espelha diretamente os domínios do backend, facilitando a navegação de desenvolvedores full-stack entre os dois repositórios.
2. **Tipagem de Ponta a Ponta via Codegen:** Escrever documentos `.graphql` e gerar código Angular elimina mapeamentos manuais de DTOs e previne erros de contrato.
3. **Estratégia Offline-First no Treino:** Salvar o estado da sessão localmente com Signals + `@capacitor/preferences` é crucial para ambientes de academia com sinal instável.

### 💡 Pontos de Atenção & Possíveis Falhas

1. **Inconsistência entre Angular Standalone e `graphql.module.ts`:**
* **Problema:** A árvore de pastas lista `src/app/core/graphql/graphql.module.ts`. Em aplicações Angular Standalone modernas (v16+), **não utilizamos `NgModule**`.
* **Ajuste:** A configuração do Apollo deve ser feita via função de provider (`provideApollo(...)`) declarada no `app.config.ts`, eliminando a necessidade da pasta/arquivo de módulo GraphQL.


2. **Falta do Mecanismo de Reenvio/Sync Queue:**
* **Problema:** O handoff menciona resiliência local caso a internet caia, mas não especifica como as *Mutations* pendentes (ex: `FinalizarSessaoTreino`) são re-executadas ao reconectar.
* **Ajuste:** O `workout.store.ts` precisa atuar como uma *fatos-queue* ou delegar para um `sync.service.ts` escutando o `network.service.ts`.


3. **Consistência Eventual na UI de Métricas (RabbitMQ):**
* **Problema:** O backend processa métricas de forma assíncrona via RabbitMQ. Se a UI redirecionar o usuário do treino finalizado direto para o dashboard de métricas esperando dados atualizados instantaneamente, ele verá dados desatualizados.
* **Ajuste:** O frontend precisa prever estados de *loading/processing* no dashboard de métricas ou utilizar polling/GraphQL Subscriptions no endpoint de métricas.



---

# 🏋️ App de Treinos & Métricas — Frontend (Ionic + Angular Standalone + Capacitor)

Bem-vindo ao repositório do cliente web/mobile do ecossistema de gestão de treinos e métricas. Esta aplicação foi construída com **Ionic 7+**, **Angular Standalone Components**, **Capacitor** e **Apollo GraphQL**, seguindo a arquitetura **Feature-Driven Design (FDD)**.

---

## 🛠️ Stack Tecnológica

* **Framework Base:** [Angular](https://angular.dev/) (Arquitetura Standalone)
* **UI & Componentes Mobile:** [Ionic Framework](https://ionicframework.com/)
* **Runtime Nativo:** [Capacitor](https://capacitorjs.com/) (iOS / Android)
* **Camada de Dados & API:** [Apollo Angular](https://apollo-angular.com/) (GraphQL Client)
* **Gerenciador de Tipos:** [GraphQL Code Generator](https://graphql-codegen.com/)
* **Gerenciamento de Estado:** Angular Signals / NgRx SignalStore
* **Persistência Local:** `@capacitor/preferences`

---

## 📁 Estrutura de Arquitetura (Feature-Driven Design)

O projeto é organizado por funcionalidades isoladas em `src/app/features/`, garantindo desacoplamento e escalabilidade.

```text
src/
├── app/
│   ├── core/                          # Infraestrutura global da aplicação
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.store.ts
│   │   │   └── token.service.ts
│   │   │
│   │   ├── graphql/
│   │   │   ├── apollo.config.ts
│   │   │   └── graphql.module.ts
│   │   │
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── active-workout.guard.ts
│   │   │
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   │
│   │   └── native/
│   │       ├── haptics.service.ts
│   │       ├── keep-awake.service.ts
│   │       ├── network.service.ts
│   │       └── storage.service.ts
│   │
│   ├── graphql/
│   │   ├── documents/
│   │   │   ├── auth.graphql
│   │   │   ├── exercicio.graphql
│   │   │   ├── metricas.graphql
│   │   │   ├── pessoa.graphql
│   │   │   └── sessao-treino.graphql
│   │   │
│   │   └── generated/
│   │       └── graphql.ts
│   │
│   ├── features/                      # Regras de negócio reutilizáveis
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   └── google-login-btn/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   └── models/
│   │   │
│   │   ├── exercises/
│   │   │   ├── components/
│   │   │   │   └── exercise-card/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   └── models/
│   │   │
│   │   ├── workout/
│   │   │   ├── components/
│   │   │   │   ├── exercise-picker/
│   │   │   │   ├── rest-timer/
│   │   │   │   └── set-row/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   └── models/
│   │   │
│   │   ├── metrics/
│   │   │   ├── components/
│   │   │   │   ├── frequency-card/
│   │   │   │   └── volume-chart/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   └── models/
│   │   │
│   │   └── profile/
│   │       ├── components/
│   │       │   └── user-stats/
│   │       ├── services/
│   │       ├── stores/
│   │       └── models/
│   │
│   ├── pages/                         # Todas as telas roteáveis do aplicativo
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── login.page.ts
│   │   │   │   ├── login.page.html
│   │   │   │   ├── login.page.scss
│   │   │   │   └── login.routes.ts
│   │   │   │
│   │   │   └── register/
│   │   │       ├── register.page.ts
│   │   │       ├── register.page.html
│   │   │       ├── register.page.scss
│   │   │       └── register.routes.ts
│   │   │
│   │   ├── exercises/
│   │   │   ├── exercise-list/
│   │   │   └── exercise-detail/
│   │   │
│   │   ├── workout/
│   │   │   ├── workout-active/
│   │   │   ├── workout-history/
│   │   │   └── workout-summary/
│   │   │
│   │   ├── metrics/
│   │   │   └── dashboard/
│   │   │
│   │   ├── profile/
│   │   │   └── profile-detail/
│   │   │
│   │   ├── home/
│   │   │   ├── home.page.ts
│   │   │   ├── home.page.html
│   │   │   ├── home.page.scss
│   │   │   └── home.routes.ts
│   │   │
│   │   ├── splash/
│   │   ├── onboarding/
│   │   ├── settings/
│   │   ├── not-found/
│   │   └── tabs/
│   │       ├── tabs.page.ts
│   │       ├── tabs.page.html
│   │       ├── tabs.page.scss
│   │       └── tabs.routes.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── empty-state/
│   │   │   ├── header/
│   │   │   ├── loading-skeleton/
│   │   │   └── stat-badge/
│   │   │
│   │   ├── directives/
│   │   │   └── auto-focus.directive.ts
│   │   │
│   │   ├── pipes/
│   │   │   ├── duration.pipe.ts
│   │   │   └── weight.pipe.ts
│   │   │
│   │   └── utils/
│   │       └── date.utils.ts
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   ├── app.routes.ts                  # Rotas principais da aplicação
│   └── app.constants.ts
│
├── assets/
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
├── theme/
│   └── variables.scss
│
├── capacitor.config.ts
└── codegen.ts

```

---

## ⚡ Configuração do Ambiente e Instalação

### Prerequisitos

* **Node.js:** `>= 18.x`
* **npm:** `>= 9.x`
* **Ionic CLI:** `npm install -g @ionic/cli`

### 1. Instalação de Dependências

```bash
npm install

```

### 2. Instalação dos Plugins Nativos (Capacitor)

```bash
npm install @capacitor/preferences @capacitor/haptics @capacitor/network
npm install @capacitor-community/keep-awake
npx cap sync

```

---

## 🔄 Fluxo de Trabalho com GraphQL e Codegen

Esta aplicação **não escreve chamadas HTTP manuais**. Toda a comunicação com a API GraphQL é fortemente tipada utilizando o **GraphQL Code Generator**.

### Como criar ou modificar uma consulta/mutação:

1. Adicione ou edite um arquivo `.graphql` dentro de `src/app/graphql/documents/`.
* *Exemplo (`src/app/graphql/documents/sessao-treino.graphql`):*
```graphql
mutation FinalizarSessaoTreino($id: ID!) {
  finalizarSessaoTreino(id: $id) {
    id
    status
    dataFim
  }
}

```




2. Execute o script de geração de código:
```bash
npm run codegen

```


3. O Codegen atualizará o arquivo `src/app/graphql/generated/graphql.ts` e injetará automaticamente um Service Angular tipado (ex: `FinalizarSessaoTreinoGQL`).
4. Injete e utilize o Service diretamente nos seus componentes ou SignalStores:
```typescript
inject(FinalizarSessaoTreinoGQL)
  .mutate({ id: sessaoId })
  .subscribe(result => { ... });

```



---

## 📱 Estratégia de Resiliência (Offline-First no Treino Ativo)

A execução do treino na feature `features/workout` foi projetada para funcionar perfeitamente mesmo sem conexão com a internet dentro da academia:

1. **Armazenamento em Tempo Real:** A cada série concluída ou carga alterada, o `workout.store.ts` atualiza o estado via **Signals** e persiste o snapshot no disco via `@capacitor/preferences`.
2. **Garantia contra Quedas:** Caso o aplicativo seja fechado acidentalmente ou o celular descarregue, a sessão é restaurada do storage local ao reabrir a app.
3. **Sincronização com Backend:** Ao clicar em **"Finalizar Treino"**, os dados consolidados são enviados ao backend. Se o usuário estiver offline, a ação é enfileirada no local storage até que a conexão seja reestabelecida via `network.service.ts`.
4. **Processamento Assíncrono de Métricas:** Devido ao processamento via RabbitMQ no backend, a atualização dos gráficos na aba `metrics` possui **consistência eventual**. Trate o dashboard com estados visuais indicando "Processando métricas...".

---

## 🔌 Integração Nativas do Capacitor

A camada `src/app/core/native/` expõe serviços para manipular hardware do dispositivo de forma isolada:

* **`KeepAwakeService`:** Ativado na rota `workout-active` para evitar que a tela apague entre as séries.
* **`HapticsService`:** Dispara pequenas vibrações no dispositivo ao bater metas de repetição e ao zerar o cronômetro de descanso (`rest-timer`).
* **`NetworkService`:** Monitora o status de conectividade e altera a barra de status da aplicação.

---

## 🚀 Executando o Projeto

### Modo Desenvolvimento Web

```bash
ionic serve

```

### Build e Execução Mobile (Android / iOS)

```bash
# Build da aplicação web
npm run build

# Sincronizar artefatos com as pastas nativas
npx cap copy
npx cap open android   # Ou 'ios'

```

---

## 📐 Padrões de Código e Diretrizes

* **Componentes Standalone:** Todo componente, diretiva e pipe novo deve declarar `standalone: true`.
* **Tratamento de Estado:** Priorize **Angular Signals** e **NgRx SignalStore** para estados locais e globais reativos. Evite a proliferação de `BehaviorSubject`.
* **Injeção de Dependências:** Prefira a função `inject(MyService)` em vez de injeção no construtor.

```

---

## 🧭 Checklist de Construção da Interface Web e App Mobile

A construção da interface segue uma sequência incremental que parte da infraestrutura e arquitetura, passa pelo Design System e pelas telas roteáveis, integra GraphQL e estado, e termina na validação do fluxo mobile com Capacitor e Android.

Para transformar cada etapa em uma atividade rastreável, consulte a documentação operacional:

> 📋 **[Checklist completa de 30 etapas — Construção da Interface Web e App Mobile](docs/FRONTEND_INTERFACE_CHECKLIST.md)**

A checklist deve ser utilizada como roteiro de implementação. Cada etapa define objetivo, atividades e critério de conclusão, preservando as decisões arquiteturais deste README, incluindo **FDD + Clean Architecture**, **Angular Standalone**, **GraphQL Codegen**, **Signals/NgRx SignalStore**, **Offline-First**, **Sync Queue**, **consistência eventual das métricas** e **integração nativa via Capacitor**.

### Ordem recomendada de execução

```text
Fundação
   ↓
Design System + Theme
   ↓
Core + Apollo + Auth
   ↓
Routing + Pages
   ↓
Features
   ↓
GraphQL Codegen
   ↓
Estado + Offline-First
   ↓
Sync Queue
   ↓
Métricas + Consistência Eventual
   ↓
Capacitor + Android
   ↓
Testes + Validação
```

> **Regra de evolução:** não considere uma tela concluída apenas porque ela renderiza. Uma etapa é considerada concluída quando interface, roteamento, estado, integração de dados, estados de erro/loading/offline e comportamento mobile correspondente estiverem validados conforme o escopo definido na checklist.


# 📋 Checklist de Construção da Interface Web e App Mobile

## Objetivo

Esta checklist transforma a arquitetura definida no `README.md` em um roteiro executável para construir a interface do projeto **Ionic + Angular Standalone + Capacitor + Apollo GraphQL**.

O objetivo não é somente produzir telas. Cada etapa deve preservar:

- **Feature-Driven Design (FDD)** alinhado aos domínios do backend.
- **Clean Architecture** e separação entre páginas, features, infraestrutura e componentes compartilhados.
- **Angular Standalone Components**.
- **GraphQL Code Generator** para tipagem ponta a ponta.
- **Signals / NgRx SignalStore** para estado reativo.
- **Offline-First** no fluxo de treino.
- **Sync Queue** para reenvio de mutations pendentes.
- **Consistência eventual** no dashboard de métricas.
- **Capacitor** para integração com recursos nativos.
- **Compatibilidade web + Android** sem duplicar regra de negócio.

---

## 1. Fundação do projeto

- [ ] Criar ou validar o projeto Ionic com Angular Standalone e Capacitor.
- [ ] Confirmar Node.js `>= 18.x`, npm `>= 9.x` e Ionic CLI instalados.
- [ ] Executar `npm install` e validar que a aplicação inicia sem erros.
- [ ] Configurar o fluxo de build web e o fluxo de sincronização do Capacitor.
- [ ] Registrar o estado inicial do projeto antes de iniciar as features.

**Critério de conclusão:** o projeto abre, compila e possui uma base pronta para evolução sem alterar a separação arquitetural definida no README.

---

## 2. Consolidar a estrutura de diretórios

- [ ] Criar `src/app/core/` para infraestrutura global.
- [ ] Criar `src/app/graphql/documents/` e `src/app/graphql/generated/`.
- [ ] Criar `src/app/features/` para regras de negócio reutilizáveis.
- [ ] Criar `src/app/pages/` para todas as telas roteáveis.
- [ ] Criar `src/app/shared/` para Design System, pipes, diretivas e utilitários.
- [ ] Criar `assets/`, `environments/` e `theme/`.
- [ ] Evitar mover lógica de negócio para `pages/`: páginas devem compor a interface e consumir as features.

**Critério de conclusão:** a árvore física do projeto representa a arquitetura documentada.

---

## 3. Corrigir a configuração GraphQL para Standalone

A documentação original identifica uma inconsistência importante: `graphql.module.ts` não é necessário em uma arquitetura Angular Standalone.

- [ ] Remover a dependência arquitetural de `graphql.module.ts`.
- [ ] Configurar Apollo através de providers no `app.config.ts`.
- [ ] Centralizar links, headers de autenticação e tratamento de erros no bootstrap da aplicação.
- [ ] Garantir que nenhuma feature dependa de um `NgModule` legado para funcionar.

**Critério de conclusão:** Apollo funciona com providers Standalone e `app.config.ts` é a origem da configuração global.

---

## 4. Definir o Design System e o Theme

- [ ] Configurar `src/theme/variables.scss`.
- [ ] Definir tokens de cores, tipografia, espaçamentos, bordas e estados.
- [ ] Definir suporte a dark mode.
- [ ] Padronizar componentes Ionic utilizados por todas as páginas.
- [ ] Criar os componentes base de `shared/components/`.

Componentes iniciais:

```text
shared/components/
├── header/
├── empty-state/
├── loading-skeleton/
└── stat-badge/
```

**Critério de conclusão:** novas páginas conseguem ser construídas utilizando os componentes e tokens compartilhados, evitando estilos duplicados.

---

## 5. Construir a camada Core de autenticação

- [ ] Implementar `auth.service.ts`.
- [ ] Implementar `auth.store.ts`.
- [ ] Implementar `token.service.ts`.
- [ ] Definir o estado mínimo: autenticado, não autenticado, carregando e erro.
- [ ] Definir claramente a origem e persistência do token.
- [ ] Preparar o armazenamento para execução web e Capacitor.

**Critério de conclusão:** o frontend sabe restaurar, atualizar e limpar o estado de autenticação sem que as páginas precisem conhecer detalhes de persistência.

---

## 6. Implementar infraestrutura nativa

- [ ] Criar `haptics.service.ts`.
- [ ] Criar `storage.service.ts`.
- [ ] Criar `network.service.ts`.
- [ ] Criar `keep-awake.service.ts`.
- [ ] Encapsular os plugins do Capacitor nesses serviços.
- [ ] Evitar chamadas diretas aos plugins dentro das páginas.

**Critério de conclusão:** o restante da aplicação utiliza abstrações em `core/native/`, e não depende diretamente de APIs nativas espalhadas pelo código.

---

## 7. Configurar GraphQL e Codegen

- [ ] Criar os documentos `.graphql` por domínio.
- [ ] Separar `auth.graphql`, `pessoa.graphql`, `exercicio.graphql`, `sessao-treino.graphql` e `metricas.graphql`.
- [ ] Configurar o `codegen.ts`.
- [ ] Criar o script `npm run codegen`.
- [ ] Gerar `src/app/graphql/generated/graphql.ts`.
- [ ] Validar que queries e mutations geradas possuem tipos corretos.

**Critério de conclusão:** nenhuma chamada GraphQL precisa depender de DTOs TypeScript escritos manualmente.

---

## 8. Definir a malha de roteamento

- [ ] Configurar `app.routes.ts`.
- [ ] Definir rotas públicas e protegidas.
- [ ] Implementar `auth.guard.ts`.
- [ ] Implementar `active-workout.guard.ts`.
- [ ] Definir rotas de `splash`, `onboarding`, `auth`, `home`, `tabs`, `workout`, `metrics`, `profile`, `settings` e `not-found`.
- [ ] Garantir lazy loading das páginas onde fizer sentido.

**Critério de conclusão:** o app consegue navegar pelas áreas sem deixar regra de autenticação ou proteção espalhada nas páginas.

---

## 9. Criar as páginas de entrada

- [ ] Criar `splash`.
- [ ] Criar `onboarding`.
- [ ] Criar `auth/login`.
- [ ] Criar `auth/register`.
- [ ] Criar `home`.
- [ ] Criar `tabs`.

Estrutura mínima das páginas:

```text
pagina/
├── pagina.page.ts
├── pagina.page.html
├── pagina.page.scss
└── pagina.routes.ts
```

**Critério de conclusão:** cada página é roteável, standalone e possui responsabilidade restrita à composição da tela.

---

## 10. Implementar autenticação na interface

- [ ] Construir formulário de login.
- [ ] Construir formulário de registro.
- [ ] Integrar botão de login Google quando o backend estiver preparado.
- [ ] Implementar estados de loading, sucesso e erro.
- [ ] Validar campos no frontend.
- [ ] Integrar as páginas com `auth.service.ts` e `auth.store.ts`.

**Critério de conclusão:** login e registro funcionam através da camada de domínio/infrastructure sem colocar lógica de autenticação diretamente no HTML.

---

## 11. Implementar navegação principal

- [ ] Definir a hierarquia de navegação do aplicativo.
- [ ] Configurar `tabs` para as áreas principais.
- [ ] Definir ícones, labels e estado ativo.
- [ ] Garantir compatibilidade entre web e Android.
- [ ] Impedir saída indevida do treino em andamento através de `active-workout.guard.ts`.

**Critério de conclusão:** o usuário consegue percorrer o app sem rotas órfãs ou caminhos que ignoram regras de negócio.

---

## 12. Construir a feature `exercises`

- [ ] Criar `features/exercises/`.
- [ ] Criar store e models da feature.
- [ ] Implementar `exercise-card`.
- [ ] Criar `pages/exercises/exercise-list`.
- [ ] Criar `pages/exercises/exercise-detail`.
- [ ] Implementar filtros por grupo muscular.
- [ ] Integrar os dados através de GraphQL Codegen.

**Critério de conclusão:** catálogo e detalhe de exercício utilizam o mesmo domínio e não duplicam modelos.

---

## 13. Construir a feature `workout`

- [ ] Criar `features/workout/`.
- [ ] Criar `workout.store.ts`.
- [ ] Criar `set-row`.
- [ ] Criar `rest-timer`.
- [ ] Criar `exercise-picker`.
- [ ] Criar `workout-active`.
- [ ] Criar `workout-summary`.
- [ ] Criar `workout-history`.

**Critério de conclusão:** é possível montar, executar, finalizar e consultar uma sessão de treino mantendo o estado centralizado no store.

---

## 14. Modelar o estado do treino ativo

- [ ] Definir o estado da sessão atual.
- [ ] Definir exercício atual.
- [ ] Definir séries, carga e repetições.
- [ ] Definir tempo de descanso.
- [ ] Definir estado de execução e finalização.
- [ ] Criar seletores/computed signals para dados derivados.

**Critério de conclusão:** a interface não depende de múltiplas fontes de estado conflitantes.

---

## 15. Implementar persistência Offline-First

- [ ] Persistir alterações de série em tempo real.
- [ ] Salvar snapshot do treino com `@capacitor/preferences`.
- [ ] Restaurar sessão após reinicialização do aplicativo.
- [ ] Definir versionamento/formato do snapshot local.
- [ ] Garantir que o armazenamento local não substitua a fonte de verdade do backend quando houver conectividade.

**Critério de conclusão:** uma sessão em andamento pode sobreviver à queda do app, perda de conexão e reabertura.

---

## 16. Implementar a Sync Queue

A arquitetura original identifica corretamente que o Offline-First precisa de um mecanismo explícito de reenvio.

- [ ] Criar `sync.service.ts` dentro da camada adequada.
- [ ] Definir o formato de uma operação pendente.
- [ ] Armazenar mutations pendentes localmente.
- [ ] Associar cada operação a um identificador único/idempotência quando suportado pelo backend.
- [ ] Escutar mudanças do `network.service.ts`.
- [ ] Reexecutar a fila ao recuperar conectividade.
- [ ] Tratar falhas de sincronização sem perder operações.
- [ ] Remover da fila somente após confirmação de sucesso.

**Critério de conclusão:** `FinalizarSessaoTreino` pode ser executada offline e reenviada automaticamente quando a conexão retornar.

---

## 17. Integrar proteção de navegação durante o treino

- [ ] Ativar `active-workout.guard.ts`.
- [ ] Detectar sessão ativa no store.
- [ ] Bloquear navegação incompatível quando necessário.
- [ ] Exibir feedback de confirmação quando o usuário tentar abandonar o treino.
- [ ] Garantir que o comportamento funcione no botão de voltar do Android.

**Critério de conclusão:** nenhuma navegação acidental destrói ou abandona silenciosamente uma sessão em andamento.

---

## 18. Integrar recursos nativos ao treino

- [ ] Ativar `KeepAwakeService` em `workout-active`.
- [ ] Usar `HapticsService` para eventos importantes.
- [ ] Usar `NetworkService` para indicar conectividade.
- [ ] Usar `StorageService` para persistência.
- [ ] Desativar recursos nativos quando a página deixar de precisar deles.

**Critério de conclusão:** a experiência mobile utiliza o hardware sem contaminar a lógica de negócio com APIs do Capacitor.

---

## 19. Implementar a feature `metrics`

- [ ] Criar `features/metrics/`.
- [ ] Criar `frequency-card`.
- [ ] Criar `volume-chart`.
- [ ] Criar store e models.
- [ ] Criar `pages/metrics/dashboard`.
- [ ] Integrar dados via GraphQL.

**Critério de conclusão:** o dashboard exibe dados tipados, estados de carregamento e estados sem dados.

---

## 20. Tratar consistência eventual das métricas

O backend processa métricas de forma assíncrona via RabbitMQ; por isso, o frontend não deve assumir atualização instantânea após a finalização do treino.

- [ ] Criar estado `loading`.
- [ ] Criar estado `processing`.
- [ ] Criar estado `ready`.
- [ ] Criar estado `error`.
- [ ] Exibir `"Processando métricas..."` quando necessário.
- [ ] Avaliar polling ou GraphQL Subscriptions conforme o contrato real do backend.

**Critério de conclusão:** a interface explica ao usuário por que os dados ainda podem não refletir o treino recém-finalizado.

---

## 21. Construir a feature `profile`

- [ ] Criar `features/profile/`.
- [ ] Criar `user-stats`.
- [ ] Criar store e models.
- [ ] Criar `pages/profile/profile-detail`.
- [ ] Integrar dados da entidade `PESSOA`.

**Critério de conclusão:** o perfil não contém regras pertencentes a outras features.

---

## 22. Consolidar o Design System nas páginas

- [ ] Substituir estilos repetidos por componentes compartilhados.
- [ ] Padronizar headers.
- [ ] Padronizar estados vazios.
- [ ] Padronizar skeletons.
- [ ] Padronizar badges e informações estatísticas.
- [ ] Garantir consistência de espaçamento e tipografia.

**Critério de conclusão:** a aparência do aplicativo é consistente entre `auth`, `exercises`, `workout`, `metrics` e `profile`.

---

## 23. Implementar estados de UI completos

Para cada tela relevante:

- [ ] Estado inicial.
- [ ] Estado carregando.
- [ ] Estado com dados.
- [ ] Estado vazio.
- [ ] Estado offline.
- [ ] Estado de erro.
- [ ] Estado de sucesso.
- [ ] Estado de processamento assíncrono quando aplicável.

**Critério de conclusão:** nenhuma tela importante depende exclusivamente do "happy path".

---

## 24. Validar responsividade Web + Mobile

- [ ] Testar viewport mobile.
- [ ] Testar viewport desktop.
- [ ] Testar tablets.
- [ ] Validar safe areas e áreas de interação no Android.
- [ ] Validar scroll, keyboard, dialogs e modals.
- [ ] Garantir que componentes Ionic permaneçam usáveis em diferentes dimensões.

**Critério de conclusão:** a mesma base de interface funciona como aplicação web e como app mobile sem hacks específicos espalhados.

---

## 25. Implementar tratamento de erros e observabilidade da UI

- [ ] Centralizar tratamento de erros GraphQL/HTTP.
- [ ] Exibir mensagens amigáveis ao usuário.
- [ ] Diferenciar erro de autenticação, validação, rede e servidor.
- [ ] Registrar eventos importantes em desenvolvimento.
- [ ] Não expor informações sensíveis no frontend.

**Critério de conclusão:** erros técnicos são tratados na infraestrutura e apresentados como estados de interface compreensíveis.

---

## 26. Criar testes da interface e das regras críticas

- [ ] Testar guards.
- [ ] Testar stores.
- [ ] Testar `workout.store.ts`.
- [ ] Testar persistência/restauração local.
- [ ] Testar `sync.service.ts`.
- [ ] Testar estados principais das páginas.
- [ ] Testar componentes críticos como `set-row` e `rest-timer`.

**Critério de conclusão:** as áreas de maior risco possuem testes automatizados antes da validação final no dispositivo.

---

## 27. Preparar o build mobile

- [ ] Executar `npm run build`.
- [ ] Executar `npx cap copy`.
- [ ] Executar `npx cap sync`.
- [ ] Validar a configuração em `capacitor.config.ts`.
- [ ] Abrir o projeto com `npx cap open android`.

**Critério de conclusão:** o projeto web compilado é corretamente refletido na plataforma Android.

---

## 28. Validar execução no Android Studio

- [ ] Abrir o projeto `android/` no Android Studio.
- [ ] Configurar um emulador Android.
- [ ] Executar o aplicativo.
- [ ] Validar navegação.
- [ ] Validar teclado.
- [ ] Validar botão voltar.
- [ ] Validar persistência.
- [ ] Validar comportamento offline.
- [ ] Validar Haptics.
- [ ] Validar Keep Awake.
- [ ] Validar Network status.

**Critério de conclusão:** as funcionalidades críticas do aplicativo estão funcionando no runtime Android real/emulado.

---

## 29. Validar o fluxo completo de negócio

Executar o cenário:

```text
Splash
  ↓
Onboarding
  ↓
Login
  ↓
Home
  ↓
Exercises
  ↓
Selecionar exercício
  ↓
Iniciar treino
  ↓
Registrar séries
  ↓
Offline / Online
  ↓
Finalizar treino
  ↓
Sync Queue (se necessário)
  ↓
Workout Summary
  ↓
Metrics
  ↓
"Processando métricas..."
  ↓
Dashboard atualizado
```

- [ ] Executar o cenário com internet.
- [ ] Executar o cenário sem internet.
- [ ] Fechar/reabrir o app durante o treino.
- [ ] Recuperar sessão persistida.
- [ ] Reconectar e validar sincronização.
- [ ] Confirmar atualização posterior das métricas.

**Critério de conclusão:** o principal fluxo funcional do aplicativo é resiliente e coerente de ponta a ponta.

---

## 30. Finalizar documentação e checklist de release

- [ ] Atualizar o `README.md`.
- [ ] Manter esta checklist sincronizada com a arquitetura real.
- [ ] Registrar mudanças arquiteturais importantes.
- [ ] Registrar novas dependências.
- [ ] Registrar decisões sobre Offline-First e Sync Queue.
- [ ] Registrar limitações conhecidas de consistência eventual.
- [ ] Validar a árvore de diretórios.
- [ ] Validar comandos de execução web.
- [ ] Validar comandos de execução Android.
- [ ] Confirmar que todas as 30 etapas estão concluídas ou explicitamente marcadas como pendentes.

**Critério de conclusão:** o repositório consegue ser entendido e executado por outro desenvolvedor sem depender de conhecimento oral não documentado.

---

## 🔗 Referência principal

A arquitetura, stack, estrutura de diretórios, integração GraphQL, estratégia Offline-First, integração nativa e padrões de código devem permanecer alinhados ao `README.md` principal do projeto.

### Arquivo relacionado

- [`README.md`](../README.md)


