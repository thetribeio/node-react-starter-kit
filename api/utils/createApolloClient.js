import ApolloClient from 'apollo-client';
import { from } from 'apollo-link';
import { SchemaLink } from 'apollo-link-schema';
import { onError } from 'apollo-link-error';
import { InMemoryCache } from 'apollo-cache-inmemory';

export default function createApolloClient(schema) {
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
        new SchemaLink({ ...schema }),
    ]);

    return new ApolloClient({
        link,
        cache: new InMemoryCache({ addTypename: false }),
        ssrMode: true,
        queryDeduplication: true,
    });
}
