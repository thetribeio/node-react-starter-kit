import {
    GraphQLNonNull as NonNull,
    GraphQLList as ListType,
} from 'graphql';
import { BookType } from '@schema/types';

export default {
    type: new NonNull(new ListType(new NonNull(BookType))),
    resolve: () => {
        throw new Error('Not implemented');
    },
};
