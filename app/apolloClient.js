import { ApolloClient } from 'apollo-client';
import { from } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { InMemoryCache } from 'apollo-cache-inmemory';
import apolloLogger from 'apollo-link-logger';

const cache = new InMemoryCache({ addTypename: false });

const link = from([
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
    ...(__DEV__ ? [apolloLogger] : []),
    new HttpLink({
        uri: '/graphql',
        credentials: 'include',
    }),
]);

export default new ApolloClient({
    link,
    queryDeduplication: true,
    cache: cache.restore(window.State.apollo),
    connectToDevTools: __DEV__,
});
