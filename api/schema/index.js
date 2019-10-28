import {
    GraphQLSchema as Schema,
    GraphQLObjectType as ObjectType,
} from 'graphql';

import * as queries from './queries';
import * as mutations from './mutations';

const schema = new Schema({
    query: new ObjectType({
        name: 'Query',
        fields: queries,
    }),
    mutation: new ObjectType({
        name: 'Mutation',
        fields: mutations,
    }),
});

export default schema;
