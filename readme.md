
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

## 📄 `README.md` Oficial para o Repositório Frontend

Abaixo está o documento de documentação (`README.md`) formatado e estruturado para ficar na raiz do projeto frontend em Ionic + Angular Standalone.

```markdown
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
│   ├── core/                        # Singletons globais, Auth, Interceptors e Infra Nativa
│   │   ├── auth/                    # Gerenciamento de sessão e tokens JWT
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.store.ts        # SignalStore para o estado global do usuário
│   │   │   └── token.service.ts     # Wrapper seguro via Capacitor Preferences
│   │   ├── graphql/                 # Configuração central do Apollo Client
│   │   │   └── apollo.config.ts     # Links HTTP, Auth Header e Error Handling
│   │   ├── guards/                  # Proteção de rotas (Auth Guard, Active Workout Guard)
│   │   ├── interceptors/            # Auth Interceptor (Bearer Token)
│   │   └── native/                  # Wrappers nativos do Capacitor
│   │       ├── haptics.service.ts   # Feedback tátil (vibração ao concluir série/timer)
│   │       ├── keep-awake.service.ts# Mantém a tela ligada durante o treino ativo
│   │       ├── network.service.ts   # Status da rede (online/offline)
│   │       └── storage.service.ts   # Cache local seguro em disco
│   │
│   ├── graphql/                     # Operações GraphQL e Código Gerado (Codegen)
│   │   ├── documents/               # Arquivos .graphql estruturados por domínio
│   │   │   ├── auth.graphql
│   │   │   ├── exercicio.graphql
│   │   │   ├── metricas.graphql
│   │   │   ├── pessoa.graphql
│   │   │   └── sessao-treino.graphql
│   │   └── generated/               # Services Angular auto-gerados via GraphQL Codegen
│   │       └── graphql.ts
│   │
│   ├── features/                    # Módulos Funcionais Isolados (FDD)
│   │   ├── auth/                    # Telas de Login, Registro e Google Auth
│   │   ├── exercises/               # Catálogo e busca de exercícios por grupo muscular
│   │   ├── workout/                 # Execução de treino ativo, histórico e séries (Offline-First)
│   │   ├── metrics/                 # Dashboard de gráficos de volume e frequência
│   │   └── profile/                 # Dados do perfil do usuário (Entidade PESSOA)
│   │
│   ├── shared/                      # Pipes, Diretivas, Design System e UI Genérica
│   │   ├── components/              # Skeleton loaders, headers customizados, badges
│   │   ├── directives/              # Auto-focus e diretivas utilitárias
│   │   ├── pipes/                   # Duration pipe (hh:mm:ss) e Weight pipe (kg)
│   │   └── utils/                   # Utilitários de data e formatação
│   │
│   ├── app.component.ts             # Shell principal da aplicação
│   ├── app.routes.ts                # Definição de rotas da aplicação
│   └── app.config.ts                # Configuration providers (Apollo, Ionic, Animations)
│
├── capacitor.config.ts              # Configuração nativa do Capacitor
└── codegen.ts                       # Configuração do GraphQL Code Generator

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
npx cap open android   # Ou 'ios'

```

---

## 📐 Padrões de Código e Diretrizes

* **Componentes Standalone:** Todo componente, diretiva e pipe novo deve declarar `standalone: true`.
* **Tratamento de Estado:** Priorize **Angular Signals** e **NgRx SignalStore** para estados locais e globais reativos. Evite a proliferação de `BehaviorSubject`.
* **Injeção de Dependências:** Prefira a função `inject(MyService)` em vez de injeção no construtor.

```

```