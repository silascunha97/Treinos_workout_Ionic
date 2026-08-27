import '@apollo/client';

// Declara os defaultOptions usados em apollo.config.ts para satisfazer o
// type-safety do Apollo Client v4 (ver:
// https://www.apollographql.com/docs/react/data/typescript#declaring-default-options-for-type-safety)
declare module '@apollo/client' {
  namespace ApolloClient {
    namespace DeclareDefaultOptions {
      interface WatchQuery {
        errorPolicy: 'all';
      }
      interface Query {
        errorPolicy: 'all';
      }
      interface Mutate {
        errorPolicy: 'all';
      }
    }
  }
}
