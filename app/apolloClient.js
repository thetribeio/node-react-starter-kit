import { ApolloClient } from 'apollo-client';
import { from, ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { InMemoryCache } from 'apollo-cache-inmemory';
import apolloLogger from 'apollo-link-logger';
import SchemaLink from 'apollo-link-schema';
import schema from './schema';

const cache = new InMemoryCache({ addTypename: false });

const schemaLink = new SchemaLink({ schema });

const offlineLink = new ApolloLink((operation, forward) => {
    const r = forward(operation);

    console.log(r);

    return r;
});

const link = from([
    // handle graphql errors
    onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            graphQLErrors.map(({ message, locations, path }) => console.warn(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            ));
        }

        if (networkError) {
            console.warn(`[Network error]: ${networkError}`);
        }
    }),
    // on development log everything
    __DEV__ && apolloLogger,
    // place in between the offline link
    offlineLink,
    // http link to forward operations to the server
    new HttpLink({
        uri: '/graphql',
        credentials: 'include',
    }),
].filter(Boolean));

export default new ApolloClient({
    link,
    queryDeduplication: true,
    cache,
    connectToDevTools: __DEV__,
});
