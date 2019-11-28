import {
    GraphQLNonNull as NonNull,
    GraphQLList as ListType,
    GraphQLBoolean as BooleanType,
} from 'graphql';
import { UserType } from '@schema/types';

export default {
    type: new NonNull(new ListType(new NonNull(UserType))),
    args: {
        onlyActive: { type: BooleanType },
    },
    resolve: () => {
        throw new Error('Not implemented');
    },
};
