import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // Altere para a URL do seu servidor backend GraphQL ou apontamento de env
  schema: process.env['GRAPHQL_SCHEMA_URL'] || 'http://localhost:4000/graphql',
  documents: 'src/app/graphql/documents/**/*.graphql',
  generates: {
    // Tipos base do schema (Enums, Inputs, tipos de objeto). Separado do
    // arquivo de operações abaixo por causa de uma regressão do
    // typescript-operations@6 que reemite Inputs/Enums já declarados pelo
    // plugin `typescript` quando os dois geram no mesmo arquivo, causando
    // erro TS2300 (Duplicate identifier). Ver:
    // https://github.com/dotansimha/graphql-code-generator/issues/10782
    // (fechada como "not planned" - o workaround é separar em dois arquivos).
    'src/app/graphql/generated/graphql-types.ts': {
      plugins: ['typescript'],
      config: {
        addExplicitOverride: true,
        skipTypename: false,
        scalars: {
          DateTime: 'string',
          UUID: 'string',
        },
      },
    },
    'src/app/graphql/generated/graphql.ts': {
      plugins: ['typescript-operations', 'typescript-apollo-angular'],
      config: {
        addExplicitOverride: true,
        skipTypename: false,
        apolloAngularVersion: 3,
        // Reaproveita os tipos base gerados acima em vez de redeclará-los
        // (é o que evita o TS2300 descrito na nota acima). O caminho é
        // resolvido a partir do cwd (raiz do projeto), não do arquivo de
        // saída - por isso o caminho completo em vez de "./graphql-types".
        importSchemaTypesFrom: './src/app/graphql/generated/graphql-types',
        // sdkClass gera uma classe wrapper (ApolloAngularSDK) com API antiga
        // (fetch/watch/mutate(variables, options)) incompatível com a
        // apollo-angular instalada (v14, alinhada ao Apollo Client v4, cujos
        // métodos aceitam um único objeto de options). Não é usada no app -
        // apenas os *GQL individuais (ex.: AutenticarComSenhaGQL) são usados.
        // Mapeamento de tipos customizados escalares do PostgreSQL / Prisma
        scalars: {
          DateTime: 'string',
          UUID: 'string',
        },
      },
    },
  },
  // Ignora erros de certificado SSL em ambiente local de desenvolvimento
  hooks: {
    afterOneFileWrite: ['prettier --write'],
  },
};

export default config;